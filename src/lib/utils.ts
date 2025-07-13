import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { stationIdToName, stationNameToId } from "./station-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Station photo storage utilities
export interface StationPhoto {
  photoId: string; // Unique ID for the blob storage
  timestamp: string; // ISO string
  type: "verification" | "additional";
}

export interface StationPhotoData {
  [stationId: string]: StationPhoto[]; // Use station IDs as keys for consistency
}

// Convert data URL to blob and store it
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Generate a unique photo ID
function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function saveStationPhoto(
  stationName: string,
  photoDataUrl: string,
  type: "verification" | "additional" = "verification"
): Promise<void> {
  try {
    const stationId = stationNameToId(stationName);
    const photoId = generatePhotoId();

    console.log("saveStationPhoto called with:");
    console.log("- stationName:", stationName);
    console.log("- converted stationId:", stationId);
    console.log("- photoId:", photoId);

    // Convert data URL to blob for efficient storage
    const blob = dataUrlToBlob(photoDataUrl);

    // Store the blob using the photoId
    const fileReader = new FileReader();

    await new Promise<void>((resolve, reject) => {
      fileReader.onload = () => {
        try {
          // Store the blob as base64 in localStorage with a unique key
          localStorage.setItem(`photo_${photoId}`, photoDataUrl);
          console.log("Stored photo with key:", `photo_${photoId}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(blob);
    });

    // Update the photo metadata
    const existingData = getStationPhotos();
    console.log("Existing photo data before save:", existingData);

    if (!existingData[stationId]) {
      existingData[stationId] = [];
    }

    const newPhoto: StationPhoto = {
      photoId,
      timestamp: new Date().toISOString(),
      type,
    };

    existingData[stationId].push(newPhoto);
    console.log("Updated photo data:", existingData);

    localStorage.setItem("stationPhotos", JSON.stringify(existingData));
    console.log(
      `✅ Saved photo for station: ${stationName} (${stationId}) with ID: ${photoId}`
    );
  } catch (error) {
    console.error("Error saving station photo:", error);
  }
}

export function getStationPhotos(): StationPhotoData {
  try {
    const data = localStorage.getItem("stationPhotos");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting station photos:", error);
    return {};
  }
}

// Visit log functionality
export interface VisitLogEntry {
  stationName: string;
  timestamp: Date;
  verified: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export function saveStationVisit(
  stationName: string,
  verified: boolean,
  location?: { latitude: number; longitude: number }
): void {
  try {
    const existingLog = getVisitLog();

    const newEntry: VisitLogEntry = {
      stationName,
      timestamp: new Date(),
      verified,
      location,
    };

    // Add new entry to the beginning of the array (most recent first)
    existingLog.unshift(newEntry);

    // Keep only the last 100 entries to prevent localStorage from getting too large
    if (existingLog.length > 100) {
      existingLog.splice(100);
    }

    localStorage.setItem("stationVisitLog", JSON.stringify(existingLog));
  } catch (error) {
    console.error("Error saving station visit:", error);
  }
}

export function getVisitLog(): VisitLogEntry[] {
  try {
    const data = localStorage.getItem("stationVisitLog");
    if (!data) return [];

    const entries = JSON.parse(data);

    // Convert timestamp strings back to Date objects
    return entries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error("Error getting visit log:", error);
    return [];
  }
}

export function clearVisitLog(): void {
  try {
    localStorage.removeItem("stationVisitLog");
  } catch (error) {
    console.error("Error clearing visit log:", error);
  }
}

export function getPhotosForStation(stationIdentifier: string): StationPhoto[] {
  try {
    const allPhotos = getStationPhotos();
    console.log(
      "getPhotosForStation called with identifier:",
      stationIdentifier
    );
    console.log("All photos in storage:", allPhotos);

    // Try as station ID first
    let photos = allPhotos[stationIdentifier];
    console.log("Photos found with exact identifier:", photos);

    // If not found, try converting from display name to ID
    if (!photos) {
      const stationId = stationNameToId(stationIdentifier);
      console.log(
        "Converted station name to ID:",
        stationIdentifier,
        "->",
        stationId
      );
      photos = allPhotos[stationId];
      console.log("Photos found with converted ID:", photos);
    }

    const result = photos || [];
    console.log("Final photos result:", result);
    return result;
  } catch (error) {
    console.error("Error getting photos for station:", error);
    return [];
  }
}

// Get the actual photo data URL from a photo ID
export function getPhotoDataUrl(photoId: string): string | null {
  try {
    return localStorage.getItem(`photo_${photoId}`);
  } catch (error) {
    console.error("Error getting photo data:", error);
    return null;
  }
}

export function hasStationPhotos(stationIdentifier: string): boolean {
  const photos = getPhotosForStation(stationIdentifier);
  return photos.length > 0;
}

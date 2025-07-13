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

// Get photos for a station by either ID or display name
export function getPhotosForStation(stationIdentifier: string): StationPhoto[] {
  try {
    const allPhotos = getStationPhotos();
    console.log("getPhotosForStation called with:", stationIdentifier);
    console.log("All stored photos:", Object.keys(allPhotos));

    // Try as station ID first
    let photos = allPhotos[stationIdentifier];
    console.log("Direct lookup result:", photos);

    // If not found, try converting from display name to ID
    if (!photos) {
      const stationId = stationNameToId(stationIdentifier);
      console.log("Converted identifier to ID:", stationId);
      photos = allPhotos[stationId];
      console.log("Converted lookup result:", photos);
    }

    // If still not found, try converting from ID to display name
    if (!photos && stationIdentifier.includes("-")) {
      const displayName = stationIdToName(stationIdentifier);
      console.log("Converted ID to display name:", displayName);
      photos = allPhotos[displayName];
      console.log("Display name lookup result:", photos);
    }

    const result = photos || [];
    console.log("Final result:", result);
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

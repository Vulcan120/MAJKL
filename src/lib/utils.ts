import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Station photo storage utilities
export interface StationPhoto {
  photo: string; // base64 data URL
  timestamp: string; // ISO string
  type: 'verification' | 'additional';
}

export interface StationPhotoData {
  [stationName: string]: StationPhoto[];
}

export function saveStationPhoto(stationName: string, photo: string, type: 'verification' | 'additional' = 'verification'): void {
  try {
    const existingData = getStationPhotos();
    
    if (!existingData[stationName]) {
      existingData[stationName] = [];
    }
    
    const newPhoto: StationPhoto = {
      photo,
      timestamp: new Date().toISOString(),
      type
    };
    
    existingData[stationName].push(newPhoto);
    
    localStorage.setItem('stationPhotos', JSON.stringify(existingData));
  } catch (error) {
    console.error('Error saving station photo:', error);
  }
}

export function getStationPhotos(): StationPhotoData {
  try {
    const data = localStorage.getItem('stationPhotos');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting station photos:', error);
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

export function saveStationVisit(stationName: string, verified: boolean, location?: { latitude: number; longitude: number }): void {
  try {
    const existingLog = getVisitLog();
    
    const newEntry: VisitLogEntry = {
      stationName,
      timestamp: new Date(),
      verified,
      location
    };
    
    // Add new entry to the beginning of the array (most recent first)
    existingLog.unshift(newEntry);
    
    // Keep only the last 100 entries to prevent localStorage from getting too large
    if (existingLog.length > 100) {
      existingLog.splice(100);
    }
    
    localStorage.setItem('stationVisitLog', JSON.stringify(existingLog));
  } catch (error) {
    console.error('Error saving station visit:', error);
  }
}

export function getVisitLog(): VisitLogEntry[] {
  try {
    const data = localStorage.getItem('stationVisitLog');
    if (!data) return [];
    
    const entries = JSON.parse(data);
    
    // Convert timestamp strings back to Date objects
    return entries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  } catch (error) {
    console.error('Error getting visit log:', error);
    return [];
  }
}

export function clearVisitLog(): void {
  try {
    localStorage.removeItem('stationVisitLog');
  } catch (error) {
    console.error('Error clearing visit log:', error);
  }
}

export function getPhotosForStation(stationName: string): StationPhoto[] {
  const allPhotos = getStationPhotos();
  return allPhotos[stationName] || [];
}

export function hasStationPhotos(stationName: string): boolean {
  const photos = getPhotosForStation(stationName);
  return photos.length > 0;
}

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

export function getPhotosForStation(stationName: string): StationPhoto[] {
  const allPhotos = getStationPhotos();
  return allPhotos[stationName] || [];
}

export function hasStationPhotos(stationName: string): boolean {
  const photos = getPhotosForStation(stationName);
  return photos.length > 0;
}

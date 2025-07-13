'use server';

import { verifyStationImage, type VerifyStationImageInput, type VerifyStationImageOutput } from '@/ai/flows/verify-station-image';
import { z } from 'zod';
import { orderByDistance } from 'geolib';
import stationCoordinates from '@/lib/station-coordinates.json';

const actionSchema = z.object({
    photoDataUri: z.string().startsWith('data:image/'),
    stationName: z.string().min(1),
    username: z.string().min(1),
    userLocation: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
});

export async function verifyStationImageAction(input: VerifyStationImageInput & { userLocation?: { latitude: number; longitude: number } }): Promise<VerifyStationImageOutput> {
    const parsedInput = actionSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error(`Invalid input: ${parsedInput.error.message}`);
    }
    
    // Location-based verification: check if user is at one of the 5 closest stations
    if (parsedInput.data.userLocation) {
        try {
            const userCoords = {
                latitude: parsedInput.data.userLocation.latitude,
                longitude: parsedInput.data.userLocation.longitude,
            };

            // Convert station coordinates to array format for geolib
            const stationsArray = Object.entries(stationCoordinates).map(([name, coords]) => ({
                name,
                latitude: coords.latitude,
                longitude: coords.longitude,
            }));

            // Get 5 closest stations
            const closestStations = orderByDistance(userCoords, stationsArray)
                .slice(0, 5)
                .map(station => (station as any).name);

            // Check if the station they're trying to verify is one of the 5 closest
            if (!closestStations.includes(parsedInput.data.stationName)) {
                return {
                    isAuthentic: false,
                    verificationResult: `Location verification failed: You don't appear to be close enough to ${parsedInput.data.stationName}. Please move closer to the station and try again.`
                };
            }
        } catch (error) {
            console.error('Location verification error:', error);
            // Continue with normal verification if location check fails
        }
    }
    
    // In a real app, you might add more checks here, e.g., user authentication, rate limiting.
    
    try {
        const result = await verifyStationImage({
            photoDataUri: parsedInput.data.photoDataUri,
            stationName: parsedInput.data.stationName,
            username: parsedInput.data.username,
        });
        return result;
    } catch(e) {
        console.error("Error in verifyStationImage flow:", e);
        return {
            isAuthentic: false,
            verificationResult: "An error occurred on the server during verification. Please try again later."
        }
    }
}

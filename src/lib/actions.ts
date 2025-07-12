'use server';

import { verifyStationImage, type VerifyStationImageInput, type VerifyStationImageOutput } from '@/ai/flows/verify-station-image';
import { z } from 'zod';

const actionSchema = z.object({
    photoDataUri: z.string().startsWith('data:image/'),
    stationName: z.string().min(1),
    username: z.string().min(1),
});

export async function verifyStationImageAction(input: VerifyStationImageInput): Promise<VerifyStationImageOutput> {
    const parsedInput = actionSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error(`Invalid input: ${parsedInput.error.message}`);
    }
    
    // In a real app, you might add more checks here, e.g., user authentication, rate limiting.
    
    try {
        const result = await verifyStationImage(parsedInput.data);
        return result;
    } catch(e) {
        console.error("Error in verifyStationImage flow:", e);
        return {
            isAuthentic: false,
            verificationResult: "An error occurred on the server during verification. Please try again later."
        }
    }
}

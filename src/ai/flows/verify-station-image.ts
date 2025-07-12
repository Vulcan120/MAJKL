'use server';

/**
 * @fileOverview A flow that verifies if a submitted image provides evidence of a user being at a specific tube station.
 *
 * - verifyStationImage - A function that handles the image verification process.
 * - VerifyStationImageInput - The input type for the verifyStationImage function.
 * - VerifyStationImageOutput - The return type for the verifyStationImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyStationImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo taken at the tube station, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  stationName: z.string().describe('The name of the tube station.'),
  username: z.string().describe('The user\'s handwritten @username included in the image.'),
});
export type VerifyStationImageInput = z.infer<typeof VerifyStationImageInputSchema>;

const VerifyStationImageOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether the image is authentic and contains the required elements.'),
  verificationResult: z.string().describe('A detailed report of the verification process, including any issues found.'),
});
export type VerifyStationImageOutput = z.infer<typeof VerifyStationImageOutputSchema>;

export async function verifyStationImage(input: VerifyStationImageInput): Promise<VerifyStationImageOutput> {
  return verifyStationImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyStationImagePrompt',
  input: {schema: VerifyStationImageInputSchema},
  output: {schema: VerifyStationImageOutputSchema},
  prompt: `You are an expert in image verification. Your task is to determine if a provided image meets specific criteria to verify a user\'s presence at a particular London tube station.

You will receive an image, the name of the station, and the user\'s handwritten @username included in the image. Your verification process should include the following checks:

1. **Image Authenticity:** Ensure the image is not manipulated or fake.
2. **Selfie Presence:** Confirm that the image contains a selfie of a person.
3. **Username Legibility:** Verify that the handwritten @username is clearly visible and legible in the image.
4. **Location Context:** Assess if the image provides evidence of being at the specified tube station. Consider elements such as station signs, platform features, or other identifiable markers.

Based on these checks, provide a detailed report of your verification process, specifying whether the image is considered authentic and meets all the criteria. If any issues are found, clearly state them in the report. Set the isAuthentic output field appropriately.

Station Name: {{{stationName}}}
Username: {{{username}}}
Image: {{media url=photoDataUri}}
`,
});

const verifyStationImageFlow = ai.defineFlow(
  {
    name: 'verifyStationImageFlow',
    inputSchema: VerifyStationImageInputSchema,
    outputSchema: VerifyStationImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

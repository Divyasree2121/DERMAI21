'use server';
/**
 * @fileOverview A real dermatoscopic image analysis AI agent using Gemini.
 * Includes retry logic for handling temporary API unavailability.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PreprocessAnalyzeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A dermatoscopic image of a skin lesion, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type PreprocessAnalyzeImageInput = z.infer<typeof PreprocessAnalyzeImageInputSchema>;

const SkinConditionPredictionSchema = z.object({
  condition: z.string().describe('The name of the suspected skin condition.'),
  score: z.number().describe('The confidence score as a percentage.'),
});

const PreprocessAnalyzeImageOutputSchema = z.object({
  predictedCondition: z.string().describe('The most likely skin condition identified.'),
  confidenceScore: z.number().describe('Confidence score for the primary prediction.'),
  explanation: z.string().describe('Detailed AI reasoning for the diagnosis based on visual features.'),
  allPredictions: z.array(SkinConditionPredictionSchema).describe('A list of all possible conditions identified with their scores.'),
  disclaimer: z.string().describe('A mandatory medical disclaimer.'),
});
export type PreprocessAnalyzeImageOutput = z.infer<typeof PreprocessAnalyzeImageOutputSchema>;

export async function preprocessAnalyzeImage(input: PreprocessAnalyzeImageInput): Promise<PreprocessAnalyzeImageOutput> {
  return preprocessAnalyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'preprocessAnalyzeImagePrompt',
  input: {schema: PreprocessAnalyzeImageInputSchema},
  output: {schema: PreprocessAnalyzeImageOutputSchema},
  prompt: `You are an expert clinical dermatologist and computer vision specialist.
Analyze the following dermatoscopic image for skin condition classification.

Assess visual features such as symmetry, border irregularity, color variation, and diameter. 
Provide a multi-class classification prediction.

Input Image: {{media url=imageDataUri}}

Return the findings in a structured format. Always include a disclaimer that this is an AI tool and not a substitute for professional medical advice.`,
});

const preprocessAnalyzeImageFlow = ai.defineFlow(
  {
    name: 'preprocessAnalyzeImageFlow',
    inputSchema: PreprocessAnalyzeImageInputSchema,
    outputSchema: PreprocessAnalyzeImageOutputSchema,
  },
  async input => {
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const {output} = await prompt(input);
        if (!output) {
          throw new Error('AI failed to generate a response');
        }
        return output;
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.message?.toLowerCase() || '';
        
        // Handle 503 or "high demand" errors with a retry
        if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('unavailable')) {
          retries--;
          if (retries > 0) {
            // Exponential backoff or simple delay
            await new Promise(resolve => setTimeout(resolve, 2000 * (3 - retries)));
            continue;
          }
        }
        throw error;
      }
    }
    throw lastError;
  }
);

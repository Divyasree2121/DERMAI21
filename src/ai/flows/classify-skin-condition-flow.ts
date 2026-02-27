
'use server';
/**
 * @fileOverview Simple skin condition classifier.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifySkinConditionInputSchema = z.object({
  imageDataUri: z.string().describe("Dermatoscopic image as data URI."),
});
export type ClassifySkinConditionInput = z.infer<typeof ClassifySkinConditionInputSchema>;

const ClassifySkinConditionOutputSchema = z.object({
  predictedCondition: z.string(),
  confidenceScore: z.number(),
});
export type ClassifySkinConditionOutput = z.infer<typeof ClassifySkinConditionOutputSchema>;

export async function classifySkinCondition(input: ClassifySkinConditionInput): Promise<ClassifySkinConditionOutput> {
  return classifySkinConditionFlow(input);
}

const classifyPrompt = ai.definePrompt({
  name: 'classifySkinConditionPrompt',
  input: {schema: ClassifySkinConditionInputSchema},
  output: {schema: ClassifySkinConditionOutputSchema},
  prompt: `Identify the skin condition in this dermatoscopic image: {{media url=imageDataUri}}`,
});

const classifySkinConditionFlow = ai.defineFlow(
  {
    name: 'classifySkinConditionFlow',
    inputSchema: ClassifySkinConditionInputSchema,
    outputSchema: ClassifySkinConditionOutputSchema,
  },
  async input => {
    const {output} = await classifyPrompt(input);
    return output!;
  }
);

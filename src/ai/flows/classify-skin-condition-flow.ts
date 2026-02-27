/**
 * @fileOverview This file implements a Genkit flow for classifying dermatoscopic skin images.
 * It takes an image as input and returns a predicted skin condition along with a confidence score.
 *
 * - classifySkinCondition - The main function to call the AI flow for skin condition classification.
 * - ClassifySkinConditionInput - The input type for the classification function.
 * - ClassifySkinConditionOutput - The return type for the classification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifySkinConditionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A dermatoscopic skin image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifySkinConditionInput = z.infer<typeof ClassifySkinConditionInputSchema>;

const ClassifySkinConditionOutputSchema = z.object({
  predictedCondition: z
    .enum([
      'Eczema',
      'Warts',
      'Melanoma',
      'Atopic Dermatitis',
      'Basal Cell Carcinoma',
      'Melanocytic Nevus',
      'Benign Lesion',
      'Psoriasis',
      'Seborrheic Keratosis',
      'Tinea (Dermatophytosis)',
    ])
    .describe('The AI-predicted skin condition from the predefined list.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe('The confidence score (0-100%) for the predicted condition.'),
});
export type ClassifySkinConditionOutput = z.infer<typeof ClassifySkinConditionOutputSchema>;

export async function classifySkinCondition(
  input: ClassifySkinConditionInput
): Promise<ClassifySkinConditionOutput> {
  return classifySkinConditionFlow(input);
}

const classifySkinConditionPrompt = ai.definePrompt({
  name: 'classifySkinConditionPrompt',
  input: {schema: ClassifySkinConditionInputSchema},
  output: {schema: ClassifySkinConditionOutputSchema},
  prompt: `You are an AI-assisted decision-support tool for dermatoscopic skin image analysis.
Your task is to analyze the provided dermatoscopic skin image and classify it into one of the following 10 skin conditions.

Here is the list of possible skin conditions:
- Eczema
- Warts
- Melanoma
- Atopic Dermatitis
- Basal Cell Carcinoma
- Melanocytic Nevus
- Benign Lesion
- Psoriasis
- Seborrheic Keratosis
- Tinea (Dermatophytosis)

Identify the most likely skin condition from the list and provide a confidence score (as a percentage).

Image: {{media url=imageDataUri}}`,
});

const classifySkinConditionFlow = ai.defineFlow(
  {
    name: 'classifySkinConditionFlow',
    inputSchema: ClassifySkinConditionInputSchema,
    outputSchema: ClassifySkinConditionOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: classifySkinConditionPrompt(input),
      config: {
        responseMimeType: 'application/json',
        safetySettings: [
          {category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH'},
          {category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH'},
          {category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH'},
          {category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH'}
        ],
      },
    });
    if (!output) {
      throw new Error('Failed to get output from the AI model.');
    }
    return output;
  }
);

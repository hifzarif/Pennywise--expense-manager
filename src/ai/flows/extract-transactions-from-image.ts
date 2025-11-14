'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting transaction data from a UPI screenshot.
 *
 * It includes:
 * - `extractTransactionsFromImage`: A function to trigger the extraction flow.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractTransactionsInputSchema,
  ExtractTransactionsOutputSchema,
  type ExtractTransactionsInput,
  type ExtractTransactionsOutput,
} from '@/ai/schemas/transaction-schemas';

export async function extractTransactionsFromImage(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  return extractTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionsPrompt',
  input: { schema: ExtractTransactionsInputSchema },
  output: { schema: ExtractTransactionsOutputSchema },
  prompt: `You are an expert at extracting transaction data from UPI (Unified Payments Interface) screenshots from India. Analyze the provided image and extract all transaction details.

For each transaction, identify the recipient's name, the amount, and the date. The amount will be in INR. Assume all transactions are expenses.

Image to analyze: {{media url=imageDataUri}}

Extract the information and return it in the specified JSON format. If no transactions are found, return an empty array.`,
});

const extractTransactionsFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFlow',
    inputSchema: ExtractTransactionsInputSchema,
    outputSchema: ExtractTransactionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

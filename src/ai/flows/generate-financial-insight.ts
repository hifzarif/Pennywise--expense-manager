'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating financial insights based on user transaction history.
 *
 * It includes:
 * - `generateFinancialInsight`:  A function to generate financial insights.
 */

import {ai} from '@/ai/genkit';
import { 
    FinancialInsightInputSchema, 
    FinancialInsightOutputSchema,
    type FinancialInsightInput,
    type FinancialInsightOutput 
} from '@/ai/schemas/financial-insight-schemas';

export async function generateFinancialInsight(input: FinancialInsightInput): Promise<FinancialInsightOutput> {
  return generateFinancialInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightPrompt',
  input: {schema: FinancialInsightInputSchema},
  output: {schema: FinancialInsightOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transaction history and provide a list of 2-3 actionable financial insights as bullet points to help the user better manage their finances.

Transaction History:
{{#each transactions}}
- Name: {{name}}, Amount: {{amount}}, Type: {{type}}, Category: {{category}}
{{/each}}

Based on this data, provide concise and helpful financial insights in a list format.`, 
});

const generateFinancialInsightFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightFlow',
    inputSchema: FinancialInsightInputSchema,
    outputSchema: FinancialInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

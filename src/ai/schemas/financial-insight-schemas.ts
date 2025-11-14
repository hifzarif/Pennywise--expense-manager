import { z } from 'genkit';

export const FinancialInsightInputSchema = z.object({
  transactions: z.array(
    z.object({
      name: z.string().describe('The name of the transaction.'),
      amount: z.number().describe('The amount of the transaction.'),
      type: z.enum(['Income', 'Expense']).describe('The type of transaction (Income or Expense).'),
      category: z.string().describe('The category of the transaction.'),
    })
  ).describe('An array of user transactions.'),
});
export type FinancialInsightInput = z.infer<typeof FinancialInsightInputSchema>;

export const FinancialInsightOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of personalized financial insights based on the transaction history.'),
});
export type FinancialInsightOutput = z.infer<typeof FinancialInsightOutputSchema>;

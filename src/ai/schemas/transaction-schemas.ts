import { z } from 'genkit';

const TransactionSchema = z.object({
  name: z.string().describe('Name of the transaction recipient.'),
  amount: z.number().describe('Amount of the transaction.'),
  date: z.string().describe('Date of the transaction in YYYY-MM-DD format.'),
});

export const ExtractTransactionsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a UPI transaction confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionsInput = z.infer<typeof ExtractTransactionsInputSchema>;

export const ExtractTransactionsOutputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of transactions extracted from the image.'),
});
export type ExtractTransactionsOutput = z.infer<typeof ExtractTransactionsOutputSchema>;

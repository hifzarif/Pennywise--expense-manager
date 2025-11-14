# **App Name**: FinanceFlow

## Core Features:

- User Authentication: Authenticate users with a custom token (or anonymously). Track the userId for data isolation in Firestore.
- Transaction List: Display a list of transactions fetched from Firestore, showing Name, Amount, and Category.
- Spending Summary: Calculate and display total income, total expenses, and net balance based on transactions.
- Add Transaction: Simple form to add new transactions (Name, Amount, Type, Category).
- Save to Firestore: Logic to save new transactions to the user's private Firestore collection.
- Real-time Data Sync: Utilize Firestore's `onSnapshot` to ensure real-time updates to the transaction list and spending summary.
- AI Finance Insights: Uses a tool that leverages generative AI to suggest ways for the user to better handle his finances, using user financial data.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF), offering a sense of stability and trust.
- Background color: Light gray (#F0F0F0), providing a clean, neutral backdrop.
- Accent color: Sea green (#2E8B57) to highlight key interactive elements, with a slight hint of prosperity
- Body and headline font: 'Inter', a grotesque-style sans-serif offering a modern and objective feel.
- Use consistent and simple icons to represent transaction categories.
- Dashboard layout with clear sections for transactions, spending summary, and the AI insight card.
- Subtle transitions when adding transactions or updating the spending summary.
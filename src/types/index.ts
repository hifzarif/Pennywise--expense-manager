import type { Timestamp } from 'firebase/firestore';

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: Timestamp;
  userId: string;
};

export type UserGoal = {
    targetAmount: number;
    deadline: Timestamp;
    dailyTarget: number;
    progress: {
        amountSaved: number;
        daysRemaining: number;
    }
}

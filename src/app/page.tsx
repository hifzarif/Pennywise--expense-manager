'use client';

import * as React from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { Landmark, Loader2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { generateFinancialInsight } from '@/ai/flows/generate-financial-insight';
import { type FinancialInsightInput } from '@/ai/schemas/financial-insight-schemas';
import { useAuth } from '@/components/auth/auth-provider';
import { AiInsightCard } from '@/components/dashboard/ai-insight-card';
import DashboardHeader from '@/components/dashboard/header';
import SummaryCard from '@/components/dashboard/summary-card';
import TransactionItem from '@/components/dashboard/transaction-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/types';
import { GoalCard } from '@/components/dashboard/goal-card';
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';

export default function DashboardPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const firestore = useFirestore();
  const [insights, setInsights] = React.useState<string[]>([]);
  const [insightLoading, setInsightLoading] = React.useState(false);
  const { toast } = useToast();

  const transactionsQuery = React.useMemo(() => {
    if (user && firestore) {
      return query(collection(firestore, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
    }
    return null;
  }, [user, firestore]);

  const { data: transactions, isLoading: loading } = useCollection<Transaction>(transactionsQuery);

  const handleGenerateInsight = React.useCallback(async () => {
    if (!transactions || transactions.length === 0) {
      toast({
        title: 'Not enough data',
        description: 'Add some transactions to generate an insight.',
        variant: 'destructive',
      });
      return;
    }
    setInsightLoading(true);
    try {
      const insightInput: FinancialInsightInput = {
        transactions: transactions.map((t) => ({
          name: t.name,
          amount: t.amount,
          type: t.type,
          category: t.category,
        })),
      };
      const result = await generateFinancialInsight(insightInput);
      setInsights(result.insights);
    } catch (error) {
      console.error('Error generating insight:', error);
      toast({
        title: 'Error',
        description: 'Could not generate AI insight. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setInsightLoading(false);
    }
  }, [transactions, toast]);

  const summary = React.useMemo(() => {
    const safeTransactions = transactions || [];
    const income = safeTransactions
      .filter((t) => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = safeTransactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const net = income - expenses;
    return { income, expenses, net };
  }, [transactions]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="flex justify-center items-center gap-2 text-2xl">
              <Landmark className="h-8 w-8 text-primary"/> PennyWise
            </CardTitle>
            <CardDescription>Your Smart Personal Finance Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">Please sign in to continue.</p>
            <Button onClick={() => signIn()} className="w-full">
              Sign In Anonymously
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 mt-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <SummaryCard
            title="Total Income"
            amount={summary.income}
            icon={TrendingUp}
            description="Total income received"
            colorClass="text-green-500"
          />
          <SummaryCard
            title="Total Expenses"
            amount={summary.expenses}
            icon={TrendingDown}
            description="Total expenses paid"
            colorClass="text-red-500"
          />
          <SummaryCard
            title="Net Balance"
            amount={summary.net}
            icon={Wallet}
            description="Your current balance"
          />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
          <Card className="lg:col-span-4 h-fit">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions yet.</p>
                  <p className="text-sm text-muted-foreground">Add a transaction or upload a screenshot to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="lg:col-span-3 space-y-4">
            <AiInsightCard
              insights={insights}
              loading={insightLoading}
              onGenerate={handleGenerateInsight}
            />
            <GoalCard currentBalance={summary.net}/>
          </div>
        </div>
        <SpendingBreakdown transactions={transactions || []} />
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {getCategoryIcon} from '@/components/icons';

interface SpendingBreakdownProps {
  transactions: Transaction[];
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
];

export function SpendingBreakdown({ transactions }: SpendingBreakdownProps) {
  const expenses = React.useMemo(
    () => (transactions || []).filter((t) => t.type === 'Expense'),
    [transactions]
  );

  const categorySpending = React.useMemo(() => {
    const spendingMap = new Map<string, number>();
    expenses.forEach((t) => {
      spendingMap.set(t.category, (spendingMap.get(t.category) || 0) + t.amount);
    });
    return Array.from(spendingMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);
  
  const dailySpending = React.useMemo(() => {
    const spendingMap = new Map<string, number>();
    expenses.forEach((t) => {
        if (t.date) {
            const date = new Date(t.date.seconds * 1000).toISOString().split('T')[0];
            spendingMap.set(date, (spendingMap.get(date) || 0) + t.amount);
        }
    });
    return Array.from(spendingMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);


  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    categorySpending.forEach((category, index) => {
      config[category.name] = {
        label: category.name,
        color: chartColors[index % chartColors.length],
        icon: getCategoryIcon(category.name),
      };
    });
    return config;
  }, [categorySpending]);
  
  if (!transactions || transactions.length === 0) {
      return null;
  }

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>A look at where your money is going.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            {categorySpending.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categorySpending}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No expense data to display.
                </div>
            )}
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Daily Spending</CardTitle>
              <CardDescription>Your spending activity over the last few days.</CardDescription>
          </CardHeader>
          <CardContent>
              {dailySpending.length > 0 ? (
                <ChartContainer config={{
                    amount: {
                        label: "Amount",
                        color: "hsl(var(--chart-1))"
                    }
                }} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={dailySpending}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                    </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No expense data to display.
                </div>
              )}
          </CardContent>
      </Card>

    </div>
  );
}

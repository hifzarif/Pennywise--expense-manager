'use client';

import type { Transaction } from '@/types';
import { getCategoryIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const Icon = getCategoryIcon(transaction.category);
  const isIncome = transaction.type === 'Income';

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(transaction.amount);

  const formattedDate = transaction.date
    ? new Date(transaction.date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Date not available';

  return (
    <div className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
      <div className="bg-muted p-3 rounded-full">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="grid gap-1 flex-1">
        <p className="text-sm font-medium leading-none">{transaction.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            <span>&middot;</span>
            <Badge variant="outline" className="text-xs">{transaction.category}</Badge>
        </div>
      </div>
      <div className={cn('text-sm font-semibold', isIncome ? 'text-green-500' : 'text-red-500')}>
        {isIncome ? `+${formattedAmount}` : `-${formattedAmount}`}
      </div>
    </div>
  );
}

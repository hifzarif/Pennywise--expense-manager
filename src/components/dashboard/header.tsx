'use client';

import { Landmark, UserCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { UploadTransactionsDialog } from './upload-transactions-dialog';
import { AddTransactionSheet } from './add-transaction-sheet';

export default function DashboardHeader() {
    const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">PennyWise</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <UploadTransactionsDialog />
            <AddTransactionSheet />
            {user && (
                <Badge variant="outline" className='flex items-center gap-2'>
                    <UserCircle className='h-4 w-4 text-muted-foreground'/>
                    <span className='text-muted-foreground'>User ID:</span> {user.uid.slice(0, 8)}...
                </Badge>
            )}
        </div>
    </header>
  );
}

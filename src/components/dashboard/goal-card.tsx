'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Target, Calendar as CalendarIcon, Edit, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/components/auth/auth-provider';
import { useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserGoal } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Progress } from '../ui/progress';

const goalSchema = z.object({
  targetAmount: z.coerce.number().positive('Target amount must be a positive number.'),
  deadline: z.date({
    required_error: 'A deadline is required.',
  }),
});

interface GoalCardProps {
    currentBalance: number;
}

export function GoalCard({ currentBalance }: GoalCardProps) {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const userDocRef = React.useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: userData, isLoading: userLoading } = useDoc<{ goal?: UserGoal }>(userDocRef);
  const goal = userData?.goal;

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      targetAmount: 0,
      deadline: new Date(),
    },
  });
  
  React.useEffect(() => {
    if (goal && goal.deadline) {
      form.reset({
        targetAmount: goal.targetAmount,
        deadline: new Date(goal.deadline.seconds * 1000),
      });
    }
  }, [goal, form]);


  async function onSubmit(values: z.infer<typeof goalSchema>) {
    if (!user || !userDocRef) return;
    setIsSubmitting(true);

    const daysRemaining = Math.max(1, Math.ceil((values.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const amountToSave = values.targetAmount - (currentBalance > 0 ? currentBalance : 0);

    const goalData: UserGoal = {
        targetAmount: values.targetAmount,
        deadline: Timestamp.fromDate(values.deadline),
        progress: {
            amountSaved: currentBalance > 0 ? currentBalance : 0,
            daysRemaining: daysRemaining,
        },
        dailyTarget: amountToSave > 0 ? amountToSave / daysRemaining : 0,
    };
    
    updateDoc(userDocRef, { goal: goalData })
      .then(() => {
        toast({
          title: 'Success!',
          description: 'Your goal has been saved.',
        });
        setIsEditing(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: { goal: goalData },
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            title: "Error",
            description: "Could not save your goal. Please try again.",
            variant: "destructive"
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const progressPercentage = goal ? Math.max(0, Math.min(100, (currentBalance / goal.targetAmount) * 100)) : 0;
  
  if (userLoading) {
      return (
          <Card>
              <CardContent className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
      )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Tracker
          </CardTitle>
          <CardDescription>Set and track your financial goals.</CardDescription>
        </div>
        {!isEditing && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Save Goal
                </Button>
              </div>
            </form>
          </Form>
        ) : goal ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                <span className="text-sm font-bold">{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
            <div className="flex justify-between text-sm">
                <span className="font-medium">Saved:</span>
                <span className='font-mono'>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(currentBalance)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="font-medium">Target:</span>
                 <span className='font-mono'>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(goal.targetAmount)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="font-medium">Deadline:</span>
                 <span>{goal.deadline ? format(new Date(goal.deadline.seconds * 1000), 'PPP') : 'N/A'}</span>
            </div>
            {goal.dailyTarget > 0 && (
                <div className="flex justify-between text-sm text-primary p-2 bg-primary/10 rounded-md">
                    <span className="font-medium">Daily Target:</span>
                    <span className='font-mono'>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(goal.dailyTarget)}</span>
                </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">You haven't set a goal yet.</p>
            <Button size="sm" className="mt-2" onClick={() => setIsEditing(true)}>Set a Goal</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

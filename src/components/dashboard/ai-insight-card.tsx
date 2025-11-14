'use client';

import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AiInsightCardProps {
  insights: string[];
  loading: boolean;
  onGenerate: () => void;
}

export function AiInsightCard({ insights, loading, onGenerate }: AiInsightCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className='flex items-center gap-2'>
        <BrainCircuit className="h-6 w-6 text-primary" />
        <CardTitle>AI Financial Insight</CardTitle>
        </div>
        <Button size="sm" onClick={onGenerate} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap ml-2">
            {loading ? 'Analyzing...' : 'Generate Insight'}
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground animate-pulse">Analyzing your finances...</p>
          </div>
        ) : insights && insights.length > 0 ? (
          <ul className="space-y-2 text-sm list-disc pl-5 text-foreground/90">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Click the "Generate Insight" button to get personalized financial tips.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

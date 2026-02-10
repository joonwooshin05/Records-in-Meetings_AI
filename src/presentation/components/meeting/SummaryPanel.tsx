'use client';

import type { Summary } from '@/src/domain/entities/Summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface SummaryPanelProps {
  summary: Summary | null;
  isGenerating: boolean;
  onGenerate: () => void;
  error?: string | null;
  canGenerate: boolean;
}

export function SummaryPanel({
  summary,
  isGenerating,
  onGenerate,
  error,
  canGenerate,
}: SummaryPanelProps) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Generating summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
        <p className="text-sm text-destructive">{error}</p>
        {canGenerate && (
          <Button onClick={onGenerate} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
        <p className="text-sm text-muted-foreground">No summary yet.</p>
        {canGenerate && (
          <Button onClick={onGenerate} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Summary
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Key Points
            <Badge variant="secondary">{summary.keyPointCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{summary.fullSummary}</p>
        </CardContent>
      </Card>
    </div>
  );
}


import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingTeamsState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

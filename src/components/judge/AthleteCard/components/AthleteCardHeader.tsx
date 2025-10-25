
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AthleteCardHeaderProps {
  athleteName: string;
  athleteIdentifier: string;
  branchName?: string;
  branchState?: string;
}

export function AthleteCardHeader({ 
  athleteName, 
  athleteIdentifier, 
  branchName, 
  branchState 
}: AthleteCardHeaderProps) {
  return (
    <CardHeader className="pb-3 pt-6">
      <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors mb-2">
        {athleteName}
      </CardTitle>
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-info-background text-info-foreground px-3 py-1 rounded-full text-xs font-medium border border-info/20">
          ID: {athleteIdentifier}
        </span>
        {branchName && (
          <span className="bg-success-background text-success-foreground px-3 py-1 rounded-full text-xs font-medium border border-success/20">
            {branchName}
          </span>
        )}
        {branchState && (
          <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium border border-border">
            {branchState}
          </span>
        )}
      </div>
    </CardHeader>
  );
}

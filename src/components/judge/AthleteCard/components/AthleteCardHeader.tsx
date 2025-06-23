
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
      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
        {athleteName}
      </CardTitle>
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
          ID: {athleteIdentifier}
        </span>
        {branchName && (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
            {branchName}
          </span>
        )}
        {branchState && (
          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
            {branchState}
          </span>
        )}
      </div>
    </CardHeader>
  );
}

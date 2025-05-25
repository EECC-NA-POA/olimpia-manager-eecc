
import React from 'react';
import { Check, X } from 'lucide-react';

interface AthleteScoreStatusProps {
  hasScoreForCurrentModality: boolean;
  modalityId?: number;
}

export function AthleteScoreStatus({ hasScoreForCurrentModality, modalityId }: AthleteScoreStatusProps) {
  return (
    <div 
      className={`${hasScoreForCurrentModality ? 'bg-green-500' : 'bg-red-500'} h-1 w-full flex justify-end items-center pr-1`}
    >
      {hasScoreForCurrentModality && (
        <span className="text-[10px] text-white flex items-center">
          <Check size={12} className="mr-1" />
          Avaliado
        </span>
      )}
      {!hasScoreForCurrentModality && modalityId && (
        <span className="text-[10px] text-white flex items-center">
          <X size={12} className="mr-1" />
          Pendente
        </span>
      )}
    </div>
  );
}

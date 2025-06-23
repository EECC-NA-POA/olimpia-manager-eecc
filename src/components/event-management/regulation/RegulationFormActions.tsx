
import React from 'react';
import { Button } from '@/components/ui/button';
import { EventRegulation } from '@/lib/types/database';

interface RegulationFormActionsProps {
  regulation: EventRegulation | null;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function RegulationFormActions({ regulation, isSubmitting, onCancel }: RegulationFormActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando...' : regulation?.id ? 'Atualizar' : 'Salvar'} Regulamento
      </Button>
    </div>
  );
}

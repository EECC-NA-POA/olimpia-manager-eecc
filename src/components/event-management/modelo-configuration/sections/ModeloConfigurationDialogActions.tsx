
import React from 'react';
import { Button } from '@/components/ui/button';

interface ModeloConfigurationDialogActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ModeloConfigurationDialogActions({
  onCancel,
  onSave,
  isSaving
}: ModeloConfigurationDialogActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={isSaving} className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary">
        {isSaving ? 'Salvando...' : 'Salvar Configuração'}
      </Button>
    </div>
  );
}

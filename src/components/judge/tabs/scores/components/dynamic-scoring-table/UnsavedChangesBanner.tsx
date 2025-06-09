
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface UnsavedChangesBannerProps {
  unsavedCount: number;
  onSaveAll: () => void;
  isSaving: boolean;
}

export function UnsavedChangesBanner({ unsavedCount, onSaveAll, isSaving }: UnsavedChangesBannerProps) {
  if (unsavedCount === 0) return null;

  return (
    <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <span className="text-sm text-yellow-800">
        {unsavedCount} atleta(s) com alterações não salvas
      </span>
      <Button
        onClick={onSaveAll}
        disabled={isSaving}
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        Salvar Todas as Alterações
      </Button>
    </div>
  );
}

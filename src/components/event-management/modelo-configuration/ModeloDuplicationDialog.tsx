
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModeloDuplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (targetModalidadeId: string) => Promise<void>;
  modelo: any;
  modalities: Array<{ id: string; nome: string }>;
  isLoading: boolean;
}

export function ModeloDuplicationDialog({
  isOpen,
  onClose,
  onDuplicate,
  modelo,
  modalities,
  isLoading
}: ModeloDuplicationDialogProps) {
  const [selectedModalidadeId, setSelectedModalidadeId] = useState<string>('');

  const handleDuplicate = async () => {
    if (selectedModalidadeId) {
      await onDuplicate(selectedModalidadeId);
      setSelectedModalidadeId('');
    }
  };

  const availableModalities = modalities.filter(mod => mod.id !== modelo?.modalidade_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar Modelo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Duplicar o modelo <strong>{modelo?.codigo_modelo}</strong> para outra modalidade:
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-modalidade">Modalidade de Destino</Label>
            <Select
              value={selectedModalidadeId}
              onValueChange={setSelectedModalidadeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                {availableModalities.map((modality) => (
                  <SelectItem key={modality.id} value={modality.id}>
                    {modality.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDuplicate} 
              disabled={!selectedModalidadeId || isLoading}
            >
              {isLoading ? 'Duplicando...' : 'Duplicar Modelo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

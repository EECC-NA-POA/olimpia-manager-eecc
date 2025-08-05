import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useModalidadesData } from '../modality-rules/hooks/useModalidadesData';
import { useAuth } from '@/contexts/AuthContext';

interface ModalitySelectorProps {
  selectedModalidades: number[];
  onModalitiesChange: (modalidades: number[]) => void;
  availableModalidades?: number[]; // For monitors, this will be their allowed modalities
}

export function ModalitySelector({ 
  selectedModalidades, 
  onModalitiesChange,
  availableModalidades 
}: ModalitySelectorProps) {
  const { currentEventId } = useAuth();
  const { data: modalidades, isLoading } = useModalidadesData(currentEventId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Modalidades</Label>
        <div className="text-sm text-muted-foreground">Carregando modalidades...</div>
      </div>
    );
  }

  if (!modalidades || modalidades.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Modalidades</Label>
        <div className="text-sm text-muted-foreground">Nenhuma modalidade disponível</div>
      </div>
    );
  }

  // Filter modalities if availableModalidades is provided (for monitors)
  const filteredModalidades = availableModalidades 
    ? modalidades.filter(modalidade => availableModalidades.includes(modalidade.id))
    : modalidades;

  const handleModalidadeToggle = (modalidadeId: number, checked: boolean) => {
    if (checked) {
      onModalitiesChange([...selectedModalidades, modalidadeId]);
    } else {
      onModalitiesChange(selectedModalidades.filter(id => id !== modalidadeId));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Modalidades</Label>
      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
        {filteredModalidades.map((modalidade) => (
          <div key={modalidade.id} className="flex items-center space-x-2">
            <Checkbox
              id={`modalidade-${modalidade.id}`}
              checked={selectedModalidades.includes(modalidade.id)}
              onCheckedChange={(checked) => 
                handleModalidadeToggle(modalidade.id, !!checked)
              }
            />
            <Label 
              htmlFor={`modalidade-${modalidade.id}`}
              className="text-sm font-normal cursor-pointer flex-1"
            >
              {modalidade.nome} - {modalidade.categoria}
              <span className="text-muted-foreground text-xs ml-1">
                ({modalidade.tipo_pontuacao === 'tempo' ? 'Tempo' : 
                  modalidade.tipo_pontuacao === 'distancia' ? 'Distância' : 'Pontos'})
              </span>
            </Label>
          </div>
        ))}
      </div>
      {selectedModalidades.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedModalidades.length} modalidade(s) selecionada(s)
        </div>
      )}
    </div>
  );
}
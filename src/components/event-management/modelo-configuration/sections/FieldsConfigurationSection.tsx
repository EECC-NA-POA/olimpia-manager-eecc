
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DraggableCampoCard } from '../DraggableCampoCard';

interface CampoConfig {
  id: string;
  chave_campo: string;
  rotulo_campo: string;
  tipo_input: string;
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: any;
}

interface FieldsConfigurationSectionProps {
  campos: CampoConfig[];
  onAddCampo: () => void;
  onRemoveCampo: (id: string) => void;
  onUpdateCampo: (id: string, updates: Partial<CampoConfig>) => void;
  onDragEnd: (event: any) => void;
}

export function FieldsConfigurationSection({
  campos,
  onAddCampo,
  onRemoveCampo,
  onUpdateCampo,
  onDragEnd
}: FieldsConfigurationSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Campos do Modelo</CardTitle>
          <Button onClick={onAddCampo} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Campo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Arraste os campos para reordenar. A ordem será refletida na interface de pontuação.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={campos.map(campo => campo.id)}
            strategy={verticalListSortingStrategy}
          >
            {campos.map((campo, index) => (
              <DraggableCampoCard
                key={campo.id}
                campo={campo}
                index={index}
                totalCampos={campos.length}
                onUpdate={onUpdateCampo}
                onRemove={onRemoveCampo}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {campos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum campo configurado.</p>
            <p>Clique em "Adicionar Campo" para começar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

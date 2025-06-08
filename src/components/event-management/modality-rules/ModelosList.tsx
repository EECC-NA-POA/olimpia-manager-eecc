
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ModeloModalidade } from '@/types/dynamicScoring';

interface Modalidade {
  id: number;
  nome: string;
  categoria: string;
  tipo_pontuacao: string;
  tipo_modalidade: string;
}

interface ModelosListProps {
  modelos: ModeloModalidade[];
  modalidades: Modalidade[];
  selectedModalidadeId: number | null;
  isLoadingModelos: boolean;
  onCreateModelo: () => void;
  onEditModelo: (modelo: ModeloModalidade) => void;
  onDeleteModelo: (modeloId: number) => void;
}

export function ModelosList({
  modelos,
  modalidades,
  selectedModalidadeId,
  isLoadingModelos,
  onCreateModelo,
  onEditModelo,
  onDeleteModelo
}: ModelosListProps) {
  const selectedModalidade = modalidades.find(m => m.id === selectedModalidadeId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          Modelos {selectedModalidadeId && `(${selectedModalidade?.nome})`}
        </h3>
        {selectedModalidadeId && (
          <Button size="sm" onClick={onCreateModelo}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Modelo
          </Button>
        )}
      </div>
      
      {selectedModalidadeId ? (
        <div className="border rounded-lg max-h-96 overflow-y-auto">
          {isLoadingModelos ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando modelos...
            </div>
          ) : modelos.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhum modelo configurado
            </div>
          ) : (
            modelos.map((modelo) => (
              <div key={modelo.id} className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{modelo.descricao || modelo.codigo_modelo}</div>
                    <Badge variant="secondary" className="text-xs">
                      {modelo.codigo_modelo}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditModelo(modelo)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteModelo(modelo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 text-center text-muted-foreground">
          Selecione uma modalidade para ver seus modelos
        </div>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Link, Copy } from 'lucide-react';
import { ModeloModalidade } from '@/types/dynamicScoring';
import { useModelosModalidade, useCreateModeloWithFields } from '@/hooks/useDynamicScoring';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [showReuseSection, setShowReuseSection] = useState(false);
  const [selectedModeloToReuse, setSelectedModeloToReuse] = useState<number | null>(null);
  
  const selectedModalidade = modalidades.find(m => m.id === selectedModalidadeId);
  
  // Get all models from all modalities for reuse
  const { data: allModelos = [] } = useModelosModalidade();
  const createModeloWithFieldsMutation = useCreateModeloWithFields();
  
  // Filter out models that are already linked to this modality
  const availableModelsForReuse = allModelos.filter(modelo => 
    modelo.modalidade_id !== selectedModalidadeId
  );

  const handleReuseModel = async () => {
    if (!selectedModeloToReuse || !selectedModalidadeId) return;
    
    const modeloToReuse = allModelos.find(m => m.id === selectedModeloToReuse);
    if (!modeloToReuse) return;

    try {
      await createModeloWithFieldsMutation.mutateAsync({
        modelo: {
          modalidade_id: selectedModalidadeId,
          codigo_modelo: modeloToReuse.codigo_modelo,
          descricao: `${modeloToReuse.descricao} (reutilizado)`,
        },
        sourceModeloId: selectedModeloToReuse
      });
      
      setShowReuseSection(false);
      setSelectedModeloToReuse(null);
    } catch (error) {
      console.error('Error reusing model:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          Modelos {selectedModalidadeId && `(${selectedModalidade?.nome})`}
        </h3>
        {selectedModalidadeId && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowReuseSection(!showReuseSection)}
            >
              <Link className="h-4 w-4 mr-1" />
              Reutilizar
            </Button>
            <Button size="sm" onClick={onCreateModelo}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Modelo
            </Button>
          </div>
        )}
      </div>
      
      {/* Reuse Section */}
      {showReuseSection && selectedModalidadeId && (
        <div className="border rounded-lg p-3 bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Reutilizar modelo existente</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Ao reutilizar um modelo, todos os campos configurados serão copiados automaticamente.
          </p>
          <div className="flex gap-2">
            <Select 
              value={selectedModeloToReuse?.toString() || ""} 
              onValueChange={(value) => setSelectedModeloToReuse(parseInt(value))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um modelo para reutilizar" />
              </SelectTrigger>
              <SelectContent>
                {availableModelsForReuse.map((modelo) => {
                  const modalidade = modalidades.find(m => m.id === modelo.modalidade_id);
                  return (
                    <SelectItem key={modelo.id} value={modelo.id.toString()}>
                      <div className="flex flex-col">
                        <span>{modelo.descricao || modelo.codigo_modelo}</span>
                        <span className="text-xs text-muted-foreground">
                          de: {modalidade?.nome || 'Modalidade não encontrada'}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleReuseModel}
              disabled={!selectedModeloToReuse || createModeloWithFieldsMutation.isPending}
            >
              <Copy className="h-4 w-4 mr-1" />
              {createModeloWithFieldsMutation.isPending ? 'Copiando...' : 'Reutilizar'}
            </Button>
          </div>
        </div>
      )}
      
      {selectedModalidadeId ? (
        <div className="border rounded-lg max-h-96 overflow-y-auto">
          {isLoadingModelos ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando modelos...
            </div>
          ) : modelos.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Nenhum modelo configurado</p>
              <p className="text-xs mt-1">
                Crie um novo modelo ou reutilize um modelo existente
              </p>
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

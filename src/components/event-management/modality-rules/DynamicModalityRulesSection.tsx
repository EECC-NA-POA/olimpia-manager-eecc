
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useModelosModalidade, useDeleteModelo } from '@/hooks/useDynamicScoring';
import { ModeloModalidadeDialog } from './ModeloModalidadeDialog';
import { CamposModeloManager } from './CamposModeloManager';

interface Modalidade {
  id: number;
  nome: string;
  tipo_pontuacao: string;
  tipo_modalidade: string;
}

export function DynamicModalityRulesSection({ eventId }: { eventId: string | null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModalidadeId, setSelectedModalidadeId] = useState<number | null>(null);
  const [isModeloDialogOpen, setIsModeloDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);

  // Fetch modalidades for this event
  const { data: modalidades = [], isLoading: isLoadingModalidades } = useQuery({
    queryKey: ['modalidades', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, tipo_pontuacao, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('nome');
      
      if (error) throw error;
      return data as Modalidade[];
    },
    enabled: !!eventId
  });

  // Fetch modelos for the selected modalidade
  const { data: modelos = [], isLoading: isLoadingModelos } = useModelosModalidade(
    selectedModalidadeId || undefined
  );

  const deleteModeloMutation = useDeleteModelo();

  const filteredModalidades = modalidades.filter(modalidade =>
    modalidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateModelo = () => {
    if (!selectedModalidadeId) return;
    setEditingModelo(null);
    setIsModeloDialogOpen(true);
  };

  const handleEditModelo = (modelo: any) => {
    setEditingModelo(modelo);
    setIsModeloDialogOpen(true);
  };

  const handleDeleteModelo = async (modeloId: number) => {
    if (!confirm('Tem certeza que deseja excluir este modelo? Todos os campos relacionados também serão excluídos.')) {
      return;
    }
    
    deleteModeloMutation.mutate(modeloId);
  };

  if (isLoadingModalidades) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modelos de Pontuação Dinâmica</CardTitle>
          <div className="text-sm text-muted-foreground">
            Configure modelos de pontuação personalizados para cada modalidade
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar modalidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Modalidades List */}
              <div className="space-y-2">
                <h3 className="font-medium">Modalidades</h3>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {filteredModalidades.map((modalidade) => (
                    <div
                      key={modalidade.id}
                      className={`p-3 border-b cursor-pointer hover:bg-accent transition-colors ${
                        selectedModalidadeId === modalidade.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedModalidadeId(modalidade.id)}
                    >
                      <div className="font-medium">{modalidade.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {modalidade.tipo_modalidade} • {modalidade.tipo_pontuacao}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modelos for Selected Modalidade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Modelos {selectedModalidadeId && `(${modalidades.find(m => m.id === selectedModalidadeId)?.nome})`}
                  </h3>
                  {selectedModalidadeId && (
                    <Button size="sm" onClick={handleCreateModelo}>
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
                                onClick={() => handleEditModelo(modelo)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteModelo(modelo.id)}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos Management */}
      {modelos.length > 0 && (
        <CamposModeloManager modelos={modelos} />
      )}

      {/* Modelo Dialog */}
      <ModeloModalidadeDialog
        isOpen={isModeloDialogOpen}
        onClose={() => setIsModeloDialogOpen(false)}
        modalidadeId={selectedModalidadeId}
        editingModelo={editingModelo}
      />
    </div>
  );
}


import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit2 } from 'lucide-react';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade, CampoModelo } from '@/types/dynamicScoring';
import { filterScoringFields, modelUsesBateriasByFields } from '@/utils/dynamicScoringUtils';

interface DynamicAthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modelo: ModeloModalidade;
  selectedBateriaId?: number | null;
}

export function DynamicAthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicAthletesTableProps) {
  const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const mutation = useDynamicScoringSubmission();

  // Fetch campos for this modelo
  const { data: allCampos = [] } = useQuery({
    queryKey: ['campos-modelo', modelo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id)
        .order('ordem_exibicao');

      if (error) throw error;
      return data as CampoModelo[];
    },
    enabled: !!modelo.id,
  });

  // Filter to only scoring fields (remove configuration fields)
  const campos = filterScoringFields(allCampos);
  const usesBaterias = modelUsesBateriasByFields(allCampos);

  console.log('DynamicAthletesTable - All campos:', allCampos);
  console.log('DynamicAthletesTable - Filtered scoring campos:', campos);
  console.log('DynamicAthletesTable - Uses baterias:', usesBaterias);
  console.log('DynamicAthletesTable - Selected bateria:', selectedBateriaId);

  const handleEdit = (athleteId: string) => {
    setEditingAthleteId(athleteId);
    setEditValues({});
  };

  const handleSave = async (athlete: Athlete) => {
    try {
      const formData = {
        ...editValues,
        notes: editValues.notes || ''
      };

      await mutation.mutateAsync({
        athleteId: athlete.atleta_id,
        modalityId,
        eventId: eventId || '',
        judgeId,
        modeloId: modelo.id,
        formData,
        bateriaId: selectedBateriaId
      });

      setEditingAthleteId(null);
      setEditValues({});
      toast.success('Pontuação salva com sucesso!');
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    }
  };

  const handleCancel = () => {
    setEditingAthleteId(null);
    setEditValues({});
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  if (!eventId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum evento selecionado
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Nenhum campo de pontuação configurado</h3>
          <p className="text-sm">
            Este modelo possui apenas campos de configuração. 
            Configure campos de pontuação no painel de administração para habilitar a pontuação dinâmica.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          <p className="text-sm">
            <strong>Modelo atual:</strong> {modelo.descricao || modelo.codigo_modelo}
          </p>
          {usesBaterias && (
            <p className="text-xs mt-1">
              <strong>Sistema de baterias:</strong> Ativo
            </p>
          )}
          <p className="text-xs mt-1">
            Acesse "Administração → Gestão de Eventos → Regras de Modalidades" para configurar os campos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {usesBaterias && selectedBateriaId && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="text-blue-800 text-sm font-medium">
            Sistema de Baterias Ativo - Bateria {selectedBateriaId}
          </div>
          <div className="text-blue-700 text-xs mt-1">
            Pontuações serão registradas para a bateria selecionada
          </div>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Atleta</TableHead>
            <TableHead className="w-[150px]">Filial</TableHead>
            {campos.map((campo) => (
              <TableHead key={campo.chave_campo} className="text-center min-w-[120px]">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{campo.rotulo_campo}</span>
                  {campo.obrigatorio && <span className="text-red-500 text-xs">*obrigatório</span>}
                  <span className="text-xs text-muted-foreground">({campo.tipo_input})</span>
                </div>
              </TableHead>
            ))}
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.map((athlete) => {
            const isEditing = editingAthleteId === athlete.atleta_id;
            
            return (
              <TableRow key={athlete.atleta_id}>
                <TableCell>
                  <div className="font-medium">{athlete.atleta_nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {athlete.tipo_documento}: {athlete.numero_documento}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {athlete.filial_nome || athlete.equipe_nome || 'N/A'}
                  </div>
                  {athlete.origem_cidade && (
                    <div className="text-xs text-muted-foreground">
                      {athlete.origem_cidade}
                      {athlete.origem_uf && ` - ${athlete.origem_uf}`}
                    </div>
                  )}
                </TableCell>
                {campos.map((campo) => (
                  <TableCell key={campo.chave_campo} className="text-center">
                    {isEditing ? (
                      <div className="w-24 mx-auto">
                        {campo.tipo_input === 'number' ? (
                          <Input
                            type="number"
                            value={editValues[campo.chave_campo] || ''}
                            onChange={(e) => handleFieldChange(campo.chave_campo, parseFloat(e.target.value) || 0)}
                            className="text-center"
                            min={campo.metadados?.min}
                            max={campo.metadados?.max}
                            step={campo.metadados?.step || 'any'}
                            placeholder={`Ex: ${campo.metadados?.min || 0}`}
                          />
                        ) : campo.tipo_input === 'select' ? (
                          <select
                            value={editValues[campo.chave_campo] || ''}
                            onChange={(e) => handleFieldChange(campo.chave_campo, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Selecione...</option>
                            {campo.metadados?.opcoes?.map((opcao) => (
                              <option key={opcao} value={opcao}>
                                {opcao}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type="text"
                            value={editValues[campo.chave_campo] || ''}
                            onChange={(e) => handleFieldChange(campo.chave_campo, e.target.value)}
                            className="text-center"
                            placeholder="Digite aqui"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {/* Aqui mostraria o valor salvo se existisse */}
                        -
                      </span>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    Pendente
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(athlete)}
                          disabled={mutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          className="h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(athlete.atleta_id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {campos.length > 0 && (
        <div className="bg-muted/50 p-3 text-xs text-muted-foreground">
          <p><strong>Dica:</strong> Use o botão "Editar" para inserir pontuações. Os campos marcados com * são obrigatórios.</p>
          {usesBaterias && (
            <p><strong>Baterias:</strong> Use a seção "Gerenciamento de Baterias" acima para criar/editar baterias.</p>
          )}
        </div>
      )}
    </div>
  );
}

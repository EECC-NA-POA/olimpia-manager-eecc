import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade, CampoModelo } from '@/types/dynamicScoring';
import { DynamicInputField } from './dynamic-scoring-table/DynamicInputField';
import { AthleteStatusCell } from './dynamic-scoring-table/AthleteStatusCell';
import { useDynamicScoringTableState } from './dynamic-scoring-table/useDynamicScoringTableState';

interface DynamicScoringTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: ModeloModalidade;
  selectedBateriaId?: number | null;
}

export function DynamicScoringTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicScoringTableProps) {
  const queryClient = useQueryClient();
  const mutation = useDynamicScoringSubmission();

  const {
    editingAthletes,
    editValues,
    unsavedChanges,
    startEditing,
    stopEditing,
    updateFieldValue,
    hasUnsavedChanges,
    clearUnsavedChanges
  } = useDynamicScoringTableState();

  // Fetch campos for this modelo
  const { data: allCampos = [], isLoading: isLoadingCampos } = useQuery({
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

  // Filter campos to remove configuration fields and fields not relevant for judges
  const campos = allCampos.filter(campo => {
    const chaveField = campo.chave_campo?.toLowerCase() || '';
    const rotuloField = campo.rotulo_campo?.toLowerCase() || '';
    
    // Remove configuration fields that judges shouldn't fill
    const configFields = [
      'bateria', 
      'numero_bateria', 
      'config',
      'usar_baterias',
      'configuracao_pontuacao',
      'usar_bateria',
      'configuracao_de_pontuacao',
      'usar baterias',
      'configuração de pontuação',
      'configuração_de_pontuação'
    ];
    
    // Check both chave_campo and rotulo_campo
    const isConfigField = configFields.some(configField => 
      chaveField.includes(configField) || rotuloField.includes(configField)
    );
    
    return !isConfigField;
  });

  // Fetch existing scores for all athletes in this bateria - CORREÇÃO AQUI
  const { data: existingScores = [], refetch: refetchScores } = useQuery({
    queryKey: ['dynamic-scores', modalityId, eventId, selectedBateriaId],
    queryFn: async () => {
      if (!eventId || !modalityId) return [];
      
      // Buscar pontuações com as tentativas relacionadas
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao(*)
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('juiz_id', judgeId)
        .in('atleta_id', athletes.map(a => a.atleta_id));

      if (selectedBateriaId) {
        query = query.eq('numero_bateria', selectedBateriaId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      console.log('Fetched dynamic scores:', data);
      
      // Transformar os dados para o formato esperado
      return (data || []).map(pontuacao => ({
        ...pontuacao,
        tentativas: pontuacao.tentativas_pontuacao?.reduce((acc: any, tentativa: any) => {
          acc[tentativa.chave_campo] = tentativa.valor;
          return acc;
        }, {}) || {}
      }));
    },
    enabled: !!eventId && !!modalityId && athletes.length > 0,
  });

  const handleEdit = (athleteId: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    startEditing(athleteId, existingScore, campos);
  };

  const handleSave = async (athleteId: string) => {
    const athleteEditValues = editValues[athleteId];
    if (!athleteEditValues) return;

    try {
      const formData = { ...athleteEditValues };

      await mutation.mutateAsync({
        athleteId,
        modalityId,
        eventId,
        judgeId,
        modeloId: modelo.id,
        formData,
        bateriaId: selectedBateriaId
      });

      stopEditing(athleteId);
      clearUnsavedChanges(athleteId);
      await refetchScores();
      toast.success('Pontuação salva com sucesso!');
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    }
  };

  const handleCancel = (athleteId: string) => {
    stopEditing(athleteId);
    clearUnsavedChanges(athleteId);
  };

  const getFieldValue = (athleteId: string, fieldKey: string) => {
    const editValue = editValues[athleteId]?.[fieldKey];
    if (editValue !== undefined) return editValue;
    
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    return existingScore?.tentativas?.[fieldKey] || '';
  };

  const hasExistingScore = (athleteId: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    return existingScore && Object.keys(existingScore.tentativas || {}).length > 0;
  };

  if (isLoadingCampos) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando campos...</span>
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Nenhum campo de pontuação configurado</h3>
          <p className="text-sm">
            Este modelo não possui campos de pontuação configurados para os juízes preencherem.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          <p className="text-sm">
            <strong>Modelo atual:</strong> {modelo.descricao || modelo.codigo_modelo}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasUnsavedChanges() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-yellow-800 text-sm">
              <strong>Alterações não salvas!</strong> Você tem alterações pendentes.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Atualizar página
            </Button>
          </div>
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        {selectedBateriaId && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="text-blue-800 text-sm font-medium">
              Sistema de Baterias Ativo - Bateria {selectedBateriaId === 999 ? 'Final' : selectedBateriaId}
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
              const isEditing = editingAthletes.has(athlete.atleta_id);
              const existingScore = existingScores.find(s => s.atleta_id === athlete.atleta_id);
              const athleteHasScore = hasExistingScore(athlete.atleta_id);
              
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
                  {campos.map((campo) => {
                    if (campo.tipo_input === 'calculated') {
                      return (
                        <TableCell key={campo.chave_campo} className="text-center">
                          <span className="text-sm text-muted-foreground">
                            Calculado automaticamente
                          </span>
                        </TableCell>
                      );
                    }
                    
                    return (
                      <TableCell key={campo.chave_campo} className="text-center">
                        {(isEditing || !athleteHasScore) ? (
                          <DynamicInputField
                            athleteId={athlete.atleta_id}
                            campo={campo}
                            value={getFieldValue(athlete.atleta_id, campo.chave_campo)}
                            onChange={(value) => updateFieldValue(athlete.atleta_id, campo.chave_campo, value)}
                            selectedBateriaId={selectedBateriaId}
                          />
                        ) : (
                          <span className="text-sm">
                            {getFieldValue(athlete.atleta_id, campo.chave_campo) || '-'}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                  <AthleteStatusCell 
                    hasUnsavedChanges={unsavedChanges.has(athlete.atleta_id)}
                  />
                  <TableCell>
                    <div className="flex gap-1">
                      {(isEditing || !athleteHasScore) ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(athlete.atleta_id)}
                            disabled={mutation.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          {athleteHasScore && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(athlete.atleta_id)}
                              className="h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          )}
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
      </div>
      
      {campos.length > 0 && (
        <div className="bg-muted/50 p-3 text-xs text-muted-foreground">
          <p><strong>Dica:</strong> Use o botão "Editar" para inserir pontuações. Os campos marcados com * são obrigatórios.</p>
          {selectedBateriaId && (
            <p><strong>Baterias:</strong> Use a navegação de baterias acima para alternar entre diferentes baterias.</p>
          )}
        </div>
      )}
    </div>
  );
}

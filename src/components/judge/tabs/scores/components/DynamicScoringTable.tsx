
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade, CampoModelo } from '@/types/dynamicScoring';
import { useDynamicScoringTableState } from './dynamic-scoring-table/useDynamicScoringTableState';
import { useDynamicScoreData } from './dynamic-scoring-table/hooks/useDynamicScoreData';
import { DynamicScoringTableContent } from './dynamic-scoring-table/DynamicScoringTableContent';

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

  // Filter campos to remove only pure configuration fields
  const campos = allCampos.filter(campo => {
    const chaveField = campo.chave_campo?.toLowerCase() || '';
    const rotuloField = campo.rotulo_campo?.toLowerCase() || '';
    
    // Remove only pure configuration fields that judges shouldn't fill
    const pureConfigFields = [
      'config',
      'usar_baterias',
      'configuracao_pontuacao',
      'configuracao_de_pontuacao',
      'usar baterias',
      'configuração de pontuação',
      'configuração_de_pontuação'
    ];
    
    // Check both chave_campo and rotulo_campo for pure config fields
    const isPureConfigField = pureConfigFields.some(configField => 
      chaveField.includes(configField) || rotuloField.includes(configField)
    );
    
    console.log('Campo filter check:', {
      chave: campo.chave_campo,
      rotulo: campo.rotulo_campo,
      isPureConfigField,
      shouldShow: !isPureConfigField
    });
    
    return !isPureConfigField;
  });

  console.log('=== CAMPOS DEBUG ===');
  console.log('All campos fetched:', allCampos);
  console.log('Filtered campos for table:', campos);
  console.log('Total campos to show:', campos.length);

  // Fetch existing scores
  const { data: existingScores = [], refetch: refetchScores } = useDynamicScoreData({
    modalityId,
    eventId,
    selectedBateriaId,
    judgeId,
    athletes
  });

  const handleEdit = (athleteId: string) => {
    console.log('=== STARTING EDIT ===');
    console.log('Athlete ID:', athleteId);
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    console.log('Existing score for athlete:', existingScore);
    
    // Initialize edit values with valor_formatado for display
    const initialValues: Record<string, any> = {};
    if (existingScore?.tentativas) {
      Object.keys(existingScore.tentativas).forEach(fieldKey => {
        const tentativa = existingScore.tentativas[fieldKey];
        initialValues[fieldKey] = tentativa.valor_formatado || tentativa.valor || '';
      });
    }
    
    // Add bateria field if selectedBateriaId exists and not in existing values
    if (selectedBateriaId && !initialValues.bateria && !initialValues.numero_bateria) {
      const bateriaField = campos.find(c => c.chave_campo === 'bateria' || c.chave_campo === 'numero_bateria');
      if (bateriaField) {
        initialValues[bateriaField.chave_campo] = selectedBateriaId === 999 ? 'Final' : selectedBateriaId.toString();
      }
    }
    
    console.log('Initial edit values:', initialValues);
    startEditing(athleteId, { tentativas: initialValues }, campos);
  };

  const handleSave = async (athleteId: string) => {
    const athleteEditValues = editValues[athleteId];
    if (!athleteEditValues) {
      console.error('No edit values found for athlete:', athleteId);
      toast.error('Erro: dados de edição não encontrados');
      return;
    }

    console.log('=== SAVING SCORE ===');
    console.log('Athlete ID:', athleteId);
    console.log('Values to save:', athleteEditValues);

    try {
      // Prepare form data ensuring all required fields are included
      const formData = { ...athleteEditValues };
      
      // Add bateria field if not present but selectedBateriaId exists
      if (selectedBateriaId && !formData.bateria && !formData.numero_bateria) {
        const bateriaField = campos.find(c => c.chave_campo === 'bateria' || c.chave_campo === 'numero_bateria');
        if (bateriaField) {
          formData[bateriaField.chave_campo] = selectedBateriaId === 999 ? 'Final' : selectedBateriaId;
        }
      }

      console.log('Final form data for submission:', formData);

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
      toast.error('Erro ao salvar pontuação: ' + (error as Error).message);
    }
  };

  const handleCancel = (athleteId: string) => {
    stopEditing(athleteId);
    clearUnsavedChanges(athleteId);
  };

  const getFieldValue = (athleteId: string, fieldKey: string) => {
    // Always check edit values first (for when user is editing)
    const editValue = editValues[athleteId]?.[fieldKey];
    if (editValue !== undefined) {
      console.log(`Getting field value for ${athleteId}.${fieldKey}: ${editValue} (from edit values)`);
      return editValue;
    }
    
    // Then check existing scores (for display when not editing)
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    const tentativa = existingScore?.tentativas?.[fieldKey];
    const existingValue = tentativa?.valor_formatado || tentativa?.valor || '';
    console.log(`Getting field value for ${athleteId}.${fieldKey}: ${existingValue} (from existing scores)`);
    return existingValue;
  };

  const getDisplayValue = (athleteId: string, fieldKey: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    const tentativa = existingScore?.tentativas?.[fieldKey];
    return tentativa?.valor_formatado || tentativa?.valor || '-';
  };

  const hasExistingScore = (athleteId: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    const hasScore = existingScore && Object.keys(existingScore.tentativas || {}).length > 0;
    console.log(`Athlete ${athleteId} has existing score:`, hasScore);
    return hasScore;
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
      
      <DynamicScoringTableContent
        athletes={athletes}
        campos={campos}
        selectedBateriaId={selectedBateriaId}
        editingAthletes={editingAthletes}
        editValues={editValues}
        unsavedChanges={unsavedChanges}
        existingScores={existingScores}
        isSaving={mutation.isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onFieldChange={updateFieldValue}
        getFieldValue={getFieldValue}
        getDisplayValue={getDisplayValue}
        hasExistingScore={hasExistingScore}
      />
      
      {campos.length > 0 && (
        <div className="bg-muted/50 p-3 text-xs text-muted-foreground">
          <p><strong>Dica:</strong> Use o botão "Editar" para inserir pontuações. Os campos marcados com * são obrigatórios.</p>
          {selectedBateriaId && (
            <p><strong>Baterias:</strong> Use a navegação de baterias acima para alternar entre diferentes baterias.</p>
          )}
          <p><strong>Edição:</strong> Clique em "Editar" para modificar pontuações já lançadas.</p>
        </div>
      )}
    </div>
  );
}

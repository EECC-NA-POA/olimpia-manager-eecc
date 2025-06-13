
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade, CampoModelo } from '@/types/dynamicScoring';
import { useDynamicScoringTableState } from './useDynamicScoringTableState';
import { useDynamicScoreData } from './hooks/useDynamicScoreData';
import { useDynamicScoringTableOperations } from './useDynamicScoringTableOperations';
import { useDynamicScoringFieldValues } from './useDynamicScoringFieldValues';
import { DynamicScoringTableContent } from './DynamicScoringTableContent';

interface DynamicScoringTableMainProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: ModeloModalidade;
  selectedBateriaId?: number | null;
}

export function DynamicScoringTableMain({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicScoringTableMainProps) {
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

  // Initialize field value management
  const { getFieldValue, getDisplayValue, hasExistingScore } = useDynamicScoringFieldValues(
    existingScores,
    editValues
  );

  // Initialize table operations
  const { handleEdit, handleSave, handleCancel, isSaving } = useDynamicScoringTableOperations({
    modalityId,
    eventId,
    judgeId,
    modelo,
    selectedBateriaId,
    campos,
    existingScores,
    editValues,
    refetchScores,
    stopEditing,
    clearUnsavedChanges
  });

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
        isSaving={isSaving}
        onEdit={(athleteId) => handleEdit(athleteId, startEditing)}
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

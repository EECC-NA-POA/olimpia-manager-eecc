
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';
import { useSchemaCreation } from './dynamic-score-form/useSchemaCreation';
import { useFormSubmission } from './dynamic-score-form/useFormSubmission';
import { DynamicScoreFormContent } from './dynamic-score-form/DynamicScoreFormContent';
import { useModeloConfiguration } from '../../tabs/scores/hooks/useModeloConfiguration';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicScoreFormProps {
  modeloId: number;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  eventId: string;
  judgeId: string;
  numeroBateria?: number; // Changed from bateriaId to numeroBateria
  raia?: number;
  initialValues?: any;
  onSuccess?: () => void;
}

export function DynamicScoreForm({
  modeloId,
  modalityId,
  athleteId,
  equipeId,
  eventId,
  judgeId,
  numeroBateria, // Changed from bateriaId to numeroBateria
  raia,
  initialValues,
  onSuccess
}: DynamicScoreFormProps) {
  const { data: allCampos = [], isLoading: isLoadingCampos } = useCamposModelo(modeloId);
  const { data: modeloConfig, isLoading: isLoadingModeloConfig } = useModeloConfiguration(modalityId);

  const { createSchema } = useSchemaCreation([]);

  // Filter to only scoring fields (remove configuration fields)
  let campos = filterScoringFields(allCampos);

  // If we're scoring a specific team (equipeId is provided),
  // there's no need to show a team selector field in the form.
  if (equipeId) {
    campos = campos.filter(campo => campo.chave_campo !== 'equipe_id' && campo.chave_campo !== 'equipe');
  }

  const parametros = modeloConfig?.parametros as any || {};
  const hasRaiaParam = parametros.num_raias && parametros.num_raias > 0;
  const usesBaterias = parametros.baterias === true;
  const raiaFieldExists = campos.some(c => c.chave_campo === 'raia' || c.chave_campo === 'lane');

  // Inject a 'raia' field if it's configured in params but not in campos,
  // and we are not using the full 'baterias' system.
  if (hasRaiaParam && !usesBaterias && !raiaFieldExists) {
    const raiaField: CampoModelo = {
      id: -Math.floor(Math.random() * 100000), // Make ID unique and numeric
      modelo_id: modeloId,
      chave_campo: 'raia',
      rotulo_campo: 'Raia',
      tipo_input: 'number',
      obrigatorio: true,
      ordem_exibicao: 0, // Show it near the top
      metadados: { placeholder: 'Número da raia' },
    };
    campos = [raiaField, ...campos];
  }

  console.log('DynamicScoreForm - All campos from hook:', allCampos.length);
  if (equipeId) {
    console.log(`DynamicScoreForm - Filtering out team selector as we are in context of equipeId: ${equipeId}`);
  }
  console.log('DynamicScoreForm - Final scoring campos:', campos.length, campos.map(c => c.chave_campo));
  console.log('DynamicScoreForm - Using numeroBateria:', numeroBateria);

  const schema = createSchema(campos);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      notes: initialValues?.notes || '',
    },
  });

  const { handleSubmit, isSubmitting } = useFormSubmission({
    eventId,
    modalityId,
    athleteId,
    equipeId,
    judgeId,
    modeloId,
    numeroBateria, // Pass numeroBateria instead of bateriaId
    raia,
    onSuccess
  });

  if (isLoadingCampos || isLoadingModeloConfig) {
    return <div>Carregando configuração da modalidade...</div>;
  }

  if (campos.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Nenhum campo de pontuação configurado para esta modalidade.</p>
        <p className="text-xs mt-1">
          Configure os campos de pontuação no painel de administração para habilitar a pontuação dinâmica.
        </p>
        {allCampos.length > 0 && (
          <p className="text-xs mt-2 text-blue-600">
            Este modelo possui {allCampos.length} campo(s) de configuração, mas nenhum campo de pontuação.
          </p>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <DynamicScoreFormContent
        form={form}
        campos={campos}
        modeloId={modeloId}
        modalityId={modalityId}
        eventId={eventId}
        numeroBateria={numeroBateria} // Pass numeroBateria instead of bateriaId
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </Form>
  );
}

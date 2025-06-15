
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';
import { useSchemaCreation } from './dynamic-score-form/useSchemaCreation';
import { useFormSubmission } from './dynamic-score-form/useFormSubmission';
import { DynamicScoreFormContent } from './dynamic-score-form/DynamicScoreFormContent';

interface DynamicScoreFormProps {
  modeloId: number;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  eventId: string;
  judgeId: string;
  bateriaId?: number;
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
  bateriaId,
  raia,
  initialValues,
  onSuccess
}: DynamicScoreFormProps) {
  const { data: allCampos = [], isLoading } = useCamposModelo(modeloId);
  const { createSchema } = useSchemaCreation([]);

  // Filter to only scoring fields (remove configuration fields)
  let campos = filterScoringFields(allCampos);

  // If we're scoring a specific team (equipeId is provided),
  // there's no need to show a team selector field in the form.
  if (equipeId) {
    campos = campos.filter(campo => campo.chave_campo !== 'equipe_id' && campo.chave_campo !== 'equipe');
  }

  console.log('DynamicScoreForm - All campos from hook:', allCampos.length);
  if (equipeId) {
    console.log(`DynamicScoreForm - Filtering out team selector as we are in context of equipeId: ${equipeId}`);
  }
  console.log('DynamicScoreForm - Final scoring campos:', campos.length, campos.map(c => c.chave_campo));

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
    bateriaId,
    raia,
    onSuccess
  });

  if (isLoading) {
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
        bateriaId={bateriaId}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </Form>
  );
}

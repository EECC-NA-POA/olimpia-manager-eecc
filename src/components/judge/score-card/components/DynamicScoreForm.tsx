
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';
import { useSchemaCreation } from './dynamic-score-form/useSchemaCreation';
import { useFormSubmission } from './dynamic-score-form/useFormSubmission';
import { DynamicScoreFormContent } from './dynamic-score-form/DynamicScoreFormContent';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CampoModelo } from '@/types/dynamicScoring';

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
  const { data: allCampos = [], isLoading: isLoadingCampos } = useCamposModelo(modeloId);
  const { data: modeloData, isLoading: isLoadingModelo } = useQuery({
    queryKey: ['modelo-details-for-form', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modelos_modalidade')
        .select('parametros')
        .eq('id', modeloId)
        .single();
      if (error) {
        console.error("Error fetching modelo params for dynamic form", error);
        return null;
      };
      return data;
    },
    enabled: !!modeloId,
  });

  const { createSchema } = useSchemaCreation([]);

  // Filter to only scoring fields (remove configuration fields)
  let campos = filterScoringFields(allCampos);

  // If we're scoring a specific team (equipeId is provided),
  // there's no need to show a team selector field in the form.
  if (equipeId) {
    campos = campos.filter(campo => campo.chave_campo !== 'equipe_id' && campo.chave_campo !== 'equipe');
  }

  const parametros = modeloData?.parametros as any || {};
  const hasRaiaParam = parametros.num_raias && parametros.num_raias > 0;
  const usesBaterias = parametros.baterias === true;
  const raiaFieldExists = campos.some(c => c.chave_campo === 'raia' || c.chave_campo === 'lane');

  // Inject a 'raia' field if it's configured in params but not in campos,
  // and we are not using the full 'baterias' system.
  if (hasRaiaParam && !usesBaterias && !raiaFieldExists) {
    const raiaField: CampoModelo = {
      id: `param_raia_${modeloId}`, // Make ID unique
      modelo_id: modeloId,
      chave_campo: 'raia',
      rotulo_campo: 'Raia',
      tipo_input: 'number',
      obrigatorio: true,
      ordem_exibicao: 0, // Show it near the top
      metadados: { placeholder: 'Número da raia' },
      created_at: new Date().toISOString()
    };
    campos = [raiaField, ...campos];
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

  if (isLoadingCampos || isLoadingModelo) {
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


import React from 'react';
import { Form } from '@/components/ui/form';
import { useScoreForm } from '../hooks/useScoreForm';
import { ScoreFormFields } from './ScoreFormFields';

interface ScoreFormProps {
  modalityId: number;
  initialValues?: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
  modalityRule?: any;
  eventId?: string | null;
  showModalityInfo?: boolean;
}

export function ScoreForm({ 
  modalityId, 
  initialValues, 
  onSubmit, 
  isPending, 
  modalityRule, 
  eventId,
  showModalityInfo = false
}: ScoreFormProps) {
  const {
    form,
    rule,
    bateriasData,
    isLoading
  } = useScoreForm({
    modalityId,
    initialValues,
    modalityRule,
    eventId
  });

  if (!modalityRule && isLoading) {
    return <div>Carregando configuração da modalidade...</div>;
  }

  if (!rule) {
    return <div>Erro ao carregar configuração da modalidade</div>;
  }

  console.log('ScoreForm - Rendering form with rule:', rule);

  return (
    <Form {...form}>
      <form className="space-y-4 mt-4">
        <ScoreFormFields 
          form={form}
          rule={rule}
          bateriasData={bateriasData}
          onSubmit={onSubmit}
          isPending={isPending}
          showModalityInfo={showModalityInfo}
        />
      </form>
    </Form>
  );
}

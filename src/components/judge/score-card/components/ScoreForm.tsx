
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

  const handleFormSubmit = (data: any) => {
    console.log('ScoreForm - Form submitted with data:', data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
        <ScoreFormFields 
          form={form}
          rule={rule}
          bateriasData={bateriasData}
          onSubmit={handleFormSubmit}
          isPending={isPending}
          showModalityInfo={showModalityInfo}
        />
      </form>
    </Form>
  );
}

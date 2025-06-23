
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
  console.log('ScoreForm - isPending:', isPending);

  const handleFormSubmit = (data: any) => {
    console.log('=== FORM SUBMISSION START ===');
    console.log('ScoreForm - Form submitted with data:', data);
    console.log('ScoreForm - Calling onSubmit with data:', data);
    onSubmit(data);
    console.log('=== FORM SUBMISSION CALLED ===');
  };

  const handleInvalidSubmit = (errors: any) => {
    console.log('=== FORM VALIDATION ERRORS ===');
    console.log('Form errors:', errors);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFormSubmit, handleInvalidSubmit)} 
        className="space-y-4 mt-4"
      >
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

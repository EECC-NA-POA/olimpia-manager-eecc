
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useCleanTeamScoringForm } from './hooks/useCleanTeamScoringForm';
import { CleanTeamFormFields } from './CleanTeamFormFields';

interface CleanTeamScoringFormProps {
  modeloId: number;
  modalityId: number;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialValues?: any;
}

export function CleanTeamScoringForm({
  modeloId,
  modalityId,
  onSubmit,
  isSubmitting,
  initialValues = {}
}: CleanTeamScoringFormProps) {
  const { campos, isLoading, form, scoreFormat } = useCleanTeamScoringForm({
    modeloId,
    modalityId,
    initialValues
  });

  const handleSubmit = (data: any) => {
    console.log('Clean team form submission:', data);
    onSubmit(data);
  };

  if (isLoading) {
    return <div>Carregando formulário...</div>;
  }

  if (campos.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Nenhum campo de pontuação configurado para esta modalidade.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CleanTeamFormFields 
          campos={campos} 
          form={form} 
          scoreFormat={scoreFormat} 
        />

        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Enviando...' : 'Salvar Pontuação da Equipe'}
        </Button>
      </form>
    </Form>
  );
}

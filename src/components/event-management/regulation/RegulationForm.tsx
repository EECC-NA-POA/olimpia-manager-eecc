
import React from 'react';
import { EventRegulation } from '@/lib/types/database';
import { Form } from '@/components/ui/form';
import { useRegulationForm } from './useRegulationForm';
import { RegulationBasicFields } from './RegulationBasicFields';
import { RegulationTextEditor } from './RegulationTextEditor';
import { RegulationStatusToggle } from './RegulationStatusToggle';
import { RegulationFormActions } from './RegulationFormActions';

interface RegulationFormProps {
  eventId: string;
  regulation: EventRegulation | null;
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function RegulationForm({ eventId, regulation, userId, onComplete, onCancel }: RegulationFormProps) {
  const { form, isSubmitting, handleSubmit } = useRegulationForm({
    eventId,
    regulation,
    userId,
    onComplete
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <RegulationBasicFields control={form.control} />
        <RegulationTextEditor control={form.control} />
        
        <RegulationStatusToggle control={form.control} />
        
        <RegulationFormActions 
          regulation={regulation}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}

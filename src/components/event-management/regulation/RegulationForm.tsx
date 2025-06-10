
import React from 'react';
import { EventRegulation } from '@/lib/types/database';
import { Form } from '@/components/ui/form';
import { useRegulationForm } from './useRegulationForm';
import { RegulationBasicFields } from './RegulationBasicFields';
import { RegulationTextEditor } from './RegulationTextEditor';
import { RegulationStatusToggle } from './RegulationStatusToggle';
import { RegulationVisibilityToggle } from './RegulationVisibilityToggle';
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
        
        {/* Status and Visibility toggles side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RegulationStatusToggle control={form.control} />
          <RegulationVisibilityToggle control={form.control} />
        </div>
        
        <RegulationFormActions 
          regulation={regulation}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}

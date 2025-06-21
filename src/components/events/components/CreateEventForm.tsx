
import { Form } from '@/components/ui/form';
import { BasicInfoSection } from '../BasicInfoSection';
import { DateSelectionSection } from '../DateSelectionSection';
import { EventDetailsSection } from '../EventDetailsSection';
import { LocationSection } from '../LocationSection';
import { BranchSelectionSection } from '../BranchSelectionSection';
import { CreateEventDialogActions } from './CreateEventDialogActions';
import { useCreateEvent } from '../hooks/useCreateEvent';
import type { Branch } from '@/types/api';

interface CreateEventFormProps {
  branches: Branch[];
  onEventCreated?: () => void;
  onClose: () => void;
}

export function CreateEventForm({ branches, onEventCreated, onClose }: CreateEventFormProps) {
  const { form, isLoading, onSubmit } = useCreateEvent({ onEventCreated, onClose });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <DateSelectionSection form={form} />
        <LocationSection form={form} />
        <EventDetailsSection form={form} />
        <BranchSelectionSection form={form} branches={branches || []} />
        
        <CreateEventDialogActions 
          onClose={onClose}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
}

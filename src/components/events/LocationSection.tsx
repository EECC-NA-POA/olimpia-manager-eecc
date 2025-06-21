
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './EventFormSchema';

interface LocationSectionProps {
  form: UseFormReturn<EventFormValues>;
}

export function LocationSection({ form }: LocationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Localização</h3>
      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
          name="pais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brasil" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Estado do evento" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Cidade do evento" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

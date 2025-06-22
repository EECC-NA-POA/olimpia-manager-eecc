
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './EventFormSchema';

interface RegistrationFeesSectionProps {
  form: UseFormReturn<EventFormValues>;
}

export function RegistrationFeesSection({ form }: RegistrationFeesSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Taxas de Inscrição</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="taxa_atleta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Inscrição - Atleta (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </FormControl>
              <FormDescription>
                Valor da taxa de inscrição para atletas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxa_publico_geral"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Inscrição - Público Geral (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </FormControl>
              <FormDescription>
                Valor da taxa de inscrição para público geral
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

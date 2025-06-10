
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './EventFormSchema';

interface EventDetailsSectionProps {
  form: UseFormReturn<EventFormValues>;
}

export function EventDetailsSection({ form }: EventDetailsSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={form.control}
        name="status_evento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status do Evento</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="foto_evento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL da Foto do Evento (opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="URL da imagem" />
            </FormControl>
            <FormDescription>
              Adicione uma URL para a imagem do evento
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

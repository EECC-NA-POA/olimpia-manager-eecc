
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { EventFormValues } from './EventFormSchema';

interface EventDetailsSectionProps {
  form: UseFormReturn<EventFormValues>;
}

export function EventDetailsSection({ form }: EventDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detalhes do Evento</h3>
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

        <FormField
          control={form.control}
          name="visibilidade_publica"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Visibilidade Pública
                </FormLabel>
                <FormDescription>
                  Tornar o evento visível para o público geral
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

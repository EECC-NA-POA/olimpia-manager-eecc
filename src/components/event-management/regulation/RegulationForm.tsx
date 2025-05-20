
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { EventRegulation } from '@/lib/types/database';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from './RichTextEditor';

interface RegulationFormProps {
  eventId: string;
  regulation: EventRegulation | null;
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const regulationSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  versao: z.string().min(1, 'Versão é obrigatória'),
  regulamento_texto: z.string().min(10, 'O texto do regulamento deve ter pelo menos 10 caracteres'),
  regulamento_link: z.string().url('Link inválido').optional().or(z.literal('')),
  is_ativo: z.boolean()
});

type RegulationFormValues = z.infer<typeof regulationSchema>;

export function RegulationForm({ eventId, regulation, userId, onComplete, onCancel }: RegulationFormProps) {
  const form = useForm<RegulationFormValues>({
    resolver: zodResolver(regulationSchema),
    defaultValues: {
      titulo: regulation?.titulo || '',
      versao: regulation?.versao || '1.0',
      regulamento_texto: regulation?.regulamento_texto || '',
      regulamento_link: regulation?.regulamento_link || '',
      is_ativo: regulation?.is_ativo ?? true
    }
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: RegulationFormValues) => {
    if (!eventId || !userId) {
      toast.error('Dados incompletos para salvar o regulamento');
      return;
    }

    setIsSubmitting(true);
    try {
      if (regulation) {
        // Update existing regulation
        const { error } = await supabase
          .from('eventos_regulamentos')
          .update({
            titulo: data.titulo,
            versao: data.versao,
            regulamento_texto: data.regulamento_texto,
            regulamento_link: data.regulamento_link || null,
            is_ativo: data.is_ativo,
            atualizado_por: userId,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', regulation.id);
        
        if (error) throw error;
        toast.success('Regulamento atualizado com sucesso!');
      } else {
        // Create new regulation
        const { error } = await supabase
          .from('eventos_regulamentos')
          .insert({
            evento_id: eventId,
            titulo: data.titulo,
            versao: data.versao,
            regulamento_texto: data.regulamento_texto,
            regulamento_link: data.regulamento_link || null,
            is_ativo: data.is_ativo,
            criado_por: userId
          });
        
        if (error) throw error;
        toast.success('Regulamento criado com sucesso!');
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving regulation:', error);
      toast.error('Erro ao salvar regulamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Regulamento Geral" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="versao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versão</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 1.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regulamento_link"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Link do Regulamento (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: https://example.com/regulamento.pdf" 
                    type="url"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Link externo para o documento do regulamento, caso exista
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="regulamento_texto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do Regulamento</FormLabel>
              <FormControl>
                <RichTextEditor 
                  value={field.value} 
                  onChange={field.onChange} 
                  placeholder="Digite o texto do regulamento aqui"
                  className="min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status do Regulamento</FormLabel>
                <FormDescription>
                  {field.value ? 'Regulamento ativo para visualização' : 'Regulamento inativo (rascunho)'}
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

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : regulation ? 'Atualizar' : 'Salvar'} Regulamento
          </Button>
        </div>
      </form>
    </Form>
  );
}

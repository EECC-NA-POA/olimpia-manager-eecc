
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { EventRegulation } from '@/lib/types/database';
import { regulationSchema, RegulationFormValues } from './regulationFormSchema';

interface UseRegulationFormProps {
  eventId: string;
  regulation: EventRegulation | null;
  userId: string;
  onComplete: () => void;
}

export function useRegulationForm({ eventId, regulation, userId, onComplete }: UseRegulationFormProps) {
  const form = useForm<RegulationFormValues>({
    resolver: zodResolver(regulationSchema),
    defaultValues: {
      titulo: regulation?.titulo || '',
      versao: regulation?.versao || '1.0',
      regulamento_texto: regulation?.regulamento_texto || '',
      regulamento_link: regulation?.regulamento_link || '',
      is_ativo: regulation?.is_ativo ?? true,
      is_regulamento_texto: regulation?.is_regulamento_texto ?? true
    }
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: RegulationFormValues) => {
    if (!eventId || !userId) {
      toast.error('Dados incompletos para salvar o regulamento');
      return;
    }

    console.log('Form data being submitted:', data);

    setIsSubmitting(true);
    try {
      // Process the link field - convert empty string to null
      const processedLink = data.regulamento_link?.trim() === '' ? null : data.regulamento_link?.trim() || null;
      
      console.log('Processed link:', processedLink);
      console.log('is_regulamento_texto value:', data.is_regulamento_texto);

      if (regulation && regulation.id) {
        // Update existing regulation
        const updateData = {
          titulo: data.titulo,
          versao: data.versao,
          regulamento_texto: data.regulamento_texto,
          regulamento_link: processedLink,
          is_ativo: data.is_ativo,
          is_regulamento_texto: data.is_regulamento_texto, // Ensure this boolean is explicitly set
          atualizado_por: userId,
          atualizado_em: new Date().toISOString()
        };
        
        console.log('Updating regulation with data:', updateData);
        
        const { data: updatedData, error } = await supabase
          .from('eventos_regulamentos')
          .update(updateData)
          .eq('id', regulation.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating regulation:', error);
          throw error;
        }
        
        console.log('Updated regulation result:', updatedData);
        toast.success('Regulamento atualizado com sucesso!');
      } else {
        // Create new regulation
        const insertData = {
          evento_id: eventId,
          titulo: data.titulo,
          versao: data.versao,
          regulamento_texto: data.regulamento_texto,
          regulamento_link: processedLink,
          is_ativo: data.is_ativo,
          is_regulamento_texto: data.is_regulamento_texto, // Ensure this boolean is explicitly set
          criado_por: userId
        };
        
        console.log('Creating regulation with data:', insertData);
        
        const { data: createdData, error } = await supabase
          .from('eventos_regulamentos')
          .insert(insertData)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating regulation:', error);
          throw error;
        }
        
        console.log('Created regulation result:', createdData);
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

  return {
    form,
    isSubmitting,
    handleSubmit
  };
}


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EventBasicInfoProps {
  eventId: string | null;
  eventData: any;
  onUpdate: () => void;
}

export function EventBasicInfo({ eventId, eventData, onUpdate }: EventBasicInfoProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with event data
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      nome: eventData.nome || '',
      descricao: eventData.descricao || '',
      local: eventData.local || '',
      data_inicio: eventData.data_inicio ? new Date(eventData.data_inicio).toISOString().split('T')[0] : '',
      data_fim: eventData.data_fim ? new Date(eventData.data_fim).toISOString().split('T')[0] : '',
      data_inicio_inscricao: eventData.data_inicio_inscricao ? new Date(eventData.data_inicio_inscricao).toISOString().split('T')[0] : '',
      data_fim_inscricao: eventData.data_fim_inscricao ? new Date(eventData.data_fim_inscricao).toISOString().split('T')[0] : '',
      status_evento: eventData.status_evento || 'PLANEJAMENTO',
    }
  });
  
  const handleStatusChange = (value: string) => {
    setValue('status_evento', value);
  };

  const onSubmit = async (data: any) => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('eventos')
        .update({
          nome: data.nome,
          descricao: data.descricao,
          local: data.local,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          data_inicio_inscricao: data.data_inicio_inscricao,
          data_fim_inscricao: data.data_fim_inscricao,
          status_evento: data.status_evento,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast.success('Informações do evento atualizadas com sucesso!');
      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Erro ao atualizar informações do evento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Evento</Label>
              <Input 
                id="nome" 
                {...register('nome', { required: true })} 
                placeholder="Nome do evento" 
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500">Nome do evento é obrigatório</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status_evento">Status do Evento</Label>
              <Select defaultValue={eventData.status_evento} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANEJAMENTO">Planejamento</SelectItem>
                  <SelectItem value="INSCRICOES_ABERTAS">Inscrições Abertas</SelectItem>
                  <SelectItem value="INSCRICOES_ENCERRADAS">Inscrições Encerradas</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input 
                id="local" 
                {...register('local')} 
                placeholder="Local do evento" 
              />
            </div>
                        
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input 
                id="data_inicio" 
                type="date" 
                {...register('data_inicio')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input 
                id="data_fim" 
                type="date" 
                {...register('data_fim')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_inicio_inscricao">Início das Inscrições</Label>
              <Input 
                id="data_inicio_inscricao" 
                type="date" 
                {...register('data_inicio_inscricao')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim_inscricao">Fim das Inscrições</Label>
              <Input 
                id="data_fim_inscricao" 
                type="date" 
                {...register('data_fim_inscricao')} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea 
              id="descricao" 
              {...register('descricao')} 
              placeholder="Descrição do evento"
              rows={5} 
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

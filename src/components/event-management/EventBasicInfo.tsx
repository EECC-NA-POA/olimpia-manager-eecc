
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EventBasicInfoProps {
  eventId: string | null;
  eventData: any;
  onUpdate: () => void;
}

export function EventBasicInfo({ eventId, eventData, onUpdate }: EventBasicInfoProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with event data, including new fields
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      nome: eventData.nome || '',
      descricao: eventData.descricao || '',
      local: eventData.local || '',
      pais: eventData.pais || 'Brasil',
      estado: eventData.estado || '',
      cidade: eventData.cidade || '',
      tipo: eventData.tipo || 'estadual',
      data_inicio: eventData.data_inicio ? new Date(eventData.data_inicio).toISOString().split('T')[0] : '',
      data_fim: eventData.data_fim ? new Date(eventData.data_fim).toISOString().split('T')[0] : '',
      data_inicio_evento: eventData.data_inicio_evento ? new Date(eventData.data_inicio_evento).toISOString().split('T')[0] : '',
      data_fim_evento: eventData.data_fim_evento ? new Date(eventData.data_fim_evento).toISOString().split('T')[0] : '',
      data_inicio_inscricao: eventData.data_inicio_inscricao ? new Date(eventData.data_inicio_inscricao).toISOString().split('T')[0] : '',
      data_fim_inscricao: eventData.data_fim_inscricao ? new Date(eventData.data_fim_inscricao).toISOString().split('T')[0] : '',
      status_evento: eventData.status_evento || 'ativo',
      foto_evento: eventData.foto_evento || '',
      visibilidade_publica: eventData.visibilidade_publica === undefined ? true : eventData.visibilidade_publica,
    }
  });
  
  const handleStatusChange = (value: string) => {
    setValue('status_evento', value);
  };

  const handleTipoChange = (value: string) => {
    setValue('tipo', value);
  };

  const handleVisibilidadeChange = (checked: boolean) => {
    setValue('visibilidade_publica', checked);
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
          pais: data.pais,
          estado: data.estado,
          cidade: data.cidade,
          tipo: data.tipo,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          data_inicio_evento: data.data_inicio_evento,
          data_fim_evento: data.data_fim_evento,
          data_inicio_inscricao: data.data_inicio_inscricao,
          data_fim_inscricao: data.data_fim_inscricao,
          status_evento: data.status_evento,
          foto_evento: data.foto_evento,
          visibilidade_publica: data.visibilidade_publica,
          updated_at: new Date().toISOString()
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

  const visibilidadePublica = watch('visibilidade_publica');

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Evento</Label>
              <Input 
                id="nome" 
                {...register('nome', { required: 'Nome do evento é obrigatório' })} 
                placeholder="Nome do evento" 
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome.message?.toString()}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status_evento">Status do Evento</Label>
              <Select defaultValue={eventData.status_evento} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="em_teste">Em Teste</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Evento</Label>
              <Select defaultValue={eventData.tipo} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="internacional">Internacional</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
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
            
            {/* New location fields */}
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input 
                id="pais" 
                {...register('pais')} 
                placeholder="País do evento" 
                defaultValue="Brasil"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input 
                id="estado" 
                {...register('estado')} 
                placeholder="Estado do evento" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input 
                id="cidade" 
                {...register('cidade')} 
                placeholder="Cidade do evento" 
              />
            </div>
            
            {/* Event dates section */}
            <div className="space-y-2">
              <Label htmlFor="data_inicio_evento">Data de Início do Evento</Label>
              <Input 
                id="data_inicio_evento" 
                type="date" 
                {...register('data_inicio_evento')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim_evento">Data de Fim do Evento</Label>
              <Input 
                id="data_fim_evento" 
                type="date" 
                {...register('data_fim_evento')} 
              />
            </div>
            
            {/* Registration dates section */}
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

            <div className="space-y-2">
              <Label htmlFor="foto_evento">URL da Foto do Evento</Label>
              <Input 
                id="foto_evento" 
                {...register('foto_evento')} 
                placeholder="URL da foto do evento" 
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch 
                id="visibilidade_publica" 
                checked={visibilidadePublica}
                onCheckedChange={handleVisibilidadeChange}
              />
              <Label htmlFor="visibilidade_publica">Visibilidade Pública</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea 
              id="descricao" 
              {...register('descricao', { required: 'Descrição do evento é obrigatória' })} 
              placeholder="Descrição do evento"
              rows={5} 
              className={errors.descricao ? 'border-red-500' : ''}
            />
            {errors.descricao && <p className="text-sm text-red-500">{errors.descricao.message?.toString()}</p>}
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

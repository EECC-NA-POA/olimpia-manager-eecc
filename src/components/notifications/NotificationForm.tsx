
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { NotificationTargetType } from '@/types/notifications';

interface NotificationFormProps {
  eventId: string;
  userId: string;
  onSuccess: () => void;
  isBranchFiltered?: boolean;
  branchId?: number;
}

export function NotificationForm({ 
  eventId, 
  userId, 
  onSuccess,
  isBranchFiltered = false,
  branchId
}: NotificationFormProps) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipoDestinatario, setTipoDestinatario] = useState<NotificationTargetType>('todos');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !conteudo.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implementar a criação da notificação no Supabase
      console.log('Creating notification:', {
        titulo,
        conteudo,
        tipo_destinatario: tipoDestinatario,
        evento_id: eventId,
        data_expiracao: dataExpiracao || null,
        filial_id: isBranchFiltered ? branchId : null,
        ativa: true
      });

      toast.success('Notificação criada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Erro ao criar notificação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Digite o título da notificação"
          required
        />
      </div>

      <div>
        <Label htmlFor="conteudo">Conteúdo *</Label>
        <Textarea
          id="conteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Digite o conteúdo da notificação"
          rows={4}
          required
        />
      </div>

      {!isBranchFiltered && (
        <div>
          <Label htmlFor="tipo">Tipo de Destinatário</Label>
          <Select value={tipoDestinatario} onValueChange={(value: NotificationTargetType) => setTipoDestinatario(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de destinatário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Participantes</SelectItem>
              <SelectItem value="perfil">Por Tipo de Perfil</SelectItem>
              <SelectItem value="filial">Por Filial</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="expiracao">Data de Expiração (opcional)</Label>
        <Input
          id="expiracao"
          type="datetime-local"
          value={dataExpiracao}
          onChange={(e) => setDataExpiracao(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Notificação'}
        </Button>
      </div>
    </form>
  );
}

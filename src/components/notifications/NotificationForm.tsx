
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import type { NotificationTargetType } from '@/types/notifications';

interface Branch {
  id: number;
  nome: string;
  estado: string;
}

interface NotificationFormProps {
  eventId: string;
  userId: string;
  onSuccess: () => void;
  isBranchFiltered?: boolean;
  branchId?: number;
  isOrganizer?: boolean;
}

export function NotificationForm({ 
  eventId, 
  userId, 
  onSuccess,
  isBranchFiltered = false,
  branchId,
  isOrganizer = false
}: NotificationFormProps) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipoDestinatario, setTipoDestinatario] = useState<NotificationTargetType>('todos');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados específicos para organizadores
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Carregar filiais se for organizador
  useEffect(() => {
    if (isOrganizer && !isBranchFiltered) {
      fetchBranches();
    }
  }, [isOrganizer, isBranchFiltered]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome, estado')
        .order('nome');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleBranchToggle = (branchId: number) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !conteudo.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    // Validação específica para organizadores selecionando filiais
    if (isOrganizer && tipoDestinatario === 'filial' && selectedBranches.length === 0) {
      toast.error('Selecione pelo menos uma filial');
      return;
    }

    // Validação para representantes de delegação
    if (isBranchFiltered && !branchId) {
      toast.error('Erro: Filial não identificada');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating notification with data:', {
        titulo,
        conteudo,
        eventId,
        isBranchFiltered,
        branchId,
        isOrganizer,
        tipoDestinatario,
        selectedBranches
      });

      // Preparar dados da notificação
      const baseNotificationData = {
        titulo,
        conteudo,
        evento_id: eventId,
        data_expiracao: dataExpiracao || null,
        ativa: true,
        data_criacao: new Date().toISOString()
      };

      if (isBranchFiltered && branchId) {
        // Para representantes de delegação - sempre filtra pela filial
        const notificationData = {
          ...baseNotificationData,
          tipo_destinatario: 'filial',
          filial_id: branchId
        };

        console.log('Inserting delegation notification:', notificationData);

        const { data, error } = await supabase
          .from('notificacoes')
          .insert(notificationData)
          .select();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log('Notification created successfully:', data);
      } else if (isOrganizer) {
        // Para organizadores
        if (tipoDestinatario === 'filial' && selectedBranches.length > 0) {
          // Criar uma notificação para cada filial selecionada
          const notifications = selectedBranches.map(filialId => ({
            ...baseNotificationData,
            tipo_destinatario: 'filial',
            filial_id: filialId
          }));

          console.log('Inserting organizer branch notifications:', notifications);

          const { data, error } = await supabase
            .from('notificacoes')
            .insert(notifications)
            .select();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          console.log('Branch notifications created successfully:', data);
        } else {
          // Notificação geral ou outros tipos
          const notificationData = {
            ...baseNotificationData,
            tipo_destinatario: tipoDestinatario
          };

          console.log('Inserting general notification:', notificationData);

          const { data, error } = await supabase
            .from('notificacoes')
            .insert(notificationData)
            .select();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          console.log('General notification created successfully:', data);
        }
      }

      toast.success('Notificação criada com sucesso!');
      
      // Reset form
      setTitulo('');
      setConteudo('');
      setTipoDestinatario('todos');
      setDataExpiracao('');
      setSelectedBranches([]);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Erro ao criar notificação: ' + (error as any)?.message || 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <RichTextEditor
          value={conteudo}
          onChange={setConteudo}
          placeholder="Digite o conteúdo da notificação. Use os botões da barra de ferramentas para formatação."
        />
      </div>

      {/* Seleção de tipo de destinatário - apenas para organizadores */}
      {isOrganizer && !isBranchFiltered && (
        <div>
          <Label htmlFor="tipo">Tipo de Destinatário</Label>
          <Select value={tipoDestinatario} onValueChange={(value: NotificationTargetType) => setTipoDestinatario(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de destinatário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Participantes</SelectItem>
              <SelectItem value="filial">Por Filial</SelectItem>
              <SelectItem value="perfil">Por Tipo de Perfil</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Seleção de filiais - apenas para organizadores quando tipo é 'filial' */}
      {isOrganizer && !isBranchFiltered && tipoDestinatario === 'filial' && (
        <div>
          <Label>Filiais Destinatárias *</Label>
          <div className="border rounded-md p-4 max-h-40 overflow-y-auto space-y-2">
            {loadingBranches ? (
              <p className="text-sm text-gray-500">Carregando filiais...</p>
            ) : (
              branches.map((branch) => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`branch-${branch.id}`}
                    checked={selectedBranches.includes(branch.id)}
                    onCheckedChange={() => handleBranchToggle(branch.id)}
                  />
                  <Label htmlFor={`branch-${branch.id}`} className="text-sm">
                    {branch.nome} - {branch.estado}
                  </Label>
                </div>
              ))
            )}
          </div>
          {selectedBranches.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {selectedBranches.length} filial(is) selecionada(s)
            </p>
          )}
        </div>
      )}

      {/* Informação para representantes de delegação */}
      {isBranchFiltered && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            Como representante de delegação, esta notificação será enviada apenas para membros da sua filial.
          </p>
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

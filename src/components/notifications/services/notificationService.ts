
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import type { NotificationTargetType } from '@/types/notifications';

interface NotificationData {
  titulo: string;
  conteudo: string;
  eventId: string;
  dataExpiracao: string;
}

export const submitNotification = async (
  data: NotificationData,
  isBranchFiltered: boolean,
  branchId: number | undefined,
  isOrganizer: boolean,
  tipoDestinatario: NotificationTargetType,
  selectedBranches: number[]
) => {
  const { titulo, conteudo, eventId, dataExpiracao } = data;

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
};

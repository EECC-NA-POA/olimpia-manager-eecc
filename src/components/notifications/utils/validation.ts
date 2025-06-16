
import { toast } from "sonner";
import type { NotificationTargetType } from '@/types/notifications';

export const validateNotificationForm = (
  titulo: string,
  conteudo: string,
  isOrganizer: boolean,
  tipoDestinatario: NotificationTargetType,
  selectedBranches: number[],
  isBranchFiltered: boolean,
  branchId?: number
): boolean => {
  if (!titulo.trim() || !conteudo.trim()) {
    toast.error('Título e conteúdo são obrigatórios');
    return false;
  }

  // Validação específica para organizadores selecionando filiais
  if (isOrganizer && tipoDestinatario === 'filial' && selectedBranches.length === 0) {
    toast.error('Selecione pelo menos uma filial');
    return false;
  }

  // Validação para representantes de delegação
  if (isBranchFiltered && !branchId) {
    toast.error('Erro: Filial não identificada');
    return false;
  }

  return true;
};

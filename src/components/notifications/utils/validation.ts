
import { toast } from "sonner";

export const validateNotificationForm = (
  mensagem: string,
  selectedBranches: string[]
): boolean => {
  if (!mensagem.trim()) {
    toast.error('A mensagem é obrigatória');
    return false;
  }

  if (selectedBranches.length === 0) {
    toast.error('Selecione pelo menos um destinatário');
    return false;
  }

  return true;
};


import { toast } from "sonner";

export const validateNotificationForm = (
  mensagem: string
): boolean => {
  if (!mensagem.trim()) {
    toast.error('A mensagem é obrigatória');
    return false;
  }

  return true;
};

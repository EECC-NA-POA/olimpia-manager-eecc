
import { Toast, ToastActionElement, useToaster } from "sonner";

const DEFAULT_TOAST_MESSAGES = {
  success: 'Operação realizada com sucesso',
  error: 'Houve um erro ao processar sua solicitação',
  loading: 'Processando...',
} as const;

type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
};

// Create a custom toast function with variants support
export const toast = {
  success: (message: string | ToastProps) => {
    if (typeof message === 'string') {
      return Toast.success(message);
    }
    return Toast.success(message.title || DEFAULT_TOAST_MESSAGES.success, { 
      description: message.description,
      action: message.action
    });
  },
  error: (message: string | ToastProps) => {
    if (typeof message === 'string') {
      return Toast.error(message);
    }
    return Toast.error(message.title || DEFAULT_TOAST_MESSAGES.error, { 
      description: message.description,
      action: message.action
    });
  },
  info: (message: string | ToastProps) => {
    if (typeof message === 'string') {
      return Toast.info(message);
    }
    return Toast.info(message.title || message.description || '', { 
      description: typeof message === 'string' ? undefined : message.description,
      action: typeof message === 'string' ? undefined : message.action
    });
  },
  warning: (message: string | ToastProps) => {
    if (typeof message === 'string') {
      return Toast.warning(message);
    }
    return Toast.warning(message.title || message.description || '', { 
      description: typeof message === 'string' ? undefined : message.description,
      action: typeof message === 'string' ? undefined : message.action
    });
  },
  loading: (message: string | ToastProps) => {
    if (typeof message === 'string') {
      return Toast.loading(message);
    }
    return Toast.loading(message.title || DEFAULT_TOAST_MESSAGES.loading, { 
      description: message.description,
      action: message.action
    });
  }
};

export const useToast = () => {
  return { toast };
};

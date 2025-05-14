
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
};

// Create a custom toast function with variants support
export const toast = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  
  const { title, description, action, variant } = props;
  
  switch (variant) {
    case 'success':
      return sonnerToast.success(title, { description, action });
    case 'destructive':
    case 'error':
      return sonnerToast.error(title, { description, action });
    case 'warning':
      return sonnerToast.warning(title, { description, action });
    case 'info':
      return sonnerToast.info(title, { description, action });
    default:
      return sonnerToast(title, { description, action });
  }
};

export type { ToastProps };
export const useToast = () => {
  return { toast };
};

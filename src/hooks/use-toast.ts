
import { toast as sonnerToast, type Toast } from "sonner";

export type ToastProps = Toast;

export const toast = sonnerToast;

export const useToast = () => {
  return {
    toast: sonnerToast,
  };
};

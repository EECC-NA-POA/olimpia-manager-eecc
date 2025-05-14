
import { toast as sonnerToast } from "sonner";
import { useToast as useShadcnToast, toast as shadcnToast, type ToastProps } from "@/hooks/use-toast";

// Export the shadcn toast hook
export const useToast = useShadcnToast;

// Export the toast function
export const toast = shadcnToast;

export type { ToastProps };

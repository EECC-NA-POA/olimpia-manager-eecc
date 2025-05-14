
import { toast as sonnerToast } from "sonner";
import { useToast as useShadcnToast } from "@/hooks/use-toast";

// Export the shadcn toast hook
export const useToast = useShadcnToast;

// Export a wrapper for the sonner toast for backward compatibility
export const toast = sonnerToast;

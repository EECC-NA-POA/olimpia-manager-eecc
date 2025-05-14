
import { toast as sonnerToast } from "sonner";
import type { ToastProps } from "@/components/ui/toast";

type ToastOptions = {
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  title?: string;
};

function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    return sonnerToast(options);
  }

  const { description, variant, title } = options;

  if (variant === "destructive") {
    return sonnerToast.error(title || description);
  }

  if (variant === "success") {
    return sonnerToast.success(title || description);
  }

  return sonnerToast(title || description || "");
}

// Export a hook for convenience
function useToast() {
  return { toast };
}

export { toast, useToast };

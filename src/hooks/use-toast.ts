
import { toast as sonnerToast } from "sonner";
import type { ToastProps } from "@/components/ui/toast";

type ToastOptions = {
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

export function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    return sonnerToast(options);
  }

  const { description, variant } = options;

  if (variant === "destructive") {
    return sonnerToast.error(description);
  }

  if (variant === "success") {
    return sonnerToast.success(description);
  }

  return sonnerToast(description || "");
}

export { toast };

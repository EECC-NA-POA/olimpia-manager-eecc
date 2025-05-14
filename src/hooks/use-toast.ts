
import * as React from "react";
import { toast as sonnerToast, type ToastT } from "sonner";

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;

export const toast = sonnerToast;

export function useToast() {
  return {
    toast: sonnerToast,
  };
}

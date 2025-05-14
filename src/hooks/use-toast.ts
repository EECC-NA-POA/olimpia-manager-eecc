
import * as React from "react";
import { toast as sonnerToast, type ToastT } from "sonner";

// Define a custom toast options type that includes variant
export interface ToastOptions {
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Helper to adapt our custom options to sonner format
const adaptToastOptions = (options?: ToastOptions) => {
  if (!options) return undefined;
  
  const { variant, ...restOptions } = options;
  
  // Map our variant to sonner's style
  if (variant === 'destructive') {
    return { ...restOptions, className: 'bg-destructive text-destructive-foreground' };
  }
  
  return restOptions;
};

// Main toast function with our custom interface
export function toast(title: React.ReactNode, options?: ToastOptions) {
  return sonnerToast(title, adaptToastOptions(options));
}

// Re-export the original toast for additional methods
export const originalToast = sonnerToast;

export function useToast() {
  return {
    toast
  };
}

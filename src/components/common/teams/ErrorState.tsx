
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function ErrorState({ onRetry, message = "Erro ao carregar dados" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-8">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <p className="text-red-500 text-lg font-medium">{message}</p>
      <p className="text-muted-foreground text-center max-w-md">
        Ocorreu um erro ao carregar os dados. Verifique sua conexão com a internet e tente novamente.
      </p>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Tentar Novamente
      </Button>
    </div>
  );
}

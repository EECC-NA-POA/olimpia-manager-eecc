
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
  error?: any;
}

export function ErrorState({ 
  onRetry, 
  message = "Erro ao carregar dados", 
  error 
}: ErrorStateProps) {
  console.error("Error details:", error);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-8">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <p className="text-destructive text-lg font-medium">{message}</p>
      <p className="text-muted-foreground text-center max-w-md">
        Ocorreu um erro ao carregar os dados. Verifique sua conexão com a internet e tente novamente.
      </p>
      {error && process.env.NODE_ENV === 'development' && (
        <div className="bg-muted p-4 rounded text-sm max-w-md overflow-auto">
          <p className="font-mono text-muted-foreground">{String(error)}</p>
        </div>
      )}
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Tentar Novamente
      </Button>
    </div>
  );
}

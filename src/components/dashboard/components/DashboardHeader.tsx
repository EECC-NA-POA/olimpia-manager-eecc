
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  title?: string;
}

export function DashboardHeader({ onRefresh, isRefreshing, title = "Dashboard do Organizador" }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-olimpics-text text-center sm:text-left">
        {title}
      </h1>
      <Button 
        onClick={onRefresh} 
        disabled={isRefreshing}
        className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white w-full sm:w-auto flex items-center justify-center gap-2 text-sm px-3 py-2"
        size="sm"
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="whitespace-nowrap">Atualizando...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span className="whitespace-nowrap">Atualizar Dados</span>
          </>
        )}
      </Button>
    </div>
  );
}

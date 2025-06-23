
import React from 'react';
import { ErrorState } from '@/components/dashboard/components/ErrorState';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Wifi } from 'lucide-react';

interface BranchSelectionErrorProps {
  onRetry: () => void;
}

export const BranchSelectionError = ({ onRetry }: BranchSelectionErrorProps) => {
  return (
    <div className="mt-2 p-4 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-5 w-5 text-red-600" />
        <h3 className="font-medium text-red-800">Erro ao carregar dados</h3>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-red-700">
          Não foi possível carregar os estados e sedes. Possíveis causas:
        </p>
        <ul className="text-xs text-red-600 ml-4 space-y-1">
          <li>• Problema de conexão com o banco de dados</li>
          <li>• Tabela de filiais vazia ou inacessível</li>
          <li>• Configuração de permissões</li>
        </ul>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onRetry} 
          size="sm" 
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Tentar novamente
        </Button>
        
        <Button 
          onClick={() => window.location.reload()} 
          size="sm" 
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <Wifi className="h-4 w-4 mr-1" />
          Recarregar página
        </Button>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SessionHeaderProps {
  session: any;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SessionHeader({ session, onBack, onSave, isSaving }: SessionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button variant="outline" onClick={onBack} size="sm" className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-olimpics-text truncate">{session.descricao}</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onSave}
        disabled={isSaving}
        className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto"
        size="sm"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar Presenças
      </Button>
    </div>
  );
}

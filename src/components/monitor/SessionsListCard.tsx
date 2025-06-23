
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Eye, Edit, AlertTriangle } from "lucide-react";
import { MonitorSession } from "@/hooks/useMonitorSessions";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SessionsListCardProps {
  session: MonitorSession;
  onViewDetails: (sessionId: string) => void;
  onEditSession: (session: MonitorSession) => void;
}

export default function SessionsListCard({ 
  session, 
  onViewDetails, 
  onEditSession 
}: SessionsListCardProps) {
  const hasObservations = (session as any).observacoes && (session as any).observacoes.trim().length > 0;

  return (
    <Card className={`hover:shadow-md transition-shadow ${hasObservations ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{session.descricao}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {format(new Date(session.data_hora_inicio), 'dd/MM/yyyy', { locale: ptBR })}
              <Clock className="h-4 w-4 ml-2" />
              {format(new Date(session.data_hora_inicio), 'HH:mm', { locale: ptBR })}
              {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
            </div>
          </div>
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            {session.modalidade_representantes.modalidades.nome}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {hasObservations && (
          <div className="mb-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">Observações importantes:</p>
                <p className="text-sm text-amber-700 mt-1 break-words">{(session as any).observacoes}</p>
                <p className="text-xs text-amber-600 mt-2">
                  Lembre-se de atualizar a chamada quando os atletas mencionados realizarem o cadastro.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{session.modalidade_representantes.filiais.nome}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditSession(session)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewDetails(session.id)}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

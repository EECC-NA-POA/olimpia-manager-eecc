
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Eye, Edit } from "lucide-react";
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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{session.descricao}</h3>
              <Badge variant="outline" className="text-xs">
                {session.modalidade_representantes?.modalidades?.nome}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(session.data_hora_inicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(session.data_hora_inicio), 'HH:mm', { locale: ptBR })}
                  {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{session.modalidade_representantes?.filiais?.nome}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(session.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEditSession(session)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

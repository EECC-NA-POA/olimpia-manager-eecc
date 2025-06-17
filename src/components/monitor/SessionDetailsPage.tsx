
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, FileText, UserCheck, UserX, Clock as ClockIcon, Edit } from "lucide-react";
import { useSessionAttendance } from "@/hooks/useSessionAttendance";
import { useMonitorSessions } from "@/hooks/useMonitorSessions";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import EditAttendanceDialog from './EditAttendanceDialog';

export default function SessionDetailsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Buscar dados da sessão - precisamos do modalidade_rep_id primeiro
  const { data: sessions } = useMonitorSessions();
  const session = sessions?.find(s => s.id === sessionId);
  
  const { data: attendances, isLoading } = useSessionAttendance(sessionId || null);

  if (!sessionId || !session) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/monitor')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Chamadas
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Chamada não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/monitor')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Chamadas
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p>Carregando detalhes da chamada...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const presente = attendances?.filter(a => a.status === 'presente').length || 0;
  const ausente = attendances?.filter(a => a.status === 'ausente').length || 0;
  const atrasado = attendances?.filter(a => a.status === 'atrasado').length || 0;
  const total = attendances?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/monitor')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Chamadas
        </Button>
        
        <Button 
          onClick={() => setIsEditDialogOpen(true)}
          className="flex items-center gap-2 bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
        >
          <Edit className="h-4 w-4" />
          Editar Chamada
        </Button>
      </div>

      {/* Informações da Chamada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{session.descricao}</CardTitle>
            <Badge variant="outline">
              {session.modalidade_representantes?.modalidades?.nome}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{format(new Date(session.data_hora_inicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>
                {format(new Date(session.data_hora_inicio), 'HH:mm', { locale: ptBR })}
                {session.data_hora_fim && ` - ${format(new Date(session.data_hora_fim), 'HH:mm', { locale: ptBR })}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{session.modalidade_representantes?.filiais?.nome}</span>
            </div>
          </div>
          
          {(session as any).observacoes && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Observações</span>
              </div>
              <p className="text-amber-700 text-sm">{(session as any).observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Presenças */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-olimpics-green-primary">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{presente}</div>
            <div className="text-sm text-gray-500">Presentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{atrasado}</div>
            <div className="text-sm text-gray-500">Atrasados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{ausente}</div>
            <div className="text-sm text-gray-500">Ausentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Presenças */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Presenças</CardTitle>
        </CardHeader>
        <CardContent>
          {attendances && attendances.length > 0 ? (
            <div className="space-y-3">
              {attendances.map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{attendance.atleta.nome_completo}</div>
                    <div className="text-sm text-gray-500">{attendance.atleta.email}</div>
                    {attendance.atleta.numero_identificador && (
                      <Badge variant="outline" className="text-xs mt-1">
                        ID: {attendance.atleta.numero_identificador}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {attendance.status === 'presente' && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Presente
                      </Badge>
                    )}
                    {attendance.status === 'atrasado' && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Atrasado
                      </Badge>
                    )}
                    {attendance.status === 'ausente' && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <UserX className="h-3 w-3 mr-1" />
                        Ausente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma presença registrada para esta chamada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <EditAttendanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        session={session}
      />
    </div>
  );
}

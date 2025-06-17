
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, Calendar } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { useNavigate } from 'react-router-dom';

export default function MonitorModalitiesPage() {
  const { data: modalities, isLoading, error } = useMonitorModalities();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar modalidades: {error.message}</p>
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-3xl font-bold text-olimpics-text">Minhas Modalidades</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Você não está cadastrado como monitor de nenhuma modalidade.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Entre em contato com a organização do evento para mais informações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="h-8 w-8 text-olimpics-green-primary" />
        <h1 className="text-3xl font-bold text-olimpics-text">Minhas Modalidades</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modalities.map((modality) => (
          <Card key={modality.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-olimpics-green-primary" />
                {modality.modalidades.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categoria:</p>
                  <p className="text-sm">{modality.modalidades.categoria}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Filial:</p>
                  <p className="text-sm">{modality.filiais.nome}</p>
                  <p className="text-xs text-gray-500">
                    {modality.filiais.cidade}, {modality.filiais.estado}
                  </p>
                </div>

                <Button
                  onClick={() => navigate(`/monitor/chamadas?modalidade=${modality.id}`)}
                  className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Chamadas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

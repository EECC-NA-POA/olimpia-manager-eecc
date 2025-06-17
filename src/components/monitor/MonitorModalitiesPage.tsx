
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { useMonitorModalities } from "@/hooks/useMonitorModalities";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingImage } from "@/components/ui/loading-image";

export default function MonitorModalitiesPage() {
  const { data: modalities, isLoading } = useMonitorModalities();

  console.log('MonitorModalitiesPage - isLoading:', isLoading);
  console.log('MonitorModalitiesPage - modalities data:', modalities);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingImage text="Carregando modalidades..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!modalities || modalities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Você não está cadastrado como monitor de nenhuma modalidade.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Entre em contato com a organização do evento para ser designado como monitor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {modalities.map((modality) => (
            <Card key={modality.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{modality.modalidades.nome}</h3>
                      <Badge variant="outline">
                        {modality.modalidades.categoria}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{modality.filiais.nome} - {modality.filiais.cidade}, {modality.filiais.estado}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Monitor desde {format(new Date(modality.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  <Badge className="bg-olimpics-green-primary text-white">
                    Monitor
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

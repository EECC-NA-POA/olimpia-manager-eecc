
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Trophy, Target, Activity, Clock } from "lucide-react";
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filter out modalities with null modalidades data
  const validModalities = modalities?.filter(modality => modality.modalidades && modality.modalidades.nome) || [];

  return (
    <div className="space-y-6">
      {validModalities.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma modalidade atribuída</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Você ainda não foi designado como monitor de nenhuma modalidade. Entre em contato com a administração.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-olimpics-green-primary/5 to-olimpics-green-primary/10 border-olimpics-green-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-olimpics-green-primary/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-olimpics-green-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-olimpics-green-primary">{validModalities.length}</div>
                    <div className="text-sm text-muted-foreground">Modalidades</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-olimpics-orange-primary/5 to-olimpics-orange-primary/10 border-olimpics-orange-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-olimpics-orange-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-olimpics-orange-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-olimpics-orange-primary">
                      {new Set(validModalities.map(m => m.modalidades.categoria)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Categorias</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {new Set(validModalities.map(m => m.filial_id)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Filiais</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modalidades Grid */}
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {validModalities.map((modality) => (
              <Card 
                key={modality.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden border-l-4 border-l-olimpics-green-primary"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-olimpics-green-primary/5 to-transparent rounded-bl-full" />
                
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-olimpics-green-primary/10 rounded-md">
                          <Trophy className="h-4 w-4 text-olimpics-green-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {modality.modalidades.tipo_modalidade || 'Modalidade'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-olimpics-green-primary transition-colors">
                        {modality.modalidades.nome}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1 font-medium">
                        {modality.modalidades.categoria}
                      </p>
                    </div>
                    <Badge className="bg-olimpics-green-primary/10 text-olimpics-green-primary border-olimpics-green-primary/20 hover:bg-olimpics-green-primary hover:text-white">
                      Monitor
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-olimpics-orange-primary flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{modality.filiais.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {modality.filiais.cidade}, {modality.filiais.estado}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">Monitor desde</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(modality.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Search, AlertCircle, Loader2 } from 'lucide-react';
import { AvailableModality } from '../hooks/useAvailableModalitiesForAthlete';
import { useModalityMutations } from '@/hooks/useModalityMutations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AvailableModalitiesCardProps {
  modalities: AvailableModality[];
  userId: string;
  eventId: string;
  registeredModalityIds: number[];
}

export function AvailableModalitiesCard({ 
  modalities, 
  userId, 
  eventId,
  registeredModalityIds 
}: AvailableModalitiesCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { registerMutation } = useModalityMutations(userId, eventId);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  const filteredModalities = modalities.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.categoria && m.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return null;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleRegister = async (modalityId: number) => {
    setRegisteringId(modalityId);
    try {
      await registerMutation.mutateAsync(modalityId);
    } finally {
      setRegisteringId(null);
    }
  };

  const isVacancyAvailable = (modality: AvailableModality) => {
    if (!modality.limite_vagas) return true;
    return modality.vagas_ocupadas < modality.limite_vagas;
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">Modalidades Disponíveis</span>
            {modalities.length > 0 && (
              <Badge variant="secondary" className="ml-auto shrink-0">{modalities.length}</Badge>
            )}
          </CardTitle>
          
          {modalities.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        {modalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Não há modalidades disponíveis.</p>
            <p className="text-xs text-muted-foreground mt-1">Você já está inscrito em todas ou não há modalidades cadastradas.</p>
          </div>
        ) : filteredModalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma encontrada para "{searchTerm}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredModalities.map((modality) => {
              const vacancyAvailable = isVacancyAvailable(modality);
              const isRegistering = registeringId === modality.id;

              return (
                <div
                  key={modality.id}
                  className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-foreground text-sm">{modality.nome}</h4>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {modality.tipo_modalidade}
                      </Badge>
                    </div>
                    
                    {modality.categoria && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {modality.categoria}
                      </p>
                    )}

                    {modality.limite_vagas && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
                        <span className={`font-medium ${vacancyAvailable ? 'text-muted-foreground' : 'text-destructive'}`}>
                          {modality.vagas_ocupadas}/{modality.limite_vagas} vagas
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-3 h-8 text-xs"
                    onClick={() => handleRegister(modality.id)}
                    disabled={!vacancyAvailable || isRegistering || registerMutation.isPending}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Inscrevendo...
                      </>
                    ) : !vacancyAvailable ? (
                      'Sem Vagas'
                    ) : (
                      'Inscrever-se'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

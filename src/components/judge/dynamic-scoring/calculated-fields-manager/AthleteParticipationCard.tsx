
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users } from 'lucide-react';

interface AthleteWithParticipation {
  atleta_id: string;
  nome: string;
  participando: boolean;
  hasRequiredFields: boolean;
}

interface AthleteParticipationCardProps {
  athletesWithParticipation: AthleteWithParticipation[];
  isLoading: boolean;
  onToggleParticipation: (atletaId: string, participando: boolean) => void;
}

export function AthleteParticipationCard({
  athletesWithParticipation,
  isLoading,
  onToggleParticipation
}: AthleteParticipationCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status de Participação dos Atletas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando atletas...</div>
        </CardContent>
      </Card>
    );
  }

  if (athletesWithParticipation.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status de Participação dos Atletas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Nenhum atleta encontrado com pontuações registradas nesta modalidade.
          </div>
        </CardContent>
      </Card>
    );
  }

  const participatingCount = athletesWithParticipation.filter(a => a.participando).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Status de Participação dos Atletas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total de atletas: {athletesWithParticipation.length}</span>
            <span>Participando: {participatingCount}</span>
            <span>Não participando: {athletesWithParticipation.length - participatingCount}</span>
          </div>
          
          <div className="grid gap-2">
            {athletesWithParticipation.map((athlete) => (
              <div key={athlete.atleta_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={athlete.participando}
                    onCheckedChange={(checked) => 
                      onToggleParticipation(athlete.atleta_id, checked as boolean)
                    }
                  />
                  <span className="font-medium">{athlete.nome}</span>
                  {athlete.hasRequiredFields ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Dados completos
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Dados incompletos
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {athlete.participando ? 'Participando' : 'Não participará'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Athlete } from '../hooks/useAthletes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BateriaAthleteSelectorProps {
  athletes: Athlete[];
  selectedBateriaId: number | null;
  modalityId: number;
  eventId: string;
}

export function BateriaAthleteSelector({
  athletes,
  selectedBateriaId,
  modalityId,
  eventId
}: BateriaAthleteSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current bateria participants
  useEffect(() => {
    if (selectedBateriaId) {
      fetchBateriaParticipants();
    }
  }, [selectedBateriaId]);

  const fetchBateriaParticipants = async () => {
    if (!selectedBateriaId) return;

    try {
      const { data, error } = await supabase
        .from('atletas_bateria')
        .select('atleta_id')
        .eq('numero_bateria', selectedBateriaId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (error) throw error;

      const participantIds = new Set(data.map(item => item.atleta_id));
      setSelectedAthletes(participantIds);
    } catch (error) {
      console.error('Error fetching bateria participants:', error);
    }
  };

  const saveParticipantsMutation = useMutation({
    mutationFn: async (athleteIds: string[]) => {
      if (!selectedBateriaId) throw new Error('No bateria selected');

      // First, remove existing participants
      const { error: deleteError } = await supabase
        .from('atletas_bateria')
        .delete()
        .eq('numero_bateria', selectedBateriaId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (deleteError) throw deleteError;

      // Then, add new participants
      if (athleteIds.length > 0) {
        const participantsData = athleteIds.map(athleteId => ({
          atleta_id: athleteId,
          numero_bateria: selectedBateriaId,
          modalidade_id: modalityId,
          evento_id: eventId
        }));

        const { error: insertError } = await supabase
          .from('atletas_bateria')
          .insert(participantsData);

        if (insertError) throw insertError;
      }

      return athleteIds;
    },
    onSuccess: () => {
      toast.success('Participantes da bateria salvos com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias'] });
    },
    onError: (error) => {
      console.error('Error saving participants:', error);
      toast.error('Erro ao salvar participantes da bateria');
    }
  });

  const filteredAthletes = athletes.filter(athlete =>
    athlete.atleta_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.numero_identificador?.includes(searchTerm)
  );

  const handleAthleteToggle = (athleteId: string) => {
    const newSelected = new Set(selectedAthletes);
    if (newSelected.has(athleteId)) {
      newSelected.delete(athleteId);
    } else {
      newSelected.add(athleteId);
    }
    setSelectedAthletes(newSelected);
  };

  const handleSave = () => {
    saveParticipantsMutation.mutate(Array.from(selectedAthletes));
  };

  const handleSelectAll = () => {
    setSelectedAthletes(new Set(filteredAthletes.map(a => a.atleta_id)));
  };

  const handleClearAll = () => {
    setSelectedAthletes(new Set());
  };

  if (!selectedBateriaId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Selecione uma bateria para gerenciar os participantes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participantes da Bateria {selectedBateriaId === 999 ? 'Final' : selectedBateriaId}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {selectedAthletes.size} de {athletes.length} selecionados
          </Badge>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Search and controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                <Check className="h-4 w-4 mr-1" />
                Todos
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Athletes list */}
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {filteredAthletes.map((athlete) => (
              <div
                key={athlete.atleta_id}
                className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedAthletes.has(athlete.atleta_id)}
                  onCheckedChange={() => handleAthleteToggle(athlete.atleta_id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{athlete.atleta_nome}</div>
                  {athlete.numero_identificador && (
                    <div className="text-sm text-muted-foreground">
                      #{athlete.numero_identificador}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveParticipantsMutation.isPending}
              className="min-w-32"
            >
              {saveParticipantsMutation.isPending ? 'Salvando...' : 'Salvar Participantes'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

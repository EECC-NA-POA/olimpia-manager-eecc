
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit2 } from 'lucide-react';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade, CampoModelo } from '@/types/dynamicScoring';

interface DynamicAthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modelo: ModeloModalidade;
  selectedBateriaId?: number | null;
}

export function DynamicAthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicAthletesTableProps) {
  const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const mutation = useDynamicScoringSubmission();

  // Fetch campos for this modelo
  const { data: campos = [] } = useQuery({
    queryKey: ['campos-modelo', modelo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id)
        .order('ordem_exibicao');

      if (error) throw error;
      return data as CampoModelo[];
    },
    enabled: !!modelo.id,
  });

  const handleEdit = (athleteId: string) => {
    setEditingAthleteId(athleteId);
    setEditValues({});
  };

  const handleSave = async (athlete: Athlete) => {
    try {
      const formData = {
        ...editValues,
        notes: editValues.notes || ''
      };

      await mutation.mutateAsync({
        athleteId: athlete.atleta_id,
        modalityId,
        eventId: eventId || '',
        judgeId,
        modeloId: modelo.id,
        formData,
        bateriaId: selectedBateriaId
      });

      setEditingAthleteId(null);
      setEditValues({});
      toast.success('Pontuação salva com sucesso!');
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    }
  };

  const handleCancel = () => {
    setEditingAthleteId(null);
    setEditValues({});
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  if (!eventId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum evento selecionado
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum campo configurado para este modelo de pontuação
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Atleta</TableHead>
            <TableHead className="w-[150px]">Filial</TableHead>
            {campos.map((campo) => (
              <TableHead key={campo.chave_campo} className="text-center">
                {campo.rotulo_campo}
                {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
              </TableHead>
            ))}
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.map((athlete) => {
            const isEditing = editingAthleteId === athlete.atleta_id;
            
            return (
              <TableRow key={athlete.atleta_id}>
                <TableCell>
                  <div className="font-medium">{athlete.atleta_nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {athlete.tipo_documento}: {athlete.numero_documento}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {athlete.filial_nome || athlete.equipe_nome || 'N/A'}
                  </div>
                  {athlete.origem_cidade && (
                    <div className="text-xs text-muted-foreground">
                      {athlete.origem_cidade}
                      {athlete.origem_uf && ` - ${athlete.origem_uf}`}
                    </div>
                  )}
                </TableCell>
                {campos.map((campo) => (
                  <TableCell key={campo.chave_campo} className="text-center">
                    {isEditing ? (
                      <div className="w-24 mx-auto">
                        {campo.tipo_input === 'number' ? (
                          <Input
                            type="number"
                            value={editValues[campo.chave_campo] || ''}
                            onChange={(e) => handleFieldChange(campo.chave_campo, parseFloat(e.target.value) || 0)}
                            className="text-center"
                            min={campo.metadados?.min}
                            max={campo.metadados?.max}
                            step={campo.metadados?.step || 'any'}
                          />
                        ) : campo.tipo_input === 'select' ? (
                          <select
                            value={editValues[campo.chave_campo] || ''}
                            onChange={(e) => handleFieldChange(campo.chave_campo, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Selecione...</option>
                            {campo.metadados?.opcoes?.map((opcao) => (
                              <option key={opcao} value={opcao}>
                                {opcao}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type="text"
                            value={editValues[campo.chave_campo] || ''}
                            onChange={(e) => handleFieldChange(campo.chave_campo, e.target.value)}
                            className="text-center"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {/* Aqui mostraria o valor salvo se existisse */}
                        -
                      </span>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    Pendente
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(athlete)}
                          disabled={mutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          className="h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(athlete.atleta_id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

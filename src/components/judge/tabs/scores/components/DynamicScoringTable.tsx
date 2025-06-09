
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { MaskedResultInput } from '@/components/judge/dynamic-scoring/MaskedResultInput';
import { Athlete } from '../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicScoringTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: any;
}

interface AthleteScoreData {
  [athleteId: string]: {
    [fieldKey: string]: string | number;
  };
}

export function DynamicScoringTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo
}: DynamicScoringTableProps) {
  const queryClient = useQueryClient();
  const [scoreData, setScoreData] = useState<AthleteScoreData>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  
  const dynamicSubmission = useDynamicScoringSubmission();

  // Fetch campos do modelo
  const { data: campos = [], isLoading: isLoadingCampos } = useQuery({
    queryKey: ['campos-modelo', modelo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id)
        .neq('tipo_input', 'calculated')
        .order('ordem_exibicao');

      if (error) throw error;
      return data as CampoModelo[];
    },
    enabled: !!modelo.id
  });

  // Fetch existing scores with tentativas
  const { data: existingScores = [] } = useQuery({
    queryKey: ['athlete-dynamic-scores', modalityId, eventId, modelo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao(
            chave_campo,
            valor,
            valor_formatado
          )
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('modelo_id', modelo.id)
        .eq('juiz_id', judgeId);

      if (error) throw error;
      return data;
    },
    enabled: !!modalityId && !!eventId && !!modelo.id
  });

  // Initialize score data from existing scores
  useEffect(() => {
    if (existingScores.length > 0) {
      const initialData: AthleteScoreData = {};
      
      existingScores.forEach(score => {
        if (!initialData[score.atleta_id]) {
          initialData[score.atleta_id] = {};
        }
        
        score.tentativas_pontuacao?.forEach((tentativa: any) => {
          // Use valor_formatado se disponível, senão valor
          const value = tentativa.valor_formatado || tentativa.valor.toString();
          initialData[score.atleta_id][tentativa.chave_campo] = value;
        });
      });
      
      console.log('Loaded initial data:', initialData);
      setScoreData(initialData);
    }
  }, [existingScores]);

  const handleFieldChange = (athleteId: string, fieldKey: string, value: string | number) => {
    setScoreData(prev => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [fieldKey]: value
      }
    }));
    
    // Mark as unsaved
    setUnsavedChanges(prev => new Set(prev).add(athleteId));
  };

  const saveAthleteScore = async (athleteId: string) => {
    const athleteData = scoreData[athleteId];
    if (!athleteData) return;

    try {
      await dynamicSubmission.mutateAsync({
        eventId,
        modalityId,
        athleteId,
        judgeId,
        modeloId: modelo.id,
        formData: athleteData
      });

      // Remove from unsaved changes
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(athleteId);
        return newSet;
      });

      toast.success(`Pontuação salva para ${athletes.find(a => a.atleta_id === athleteId)?.atleta_nome}`);
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    }
  };

  const saveAllScores = async () => {
    const unsavedAthletes = Array.from(unsavedChanges);
    
    for (const athleteId of unsavedAthletes) {
      await saveAthleteScore(athleteId);
    }
  };

  const renderInputField = (campo: CampoModelo, athleteId: string) => {
    const value = scoreData[athleteId]?.[campo.chave_campo] || '';
    
    switch (campo.tipo_input) {
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(athleteId, campo.chave_campo, parseFloat(e.target.value) || 0)}
            placeholder={`${campo.metadados?.min || 0} - ${campo.metadados?.max || 100}`}
            min={campo.metadados?.min}
            max={campo.metadados?.max}
            step={campo.metadados?.step || 0.01}
            className="w-full"
          />
        );
      
      case 'integer':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(athleteId, campo.chave_campo, parseInt(e.target.value) || 0)}
            placeholder={`${campo.metadados?.min || 0} - ${campo.metadados?.max || 100}`}
            min={campo.metadados?.min}
            max={campo.metadados?.max}
            step={1}
            className="w-full"
          />
        );
      
      case 'text':
        if (campo.metadados?.formato_resultado) {
          return (
            <MaskedResultInput
              campo={campo}
              form={null as any}
              value={value as string}
              onChange={(newValue) => handleFieldChange(athleteId, campo.chave_campo, newValue)}
            />
          );
        }
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(athleteId, campo.chave_campo, e.target.value)}
            placeholder={campo.rotulo_campo}
            className="w-full"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(athleteId, campo.chave_campo, e.target.value)}
            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">Selecione...</option>
            {campo.metadados?.opcoes?.map((opcao: string) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(athleteId, campo.chave_campo, e.target.value)}
            placeholder={campo.rotulo_campo}
            className="w-full"
          />
        );
    }
  };

  const getAthleteCompletionStatus = (athleteId: string) => {
    const athleteData = scoreData[athleteId] || {};
    const requiredFields = campos.filter(c => c.obrigatorio);
    const completedRequired = requiredFields.filter(field => 
      athleteData[field.chave_campo] !== undefined && 
      athleteData[field.chave_campo] !== '' &&
      athleteData[field.chave_campo] !== null
    );
    
    return {
      completed: completedRequired.length,
      total: requiredFields.length,
      isComplete: completedRequired.length === requiredFields.length
    };
  };

  if (isLoadingCampos) {
    return <div>Carregando campos...</div>;
  }

  if (campos.length === 0) {
    return <div>Nenhum campo configurado para este modelo.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Save All Button */}
      {unsavedChanges.size > 0 && (
        <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-sm text-yellow-800">
            {unsavedChanges.size} atleta(s) com alterações não salvas
          </span>
          <Button
            onClick={saveAllScores}
            disabled={dynamicSubmission.isPending}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Todas as Alterações
          </Button>
        </div>
      )}

      {/* Scoring Table */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background">Atleta</TableHead>
              <TableHead className="min-w-[150px]">Filial</TableHead>
              {campos.map((campo) => (
                <TableHead key={campo.chave_campo} className="min-w-[120px]">
                  <div className="flex flex-col">
                    <span>{campo.rotulo_campo}</span>
                    {campo.obrigatorio && (
                      <Badge variant="outline" className="text-xs w-fit">
                        Obrigatório
                      </Badge>
                    )}
                    {campo.metadados?.formato_resultado && (
                      <Badge variant="outline" className="text-xs w-fit bg-green-50">
                        {campo.metadados.formato_resultado}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => {
              const status = getAthleteCompletionStatus(athlete.atleta_id);
              const hasUnsavedChanges = unsavedChanges.has(athlete.atleta_id);

              return (
                <TableRow key={athlete.atleta_id}>
                  <TableCell className="font-medium sticky left-0 bg-background">
                    {athlete.atleta_nome}
                  </TableCell>
                  <TableCell>
                    {athlete.filial_nome || '-'}
                  </TableCell>
                  {campos.map((campo) => (
                    <TableCell key={campo.chave_campo}>
                      {renderInputField(campo, athlete.atleta_id)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {status.isComplete ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                          {status.completed}/{status.total}
                        </Badge>
                      )}
                      {hasUnsavedChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-800 text-xs">
                          Não salvo
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveAthleteScore(athlete.atleta_id)}
                      disabled={!hasUnsavedChanges || dynamicSubmission.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

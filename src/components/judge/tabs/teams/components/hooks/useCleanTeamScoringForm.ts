
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { CampoModelo } from '@/types/dynamicScoring';

interface UseCleanTeamScoringFormProps {
  modeloId: number;
  modalityId: number;
  initialValues?: any;
}

export function useCleanTeamScoringForm({ 
  modeloId, 
  modalityId, 
  initialValues = {} 
}: UseCleanTeamScoringFormProps) {
  // Fetch modality rule to determine score type
  const { data: modalityRule } = useQuery({
    queryKey: ['modality-rule', modalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regras_modalidades')
        .select('regra_tipo, parametros')
        .eq('modalidade_id', modalityId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching modality rule:', error);
        return null;
      }

      console.log('Modality rule for team scoring:', data);
      return data;
    },
    enabled: !!modalityId,
  });

  // Fetch scoring fields only - NO battery or configuration fields
  const { data: campos = [], isLoading } = useQuery({
    queryKey: ['clean-team-campos', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .order('ordem_exibicao');

      if (error) throw error;

      // Ultra aggressive filtering to exclude ALL configuration fields
      const scoringFields = (data as CampoModelo[]).filter(campo => {
        const chaveLower = campo.chave_campo.toLowerCase();
        
        // Exclude configuration input types
        if (campo.tipo_input === 'configuration' || campo.tipo_input === 'checkbox') {
          return false;
        }
        
        // Exclude ALL known configuration fields by key
        const configurationKeys = [
          'bateria', 'baterias', 'numero_bateria', 'equipe',
          'configuracao_pontuacao', 'configuracao', 'pontuacao_config',
          'usar_baterias', 'config_pontos', 'config', 'configuracao_de_pontuacao'
        ];
        
        if (configurationKeys.some(key => chaveLower.includes(key))) {
          return false;
        }
        
        // Additional check: if the field label contains "configuração"
        if (campo.rotulo_campo?.toLowerCase().includes('configuração')) {
          return false;
        }
        
        return true;
      });

      console.log('Clean team scoring fields:', scoringFields);
      return scoringFields;
    },
    enabled: !!modeloId,
  });

  // Create dynamic schema
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    campos.forEach(campo => {
      if (campo.tipo_input === 'number' || campo.tipo_input === 'integer') {
        schemaFields[campo.chave_campo] = campo.obrigatorio 
          ? z.number({ required_error: `${campo.rotulo_campo} é obrigatório` })
          : z.number().optional();
      } else if (campo.tipo_input === 'select') {
        schemaFields[campo.chave_campo] = campo.obrigatorio
          ? z.string({ required_error: `${campo.rotulo_campo} é obrigatório` })
          : z.string().optional();
      } else {
        schemaFields[campo.chave_campo] = campo.obrigatorio
          ? z.string({ required_error: `${campo.rotulo_campo} é obrigatório` })
          : z.string().optional();
      }
    });

    schemaFields.notes = z.string().optional();

    return z.object(schemaFields);
  };

  const schema = createSchema();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      notes: initialValues?.notes || '',
    },
  });

  // Determine the score format based on modality rule
  const getScoreFormat = () => {
    if (!modalityRule) return 'pontos';
    
    switch (modalityRule.regra_tipo) {
      case 'tempo':
        return 'tempo';
      case 'distancia':
        return 'distancia';
      default:
        return 'pontos';
    }
  };

  const scoreFormat = getScoreFormat();

  return {
    campos,
    isLoading,
    form,
    scoreFormat,
    modalityRule
  };
}


import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DynamicScoreFields } from './DynamicScoreFields';
import { useModalityRules } from '../../tabs/scores/hooks/useModalityRules';
import { 
  TimeScoreFormValues, 
  DistanceScoreFormValues, 
  PointsScoreFormValues 
} from '../types';

interface ScoreFormProps {
  modalityId: number;
  initialValues?: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

// Dynamic schema based on rule type
const createDynamicSchema = (regraTipo: string, parametros: any) => {
  const baseSchema = {
    notes: z.string().optional(),
  };

  switch (regraTipo) {
    case 'tempo':
      return z.object({
        ...baseSchema,
        minutes: z.coerce.number().min(0).default(0),
        seconds: z.coerce.number().min(0).max(59).default(0),
        milliseconds: z.coerce.number().min(0).max(999).default(0),
      });
    
    case 'distancia':
      // Check if using meters and centimeters format
      if (parametros?.subunidade === 'cm') {
        return z.object({
          ...baseSchema,
          meters: z.coerce.number().min(0).default(0),
          centimeters: z.coerce.number().min(0).max(99).default(0),
        });
      }
      // Legacy single value format
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
    
    case 'pontos':
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
    
    case 'baterias':
      const numTentativas = parametros?.num_tentativas || 3;
      return z.object({
        ...baseSchema,
        tentativas: z.array(z.object({
          valor: z.coerce.number().min(0),
          raia: z.string().optional(),
        })).length(numTentativas),
      });
    
    case 'sets':
      const numSets = parametros?.num_sets || 3;
      const pontuaPorSet = parametros?.pontua_por_set !== false;
      
      if (pontuaPorSet) {
        return z.object({
          ...baseSchema,
          sets: z.array(z.object({
            pontos: z.coerce.number().min(0),
          })).length(numSets),
        });
      } else {
        return z.object({
          ...baseSchema,
          sets: z.array(z.object({
            vencedor: z.enum(['vitoria', 'derrota']),
          })).length(numSets),
        });
      }
    
    case 'arrows':
      const numFlechas = parametros?.num_flechas || 6;
      return z.object({
        ...baseSchema,
        flechas: z.array(z.object({
          zona: z.string(),
        })).length(numFlechas),
      });
    
    default:
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
  }
};

export function ScoreForm({ modalityId, initialValues, onSubmit, isPending }: ScoreFormProps) {
  const { data: rule, isLoading } = useModalityRules(modalityId);
  
  // Create schema based on rule
  const schema = rule ? createDynamicSchema(rule.regra_tipo, rule.parametros) : z.object({
    score: z.coerce.number().min(0).default(0),
    notes: z.string().optional(),
  });
  
  // Define default values based on rule type
  const getDefaultValues = () => {
    if (initialValues) return initialValues;
    if (!rule) return { score: 0, notes: '' };
    
    switch (rule.regra_tipo) {
      case 'tempo':
        return { minutes: 0, seconds: 0, milliseconds: 0, notes: '' };
      case 'distancia':
        if (rule.parametros.subunidade === 'cm') {
          return { meters: 0, centimeters: 0, notes: '' };
        }
        return { score: 0, notes: '' };
      case 'baterias':
        const numTentativas = rule.parametros.num_tentativas || 3;
        return {
          tentativas: Array.from({ length: numTentativas }, () => ({ valor: 0, raia: '' })),
          notes: ''
        };
      case 'sets':
        const numSets = rule.parametros.num_sets || 3;
        const pontuaPorSet = rule.parametros.pontua_por_set !== false;
        return {
          sets: Array.from({ length: numSets }, () => 
            pontuaPorSet ? { pontos: 0 } : { vencedor: 'derrota' }
          ),
          notes: ''
        };
      case 'arrows':
        const numFlechas = rule.parametros.num_flechas || 6;
        return {
          flechas: Array.from({ length: numFlechas }, () => ({ zona: '0' })),
          notes: ''
        };
      default:
        return { score: 0, notes: '' };
    }
  };
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  const handleSubmit = (data: any) => {
    // Convert meters and centimeters to decimal value for distance scoring
    if (rule?.regra_tipo === 'distancia' && rule.parametros.subunidade === 'cm' && 'meters' in data && 'centimeters' in data) {
      const convertedData = {
        ...data,
        score: data.meters + (data.centimeters / 100), // Convert to decimal meters
        meters: undefined,
        centimeters: undefined
      };
      onSubmit(convertedData);
    } else {
      onSubmit(data);
    }
  };

  if (isLoading) {
    return <div>Carregando configuração da modalidade...</div>;
  }

  if (!rule) {
    return <div>Erro ao carregar configuração da modalidade</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <DynamicScoreFields form={form} rule={rule} />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Enviando...' : 'Salvar Pontuação'}
        </Button>
      </form>
    </Form>
  );
}

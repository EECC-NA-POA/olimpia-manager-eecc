
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModalityRules } from '../../tabs/scores/hooks/useModalityRules';
import { useBateriaData } from '../../tabs/scores/hooks/useBateriaData';
import { createDynamicSchema } from '../utils/schemaUtils';
import { getDefaultValues } from '../utils/defaultValuesUtils';

interface UseScoreFormProps {
  modalityId: number;
  initialValues?: any;
  modalityRule?: any;
  eventId?: string | null;
}

export function useScoreForm({ modalityId, initialValues, modalityRule, eventId }: UseScoreFormProps) {
  // Use passed modalityRule if available, otherwise fetch it
  const { data: fetchedRule, isLoading } = useModalityRules(modalityId);
  const rule = modalityRule || fetchedRule;
  
  // Fetch baterias data
  const { data: bateriasData = [], isLoading: isLoadingBaterias } = useBateriaData(
    modalityId, 
    eventId
  );
  
  console.log('useScoreForm - modalityId:', modalityId);
  console.log('useScoreForm - passed modalityRule:', modalityRule);
  console.log('useScoreForm - fetchedRule:', fetchedRule);
  console.log('useScoreForm - final rule:', rule);
  console.log('useScoreForm - initialValues:', initialValues);
  console.log('useScoreForm - bateriasData:', bateriasData);
  
  // Create schema based on rule
  const schema = rule ? createDynamicSchema(rule.regra_tipo, rule.parametros) : z.object({
    score: z.coerce.number().min(0).default(0),
    notes: z.string().optional(),
  });
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialValues, rule),
  });

  return {
    form,
    rule,
    bateriasData,
    isLoading: !modalityRule && isLoading,
    isLoadingBaterias
  };
}

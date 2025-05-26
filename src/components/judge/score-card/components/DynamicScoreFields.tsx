
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';
import { TimeScoreFields } from './TimeScoreFields';
import { DistanceScoreFields } from './DistanceScoreFields';
import { PointsScoreFields } from './PointsScoreFields';
import { BateriasScoreFields } from './BateriasScoreFields';
import { SetsScoreFields } from './SetsScoreFields';
import { ArrowsScoreFields } from './ArrowsScoreFields';
import { ArcheryScoreFields } from './ArcheryScoreFields';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';

interface DynamicScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
  bateriasData?: Bateria[];
}

export function DynamicScoreFields({ form, rule, bateriasData = [] }: DynamicScoreFieldsProps) {
  console.log('DynamicScoreFields - Rule type:', rule.regra_tipo);
  console.log('DynamicScoreFields - Rule parameters:', rule.parametros);
  console.log('DynamicScoreFields - Baterias data:', bateriasData);
  
  // Ensure parametros has default values if empty
  const parametros = rule.parametros || {};
  
  switch (rule.regra_tipo) {
    case 'pontos':
      console.log('Rendering PointsScoreFields');
      return <PointsScoreFields form={form} />;
    
    case 'distancia':
      console.log('Rendering DistanceScoreFields');
      // Check if the rule specifically requires meters and centimeters input
      const useMetersAndCentimeters = parametros.subunidade === 'cm';
      const baterias = parametros.baterias === true;
      const raiasPorBateria = parametros.raias_por_bateria;
      
      console.log('Using meters and centimeters?', useMetersAndCentimeters);
      console.log('Using heats?', baterias);
      console.log('Lanes per heat?', raiasPorBateria);
      
      return (
        <DistanceScoreFields 
          form={form} 
          useMetersAndCentimeters={useMetersAndCentimeters}
          baterias={baterias}
          raiasPorBateria={raiasPorBateria}
          bateriasData={bateriasData}
        />
      );
    
    case 'tempo':
      console.log('Rendering TimeScoreFields');
      return <TimeScoreFields form={form} />;
    
    case 'baterias':
      console.log('Rendering BateriasScoreFields');
      return <BateriasScoreFields form={form} rule={rule} />;
    
    case 'sets':
      console.log('Rendering SetsScoreFields');
      return <SetsScoreFields form={form} rule={rule} />;
    
    case 'arrows':
      console.log('Rendering ArcheryScoreFields');
      // Check if this is Olympic-style archery with phases
      const hasPhases = parametros.fase_classificacao || parametros.fase_eliminacao;
      
      if (hasPhases) {
        return <ArcheryScoreFields form={form} rule={rule} />;
      } else {
        // Fallback to simple arrows input
        return <ArrowsScoreFields form={form} rule={rule} />;
      }
    
    default:
      console.warn('Unknown rule type, falling back to points:', rule.regra_tipo);
      return <PointsScoreFields form={form} />;
  }
}

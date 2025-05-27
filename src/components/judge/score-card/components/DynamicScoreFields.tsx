
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
  
  // Check if this rule uses baterias (any rule type can use baterias)
  const usesBaterias = parametros.baterias === true;
  
  // If the rule uses baterias, show the BateriasScoreFields component
  if (usesBaterias) {
    console.log('Rendering BateriasScoreFields for rule type:', rule.regra_tipo);
    return <BateriasScoreFields form={form} rule={rule} />;
  }
  
  // Base the field type on the rule type - this is the key fix
  switch (rule.regra_tipo) {
    case 'tempo':
      console.log('Rendering TimeScoreFields for tempo rule');
      return (
        <TimeScoreFields 
          form={form} 
          bateriasData={bateriasData}
          modalityRule={rule}
        />
      );
    
    case 'distancia':
      console.log('Rendering DistanceScoreFields for distancia rule');
      // Check if the rule specifically requires meters and centimeters input
      const useMetersAndCentimeters = parametros.subunidade === 'cm';
      const raiasPorBateria = parametros.raias_por_bateria;
      
      console.log('Using meters and centimeters?', useMetersAndCentimeters);
      console.log('Lanes per heat?', raiasPorBateria);
      
      return (
        <DistanceScoreFields 
          form={form} 
          useMetersAndCentimeters={useMetersAndCentimeters}
          baterias={false}
          raiasPorBateria={raiasPorBateria}
          bateriasData={bateriasData}
        />
      );
    
    case 'pontos':
      console.log('Rendering PointsScoreFields for pontos rule');
      return <PointsScoreFields form={form} />;
    
    case 'sets':
      console.log('Rendering SetsScoreFields for sets rule');
      return <SetsScoreFields form={form} rule={rule} />;
    
    case 'arrows':
      console.log('Rendering ArcheryScoreFields for arrows rule');
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

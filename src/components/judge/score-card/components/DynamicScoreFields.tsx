
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';
import { TimeScoreFields } from './TimeScoreFields';
import { DistanceScoreFields } from './DistanceScoreFields';
import { PointsScoreFields } from './PointsScoreFields';
import { BateriasScoreFields } from './BateriasScoreFields';
import { SetsScoreFields } from './SetsScoreFields';
import { ArrowsScoreFields } from './ArrowsScoreFields';

interface DynamicScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function DynamicScoreFields({ form, rule }: DynamicScoreFieldsProps) {
  switch (rule.regra_tipo) {
    case 'pontos':
      return <PointsScoreFields form={form} />;
    
    case 'distancia':
      // Check if the rule has subunidade parameter to determine input format
      const useMetersAndCentimeters = rule.parametros.subunidade === 'cm';
      return <DistanceScoreFields form={form} useMetersAndCentimeters={useMetersAndCentimeters} />;
    
    case 'tempo':
      return <TimeScoreFields form={form} />;
    
    case 'baterias':
      return <BateriasScoreFields form={form} rule={rule} />;
    
    case 'sets':
      return <SetsScoreFields form={form} rule={rule} />;
    
    case 'arrows':
      return <ArrowsScoreFields form={form} rule={rule} />;
    
    default:
      return <PointsScoreFields form={form} />;
  }
}

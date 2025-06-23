import React from 'react';
import { ModalityRule } from '../../tabs/scores/hooks/useModeloConfiguration';

interface ModalityInfoProps {
  rule: ModalityRule;
}

export function ModalityInfo({ rule }: ModalityInfoProps) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-medium mb-3">
        Modalidade: {rule.regra_tipo} 
        {rule.parametros?.unidade && ` (${rule.parametros.unidade})`}
      </h4>
    </div>
  );
}

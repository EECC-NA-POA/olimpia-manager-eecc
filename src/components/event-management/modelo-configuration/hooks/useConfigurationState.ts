
import { useState } from 'react';
import { ModeloConfig } from './types';

export function useConfigurationState() {
  const [config, setConfig] = useState<ModeloConfig>({
    baterias: false,
    num_raias: 0,
    permite_final: false,
    regra_tipo: 'pontos',
    formato_resultado: '',
    tipo_calculo: '',
    campo_referencia: '',
    contexto: '',
    ordem_calculo: 'asc'
  });

  const handleBateriasChange = (checked: boolean) => {
    setConfig(prev => ({ ...prev, baterias: checked }));
  };

  const handleRegraTypeChange = (value: string) => {
    const newConfig = { ...config, regra_tipo: value };
    
    if (value === 'tempo') {
      newConfig.formato_resultado = 'tempo';
      newConfig.campo_referencia = 'tempo';
    }
    
    setConfig(newConfig);
  };

  const handleNumRaiasChange = (value: number) => {
    console.log('useConfigurationState - Updating num_raias to:', value);
    // Explicitly allow 0 as a valid value - using strict equality check
    if (value >= 0 && value <= 20) {
      setConfig(prev => ({
        ...prev,
        num_raias: value
      }));
    }
  };

  const handlePermiteFinalChange = (checked: boolean) => {
    setConfig(prev => ({ ...prev, permite_final: checked }));
  };

  return {
    config,
    setConfig,
    handleBateriasChange,
    handleRegraTypeChange,
    handleNumRaiasChange,
    handlePermiteFinalChange
  };
}

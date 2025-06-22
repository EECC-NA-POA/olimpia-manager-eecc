
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
    console.log('useConfigurationState - handleNumRaiasChange called with:', value);
    console.log('Current config.num_raias before update:', config.num_raias);
    
    // EXPLICITLY accept 0 and any number between 0 and 20
    if (Number.isInteger(value) && value >= 0 && value <= 20) {
      console.log('useConfigurationState - Updating num_raias to:', value);
      setConfig(prev => {
        const newConfig = {
          ...prev,
          num_raias: value
        };
        console.log('useConfigurationState - New config after update:', newConfig);
        return newConfig;
      });
    } else {
      console.log('useConfigurationState - Invalid value, not updating:', value);
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

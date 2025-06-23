
import { useConfigurationState } from './useConfigurationState';
import { useCamposState } from './useCamposState';
import { useModeloDataLoader } from './useModeloDataLoader';

export function useModeloConfigurationState(editingModelo: any) {
  const {
    config,
    setConfig,
    handleBateriasChange: baseBateriasChange,
    handleRegraTypeChange: baseRegraTypeChange,
    handleNumRaiasChange,
    handlePermiteFinalChange
  } = useConfigurationState();

  const {
    campos,
    setCampos,
    addCampo: baseAddCampo,
    removeCampo,
    updateCampo,
    handleBateriaToggle,
    updateCamposForRegraType,
    handleDragEnd,
    ensureResultadoField
  } = useCamposState();

  useModeloDataLoader({ editingModelo, setConfig, setCampos });

  const handleBateriasChange = (checked: boolean) => {
    baseBateriasChange(checked);
    handleBateriaToggle(checked);
  };

  const handleRegraTypeChange = (value: string) => {
    baseRegraTypeChange(value);
    updateCamposForRegraType(value);
    // Ensure resultado field exists after regra type change
    ensureResultadoField(value);
  };

  const addCampo = () => {
    baseAddCampo(config.regra_tipo);
  };

  return {
    config,
    setConfig,
    campos,
    setCampos,
    handleBateriasChange,
    handleRegraTypeChange,
    handleNumRaiasChange,
    addCampo,
    removeCampo,
    updateCampo,
    handleDragEnd
  };
}

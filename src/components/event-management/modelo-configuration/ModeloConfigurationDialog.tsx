
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { BatteryAndLanesSection } from './sections/BatteryAndLanesSection';
import { ScoringConfigurationSection } from './sections/ScoringConfigurationSection';
import { FieldsConfigurationSection } from './sections/FieldsConfigurationSection';
import { ModeloConfigurationDialogActions } from './sections/ModeloConfigurationDialogActions';
import { useModeloConfigurationState } from './hooks/useModeloConfigurationState';

interface ModeloConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modeloId: number, parametros: any) => Promise<void>;
  onDuplicate?: (modelo: any) => void;
  editingModelo: any;
  isSaving: boolean;
}

export function ModeloConfigurationDialog({
  isOpen,
  onClose,
  onSave,
  onDuplicate,
  editingModelo,
  isSaving
}: ModeloConfigurationDialogProps) {
  const {
    config,
    setConfig,
    campos,
    handleBateriasChange,
    handleRegraTypeChange,
    addCampo,
    removeCampo,
    updateCampo,
    handleDragEnd
  } = useModeloConfigurationState(editingModelo);

  const handleSave = async () => {
    if (!editingModelo) return;
    
    console.log('Saving configuration...');
    console.log('Current config:', config);
    console.log('Current campos:', campos);
    
    const configWithCampos = {
      ...config,
      campos: campos.sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
    };
    
    console.log('Final config to save:', configWithCampos);
    
    try {
      await onSave(editingModelo.id, configWithCampos);
      console.log('Save completed successfully');
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate && editingModelo) {
      onDuplicate(editingModelo);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Configurar Modelo: {editingModelo?.codigo_modelo || editingModelo?.descricao}
            </DialogTitle>
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={handleDuplicate} className="mr-12">
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <BatteryAndLanesSection
            config={{
              baterias: config.baterias,
              num_raias: config.num_raias,
              permite_final: config.permite_final
            }}
            onBateriasChange={handleBateriasChange}
            onNumRaiasChange={(value) => setConfig(prev => ({ ...prev, num_raias: value }))}
            onPermiteFinalChange={(checked) => setConfig(prev => ({ ...prev, permite_final: checked }))}
          />
          
          <ScoringConfigurationSection
            config={{
              regra_tipo: config.regra_tipo,
              formato_resultado: config.formato_resultado,
              tipo_calculo: config.tipo_calculo,
              campo_referencia: config.campo_referencia,
              contexto: config.contexto,
              ordem_calculo: config.ordem_calculo
            }}
            onRegraTypeChange={handleRegraTypeChange}
            onFormatoResultadoChange={(value) => setConfig(prev => ({ ...prev, formato_resultado: value }))}
            onTipoCalculoChange={(value) => setConfig(prev => ({ ...prev, tipo_calculo: value }))}
            onCampoReferenciaChange={(value) => setConfig(prev => ({ ...prev, campo_referencia: value }))}
            onContextoChange={(value) => setConfig(prev => ({ ...prev, contexto: value }))}
            onOrdemCalculoChange={(value) => setConfig(prev => ({ ...prev, ordem_calculo: value }))}
          />

          <FieldsConfigurationSection
            campos={campos}
            onAddCampo={addCampo}
            onRemoveCampo={removeCampo}
            onUpdateCampo={updateCampo}
            onDragEnd={handleDragEnd}
          />
          
          <ModeloConfigurationDialogActions
            onCancel={onClose}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

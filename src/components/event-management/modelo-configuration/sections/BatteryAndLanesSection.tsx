
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface BatteryAndLanesSectionProps {
  config: {
    baterias: boolean;
    num_raias: number;
    permite_final: boolean;
  };
  onBateriasChange: (checked: boolean) => void;
  onNumRaiasChange: (value: number) => void;
  onPermiteFinalChange: (checked: boolean) => void;
}

export function BatteryAndLanesSection({
  config,
  onBateriasChange,
  onNumRaiasChange,
  onPermiteFinalChange
}: BatteryAndLanesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configurações de Bateria e Raias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="baterias">Usar Sistema de Baterias</Label>
            <p className="text-sm text-muted-foreground">
              Permite organizar competições em baterias/grupos
            </p>
          </div>
          <Switch
            id="baterias"
            checked={config.baterias}
            onCheckedChange={onBateriasChange}
          />
        </div>
        
        {config.baterias && (
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="permite_final">Permitir Bateria Final</Label>
              <p className="text-sm text-muted-foreground">
                Habilita criação de bateria final para definir vencedores
              </p>
            </div>
            <Switch
              id="permite_final"
              checked={config.permite_final}
              onCheckedChange={onPermiteFinalChange}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="num_raias">Número de Raias</Label>
          <Input
            id="num_raias"
            type="number"
            min="0"
            max="20"
            value={config.num_raias}
            onChange={(e) => onNumRaiasChange(Number(e.target.value))}
          />
          <p className="text-sm text-muted-foreground">
            {config.baterias ? 'Número de raias por bateria.' : 'Número total de raias para a modalidade. Deixe 0 se não for aplicável.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

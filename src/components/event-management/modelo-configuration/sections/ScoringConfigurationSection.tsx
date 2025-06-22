
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScoringConfigurationSectionProps {
  config: {
    regra_tipo: string;
    formato_resultado: string;
    tipo_calculo: string;
    campo_referencia: string;
    contexto: string;
    ordem_calculo: string;
  };
  onRegraTypeChange: (value: string) => void;
  onFormatoResultadoChange: (value: string) => void;
  onTipoCalculoChange: (value: string) => void;
  onCampoReferenciaChange: (value: string) => void;
  onContextoChange: (value: string) => void;
  onOrdemCalculoChange: (value: string) => void;
}

export function ScoringConfigurationSection({
  config,
  onRegraTypeChange,
  onFormatoResultadoChange,
  onTipoCalculoChange,
  onCampoReferenciaChange,
  onContextoChange,
  onOrdemCalculoChange
}: ScoringConfigurationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configurações de Pontuação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="regra_tipo">Tipo de Regra</Label>
          <Select
            value={config.regra_tipo}
            onValueChange={onRegraTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de regra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pontos">Pontos</SelectItem>
              <SelectItem value="tempo">Tempo</SelectItem>
              <SelectItem value="distancia">Distância</SelectItem>
              <SelectItem value="sets">Sets</SelectItem>
              <SelectItem value="arrows">Flechas (Tiro com Arco)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formato_resultado">Formato de Resultado</Label>
          <Select
            value={config.formato_resultado}
            onValueChange={onFormatoResultadoChange}
            disabled={config.regra_tipo === 'tempo'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tempo">Tempo (MM:SS.mmm)</SelectItem>
              <SelectItem value="distancia">Distância (m,cm)</SelectItem>
              <SelectItem value="pontos">Pontos (###.##)</SelectItem>
            </SelectContent>
          </Select>
          {config.regra_tipo === 'tempo' && (
            <p className="text-sm text-muted-foreground">
              Automaticamente definido como "Tempo" quando o tipo de regra é tempo
            </p>
          )}
        </div>

        {config.regra_tipo === 'tempo' && (
          <div className="space-y-2">
            <Label htmlFor="tipo_calculo">Tipo de Cálculo</Label>
            <Select
              value={config.tipo_calculo}
              onValueChange={onTipoCalculoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de cálculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colocacao_bateria">Colocação por Bateria</SelectItem>
                <SelectItem value="colocacao_final">Colocação Final</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {config.tipo_calculo && (
          <>
            <div className="space-y-2">
              <Label htmlFor="campo_referencia">Campo de Referência</Label>
              <Input
                id="campo_referencia"
                placeholder="Ex: tempo, distancia, pontos"
                value={config.campo_referencia}
                onChange={(e) => onCampoReferenciaChange(e.target.value)}
                disabled={config.regra_tipo === 'tempo'}
              />
              {config.regra_tipo === 'tempo' && (
                <p className="text-sm text-muted-foreground">
                  Automaticamente definido como "tempo" quando o tipo de regra é tempo
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contexto">Contexto do Cálculo</Label>
              <Select
                value={config.contexto}
                onValueChange={onContextoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contexto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bateria">Bateria - Classificação dentro de cada bateria</SelectItem>
                  <SelectItem value="modalidade">Modalidade - Classificação geral da modalidade</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Bateria:</strong> Cada bateria tem seus próprios colocados (1º, 2º, 3º...)</p>
                <p><strong>Modalidade:</strong> Todos os resultados da modalidade são comparados</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordem_calculo">Ordem de Cálculo</Label>
              <Select
                value={config.ordem_calculo}
                onValueChange={onOrdemCalculoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ordem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente (menor = melhor)</SelectItem>
                  <SelectItem value="desc">Decrescente (maior = melhor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

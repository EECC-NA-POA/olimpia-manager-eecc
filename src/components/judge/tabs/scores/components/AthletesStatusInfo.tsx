
import React from 'react';

interface AthletesStatusInfoProps {
  athletesToShow: number;
  totalAthletes: number;
  usesBaterias: boolean;
  selectedBateriaId: number | null;
  selectedAthletesCount: number;
  hasDynamicScoring: boolean;
  modelos: any[];
  modalityRule?: any;
  bateriasData: any[];
}

export function AthletesStatusInfo({
  athletesToShow,
  totalAthletes,
  usesBaterias,
  selectedBateriaId,
  selectedAthletesCount,
  hasDynamicScoring,
  modelos,
  modalityRule,
  bateriasData
}: AthletesStatusInfoProps) {
  const showBateriaInfo = !hasDynamicScoring && modalityRule && (
    (modalityRule.regra_tipo === 'distancia' && modalityRule.parametros?.baterias) ||
    modalityRule.regra_tipo === 'baterias' ||
    modalityRule.regra_tipo === 'tempo'
  );

  return (
    <div className="text-center text-xs sm:text-sm text-muted-foreground">
      Mostrando {athletesToShow} de {totalAthletes} atletas
      {usesBaterias && selectedBateriaId && selectedAthletesCount > 0 && (
        <div className="mt-1 text-blue-700">
          ({selectedAthletesCount} selecionados para a bateria)
        </div>
      )}
      {hasDynamicScoring ? (
        <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded border">
          <strong>Sistema de Pontuação Dinâmica Ativo</strong>
          <div className="mt-1">
            Modelo: {modelos[0]?.descricao || modelos[0]?.codigo_modelo}
          </div>
          <div className="mt-1">
            {usesBaterias ? 'Sistema de baterias: Ativo' : 'Sistema de baterias: Inativo'}
          </div>
        </div>
      ) : modalityRule && (
        <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded border">
          Modalidade: {modalityRule.regra_tipo} 
          {modalityRule.parametros?.unidade && ` (${modalityRule.parametros.unidade})`}
          {showBateriaInfo && bateriasData.length > 0 && (
            <div className="mt-1">
              Baterias disponíveis: {bateriasData.map(b => `Bateria ${b.numero}`).join(', ')}
            </div>
          )}
          {showBateriaInfo && bateriasData.length === 0 && (
            <div className="mt-1 text-amber-600">
              ⚠️ Nenhuma bateria configurada - configure nas regras da modalidade
            </div>
          )}
        </div>
      )}
    </div>
  );
}

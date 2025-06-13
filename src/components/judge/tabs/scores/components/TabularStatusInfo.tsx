
import React from 'react';
import { Athlete } from '../hooks/useAthletes';

interface TabularStatusInfoProps {
  athletesToShow: Athlete[];
  totalAthletes: number;
  usesBaterias: boolean;
  selectedBateriaId: number | null;
  selectedAthletesCount: number;
  hasDynamicScoring: boolean;
  modelos: any[];
  selectedBateria: any;
}

export function TabularStatusInfo({
  athletesToShow,
  totalAthletes,
  usesBaterias,
  selectedBateriaId,
  selectedAthletesCount,
  hasDynamicScoring,
  modelos,
  selectedBateria
}: TabularStatusInfoProps) {
  return (
    <div className="text-center text-xs sm:text-sm text-muted-foreground">
      Mostrando {athletesToShow.length} de {totalAthletes} atletas
      {usesBaterias && selectedBateriaId && selectedAthletesCount > 0 && (
        <div className="mt-1 text-blue-700">
          ({selectedAthletesCount} selecionados para a bateria)
        </div>
      )}
      {hasDynamicScoring && modelos[0] && (
        <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded border">
          <strong>Sistema de Pontuação Dinâmica Ativo</strong>
          <div className="mt-1">
            Modelo: {modelos[0].descricao || modelos[0].codigo_modelo}
          </div>
          <div className="mt-1">
            {usesBaterias ? 'Sistema de baterias: Ativo' : 'Sistema de baterias: Inativo'}
          </div>
        </div>
      )}
      {selectedBateria && (
        <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded border">
          <strong>
            {selectedBateria.isFinal ? 'Bateria Final' : `Bateria ${selectedBateria.numero}`} Selecionada
          </strong>
          <div className="mt-1">
            {selectedBateria.isFinal 
              ? 'Determine os ganhadores finais desta modalidade'
              : 'Registre as pontuações para esta bateria'
            }
          </div>
        </div>
      )}
    </div>
  );
}

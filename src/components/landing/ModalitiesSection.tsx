
import React from 'react';
import { Card } from "@/components/ui/card";

const modalities = [
  { name: 'Corrida', icon: "🏃" },
  { name: 'Lançamento de Dardo', icon: "🎯" },
  { name: 'Natação', icon: "🏊" },
  { name: 'Poesia (Escrita e Declamada)', icon: "📝" },
  { name: 'Salto em Distância', icon: "🦘" },
  { name: 'Tênis de Mesa', icon: "🏓" },
  { name: 'Tiro com Arco', icon: "🎯" },
  { name: 'Vôlei', icon: "🏐" },
  { name: 'Xadrez', icon: "♟️" }
];

export const ModalitiesSection = () => {
  return (
    <div className="bg-white/95 backdrop-blur rounded-lg p-6 shadow-lg mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-olimpics-text mb-6 text-center">
        Modalidades Olímpicas
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {modalities.map((modality, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/80 shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-2xl">{modality.icon}</span>
            <span className="text-olimpics-text font-medium">
              {modality.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

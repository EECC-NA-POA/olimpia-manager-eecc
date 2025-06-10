
import React from 'react';
import { Card } from "@/components/ui/card";

export const WelcomeMessage = () => {
  return (
    <div className="relative">
      <Card className="mb-8 p-6 bg-white/10 backdrop-blur border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/lovable-uploads/0a5e70c8-a05f-4bbe-89dd-08c867e74b50.png"
            alt="Olympic Rings"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-md">
            Bem-vindo/a(s) à maior Olimpíada de Esporte com Filosofia!
          </h3>
          <p className="text-lg leading-relaxed text-white drop-shadow">
            Mais que medalhas, a Olimpíada é um caminho de autoconhecimento e superação. Uma verdadeira celebração da Humanidade.
          </p>
          <p className="text-lg leading-relaxed italic text-white drop-shadow">
            Venha desafiar seus limites e buscar a excelência. O maior adversário é você mesmo.
          </p>
          <p className="text-xl font-semibold text-white drop-shadow">
            Onde o Espírito Olímpico encontra a Filosofia. Inscreva-se nas Olimpíadas Nacionais da Escola do Esporte com Coração!
          </p>
        </div>
      </Card>
    </div>
  );
};

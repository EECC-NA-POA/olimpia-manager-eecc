
import React from 'react';
import { Card } from "@/components/ui/card";
import { Trophy, Users, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: <Trophy className="h-8 w-8 text-olimpics-orange-primary" />,
    title: "Gestão de Eventos",
    description: "Sistema completo para organização e gestão de eventos esportivos olímpicos"
  },
  {
    icon: <Users className="h-8 w-8 text-olimpics-green-primary" />,
    title: "Inscrições Online",
    description: "Processo simplificado de inscrição para atletas e delegações"
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-olimpics-orange-primary" />,
    title: "Acompanhamento",
    description: "Dashboards e relatórios em tempo real para organizadores"
  },
  {
    icon: <Shield className="h-8 w-8 text-olimpics-green-primary" />,
    title: "Segurança",
    description: "Dados protegidos e sistema confiável para suas informações"
  }
];

export const SystemInfoSection = () => {
  return (
    <div className="bg-white/95 backdrop-blur rounded-lg p-8 shadow-lg mb-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-olimpics-text mb-4">
          Sobre o Olimpia Manager
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Plataforma completa para gestão de eventos esportivos olímpicos, 
          conectando atletas, delegações e organizadores em um sistema integrado e eficiente.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-6 rounded-lg bg-white/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-olimpics-text mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

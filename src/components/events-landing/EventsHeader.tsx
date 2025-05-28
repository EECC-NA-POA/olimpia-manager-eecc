
import React from 'react';
import { Calendar, Users, Trophy, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function EventsHeader() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
      <div className="absolute inset-0 bg-black/40" />
      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="text-center mb-16">
          {/* Event Logos */}
          <div className="flex flex-col items-center mb-8 pt-16">
            <div className="flex items-center justify-center gap-8 mb-6 w-full">
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <img src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png" alt="EECC Logo" className="w-full h-full object-contain animate-pulse" />
              </div>
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <img src="/lovable-uploads/nova_acropole_logo_redondo_verde.png" alt="Nova Acrópole Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary mb-6">
              Areté
            </h2>
          </div>

          <div className="flex justify-center items-center gap-3 mb-6">
            <Trophy className="h-12 w-12 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Olímpia Manager
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8">
            Sistema de gestão de eventos e atividades para a Escola do Esporte com Coração
          </p>

          {/* Login/Cadastro Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-olimpics-green-primary mb-4">
              Acesse o Sistema
            </h3>
            <p className="text-gray-600 mb-6">
              Faça login ou cadastre-se para participar dos eventos
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/login')} className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white py-3" size="lg">
                <Users className="h-5 w-5 mr-2" />
                Entrar / Cadastrar-se
              </Button>
              <p className="text-sm text-gray-500">
                Crie sua conta ou acesse eventos específicos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

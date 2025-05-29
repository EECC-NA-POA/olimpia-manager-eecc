
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { LogIn, Users, Calendar } from 'lucide-react';

export const EventAccessSection = () => {
  const scrollToLogin = () => {
    const loginSection = document.querySelector('.backdrop-blur-sm');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Card className="mb-8 p-8 bg-white/10 backdrop-blur border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-olimpics-orange-primary/20 rounded-full">
            <Calendar className="h-12 w-12 text-olimpics-orange-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-white drop-shadow-md">
            Acesse os Eventos Disponíveis
          </h3>
          <p className="text-lg text-white/90 drop-shadow max-w-2xl mx-auto leading-relaxed">
            Para visualizar os eventos disponíveis e realizar sua inscrição nas Olimpíadas, 
            é necessário fazer login ou criar uma conta no sistema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2 text-white/80">
            <Users className="h-5 w-5" />
            <span>Atletas • Delegações • Organizadores</span>
          </div>
        </div>

        <Button 
          onClick={scrollToLogin}
          className="bg-olimpics-orange-primary hover:bg-olimpics-orange-primary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          size="lg"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Fazer Login / Cadastrar-se
        </Button>
      </div>
    </Card>
  );
};

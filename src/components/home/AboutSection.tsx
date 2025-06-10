
import React from 'react';
import { Target } from 'lucide-react';

export const AboutSection = () => {
  return (
    <div className="relative py-20">
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Enhanced section icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl shadow-2xl border border-white/30">
                <Target className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-olimpics-orange-primary/60 rounded-full blur-sm animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
              Sobre o Olímpia Manager
            </span>
          </h2>
          
          <div className="text-lg leading-relaxed space-y-6">
            <div className="p-6 rounded-xl bg-white/95 border border-white/40 backdrop-blur-sm">
              <p className="text-gray-800">
                O <strong className="text-olimpics-green-primary">Olímpia Manager</strong> é uma plataforma digital desenvolvida especificamente 
                para atender às necessidades da <strong className="text-olimpics-orange-primary">Escola do Esporte com Coração</strong> e suas 
                olimpíadas.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/95 border border-white/40 backdrop-blur-sm">
              <p className="text-gray-800">
                Nossa missão é proporcionar uma experiência completa de gestão esportiva, onde cada 
                atleta, juiz e organizador tem acesso às ferramentas necessárias para o sucesso 
                dos eventos olímpicos.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/95 border border-white/40 backdrop-blur-sm">
              <p className="text-gray-800">
                Com foco na <strong className="text-olimpics-green-primary">filosofia olímpica</strong> e nos valores do esporte educacional, 
                o sistema integra tecnologia moderna com os princípios fundamentais do olimpismo: 
                <span className="text-olimpics-green-primary font-semibold"> excelência</span>, 
                <span className="text-olimpics-orange-primary font-semibold"> amizade</span> e 
                <span className="text-olimpics-green-primary font-semibold"> respeito</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Target } from 'lucide-react';

export const AboutSection = () => {
  return (
    <div className="relative py-20">
      {/* Section background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-olimpics-orange-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Enhanced section icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-olimpics-green-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-olimpics-green-primary to-olimpics-green-secondary rounded-2xl shadow-2xl">
                <Target className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-olimpics-orange-primary/60 rounded-full blur-sm animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-olimpics-green-primary mb-8">
            <span className="bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary bg-clip-text text-transparent">
              Sobre o Olímpia Manager
            </span>
          </h2>
          
          <div className="text-lg text-gray-700 leading-relaxed space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-r from-olimpics-green-primary/5 to-transparent border border-olimpics-green-primary/10">
              <p>
                O <strong className="text-olimpics-green-primary">Olímpia Manager</strong> é uma plataforma digital desenvolvida especificamente 
                para atender às necessidades da <strong className="text-olimpics-orange-primary">Escola do Esporte com Coração</strong> e suas 
                olimpíadas nacionais.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-r from-olimpics-orange-primary/5 to-transparent border border-olimpics-orange-primary/10">
              <p>
                Nossa missão é proporcionar uma experiência completa de gestão esportiva, onde cada 
                atleta, juiz e organizador tem acesso às ferramentas necessárias para o sucesso 
                dos eventos olímpicos.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10">
              <p>
                Com foco na <strong className="text-blue-600">filosofia olímpica</strong> e nos valores do esporte educacional, 
                o sistema integra tecnologia moderna com os princípios fundamentais do olimpismo: 
                <span className="text-olimpics-green-primary font-semibold"> excelência</span>, 
                <span className="text-olimpics-orange-primary font-semibold"> amizade</span> e 
                <span className="text-blue-600 font-semibold"> respeito</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

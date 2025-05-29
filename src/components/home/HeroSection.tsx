
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-24">
        <div className="text-center text-white">
          {/* Enhanced Logos Section */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 group cursor-pointer">
                {/* Glow effect for first logo */}
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img 
                  src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
                  alt="EECC Logo"
                  className="w-full h-full object-contain animate-pulse relative z-10 group-hover:scale-110 transition-transform duration-500"
                  onClick={() => window.open('https://www.instagram.com/escola.esporte.coracao', '_blank')}
                />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-olimpics-orange-primary/60 rounded-full blur-sm animate-pulse"></div>
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32 group cursor-pointer">
                {/* Glow effect for second logo */}
                <div className="absolute inset-0 bg-olimpics-orange-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img 
                  src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
                  alt="Nova Acrópole Logo"
                  className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                  onClick={() => window.open('https://www.instagram.com/novaacropolebrasilsul', '_blank')}
                />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white/40 rounded-full blur-sm animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-32 bg-gradient-to-r from-olimpics-orange-primary/20 to-white/10 rounded-full blur-3xl"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 relative">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                Olímpia Manager
              </span>
            </h1>
          </div>
          
          {/* Enhanced Description */}
          <div className="relative max-w-4xl mx-auto mb-8">
            <p className="text-xl md:text-2xl leading-relaxed text-white/90">
              Sistema completo de gestão para eventos esportivos olímpicos. 
              Gerencie atletas, modalidades, competições e resultados em uma plataforma integrada.
            </p>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-olimpics-orange-primary to-transparent rounded-full"></div>
          </div>
          
          {/* Enhanced CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-olimpics-orange-primary to-yellow-500 hover:from-yellow-500 hover:to-olimpics-orange-primary text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-0 overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-olimpics-orange-primary to-yellow-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                
                <span className="relative flex items-center gap-3">
                  Acessar Sistema
                  <ChevronRight className="h-7 w-7 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-pulse"></div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

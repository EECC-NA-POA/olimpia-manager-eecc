import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-20 sm:py-28">
        <div className="text-center text-white space-y-8">

          {/* Logos */}
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/escola.esporte.coracao"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da EECC"
              className="group"
            >
              <img
                src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
                alt="EECC Logo"
                className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
            </a>
            <a
              href="https://www.instagram.com/novaacropolebrasilsul"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Nova Acrópole Brasil Sul"
              className="group"
            >
              <img
                src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
                alt="Nova Acrópole Logo"
                className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-lg">
              Olímpia Manager
            </h1>
            <div className="mt-3 mx-auto w-24 h-1 rounded-full bg-olimpics-orange-primary opacity-80" />
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-white/85 max-w-2xl mx-auto">
            Sistema completo de gestão para eventos esportivos olímpicos.
            Atletas, modalidades, competições e resultados em uma plataforma integrada.
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-olimpics-orange-primary hover:bg-olimpics-orange-primary/90 text-white px-10 py-5 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 border-0"
            >
              <Link to="/login" className="flex items-center gap-2">
                Acessar Sistema
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

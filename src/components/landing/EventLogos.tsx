
import React from 'react';

export const EventLogos = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center justify-center gap-4 mb-4 w-full">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <img 
            src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
            alt="EECC Logo"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <img 
            src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
            alt="Nova Acrópole Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <img 
            src="/lovable-uploads/LOGO_COMITE_PIERRE_COUBERTIN.png"
            alt="Comitê Pierre de Coubertin Logo"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary">
        Areté
      </h2>
    </div>
  );
};

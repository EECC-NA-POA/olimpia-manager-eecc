import React from 'react';

export const ConcordiaLogos = () => {
  return (
    <div className="flex items-center justify-center gap-8 mb-8">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img 
          src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
          alt="EECC Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img 
          src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
          alt="Nova Acrópole Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

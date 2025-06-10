
import React from 'react';

interface LoadingImageProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingImage({ text = "Carregando...", size = 'md' }: LoadingImageProps) {
  // Define os tamanhos com base no parâmetro size
  const imageSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${imageSizes[size]} mb-4`}>
        <img 
          src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
          alt="EECC Logo"
          className="w-full h-full object-contain animate-pulse"
        />
      </div>
      {text && <p className="text-olimpics-green-primary font-medium">{text}</p>}
    </div>
  );
}

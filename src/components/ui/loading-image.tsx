
import React from 'react';

interface LoadingImageProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingImage({ text = "Carregando...", size = 'md' }: LoadingImageProps) {
  const imgSize  = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' }[size];
  const ringSize = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <div
          className={`absolute ${ringSize} rounded-full border-[3px] border-olimpics-green-primary/20 border-t-olimpics-green-primary animate-spin`}
        />
        <img
          src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
          alt="EECC"
          className={`${imgSize} object-contain`}
        />
      </div>
      {text && (
        <p className="text-sm font-medium text-olimpics-green-primary">{text}</p>
      )}
    </div>
  );
}

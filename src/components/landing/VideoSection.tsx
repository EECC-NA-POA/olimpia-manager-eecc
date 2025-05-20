
import React from 'react';

export const VideoSection = () => {
  return (
    <div className="bg-white/95 backdrop-blur rounded-lg p-6 shadow-lg mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-olimpics-text mb-6 text-center">
        Escola do Esporte com Coração
      </h2>
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src="https://www.youtube.com/embed/BwFoRPHYEhg?si=BTizxrPlXejdGHFH"
          title="Escola do Esporte com Coração YouTube Channel"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-[600px] rounded-lg shadow-md"
        ></iframe>
      </div>
    </div>
  );
};

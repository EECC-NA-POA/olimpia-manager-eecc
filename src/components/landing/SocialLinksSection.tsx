
import React from 'react';
import { Instagram, Globe, Youtube } from 'lucide-react';

const socialLinks = [
  {
    name: 'Escola do Esporte com Coração',
    icon: <Instagram className="w-5 h-5" />,
    url: 'https://www.instagram.com/escola.esporte.coracao',
  },
  {
    name: 'Nova Acrópole Brasil Sul',
    icon: <Instagram className="w-5 h-5" />,
    url: 'https://www.instagram.com/novaacropolebrasilsul',
  },
  {
    name: 'Nova Acrópole Website',
    icon: <Globe className="w-5 h-5" />,
    url: 'https://www.nova-acropole.org.br',
  },
  {
    name: 'YouTube Channel',
    icon: <Youtube className="w-5 h-5" />,
    url: 'https://www.youtube.com/@escueladeldeporteconcorazo19',
  },
];

export const SocialLinksSection = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {socialLinks.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full text-olimpics-green-primary hover:bg-white transition-all shadow-md hover:shadow-lg"
        >
          {link.icon}
          <span className="text-sm font-medium">{link.name}</span>
        </a>
      ))}
    </div>
  );
};

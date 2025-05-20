
import React from 'react';
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Instagram, Globe, Youtube } from 'lucide-react';
import { toast } from "sonner";
import Login from "./Login";
import { formatToGoogleCalendarDate } from "@/utils/formatters";

const modalities = [
  { name: 'Corrida', icon: "🏃" },
  { name: 'Lançamento de Dardo', icon: "🎯" },
  { name: 'Natação', icon: "🏊" },
  { name: 'Poesia (Escrita e Declamada)', icon: "📝" },
  { name: 'Salto em Distância', icon: "🦘" },
  { name: 'Tênis de Mesa', icon: "🏓" },
  { name: 'Tiro com Arco', icon: "🎯" },
  { name: 'Vôlei', icon: "🏐" },
  { name: 'Xadrez', icon: "♟️" }
];

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

const LandingPage = () => {
  const handleLocationClick = () => {
    const address = "São Paulo";
    const mapsUrl = `https://www.google.com.br/maps/search/${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCalendarSync = (startDate: string, endDate: string, title: string) => {
    // Format dates for Google Calendar (ensuring end date is the day after the last day of the event)
    const formattedStartDate = formatToGoogleCalendarDate(new Date(startDate));
    const lastDay = new Date(endDate);
    const formattedEndDate = formatToGoogleCalendarDate(lastDay);
    
    // Build Google Calendar URL with properly formatted dates
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedStartDate}/${formattedEndDate}`;
  
    if (window.confirm('Deseja adicionar este evento ao seu calendário?')) {
      window.open(googleCalendarUrl, '_blank');
      toast.success('Redirecionando para o Google Calendar');
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white home-page">
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="text-white">
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

              <div className="text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center lg:text-left animate-fade-in">
                  <span>Olimpíadas Nacionais da Escola do Esporte com Coração - 2025</span>
                </h1>
                <p className="text-xl md:text-2xl italic mb-12 text-center lg:text-left animate-fade-in">
                "Mais rápido, mais alto, mais forte. Estamos unidos!"
                </p>
              </div>

              <div className="relative">
                <Card className="mb-8 p-6 bg-white/10 backdrop-blur border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src="/lovable-uploads/0a5e70c8-a05f-4bbe-89dd-08c867e74b50.png"
                      alt="Olympic Rings"
                      className="w-full h-full object-cover opacity-10"
                    />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">
                      Bem-vindo/a(s) à maior Olimpíada de Esporte com Filosofia!
                    </h3>
                    <p className="text-lg leading-relaxed text-white drop-shadow">
                      Mais que medalhas, a Olimpíada é um caminho de autoconhecimento e superação. Uma verdadeira celebração da Humanidade.
                    </p>
                    <p className="text-lg leading-relaxed italic text-white drop-shadow">
                      Venha desafiar seus limites e buscar a excelência. O maior adversário é você mesmo.
                    </p>
                    <p className="text-xl font-semibold text-white drop-shadow">
                      Onde o Espírito Olímpico encontra a Filosofia. Inscreva-se nas Olimpíadas Nacionais da Escola do Esporte com Coração!
                    </p>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card 
                  className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer animate-fade-in"
                  onClick={handleLocationClick}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-olimpics-green-primary/10">
                      <MapPin className="w-8 h-8 text-olimpics-green-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Local</h3>
                      <p className="text-olimpics-text text-lg mb-2">
                        São Paulo
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        Clique para ver no mapa
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer animate-fade-in"
                  onClick={() => handleCalendarSync('2025-07-10', '2025-07-11', 'Pré-temporada - Olimpíadas Nacionais EECC 2025')}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-olimpics-green-primary/10">
                      <Calendar className="w-8 h-8 text-olimpics-green-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Pré-temporada</h3>
                      <p className="text-olimpics-text text-lg mb-2">10 e 11 de Julho</p>
                      <p className="text-sm text-gray-600 italic">
                        Clique para adicionar ao calendário
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer animate-fade-in"
                  onClick={() => handleCalendarSync('2025-07-12', '2025-07-13', 'Olimpíadas Nacionais EECC 2025')}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-olimpics-green-primary/10">
                      <Calendar className="w-8 h-8 text-olimpics-green-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Olimpíadas</h3>
                      <p className="text-olimpics-text text-lg mb-2">12 e 13 de Julho</p>
                      <p className="text-sm text-gray-600 italic">
                        Clique para adicionar ao calendário
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-lg p-6 shadow-lg mb-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-olimpics-text mb-6 text-center">
                  Modalidades Olímpicas
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {modalities.map((modality, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/80 shadow-sm hover:shadow-md transition-all"
                    >
                      <span className="text-2xl">{modality.icon}</span>
                      <span className="text-olimpics-text font-medium">
                        {modality.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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


            </div>

            <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-xl p-6 lg:sticky lg:top-8 animate-fade-in">
              <Login />
            </div>
          </div>

          <div className="col-span-full mt-8">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


import React from 'react';
import { toast } from "sonner";
import Login from "./Login";
import { formatToGoogleCalendarDate } from "@/utils/formatters";
import { EventLogos } from '@/components/landing/EventLogos';
import { WelcomeMessage } from '@/components/landing/WelcomeMessage';
import { EventInfoCards } from '@/components/landing/EventInfoCards';
import { ModalitiesSection } from '@/components/landing/ModalitiesSection';
import { SocialLinksSection } from '@/components/landing/SocialLinksSection';
import { VideoSection } from '@/components/landing/VideoSection';

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
        <div className="container relative z-10 mx-auto px-4 pt-20 pb-8 public-route-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="text-white">
              <EventLogos />

              <div className="text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center lg:text-left animate-fade-in">
                  <span>Olimpíadas Nacionais da Escola do Esporte com Coração - 2025</span>
                </h1>
                <p className="text-xl md:text-2xl italic mb-12 text-center lg:text-left animate-fade-in">
                "Mais rápido, mais alto, mais forte. Estamos unidos!"
                </p>
              </div>

              <WelcomeMessage />
              <EventInfoCards 
                handleLocationClick={handleLocationClick} 
                handleCalendarSync={handleCalendarSync} 
              />
              <ModalitiesSection />
              <SocialLinksSection />
            </div>

            <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-xl p-6 lg:sticky lg:top-8 animate-fade-in">
              <Login />
            </div>
          </div>

          <div className="col-span-full mt-8">
            <VideoSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

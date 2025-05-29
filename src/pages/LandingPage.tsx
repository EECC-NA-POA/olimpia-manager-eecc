
import React from 'react';
import { toast } from "sonner";
import Login from "./Login";
import { formatToGoogleCalendarDate } from "@/utils/formatters";
import { EventLogos } from '@/components/landing/EventLogos';
import { WelcomeMessage } from '@/components/landing/WelcomeMessage';
import { EventAccessSection } from '@/components/landing/EventAccessSection';
import { SystemInfoSection } from '@/components/landing/SystemInfoSection';
import { EventInfoCards } from '@/components/landing/EventInfoCards';
import { ModalitiesSection } from '@/components/landing/ModalitiesSection';
import { SocialLinksSection } from '@/components/landing/SocialLinksSection';
import { VideoSection } from '@/components/landing/VideoSection';
import { HeaderTitle } from '@/components/landing/HeaderTitle';

const LandingPage = () => {
  const handleLocationClick = () => {
    const address = "São Francisco Xavier, São Paulo, SP";
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
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 py-8 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="text-white">
              <EventLogos />

              <HeaderTitle />

              <WelcomeMessage />
              
              <EventAccessSection />
              
              <EventInfoCards 
                handleLocationClick={handleLocationClick} 
                handleCalendarSync={handleCalendarSync} 
              />
              <SocialLinksSection />
            </div>

            <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-xl p-6 lg:sticky lg:top-8 animate-fade-in">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-bold text-olimpics-green-primary mb-2">
                  Acesso ao Sistema
                </h3>
                <p className="text-gray-600">
                  Faça login para acessar eventos e funcionalidades do sistema
                </p>
              </div>
              <Login />
            </div>
          </div>
          
          {/* Moved sections below the two columns */}
          <div className="mt-12 space-y-8 animate-fade-in">
            <ModalitiesSection />
            <VideoSection />
            
            {/* Cards lado a lado: Acesso aos Eventos e Sobre o Sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EventAccessSection />
              <SystemInfoSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

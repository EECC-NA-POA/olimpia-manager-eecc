
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
import { HeaderTitle } from '@/components/landing/HeaderTitle';
import { SystemInfoSection } from '@/components/landing/SystemInfoSection';

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
      {/* Hero Section with Event Info */}
      <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto px-4 py-8 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="text-white">
              <EventLogos />
              <HeaderTitle />
              <WelcomeMessage />
              <EventInfoCards 
                handleLocationClick={handleLocationClick} 
                handleCalendarSync={handleCalendarSync} 
              />
              <SocialLinksSection />
            </div>

            <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-xl p-6 lg:sticky lg:top-8 animate-fade-in">
              <Login />
            </div>
          </div>
          
          {/* Modalidades Section */}
          <div className="mt-8 animate-fade-in">
            <ModalitiesSection />
          </div>

          {/* Video Section */}
          <div className="mt-8">
            <VideoSection />
          </div>
        </div>
      </div>

      {/* System Information Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <SystemInfoSection />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

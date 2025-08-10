
import React from 'react';
import { PublicEventsSections } from '@/components/home/PublicEventsSections';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { HeroSection } from '@/components/home/HeroSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/53fe30f6-8ee7-4abc-a9ea-bf9c8ceff961.png"
          alt="Olympic background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Decorative background elements for entire page */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-olimpics-orange-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-olimpics-orange-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      
      {/* Content with higher z-index */}
      <div className="relative z-20">
        {/* Hero Section */}
        {/* Mantendo a Hero existente */}
        <HeroSection />

        {/* Public Events Sections (Abertos e Encerrados) */}
        <PublicEventsSections />

        {/* Features Section */}
        <FeaturesSection />

        {/* About Section */}
        <AboutSection />
      </div>
    </div>
  );
};

export default Index;

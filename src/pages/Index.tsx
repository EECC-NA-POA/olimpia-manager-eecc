
import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ActiveEventsSection } from '@/components/home/ActiveEventsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { AboutSection } from '@/components/home/AboutSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary relative overflow-hidden">
      {/* Global overlay for entire page */}
      <div className="absolute inset-0 bg-black/20 z-0" />
      
      {/* Decorative background elements for entire page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-olimpics-orange-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-olimpics-orange-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      
      {/* Hero Section */}
      <HeroSection />

      {/* Active Events Section */}
      <ActiveEventsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* About Section */}
      <AboutSection />
    </div>
  );
};

export default Index;

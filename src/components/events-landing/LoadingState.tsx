
import React from 'react';
import { EventsHeader } from './EventsHeader';
import { LoadingImage } from '@/components/ui/loading-image';

export function LoadingState() {
  return (
    <div className="min-h-screen">
      <EventsHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingImage text="Carregando sistema..." />
        </div>
      </div>
    </div>
  );
}

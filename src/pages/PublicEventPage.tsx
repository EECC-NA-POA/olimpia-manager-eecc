
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Event } from '@/lib/types/database';
import { EventsHeader } from '@/components/events-landing/EventsHeader';
import { LoadingImage } from '@/components/ui/loading-image';
import { Calendar, MapPin, Clock, Users, Trophy, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const PublicEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug não fornecido');
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('slug_pagina', slug)
        .eq('visibilidade_publica', true)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <EventsHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingImage text="Carregando evento..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return <Navigate to="/" replace />;
  }

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.data_inicio_inscricao);
    const endDate = new Date(event.data_fim_inscricao);
    
    if (event.status_evento === 'encerrado') {
      return { label: 'Encerrado', variant: 'secondary' as const };
    }
    
    if (event.status_evento === 'suspenso') {
      return { label: 'Suspenso', variant: 'destructive' as const };
    }
    
    if (now < startDate) {
      return { label: 'Em Breve', variant: 'outline' as const };
    }
    
    if (now >= startDate && now <= endDate) {
      return { label: 'Inscrições Abertas', variant: 'default' as const };
    }
    
    return { label: 'Inscrições Encerradas', variant: 'secondary' as const };
  };

  const getLocationString = () => {
    const locationParts = [event.cidade, event.estado, event.pais].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(', ') : null;
  };

  const status = getEventStatus();
  const locationString = getLocationString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary">
      <EventsHeader />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <div className="text-center mb-12">
            <Badge variant={status.variant} className="mb-4 text-lg px-4 py-2">
              {status.label}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {event.nome}
            </h1>
            {event.descricao && (
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {event.descricao}
              </p>
            )}
          </div>

          {/* Event Image */}
          {event.foto_evento && (
            <div className="mb-12">
              <img
                src={event.foto_evento}
                alt={event.nome}
                className="w-full h-64 md:h-96 object-cover rounded-xl shadow-2xl"
              />
            </div>
          )}

          {/* Event Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
                  <Calendar className="h-5 w-5" />
                  Período de Inscrições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Início:</span>
                    <span className="font-semibold">
                      {format(new Date(event.data_inicio_inscricao), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fim:</span>
                    <span className="font-semibold">
                      {format(new Date(event.data_fim_inscricao), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(event.data_inicio_evento || event.data_fim_evento) && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
                    <Clock className="h-5 w-5" />
                    Período do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.data_inicio_evento && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Início:</span>
                        <span className="font-semibold">
                          {format(new Date(event.data_inicio_evento), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                    {event.data_fim_evento && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Fim:</span>
                        <span className="font-semibold">
                          {format(new Date(event.data_fim_evento), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {locationString && (
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
                    <MapPin className="h-5 w-5" />
                    Local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{locationString}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
                  <Globe className="h-5 w-5" />
                  Tipo de Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 capitalize">{event.tipo}</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-white/95 backdrop-blur-sm p-8 inline-block">
              <div className="space-y-6">
                <div>
                  <Trophy className="h-16 w-16 text-olimpics-orange-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-olimpics-green-primary mb-2">
                    Participe do Evento
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Faça login ou cadastre-se para se inscrever neste evento
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white py-3"
                    size="lg"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Entrar / Cadastrar-se
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Voltar ao Início
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEventPage;

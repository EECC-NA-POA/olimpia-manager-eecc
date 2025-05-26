
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { EmptyState } from '@/components/dashboard/components/EmptyState';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { EventRegulation } from '@/lib/types/database';
import { useEventData } from '@/hooks/useEventData';
import '../styles/regulation-display.css';

const EventRegulations = () => {
  const { currentEventId } = useAuth();
  const { data: event } = useEventData(currentEventId);

  const { data: regulation, isLoading } = useQuery({
    queryKey: ['active-regulation', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return null;
      
      const { data, error } = await supabase
        .from('eventos_regulamentos')
        .select('*')
        .eq('evento_id', currentEventId)
        .eq('is_ativo', true)
        .order('criado_em', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching regulation:', error);
        return null;
      }

      return data as EventRegulation | null;
    },
    enabled: !!currentEventId,
  });

  // Check if the link is a PDF
  const isPDF = (url: string | null) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.pdf') || lowerUrl.includes('pdf');
  };

  // Open external link in a new tab
  const openExternalLink = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Regulamento</h1>
          <p className="text-muted-foreground">
            Regulamento oficial do evento {event?.nome || 'atual'}
          </p>
        </div>

        {regulation ? (
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">{regulation.titulo}</h2>
                  <div className="text-sm text-muted-foreground">Versão: {regulation.versao}</div>
                </div>

                {regulation.regulamento_link && (
                  <div className="flex justify-center mb-4">
                    <Button 
                      onClick={() => openExternalLink(regulation.regulamento_link)}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir em Nova Aba
                    </Button>
                  </div>
                )}

                {/* PDF Embed Section */}
                {regulation.regulamento_link && isPDF(regulation.regulamento_link) && (
                  <div className="w-full mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-medium mb-2">Visualização do Documento</h3>
                      <p className="text-sm text-muted-foreground">
                        O documento está sendo exibido abaixo. Caso não consiga visualizar, use o botão acima para abrir em nova aba.
                      </p>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={regulation.regulamento_link}
                        className="w-full h-[600px] border-0"
                        title="Regulamento do Evento"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {regulation.is_regulamento_texto !== false && regulation.regulamento_texto ? (
                  <div 
                    className="regulation-content mt-4 text-left"
                    dangerouslySetInnerHTML={{ __html: regulation.regulamento_texto }}
                  />
                ) : regulation.is_regulamento_texto === false && !regulation.regulamento_link ? (
                  <p className="text-center text-muted-foreground py-4">
                    O regulamento não está disponível para visualização no momento.
                  </p>
                ) : regulation.is_regulamento_texto === false && regulation.regulamento_link ? (
                  <p className="text-center text-muted-foreground py-4">
                    Utilize o botão acima para acessar o regulamento completo.
                  </p>
                ) : !regulation.regulamento_link ? (
                  <p className="text-center text-muted-foreground py-4">
                    Este regulamento não possui conteúdo disponível.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="Nenhum regulamento ativo"
            description="Não há regulamentos ativos para este evento."
          />
        )}
      </div>
    </div>
  );
};

export default EventRegulations;

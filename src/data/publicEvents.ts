
import { Event } from '@/lib/types/database';

export const publicEvents: Event[] = [
  {
    id: '1',
    nome: 'Olimpíadas Estaduais 2025',
    descricao: 'Competição esportiva estadual com diversas modalidades para todas as idades',
    data_inicio_inscricao: '2024-12-01T00:00:00Z',
    data_fim_inscricao: '2025-03-15T23:59:59Z',
    data_inicio_evento: '2025-04-01T00:00:00Z',
    data_fim_evento: '2025-04-07T23:59:59Z',
    pais: 'Brasil',
    estado: 'Rio Grande do Sul',
    cidade: 'Porto Alegre',
    foto_evento: '/lovable-uploads/evento-olimpiadas-estaduais-2025-banner.png',
    tipo: 'estadual',
    data_inicio: '2025-04-01T00:00:00Z',
    data_fim: '2025-04-07T23:59:59Z',
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-11-01T00:00:00Z',
    status_evento: 'ativo',
    visibilidade_publica: true,
    slug_pagina: 'olimpiadas-estaduais-2025'
  },
  {
    id: '2',
    nome: 'Campeonato Nacional de Natação',
    descricao: 'Competição nacional de natação com provas individuais e por equipes',
    data_inicio_inscricao: '2025-01-15T00:00:00Z',
    data_fim_inscricao: '2025-05-01T23:59:59Z',
    data_inicio_evento: '2025-06-01T00:00:00Z',
    data_fim_evento: '2025-06-05T23:59:59Z',
    pais: 'Brasil',
    estado: 'São Paulo',
    cidade: 'São Paulo',
    foto_evento: '/lovable-uploads/capa-evento-nacional.png',
    tipo: 'nacional',
    data_inicio: '2025-06-01T00:00:00Z',
    data_fim: '2025-06-05T23:59:59Z',
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-11-01T00:00:00Z',
    status_evento: 'ativo',
    visibilidade_publica: true,
    slug_pagina: 'campeonato-nacional-natacao-2025'
  }
];

// Função para filtrar eventos não expirados
export const getActivePublicEvents = (): Event[] => {
  const now = new Date();
  return publicEvents.filter(event => {
    // Evento é ativo se ainda não passou da data fim de inscrição
    const endDate = new Date(event.data_fim_inscricao);
    return endDate >= now && event.status_evento === 'ativo';
  });
};

// Função para buscar evento por slug
export const getEventBySlug = (slug: string): Event | null => {
  const event = publicEvents.find(event => event.slug_pagina === slug);
  
  // Verificar se o evento não está expirado
  if (event) {
    const now = new Date();
    const endDate = new Date(event.data_fim_inscricao);
    
    // Retornar null se o evento estiver expirado
    if (endDate < now || event.status_evento !== 'ativo') {
      return null;
    }
  }
  
  return event || null;
};

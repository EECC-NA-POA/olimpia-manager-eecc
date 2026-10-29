import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicEventPageView } from '@/components/public-event/PublicEventPageView';

// Página pública de divulgação do evento em /event/:slug (sem login).
// No subdomínio <slug>.nova-acropole.org.br a mesma view é renderizada direto pelo App.
const PublicEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  return <PublicEventPageView slug={(slug || '').toLowerCase()} isAuthenticated={!!user} />;
};

export default PublicEventPage;

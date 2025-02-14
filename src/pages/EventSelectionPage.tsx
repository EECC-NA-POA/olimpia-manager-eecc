
import React from 'react';
import { EventSelection } from '@/components/auth/EventSelection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileResponse {
  perfis: {
    id: number;
    perfil_tipo_id: string;
    perfis_tipo: {
      id: string;
      codigo: string;
    };
  };
}

export default function EventSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user's profile type to determine if they are a child
  const { data: userProfileType } = useQuery({
    queryKey: ['user-profile-type', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('Fetching profile type for user:', user.id);

      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis:perfil_id (
            id,
            perfil_tipo_id,
            perfis_tipo:perfil_tipo_id (
              id,
              codigo
            )
          )
        `)
        .eq('usuario_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile type:', error);
        throw error;
      }

      console.log('Received profile data:', data);

      if (!data?.perfis) {
        console.log('No profile found for user');
        return null;
      }

      // Ensure we're dealing with the correct data structure
      const typedData = {
        perfis: {
          id: data.perfis.id,
          perfil_tipo_id: data.perfis.perfil_tipo_id,
          perfis_tipo: {
            id: data.perfis.perfis_tipo.id,
            codigo: data.perfis.perfis_tipo.codigo
          }
        }
      } as UserProfileResponse;

      return typedData.perfis.perfis_tipo.codigo;
    },
    enabled: !!user?.id
  });

  const handleEventSelect = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    toast.success('Evento selecionado com sucesso!');
    navigate('/athlete-profile');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
        backgroundColor: 'rgba(0, 155, 64, 0.05)',
        backgroundBlendMode: 'overlay',
        boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
      }}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-olimpics-green-primary text-white py-2 px-4 rounded-lg inline-block mx-auto">
          Selecione um Evento
        </h1>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <EventSelection
            selectedEvents={[]}
            onEventSelect={handleEventSelect}
            mode="login"
            userProfileType={userProfileType}
          />
        </div>
      </div>
    </div>
  );
}

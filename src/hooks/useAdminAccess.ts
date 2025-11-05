
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useAdminAccess() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        navigate('/');
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive"
        });
        return;
      }

      if (!currentEventId) {
        toast({
          title: "Nenhum evento selecionado",
          description: "Selecione um evento para acessar esta página",
          variant: "destructive"
        });
        navigate('/event-selection');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking Admin access for user:', user.id, 'event:', currentEventId);
        
        // Check if user has admin role FOR THIS EVENT
        const { data: userRoles, error } = await supabase
          .from('papeis_usuarios')
          .select(`
            perfil_id,
            perfis!inner(
              perfil_tipo_id,
              perfis_tipo!inner(
                codigo
              )
            )
          `)
          .eq('usuario_id', user.id)
          .eq('evento_id', currentEventId);

        console.log('📊 Roles query result:', { userRoles, error });

        if (error) throw error;

        // Check if any of the user's roles has the type code "ADM"
        const hasAdminRole = userRoles?.some(role => {
          // Access the nested data properly
          const perfis = role.perfis as any;
          const perfisType = perfis?.perfis_tipo as any;
          const isAdmin = perfisType?.codigo === 'ADM';
          console.log('Checking role:', perfisType?.codigo, 'is ADM?', isAdmin);
          return isAdmin;
        });

        console.log('🎯 Has Admin role for this event?', hasAdminRole);

        if (!hasAdminRole) {
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a administradores neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('❌ Error checking admin role:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões de acesso",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user, currentEventId, navigate]);

  return { isAdmin, isLoading };
}

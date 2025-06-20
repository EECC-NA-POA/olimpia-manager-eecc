
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useAdminAccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

      try {
        // Check if user has admin role
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
          .eq('usuario_id', user.id);

        if (error) throw error;

        // Check if any of the user's roles has the type code "ADM"
        const hasAdminRole = userRoles?.some(
          role => role.perfis?.perfis_tipo?.codigo === 'ADM'
        );

        if (!hasAdminRole) {
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a administradores",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin role:', error);
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
  }, [user, navigate]);

  return { isAdmin, isLoading };
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useMasterAccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMaster, setIsMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMasterRole = async () => {
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
        // Check if user has master role via is_master flag or MST profile
        if (user.is_master) {
          setIsMaster(true);
          setIsLoading(false);
          return;
        }

        // Check if user has master role via profile
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

        // Check if any of the user's roles has the type code "MST"
        const hasMasterRole = userRoles?.some(role => {
          const perfis = role.perfis as any;
          const perfisType = perfis?.perfis_tipo as any;
          return perfisType?.codigo === 'MST';
        });

        if (!hasMasterRole) {
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a usuários Master",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsMaster(true);
      } catch (error) {
        console.error('Error checking master role:', error);
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

    checkMasterRole();
  }, [user, navigate]);

  return { isMaster, isLoading };
}

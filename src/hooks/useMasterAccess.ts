import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useMasterAccess() {
  const navigate = useNavigate();
  const { user, currentEventId } = useAuth();
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
        console.log('🔍 Checking Master access for user:', user.id, 'event:', currentEventId);
        
        // Check if user has master role via is_master flag or MST profile
        if (user.is_master) {
          console.log('✅ User has is_master flag');
          setIsMaster(true);
          setIsLoading(false);
          return;
        }

        // Check if user has master role via profile FOR THIS EVENT
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

        // Check if any of the user's roles has the type code "MST"
        const hasMasterRole = userRoles?.some(role => {
          const perfis = role.perfis as any;
          const perfisType = perfis?.perfis_tipo as any;
          const isMaster = perfisType?.codigo === 'MST';
          console.log('Checking role:', perfisType?.codigo, 'is MST?', isMaster);
          return isMaster;
        });

        console.log('🎯 Has Master role for this event?', hasMasterRole);

        if (!hasMasterRole) {
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a usuários Master neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsMaster(true);
      } catch (error) {
        console.error('❌ Error checking master role:', error);
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
  }, [user, currentEventId, navigate]);

  return { isMaster, isLoading };
}

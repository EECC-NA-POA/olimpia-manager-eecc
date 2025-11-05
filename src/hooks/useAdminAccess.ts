
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
        console.log('📋 User context:', { 
          papeis: user.papeis?.map(r => r.codigo) 
        });
        
        // Strategy 1: Check user.papeis (already event-filtered by AuthProvider)
        const hasAdmInPapeis = user.papeis?.some(r => r.codigo === 'ADM');
        if (hasAdmInPapeis) {
          console.log('✅ Access granted via user.papeis (ADM found)');
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        console.log('⚠️ ADM not found in user context, trying fallback query...');

        // Strategy 2: Fallback with explicit 2-step query
        // Step 2a: Get perfis_tipo ID for 'ADM'
        const { data: admType, error: admTypeError } = await supabase
          .from('perfis_tipo')
          .select('id')
          .eq('codigo', 'ADM')
          .maybeSingle();

        console.log('📊 Step 2a - perfis_tipo query:', { admType, admTypeError });

        if (admTypeError) throw admTypeError;

        if (!admType) {
          console.log('❌ ADM perfis_tipo not found in database');
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a administradores neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // Step 2b: Get perfis for this event with ADM type
        const { data: admPerfis, error: admPerfisError } = await supabase
          .from('perfis')
          .select('id')
          .eq('evento_id', currentEventId)
          .eq('perfil_tipo_id', admType.id);

        console.log('📊 Step 2b - perfis query:', { admPerfis, admPerfisError });

        if (admPerfisError) throw admPerfisError;

        if (!admPerfis || admPerfis.length === 0) {
          console.log('❌ No ADM perfis found for this event');
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a administradores neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // Step 2c: Check papeis_usuarios for user with these perfis
        const perfilIds = admPerfis.map(p => p.id);
        const { data: userRoles, error: userRolesError } = await supabase
          .from('papeis_usuarios')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('evento_id', currentEventId)
          .in('perfil_id', perfilIds);

        console.log('📊 Step 2c - papeis_usuarios query:', { userRoles, userRolesError });

        if (userRolesError) throw userRolesError;

        if (!userRoles || userRoles.length === 0) {
          console.log('❌ No ADM role assignment found for user in this event');
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a administradores neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        console.log('✅ Access granted via fallback query');
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

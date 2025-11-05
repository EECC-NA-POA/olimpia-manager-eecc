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
        console.log('📋 User context:', { 
          is_master: user.is_master, 
          papeis: user.papeis?.map(r => r.codigo) 
        });
        
        // Strategy 1: Check if user has is_master flag
        if (user.is_master) {
          console.log('✅ Access granted via is_master flag');
          setIsMaster(true);
          setIsLoading(false);
          return;
        }

        // Strategy 2: Check user.papeis (already event-filtered by AuthProvider)
        const hasMstInPapeis = user.papeis?.some(r => r.codigo === 'MST' || r.codigo === 'MSTR');
        if (hasMstInPapeis) {
          console.log('✅ Access granted via user.papeis (MST found)');
          setIsMaster(true);
          setIsLoading(false);
          return;
        }

        console.log('⚠️ MST not found in user context, trying fallback query...');

        // Strategy 3: Fallback with explicit 2-step query
        // Step 3a: Get perfis_tipo ID for 'MST' or 'MSTR'
        const { data: mstTypes, error: mstTypeError } = await supabase
          .from('perfis_tipo')
          .select('id,codigo')
          .in('codigo', ['MST','MSTR']);

        console.log('📊 Step 3a - perfis_tipo query:', { mstTypes, mstTypeError });

        if (mstTypeError) throw mstTypeError;

        const mstTypeId = Array.isArray(mstTypes) && mstTypes.length > 0 ? mstTypes[0].id : null;

        if (!mstTypeId) {
          console.log('❌ MST perfis_tipo not found in database');
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a usuários Master neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // Step 3b: Get perfis for this event with MST type
        const { data: mstPerfis, error: mstPerfisError } = await supabase
          .from('perfis')
          .select('id')
          .eq('evento_id', currentEventId)
          .eq('perfil_tipo_id', mstTypeId);

        console.log('📊 Step 3b - perfis query:', { mstPerfis, mstPerfisError });

        if (mstPerfisError) throw mstPerfisError;

        if (!mstPerfis || mstPerfis.length === 0) {
          console.log('❌ No MST perfis found for this event');
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a usuários Master neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // Step 3c: Check papeis_usuarios for user with these perfis
        const perfilIds = mstPerfis.map(p => p.id);
        const { data: userRoles, error: userRolesError } = await supabase
          .from('papeis_usuarios')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('evento_id', currentEventId)
          .in('perfil_id', perfilIds);

        console.log('📊 Step 3c - papeis_usuarios query:', { userRoles, userRolesError });

        if (userRolesError) throw userRolesError;

        if (!userRoles || userRoles.length === 0) {
          console.log('❌ No MST role assignment found for user in this event');
          toast({
            title: "Acesso restrito",
            description: "Acesso restrito a usuários Master neste evento",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        console.log('✅ Access granted via fallback query');
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

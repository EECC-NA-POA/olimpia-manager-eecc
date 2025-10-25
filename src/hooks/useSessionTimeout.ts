
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  checkIntervalMinutes?: number;
}

export const useSessionTimeout = ({ 
  timeoutMinutes = 30, 
  checkIntervalMinutes = 1 
}: UseSessionTimeoutProps = {}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastCheckRef = useRef(Date.now());

  // Atualiza última atividade
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Verifica se a sessão está válida
  const checkSessionValidity = async () => {
    if (!user) return true;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('⚠️ Sessão inválida detectada:', error?.message || 'no session');
        return false;
      }

      // Verifica se o token está próximo do vencimento
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Se faltam menos de 5 minutos para expirar
        if (timeUntilExpiry < 300) {
          console.log('⚠️ Token próximo do vencimento:', timeUntilExpiry, 'segundos');
          return false;
        }
        
        // Log a cada 5 minutos
        if (Date.now() - lastCheckRef.current > 5 * 60 * 1000) {
          console.log('✅ Sessão válida - expira em:', Math.floor(timeUntilExpiry / 60), 'minutos');
          lastCheckRef.current = Date.now();
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar validade da sessão:', error);
      return false;
    }
  };

  // Manipula expiração da sessão
  const handleSessionExpiry = async () => {
    console.log('🔒 Iniciando processo de logout por expiração de sessão');
    try {
      // Clear all query cache before signing out
      console.log('🗑️ Clearing all query cache due to session expiry');
      queryClient.clear();
      
      await signOut();
      toast.error(
        'Sua sessão expirou. Por favor, faça login novamente.',
        { duration: 5000 }
      );
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Forçar navegação mesmo se o logout falhar
      localStorage.removeItem('olimpics_auth_token');
      localStorage.removeItem('currentEventId');
      queryClient.clear();
      navigate('/login', { replace: true });
      // Recarregar a página para limpar todo o estado
      setTimeout(() => window.location.reload(), 100);
    }
  };

  useEffect(() => {
    if (!user) {
      console.log('⏭️ useSessionTimeout: sem usuário, pulando configuração');
      return;
    }

    console.log('🔒 useSessionTimeout: configurando monitoramento para usuário:', user.id);

    // Eventos que indicam atividade do usuário
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Verifica periodicamente se a sessão ainda é válida
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      // Se passou muito tempo sem atividade OU a sessão está inválida
      const isInactive = timeSinceLastActivity > timeoutMs;
      const isSessionValid = await checkSessionValidity();

      if (isInactive) {
        console.log('⚠️ Sessão expirada por inatividade:', Math.floor(timeSinceLastActivity / 60000), 'minutos');
        handleSessionExpiry();
      } else if (!isSessionValid) {
        console.log('⚠️ Sessão inválida ou token expirado');
        handleSessionExpiry();
      }
    }, checkIntervalMinutes * 60 * 1000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, timeoutMinutes, checkIntervalMinutes]);

  return { updateActivity };
};

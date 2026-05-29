
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  checkIntervalMinutes?: number;
  enabled?: boolean;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  checkIntervalMinutes = 1,
  enabled = true
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

      // Log periódico da sessão (sem forçar logout prematuro)
      const expiresAt = session.expires_at;
      if (expiresAt && Date.now() - lastCheckRef.current > 5 * 60 * 1000) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        console.log('✅ Sessão válida - expira em:', Math.floor(timeUntilExpiry / 60), 'minutos');
        lastCheckRef.current = Date.now();
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar validade da sessão:', error);
      return false;
    }
  };

  // Manipula expiração da sessão
  const handleSessionExpiry = async () => {
    console.log('🔒 Sessão expirada, fazendo logout...');
    try {
      console.log('🗑️ Limpando cache de queries');
      queryClient.clear();

      await signOut();
      toast.error(
        'Sua sessão expirou. Por favor, faça login novamente.',
        { duration: 5000 }
      );
      // AuthProvider vai gerenciar a navegação após o logout
    } catch (error) {
      console.error('❌ Erro crítico ao fazer logout:', error);
      localStorage.removeItem('olimpics_auth_token');
      localStorage.removeItem('currentEventId');
      queryClient.clear();
      // Força reload apenas em caso de erro crítico
      setTimeout(() => window.location.reload(), 100);
    }
  };

  useEffect(() => {
    if (!enabled) {
      console.log('⏭️ useSessionTimeout: disabled (native mobile)');
      return;
    }
    if (!user) {
      console.log('⏭️ useSessionTimeout: sem usuário, pulando configuração');
      return;
    }

    console.log('🔒 useSessionTimeout: configurando monitoramento para usuário:', user.id);

    // Eventos que indicam atividade do usuário (incluindo eventos de formulário)
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'keydown',
      'scroll', 'touchstart', 'click', 'focus',
      'input', 'change'
    ];

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { capture: true });
    });

    // Verifica periodicamente se a sessão ainda é válida
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      // Se passou muito tempo sem atividade OU a sessão está inválida
      const isInactive = timeSinceLastActivity > timeoutMs;
      const isSessionValid = await checkSessionValidity();

      // Log detalhado para diagnóstico
      console.log('⏰ Verificação de sessão:', {
        minutosInativos: Math.floor(timeSinceLastActivity / 60000),
        limiteMinutos: timeoutMinutes,
        sessaoValida: isSessionValid
      });

      if (isInactive) {
        console.log('⚠️ Sessão expirada por inatividade:', Math.floor(timeSinceLastActivity / 60000), 'minutos');
        handleSessionExpiry();
      } else if (!isSessionValid) {
        console.log('⚠️ Sessão inválida detectada');
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
  }, [user, timeoutMinutes, checkIntervalMinutes, enabled]);

  return { updateActivity };
};


import { useEffect, useRef } from 'react';
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
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();

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
        console.log('Sessão inválida detectada:', error);
        return false;
      }

      // Verifica se o token está próximo do vencimento
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Se faltam menos de 5 minutos para expirar
        if (timeUntilExpiry < 300) {
          console.log('Token próximo do vencimento');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar validade da sessão:', error);
      return false;
    }
  };

  // Manipula expiração da sessão
  const handleSessionExpiry = async () => {
    try {
      await signOut();
      toast.error(
        'Sua sessão expirou por inatividade. Por favor, faça login novamente.',
        { duration: 5000 }
      );
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar navegação mesmo se o logout falhar
      localStorage.removeItem('olimpics_auth_token');
      localStorage.removeItem('currentEventId');
      navigate('/login');
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!user) return;

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

      if (isInactive || !isSessionValid) {
        console.log('Sessão expirada - Inatividade:', isInactive, 'Sessão inválida:', !isSessionValid);
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

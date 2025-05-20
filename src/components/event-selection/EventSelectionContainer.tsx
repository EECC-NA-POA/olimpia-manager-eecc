
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { usePrivacyPolicyCheck } from '@/hooks/usePrivacyPolicyCheck';
import { PrivacyPolicyAcceptanceModal } from '@/components/auth/PrivacyPolicyAcceptanceModal';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { EventSelectionHeader } from './EventSelectionHeader';
import { EventSelectionContent } from './EventSelectionContent';
import { toast } from "sonner";

export function EventSelectionContainer() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Check if the user needs to accept the privacy policy
  const { 
    needsAcceptance, 
    isLoading: isPolicyCheckLoading,
    checkCompleted,
    refetchCheck 
  } = usePrivacyPolicyCheck();

  // Tempo máximo de carregamento para a verificação da política
  useEffect(() => {
    // Se o carregamento estiver demorando muito, forçamos a conclusão
    const loadingTimer = setTimeout(() => {
      if (!checkCompleted) {
        console.log('Privacy policy check taking too long, forcing completion');
      }
    }, 3000);
    
    return () => clearTimeout(loadingTimer);
  }, [checkCompleted]);

  const handleLogout = async () => {
    try {
      console.log('Handling logout from EventSelectionPage');
      localStorage.removeItem('currentEventId');
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Erro ao fazer logout");
    }
  };

  const handlePrivacyPolicyAccept = async () => {
    await refetchCheck();
  };

  // If there's no user, redirect to landing page
  if (!user) {
    return null;
  }

  // Mostrar um estado de carregamento breve durante a verificação da política
  // Limitamos a apenas 1.5 segundos para não confundir o usuário
  if (isPolicyCheckLoading && !checkCompleted) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
          backgroundColor: 'rgba(0, 155, 64, 0.05)',
          backgroundBlendMode: 'overlay',
          boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
        }}
      >
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-olimpics-green-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-olimpics-green-primary font-medium">Verificando termos de privacidade...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show the privacy policy acceptance modal if needed
  if (needsAcceptance) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
          backgroundColor: 'rgba(0, 155, 64, 0.05)',
          backgroundBlendMode: 'overlay',
          boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
        }}
      >
        <PrivacyPolicyAcceptanceModal
          onAccept={handlePrivacyPolicyAccept}
          onCancel={handleLogout}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-20 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
        backgroundColor: 'rgba(0, 155, 64, 0.05)',
        backgroundBlendMode: 'overlay',
        boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
      }}
    >
      <div className="container mx-auto py-8">
        <EventSelectionHeader onLogout={handleLogout} />
        <EventSelectionContent />
      </div>
    </div>
  );
}

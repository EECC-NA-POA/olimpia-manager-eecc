
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomePolicyBranchModal } from '@/components/auth/WelcomePolicyBranchModal';
import { LoadingImage } from '@/components/ui/loading-image';
import { EventSelectionHeader } from './EventSelectionHeader';
import { EventSelectionContent } from './EventSelectionContent';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export function EventSelectionContainer() {
  const navigate = useNavigate();
  const { user, signOut, setCurrentEventId } = useAuth();
  const [needsBranchSelection, setNeedsBranchSelection] = useState(false);
  const [existingState, setExistingState] = useState<string | undefined>(undefined);
  const [existingBranchName, setExistingBranchName] = useState<string | undefined>(undefined);

  // Check if user has a branch associated and get state if they do
  useEffect(() => {
    const checkUserBranchAndState = async () => {
      if (!user?.id) return;
      
      try {
        // Join with filiais table to get the state and branch name
        const { data, error } = await supabase
          .from('usuarios')
          .select('filial_id, filiais:filial_id(estado, nome)')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking user branch:', error);
          return;
        }
        
        const needsSelection = !data.filial_id;
        setNeedsBranchSelection(needsSelection);
        
        // Access the estado and nome properties from the filiais object
        if (!needsSelection && data.filiais) {
          const filiais = data.filiais as any;
          setExistingState(filiais.estado);
          setExistingBranchName(filiais.nome);
          console.log('User branch data:', filiais);
        }
      } catch (err) {
        console.error('Error in checkUserBranch:', err);
      }
    };
    
    if (user?.id) {
      checkUserBranchAndState();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log('EventSelectionContainer - Handling logout...');
      
      // Clear event data
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      
      // Sign out
      await signOut();
      
      console.log('EventSelectionContainer - Logout successful');
      toast.success('Logout realizado com sucesso!');
      
      // Navigate to home
      navigate('/', { replace: true });
    } catch (error) {
      console.error('EventSelectionContainer - Error during logout:', error);
      toast.error("Erro ao fazer logout");
    }
  };

  const handlePreferencesComplete = async () => {
    // Reload to get updated user info
    window.location.reload();
  };

  // If there's no user, redirect to landing page
  if (!user) {
    return null;
  }

  // Show the welcome modal if needed
  const showWelcomeModal = needsBranchSelection;
  if (showWelcomeModal) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat pt-16"
        style={{ 
          backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
          backgroundColor: 'rgba(0, 155, 64, 0.05)',
          backgroundBlendMode: 'overlay',
          boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
        }}
      >
        <WelcomePolicyBranchModal
          isOpen={true}
          onClose={handleLogout}
          needsLocationSelection={needsBranchSelection}
          existingBranchId={user?.filial_id}
          existingState={existingState}
          existingBranchName={existingBranchName}
          onComplete={handlePreferencesComplete}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen event-selection-container bg-cover bg-center bg-no-repeat px-4 sm:px-0 pt-16"
      style={{ 
        backgroundImage: 'url(/lovable-uploads/7f5d4c54-bc15-4310-ac7a-ecd055bda99b.png)',
        backgroundColor: 'rgba(0, 155, 64, 0.05)',
        backgroundBlendMode: 'overlay',
        boxShadow: 'inset 0 0 0 2000px rgba(0, 155, 64, 0.05)'
      }}
    >
      <div className="container mx-auto py-6 sm:py-8">
        <EventSelectionHeader onLogout={handleLogout} />
        <EventSelectionContent />
      </div>
    </div>
  );
}

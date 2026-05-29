
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomePolicyBranchModal } from '@/components/auth/WelcomePolicyBranchModal';
import { LoadingImage } from '@/components/ui/loading-image';
import { EventSelectionContent } from './EventSelectionContent';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';

export function EventSelectionContainer() {
  const navigate = useNavigate();
  const { user, signOut, setCurrentEventId } = useAuth();
  const [needsBranchSelection, setNeedsBranchSelection] = useState(false);
  const [existingState, setExistingState] = useState<string | undefined>(undefined);
  const [existingBranchName, setExistingBranchName] = useState<string | undefined>(undefined);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const { canCreateEvents } = useCanCreateEvents();

  useEffect(() => {
    const checkUserBranchAndState = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('filial_id, filiais:filial_id(estado, nome)')
          .eq('id', user.id)
          .single();
        if (error) return;
        const needsSelection = !data.filial_id;
        setNeedsBranchSelection(needsSelection);
        if (!needsSelection && data.filiais) {
          const filiais = data.filiais as any;
          setExistingState(filiais.estado);
          setExistingBranchName(filiais.nome);
        }
      } catch {}
    };
    if (user?.id) checkUserBranchAndState();
  }, [user]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch {
      toast.error("Erro ao fazer logout");
    }
  };

  const handlePreferencesComplete = async () => {
    window.location.reload();
  };

  if (!user) return null;

  if (needsBranchSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center p-4">
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

  const firstName = (user as any).nome_completo?.split(' ')[0] || user.email?.split('@')[0] || 'Atleta';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800">
      {/* Top nav bar */}
      <header className="sticky top-0 z-20 bg-emerald-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
              alt="EECC"
              className="h-7 w-auto object-contain"
            />
            <span className="text-white font-semibold text-sm hidden sm:block">Olímpia Manager</span>
          </div>
          {canCreateEvents && (
            <Button
              size="sm"
              onClick={() => setCreateEventOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-1.5 text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Evento
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4 border border-white/20">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Olá, {firstName}!
        </h1>
        <p className="text-emerald-200 text-sm sm:text-base max-w-sm mx-auto">
          Escolha o evento que deseja acessar ou inscreva-se em um novo.
        </p>
      </div>

      {/* Card container */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8">
          <EventSelectionContent />
        </div>
      </div>

      {createEventOpen && (
        <CreateEventDialog
          open={createEventOpen}
          onOpenChange={setCreateEventOpen}
          onEventCreated={() => toast.success("Evento criado com sucesso!")}
        />
      )}
    </div>
  );
}


import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AthleteProfile from './AthleteProfile';
import { Loader2 } from "lucide-react";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";
import { useUserRoleCheck } from "@/hooks/useUserRoleCheck";

export default function AthleteProfilePage() {
  const { user, currentEventId } = useAuth();
  
  const { data: eventData } = useEventData(currentEventId);
  const { data: profile, isLoading: profileLoading } = useAthleteProfileData(user?.id, currentEventId);
  const { data: roleCheck } = useUserRoleCheck(user?.id, currentEventId);

  // SEO: title, description, canonical
  useEffect(() => {
    document.title = 'Perfil do Usuário | EECC';

    const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement) || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.content = 'Perfil do usuário: dados pessoais, acesso e pagamentos.';

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  if (profileLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <div className="text-center text-olimpics-text">
          Perfil não encontrado. Por favor, entre em contato com o suporte.
        </div>
      </div>
    );
  }

  // Verificar se é atleta pelo código do papel ou nome
  const isAthleteProfile = profile.papeis?.some(role => 
    role.codigo === 'ATL' || role.nome === 'Atleta'
  ) || false;

  console.log('=== ATHLETE PROFILE PAGE DEBUG ===');
  console.log('Profile data:', profile);
  console.log('User roles (papeis):', profile.papeis);
  console.log('Roles count:', profile.papeis?.length || 0);
  console.log('Is athlete profile:', isAthleteProfile);
  console.log('Current event ID:', currentEventId);
  console.log('User ID:', user?.id);
  console.log('Role check data:', roleCheck);
  console.log('Individual role checks:');
  profile.papeis?.forEach((role, index) => {
    console.log(`  Role ${index + 1}:`, {
      nome: role.nome,
      codigo: role.codigo,
      isATL: role.codigo === 'ATL',
      isAthlete: role.nome === 'Atleta'
    });
  });
  console.log('==================================');

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <section aria-labelledby="perfil-section">
        <h2 id="perfil-section" className="sr-only">Detalhes do Perfil</h2>
        <AthleteProfile 
          profile={profile}
          isPublicUser={!isAthleteProfile}
          eventData={eventData}
        />
      </section>
    </main>
  );
}

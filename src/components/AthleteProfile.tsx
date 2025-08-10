
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileImage from './athlete/ProfileImage';
import PersonalInfo from './athlete/PersonalInfo';
import PaymentAndBranchInfo from './athlete/PaymentAndBranchInfo';
import AccessProfile from './athlete/AccessProfile';
import RegistrationFees from './athlete/RegistrationFees';
import { useRegistrationFees } from './athlete/registration-fees/useRegistrationFees';
import { DependentsTable } from './athlete/DependentsTable';

interface AthleteProfileProps {
  profile: {
    id: string;
    nome_completo: string;
    telefone: string;
    email: string;
    numero_identificador?: string;
    tipo_documento: string;
    numero_documento: string;
    genero: string;
    filial_nome: string;
    filial_cidade: string;
    filial_estado: string;
    pagamento_status?: string;
    pagamento_valor?: number;
    papeis?: { nome: string; codigo: string; id?: number; }[];
    data_nascimento?: string | null;
  };
  isPublicUser: boolean;
}

export default function AthleteProfile({ profile, isPublicUser }: AthleteProfileProps) {
  const navigate = useNavigate();
  const currentEventId = localStorage.getItem('currentEventId');
  const { data: registrationFees } = useRegistrationFees(currentEventId);
  const userProfileId = profile.papeis?.[0]?.id;
  const hasUserFee = React.useMemo(() => {
    if (!registrationFees) return false;
    const visible = registrationFees.filter(f => f.mostra_card);
    return visible.some((f: any) => {
      const perfil = f.perfil;
      const perfilId = perfil?.id;
      const perfilNome = perfil?.nome;
      return (userProfileId ? perfilId === userProfileId : false) || perfilNome === 'Público Geral';
    });
  }, [registrationFees, userProfileId]);

  if (!profile) {
    return null;
  }

  const handlePasswordChange = () => {
    console.log('Navigating to reset password from profile');
    navigate('/reset-password', { 
      state: { 
        fromProfile: true 
      },
      replace: false
    });
  };

  console.log('AthleteProfile - profile:', profile);
  console.log('AthleteProfile - isPublicUser:', isPublicUser);

  return (
    <div className="space-y-6">
      {!isPublicUser && (
        <Alert className="bg-olimpics-orange-primary/10 border-olimpics-orange-primary text-olimpics-text">
          <Info className="h-5 w-5 text-olimpics-orange-primary" />
          <AlertDescription className="text-sm font-medium">
            As inscrições nas modalidades devem ser feitas no menu 'Minhas Inscrições'.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div>
              <ProfileImage 
                gender={profile.genero}
                identificador={profile.numero_identificador}
                isPublicUser={isPublicUser}
              />
            </div>

            <div>
              <PersonalInfo 
                nome_completo={profile.nome_completo}
                tipo_documento={profile.tipo_documento}
                numero_documento={profile.numero_documento}
                telefone={profile.telefone}
                email={profile.email}
                data_nascimento={profile.data_nascimento}
              />
            </div>

            <div>
              <PaymentAndBranchInfo 
                pagamento_status={profile.pagamento_status}
                pagamento_valor={profile.pagamento_valor}
                filial_nome={profile.filial_nome}
                filial_cidade={profile.filial_cidade}
                filial_estado={profile.filial_estado}
              />
            </div>

            <div>
              <AccessProfile 
                papeis={profile.papeis}
                onPasswordChange={handlePasswordChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {currentEventId && !isPublicUser && (
        <DependentsTable userId={profile.id} eventId={currentEventId} />
      )}

      {hasUserFee && (
        <div className="mt-6">
          <RegistrationFees 
            eventId={currentEventId}
            userProfileId={userProfileId}
          />
        </div>
      )}
    </div>
  );
}

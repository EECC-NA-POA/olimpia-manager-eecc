
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileImage from './athlete/ProfileImage';
import PersonalInfo from './athlete/PersonalInfo';
import PaymentAndBranchInfo from './athlete/PaymentAndBranchInfo';
import AccessProfile from './athlete/AccessProfile';
import RegistrationFees from './athlete/RegistrationFees';
import { useRegistrationFees } from './athlete/registration-fees/useRegistrationFees';
import { DependentsTable } from './athlete/DependentsTable';
import { RegistrationCallToAction } from './athlete/RegistrationCallToAction';

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
  eventData?: {
    id: string;
    nome: string;
    status_evento: string;
  } | null;
}

export default function AthleteProfile({ profile, isPublicUser, eventData }: AthleteProfileProps) {
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

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'default';
      case 'encerrado':
      case 'suspenso':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {eventData && (
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-olimpics-green-primary">
            {eventData.nome}
          </h2>
          <Badge variant={getStatusBadgeVariant(eventData.status_evento)} className="text-xs">
            {eventData.status_evento}
          </Badge>
        </div>
      )}

      <Card className="border border-olimpics-green-primary/10 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-olimpics-text">Seu Perfil</CardTitle>
          <CardDescription>Informações pessoais, pagamento e acesso</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
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
                userId={profile.id}
                telefone={profile.telefone}
                dataNascimento={profile.data_nascimento}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {currentEventId && !isPublicUser && (
        <DependentsTable userId={profile.id} eventId={currentEventId} />
      )}

      {!profile.papeis?.some(papel => papel.codigo === 'PGR') && <RegistrationCallToAction />}

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

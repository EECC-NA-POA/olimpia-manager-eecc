
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PersonalInfo from './athlete/PersonalInfo';
import PaymentAndBranchInfo from './athlete/PaymentAndBranchInfo';
import AccessProfile from './athlete/AccessProfile';
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
  eventData?: {
    id: string;
    nome: string;
    status_evento: string;
  } | null;
}

export default function AthleteProfile({ profile, isPublicUser, eventData }: AthleteProfileProps) {
  const navigate = useNavigate();
  const currentEventId = localStorage.getItem('currentEventId');

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
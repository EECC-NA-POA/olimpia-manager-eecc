
export interface ProfileType {
  id: string;
  codigo: string;
  descricao: string | null;
}

export interface Profile {
  id: number;
  nome: string;
  descricao: string | null;
  evento_id: string;
  perfil_tipo_id: string;
  perfis_tipo: ProfileType;
  taxas_inscricao?: RegistrationFee[];
}

export interface RegistrationFee {
  id: number;
  perfil_id: number;
  valor: number;
  isento: boolean;
  mostra_card: boolean;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  link_formulario: string | null;
}

export interface EventProfilesSectionProps {
  eventId: string | null;
}

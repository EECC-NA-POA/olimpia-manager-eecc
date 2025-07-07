
export interface UserProfileData {
  id: string;
  nome_completo: string;
  email: string;
  numero_documento: string;
  tipo_documento: string;
  filial_id: string;
  created_at: string;
  filial_nome: string;
  profiles: {
    perfil_id: number;
    perfil_nome: string;
  }[];
  pagamentos: {
    status: string;
    valor: number;
    created_at: string;
  }[];
  status_pagamento: string;
}

export interface UserRole {
  usuario_id: string;
  perfil_id: number;
  perfis: {
    nome: string;
  } | null;
}

export interface UserPayment {
  atleta_id: string;
  status: string;
  valor: number;
  data_criacao: string;
}

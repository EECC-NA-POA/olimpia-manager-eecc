
export interface AthleteProfileData {
  atleta_id: string;
  id: string;
  nome_completo: string;
  telefone: string;
  email: string;
  numero_identificador: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  filial_nome: string;
  filial_cidade: string;
  filial_estado: string;
  status_confirmacao: boolean;
  foto_perfil?: string;
  papeis?: { 
    id: number;
    nome: string; 
    codigo: string; 
  }[];
  pagamento_status?: string;
  pagamento_valor?: number;
}

export interface Event {
  id: string;
  nome: string;
  status_evento: 'ativo' | 'encerrado' | 'suspenso' | 'em_teste';
}

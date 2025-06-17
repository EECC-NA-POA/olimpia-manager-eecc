
export interface AthleteModality {
  id: string;
  modalidade: string;
  status: string;
  justificativa_status: string;
}

export interface AthleteManagement {
  id: string;
  nome_atleta: string;
  email: string;
  telefone: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  numero_identificador?: string;
  status_confirmacao: boolean;
  filial_id: string;
  filial_nome: string;
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  usuario_registrador_id?: string;
  registrador_nome?: string;
  registrador_email?: string;
  modalidades: AthleteModality[];
  evento_id: string;
}

export interface Event {
  id: string;
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  local?: string;
  status?: string;
}

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export interface ModalidadePopular {
  modalidade: string;
  total_inscritos: number;
  status_pagamento?: string;
  filial?: string;
}

export interface StatusPagamento {
  status_pagamento: string;
  quantidade: number;
}

export interface StatusInscricao {
  status_pagamento: string;
  quantidade: number;
}

export interface RankingFilial {
  total_pontos: number;
}

export interface CategoriaQuantidade {
  categoria: string;
  quantidade: number;
}

export interface PontuacaoModalidade {
  modalidade: string;
  media_pontuacao: number;
}

export interface RegistroFilial {
  filial_nome: string;
  status_pagamento: string;
  quantidade: number;
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  evento_id: string;
  total_inscritos_geral: number;
  total_inscritos_modalidades: number;
  valor_total_pago: number;
  valor_total_pendente: number;
  total_isentos?: number;
  modalidades_populares: ModalidadePopular[];
  total_inscritos_por_status: StatusPagamento[];
  inscritos_por_status_pagamento: StatusInscricao[];
  ranking_filiais: RankingFilial[];
  registros_por_filial: RegistroFilial[];
  atletas_por_categoria: CategoriaQuantidade[];
  media_pontuacao_por_modalidade: PontuacaoModalidade[];
}

export interface BranchRegistrationData {
  name: string;
  confirmados: number;
  pendentes: number;
  total: number;
}

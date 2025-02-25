
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

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface ModalidadePopular {
  modalidade: string;
  total_inscritos: number;
}

interface StatusPagamento {
  status_pagamento: string;
  quantidade: number;
}

interface StatusInscricao {
  status_inscricao: string;
  quantidade: number;
}

interface RankingFilial {
  total_pontos: number;
}

interface CategoriaQuantidade {
  categoria: string;
  quantidade: number;
}

interface PontuacaoModalidade {
  modalidade: string;
  media_pontuacao: number;
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  total_inscritos_geral: number;
  total_inscritos_modalidades: number;
  valor_total_pago: number;
  modalidades_populares: ModalidadePopular[];
  total_inscritos_por_status: StatusPagamento[];
  inscritos_por_status_pagamento: StatusInscricao[];
  ranking_filiais: RankingFilial[];
  atletas_por_categoria: CategoriaQuantidade[];
  media_pontuacao_por_modalidade: PontuacaoModalidade[];
  valor_total_pendente: number;
}


export interface Modality {
  id: string;
  evento_id: string;
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
  status: 'Ativa' | 'Em análise' | 'Esgotada' | 'Cancelada';
  limite_vagas: number;
  vagas_ocupadas: number;
  grupo: string | null;
  faixa_etaria: 'adulto' | 'infantil';
}

export interface ModalityForm {
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
  status: 'Ativa' | 'Em análise' | 'Esgotada' | 'Cancelada';
  limite_vagas: number;
  grupo: string | null;
  faixa_etaria: 'adulto' | 'infantil';
}

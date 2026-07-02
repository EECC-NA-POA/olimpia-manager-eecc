// Registro central da documentação do sistema exibida na aba "Documentações"
// (Administração). Para adicionar um novo documento:
//   1. Crie o arquivo .md em docs/
//   2. Importe-o aqui com o sufixo ?raw e adicione uma entrada em DOCS
// O conteúdo é embutido no build (import ?raw do Vite) — sem fetch em runtime.

import papeisPermissoes from '../../../docs/PAPEIS_E_PERMISSOES.md?raw';
import modeloPagamento from '../../../docs/MODELO_DE_PAGAMENTO.md?raw';

export type DocCategory = 'Referência' | 'Atualização' | 'Melhoria' | 'Correção';

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  category: DocCategory;
  updatedAt: string; // 'YYYY-MM-DD'
  content: string;
}

export const DOCS: DocEntry[] = [
  {
    slug: 'modelo-de-pagamento',
    title: 'Modelo de Pagamento',
    description: 'Taxa por perfil, ciclo de vida do valor, isenção e como o Total Pago é calculado.',
    category: 'Referência',
    updatedAt: '2026-07-02',
    content: modeloPagamento,
  },
  {
    slug: 'papeis-e-permissoes',
    title: 'Papéis e Permissões',
    description: 'Papéis de usuário (ADM/ORG/RDD/…) e a permissão de isenção.',
    category: 'Referência',
    updatedAt: '2026-07-02',
    content: papeisPermissoes,
  },
];

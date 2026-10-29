// Registro central da documentação do sistema exibida na aba "Documentações"
// (Administração). Para adicionar um novo documento:
//   1. Crie o arquivo .md em docs/
//   2. Importe-o aqui com o sufixo ?raw e adicione uma entrada em DOCS
// O conteúdo é embutido no build (import ?raw do Vite) — sem fetch em runtime.

import papeisPermissoes from '../../../docs/PAPEIS_E_PERMISSOES.md?raw';
import modeloPagamento from '../../../docs/MODELO_DE_PAGAMENTO.md?raw';
import guiaDeTestes from '../../../docs/GUIA_DE_TESTES.md?raw';
import paginaPublicaEvento from '../../../docs/PAGINA_PUBLICA_EVENTO.md?raw';

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
    slug: 'pagina-publica-evento',
    title: 'Página Pública de Divulgação',
    description: 'Página aberta do evento com oficinas, horários, filósofos monitores e inscrição: como ligar e endereços.',
    category: 'Melhoria',
    updatedAt: '2026-10-28',
    content: paginaPublicaEvento,
  },
  {
    slug: 'guia-de-testes',
    title: 'Guia de Teste de Fluxo',
    description: 'Roteiro da reunião de validação: papéis, setup, rodadas de teste e como registrar bugs.',
    category: 'Referência',
    updatedAt: '2026-07-02',
    content: guiaDeTestes,
  },
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

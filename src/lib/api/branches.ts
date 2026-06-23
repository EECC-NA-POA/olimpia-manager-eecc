
import { publicFetch } from './publicFetch';
import { supabase } from '../supabase';
import type { Branch, BranchAnalytics } from '../../types/api';

// Para usuários autenticados — usa o cliente Supabase com sessão ativa
export const fetchBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase
    .from('filiais')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Agrupa filiais por estado — para usuários autenticados (dashboards, etc.)
export const fetchBranchesByState = async (): Promise<{ estado: string; branches: Branch[] }[]> => {
  const { data, error } = await supabase
    .from('filiais')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const uniqueStates = [...new Set(data.map(b => b.estado))]
    .filter((s): s is string => Boolean(s))
    .sort();

  return uniqueStates.map(estado => ({
    estado,
    branches: data.filter(b => b.estado === estado),
  }));
};

// Para contextos públicos (cadastro, landing page) — sem sessão, sem JWT
export const fetchBranchesPublic = (): Promise<Branch[]> =>
  publicFetch<Branch>('filiais', { select: '*', order: 'nome.asc' });

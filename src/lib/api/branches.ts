
import { supabase } from '../supabase';
import type { Branch, BranchAnalytics } from '../../types/api';

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  const { data, error } = await supabase
    .from('filiais')
    .select('*');

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }

  return data || [];
};

export const fetchBranchesByState = async (): Promise<{ estado: string; branches: Branch[] }[]> => {
  console.log('Fetching branches grouped by state...');
  const { data, error } = await supabase
    .from('filiais')
    .select('*')
    .order('estado', { ascending: true })
    .order('nome', { ascending: true });

  if (error) {
    console.error('Error fetching branches by state:', error);
    throw error;
  }

  // Group branches by state
  const groupedBranches = (data || []).reduce((acc: { [key: string]: Branch[] }, branch) => {
    if (!acc[branch.estado]) {
      acc[branch.estado] = [];
    }
    acc[branch.estado].push(branch);
    return acc;
  }, {});

  // Convert to array format for easier consumption
  return Object.entries(groupedBranches).map(([estado, branches]) => ({
    estado,
    branches
  }));
};

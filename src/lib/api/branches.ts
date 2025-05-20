
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
  
  try {
    // First, get all unique states
    const { data: statesData, error: statesError } = await supabase
      .from('filiais')
      .select('estado')
      .order('estado', { ascending: true });
    
    if (statesError) throw statesError;
    
    // Get unique states
    const uniqueStates = Array.from(new Set(statesData.map(item => item.estado)));
    
    // For each state, get all branches
    const result = await Promise.all(uniqueStates.map(async (estado) => {
      const { data: branchesData, error: branchesError } = await supabase
        .from('filiais')
        .select('*')
        .eq('estado', estado)
        .order('nome', { ascending: true });
      
      if (branchesError) throw branchesError;
      
      return {
        estado,
        branches: branchesData || []
      };
    }));
    
    return result;
  } catch (error) {
    console.error('Error fetching branches by state:', error);
    throw error;
  }
};

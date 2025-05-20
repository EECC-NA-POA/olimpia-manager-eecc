
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
    // First, get all branches
    const { data: branchesData, error: branchesError } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });
    
    if (branchesError) throw branchesError;

    // Extract unique states and sort them
    const uniqueStates = Array.from(new Set(branchesData.map(branch => branch.estado)))
      .filter(Boolean)
      .sort();
    
    // Group branches by state
    const result = uniqueStates.map(estado => {
      const stateBranches = branchesData.filter(branch => branch.estado === estado);
      return {
        estado,
        branches: stateBranches || []
      };
    });
    
    console.log('Branches by state:', result);
    return result;
  } catch (error) {
    console.error('Error fetching branches by state:', error);
    throw error;
  }
};


import { supabase } from '../supabase';
import type { Branch, BranchAnalytics } from '../../types/api';

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  try {
    const { data, error } = await supabase
      .from('filiais')
      .select('*');

    if (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBranches:', error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
};

export const fetchBranchesByState = async (): Promise<{ estado: string; branches: Branch[] }[]> => {
  console.log('Fetching branches grouped by state...');
  
  try {
    // First, get all branches
    const { data: branchesData, error: branchesError } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });
    
    if (branchesError) {
      console.error('Error fetching branches by state:', branchesError);
      return []; // Return empty array instead of throwing
    }

    if (!branchesData || branchesData.length === 0) {
      console.log('No branches data returned');
      return [];
    }

    console.log('Branches data retrieved:', branchesData.length, 'records');

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
    
    console.log('States found:', uniqueStates.length, 'states');
    console.log('Branches by state result:', result);
    return result;
  } catch (error) {
    console.error('Error in fetchBranchesByState:', error);
    return []; // Return empty array instead of throwing
  }
};

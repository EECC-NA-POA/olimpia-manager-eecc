
import { supabase } from '../supabase';
import type { Branch, BranchAnalytics } from '../../types/api';

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  try {
    // Use the anon key to access public data
    const { data, error } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }

    console.log('Branches fetched successfully:', data?.length || 0, 'records');
    return data || [];
  } catch (error) {
    console.error('Error in fetchBranches:', error);
    throw error;
  }
};

export const fetchBranchesByState = async (): Promise<{ estado: string; branches: Branch[] }[]> => {
  console.log('Fetching branches grouped by state...');
  
  try {
    // First, get all branches using anon key for public data
    const { data: branchesData, error: branchesError } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });
    
    if (branchesError) {
      console.error('Error fetching branches by state:', branchesError);
      throw branchesError;
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
    return result;
  } catch (error) {
    console.error('Error in fetchBranchesByState:', error);
    throw error;
  }
};

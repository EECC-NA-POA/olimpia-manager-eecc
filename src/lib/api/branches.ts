
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
    // Add more detailed logging to debug the issue
    console.log('Supabase client configured, attempting to fetch filiais...');
    
    // Fetch all branches without authentication requirement
    const { data: branchesData, error: branchesError } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });
    
    if (branchesError) {
      console.error('Error fetching branches by state:', branchesError);
      console.error('Error details:', {
        code: branchesError.code,
        message: branchesError.message,
        details: branchesError.details,
        hint: branchesError.hint
      });
      throw branchesError;
    }

    if (!branchesData || branchesData.length === 0) {
      console.log('No branches data returned');
      return [];
    }

    console.log('Branches data retrieved:', branchesData.length, 'records');
    console.log('Sample branch data:', branchesData[0]);

    // Extract unique states and sort them
    const uniqueStates = Array.from(new Set(branchesData.map(branch => branch.estado)))
      .filter(Boolean)
      .sort();
    
    console.log('Unique states found:', uniqueStates);
    
    // Group branches by state
    const result = uniqueStates.map(estado => {
      const stateBranches = branchesData.filter(branch => branch.estado === estado);
      console.log(`State ${estado} has ${stateBranches.length} branches`);
      return {
        estado,
        branches: stateBranches || []
      };
    });
    
    console.log('Final result:', result.length, 'states with branches');
    return result;
  } catch (error) {
    console.error('Error in fetchBranchesByState:', error);
    throw error;
  }
};

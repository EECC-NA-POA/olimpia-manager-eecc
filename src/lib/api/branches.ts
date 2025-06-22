
import { supabase } from '../supabase';
import type { Branch, BranchAnalytics } from '../../types/api';

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('🔍 Fetching branches...');
  try {
    // Test connection first
    console.log('🧪 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ Error fetching branches:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Raw branches data:', {
      count: data?.length || 0,
      sample: data?.[0] || null,
      allData: data
    });

    if (!data || data.length === 0) {
      console.warn('⚠️ No branches found in database');
      return [];
    }

    console.log('✅ Branches fetched successfully:', data.length, 'records');
    return data || [];
  } catch (error) {
    console.error('💥 Exception in fetchBranches:', error);
    throw error;
  }
};

export const fetchBranchesByState = async (): Promise<{ estado: string; branches: Branch[] }[]> => {
  console.log('🗺️ Fetching branches grouped by state...');
  
  try {
    // First test if table exists and is accessible
    console.log('🧪 Testing table access...');
    
    const { data: branchesData, error: branchesError } = await supabase
      .from('filiais')
      .select('*')
      .order('nome', { ascending: true });
    
    if (branchesError) {
      console.error('❌ Database error:', {
        code: branchesError.code,
        message: branchesError.message,
        details: branchesError.details,
        hint: branchesError.hint
      });
      
      // Try alternative approach with public API
      console.log('🔄 Attempting fallback with public API...');
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'x9Ll0f6bKmCBQWXGrBHtH4zPxEht0Of7XShBxUV8IkJPF8GKjXK4VKeTTt0bAMvbWcF7zUOZA02pdbLahz9Z4eFzhk6EVPwflciK5HasI7Cm7zokA4y3Sg8EG34qseUQZGTUiTjTAf9idr6mcdEEPdKSUvju6PwLJxLRjSF3oRRF6KTHrPyWpyY5rJs7m7QCFd1uMOSBQ7gY4RtTMydqWAgIHJJhxTPxC49A2rMuB0Z';
        
        const fallbackUrl = `${supabaseUrl}/rest/v1/filiais?select=*&order=nome.asc`;
        console.log('🌐 Fallback URL:', fallbackUrl);
        
        const publicResponse = await fetch(fallbackUrl, {
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('📡 Fallback response status:', publicResponse.status);
        
        if (publicResponse.ok) {
          const fallbackData = await publicResponse.json() as Branch[];
          console.log('✅ Fallback data retrieved:', fallbackData.length, 'records');
          if (fallbackData && fallbackData.length > 0) {
            // Process fallback data same way
            const uniqueStates = Array.from(new Set(fallbackData.map((branch: Branch) => branch.estado)))
              .filter((estado): estado is string => Boolean(estado))
              .sort();
            
            const result = uniqueStates.map(estado => ({
              estado,
              branches: fallbackData.filter((branch: Branch) => branch.estado === estado) || []
            }));
            
            console.log('✅ Fallback result processed:', result.length, 'states');
            return result;
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      
      throw branchesError;
    }

    console.log('📊 Raw data analysis:', {
      totalRecords: branchesData?.length || 0,
      hasData: !!branchesData && branchesData.length > 0,
      sampleRecord: branchesData?.[0],
      stateField: branchesData?.[0]?.estado,
      uniqueStates: branchesData ? [...new Set(branchesData.map(b => b.estado))].filter(Boolean) : []
    });

    if (!branchesData || branchesData.length === 0) {
      console.warn('⚠️ No branches data returned from database');
      return [];
    }

    // Extract unique states and sort them
    const uniqueStates = Array.from(new Set(branchesData.map(branch => branch.estado)))
      .filter((estado): estado is string => Boolean(estado))
      .sort();
    
    console.log('🗺️ States found:', uniqueStates);
    
    // Group branches by state
    const result = uniqueStates.map(estado => {
      const stateBranches = branchesData.filter(branch => branch.estado === estado);
      console.log(`📍 State ${estado}: ${stateBranches.length} branches`);
      return {
        estado,
        branches: stateBranches || []
      };
    });
    
    console.log('✅ Final grouped result:', {
      statesCount: result.length,
      totalBranches: result.reduce((sum, state) => sum + state.branches.length, 0),
      statesSummary: result.map(s => ({ state: s.estado, count: s.branches.length }))
    });
    
    return result;
  } catch (error: any) {
    console.error('💥 Critical error in fetchBranchesByState:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

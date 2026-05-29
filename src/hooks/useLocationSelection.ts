/**
 * Hook para seleção de localização (País → Estado → Filial)
 * Usa a mesma abordagem da web - busca direta da tabela filiais
 * Inclui fallback com fetch direto quando o Supabase client falha
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Branch {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
    pais: string;
}

interface UseLocationSelectionReturn {
    // Data
    countries: string[];
    states: string[];
    branches: Branch[];

    // Selected values
    selectedCountry: string;
    selectedState: string;

    // Handlers
    setSelectedCountry: (country: string) => void;
    setSelectedState: (state: string) => void;

    // Loading states
    isLoading: boolean;
    error: Error | null;
}

// Fallback fetch function - same approach as web
const fetchBranchesWithFallback = async (): Promise<Branch[]> => {
    console.log('🏢 Fetching all branches for location selection...');

    // Try Supabase client first
    const { data, error } = await supabase
        .from('filiais')
        .select('id, nome, cidade, estado, pais')
        .order('nome', { ascending: true });

    if (!error && data) {
        console.log('✅ Branches fetched via Supabase client:', data.length, 'records');
        return data as Branch[];
    }

    console.error('❌ Supabase client error:', error);
    console.log('🔄 Attempting fallback with direct fetch...');

    // Fallback with direct fetch (same as web does)
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const fallbackUrl = `${supabaseUrl}/rest/v1/filiais?select=id,nome,cidade,estado,pais&order=nome.asc`;
        console.log('🌐 Fallback URL:', fallbackUrl);

        const response = await fetch(fallbackUrl, {
            headers: {
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('📡 Fallback response status:', response.status);

        if (response.ok) {
            const fallbackData = await response.json() as Branch[];
            console.log('✅ Fallback data retrieved:', fallbackData.length, 'records');
            return fallbackData;
        }

        // If status is not ok, try to get error message
        const errorText = await response.text();
        console.error('❌ Fallback response error:', errorText);
    } catch (fallbackError) {
        console.error('❌ Fallback fetch also failed:', fallbackError);
    }

    // If all else fails, throw original error
    throw error || new Error('Failed to fetch branches');
};

export const useLocationSelection = (defaultCountry: string = 'Brasil'): UseLocationSelectionReturn => {
    const [selectedCountry, setSelectedCountryState] = useState<string>(defaultCountry);
    const [selectedState, setSelectedStateState] = useState<string>('');

    // Fetch all branches with fallback
    const { data: allBranches = [], isLoading, error } = useQuery({
        queryKey: ['all-branches-for-location'],
        queryFn: fetchBranchesWithFallback,
        staleTime: 60000, // Cache for 1 minute
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });

    // Extract unique countries, ensuring Brasil is first
    const countries = useMemo(() => {
        const uniqueCountries = [...new Set(allBranches.map(b => b.pais || 'Brasil'))].sort();

        // Put Brasil first if it exists
        const brasilIndex = uniqueCountries.indexOf('Brasil');
        if (brasilIndex > 0) {
            uniqueCountries.splice(brasilIndex, 1);
            uniqueCountries.unshift('Brasil');
        }

        console.log('🌍 Countries available:', uniqueCountries);
        return uniqueCountries;
    }, [allBranches]);

    // Get states for selected country
    const states = useMemo(() => {
        if (!selectedCountry) return [];

        const countryBranches = allBranches.filter(b => (b.pais || 'Brasil') === selectedCountry);
        const uniqueStates = [...new Set(countryBranches.map(b => b.estado))].filter(Boolean).sort();

        console.log(`📍 States for ${selectedCountry}:`, uniqueStates);
        return uniqueStates;
    }, [allBranches, selectedCountry]);

    // Get branches for selected state
    const branches = useMemo(() => {
        if (!selectedState) return [];

        const stateBranches = allBranches.filter(
            b => (b.pais || 'Brasil') === selectedCountry && b.estado === selectedState
        );

        console.log(`🏢 Branches for ${selectedState}:`, stateBranches.length);
        return stateBranches;
    }, [allBranches, selectedCountry, selectedState]);

    // Handlers with state reset
    const setSelectedCountry = useCallback((country: string) => {
        console.log('🌍 Country selected:', country);
        setSelectedCountryState(country);
        setSelectedStateState(''); // Reset state when country changes
    }, []);

    const setSelectedState = useCallback((state: string) => {
        console.log('📍 State selected:', state);
        setSelectedStateState(state);
    }, []);

    return {
        countries,
        states,
        branches,
        selectedCountry,
        selectedState,
        setSelectedCountry,
        setSelectedState,
        isLoading,
        error: error as Error | null,
    };
};

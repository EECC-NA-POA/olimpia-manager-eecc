/**
 * Hook para seleção de localização (País → Estado → Filial)
 * Usa a mesma abordagem da web - busca direta da tabela filiais
 * Inclui fallback com fetch direto quando o Supabase client falha
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

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

// A chave anon do servidor não é um JWT padrão — o cliente Supabase envia
// Authorization: Bearer <chave>, mas o PostgREST exige um JWT válido (3 partes).
// Usamos fetch direto com o header 'apikey', que o servidor aceita corretamente.
const fetchBranches = async (): Promise<Branch[]> => {
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br').replace(/\/$/, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/filiais?select=id,nome,cidade,estado,pais&order=nome.asc`;

    const response = await fetch(url, {
        headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar filiais: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<Branch[]>;
};

export const useLocationSelection = (defaultCountry: string = 'Brasil'): UseLocationSelectionReturn => {
    const [selectedCountry, setSelectedCountryState] = useState<string>(defaultCountry);
    const [selectedState, setSelectedStateState] = useState<string>('');

    // Fetch all branches with fallback
    const { data: allBranches = [], isLoading, error } = useQuery({
        queryKey: ['all-branches-for-location'],
        queryFn: fetchBranches,
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

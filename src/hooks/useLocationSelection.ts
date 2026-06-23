/**
 * Hook para seleção de localização (País → Estado → Filial) na tela de cadastro.
 * Usa publicFetch (sem Authorization header) pois a anon key do servidor
 * não é um JWT padrão e o cliente Supabase JS seria rejeitado pelo PostgREST.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { publicFetch } from '@/lib/api/publicFetch';

interface Branch {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
    pais: string;
}

interface UseLocationSelectionReturn {
    countries: string[];
    states: string[];
    branches: Branch[];
    selectedCountry: string;
    selectedState: string;
    setSelectedCountry: (country: string) => void;
    setSelectedState: (state: string) => void;
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    refetch: () => void;
}

const fetchBranches = (): Promise<Branch[]> =>
    publicFetch<Branch>('filiais', {
        select: 'id,nome,cidade,estado,pais',
        order: 'nome.asc',
    });

export const useLocationSelection = (defaultCountry: string = 'Brasil'): UseLocationSelectionReturn => {
    const [selectedCountry, setSelectedCountryState] = useState<string>(defaultCountry);
    const [selectedState, setSelectedStateState] = useState<string>('');
    const [toastShown, setToastShown] = useState(false);

    const { data: allBranches = [], isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['all-branches-for-location'],
        queryFn: fetchBranches,
        staleTime: 5 * 60_000,
        retry: 6,
        retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 30_000),
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
    });

    // Toast informativo (não bloqueante) somente após esgotar todas as tentativas
    useEffect(() => {
        if (error && !toastShown) {
            setToastShown(true);
            toast.warning('Problema ao conectar com o servidor. Tentando novamente...', {
                duration: 8_000,
            });
        }
        if (!error && toastShown) {
            setToastShown(false);
        }
    }, [error, toastShown]);

    const countries = useMemo(() => {
        const unique = [...new Set(allBranches.map(b => b.pais || 'Brasil'))].sort();
        const idx = unique.indexOf('Brasil');
        if (idx > 0) { unique.splice(idx, 1); unique.unshift('Brasil'); }
        return unique;
    }, [allBranches]);

    const states = useMemo(() => {
        if (!selectedCountry) return [];
        return [...new Set(
            allBranches.filter(b => (b.pais || 'Brasil') === selectedCountry).map(b => b.estado)
        )].filter(Boolean).sort() as string[];
    }, [allBranches, selectedCountry]);

    const branches = useMemo(() => {
        if (!selectedState) return [];
        return allBranches.filter(
            b => (b.pais || 'Brasil') === selectedCountry && b.estado === selectedState
        );
    }, [allBranches, selectedCountry, selectedState]);

    const setSelectedCountry = useCallback((country: string) => {
        setSelectedCountryState(country);
        setSelectedStateState('');
    }, []);

    const setSelectedState = useCallback((state: string) => {
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
        isFetching,
        error: error as Error | null,
        refetch,
    };
};

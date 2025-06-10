
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '@/lib/api';
import { toast } from 'sonner';

export const useBranchData = () => {
  const { 
    data: branches,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    retry: 3,
    retryDelay: 1000,
    staleTime: 300000, // Cache for 5 minutes
    meta: {
      onError: (error: any) => {
        console.error('Error fetching branches in useBranchData hook:', error);
        toast.error('Erro ao carregar informações das filiais');
      }
    }
  });

  return {
    branches,
    isLoading,
    error,
    refetch
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface Branch {
  id: number;
  nome: string;
  estado: string;
}

export const useBranches = (isOrganizer: boolean, isBranchFiltered: boolean) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (isOrganizer && !isBranchFiltered) {
      fetchBranches();
    }
  }, [isOrganizer, isBranchFiltered]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome, estado')
        .order('nome');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingBranches(false);
    }
  };

  return { branches, loadingBranches };
};

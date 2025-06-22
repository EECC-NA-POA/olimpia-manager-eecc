
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Branch, GroupedBranches } from './types';

export function useEventBranches(eventId: string | null) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<Record<string, boolean>>({});
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  
  // Group branches by state
  const groupedBranches: GroupedBranches = useMemo(() => {
    const filtered = branches.filter(branch => 
      branch.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.estado.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.reduce((groups, branch) => {
      if (!groups[branch.estado]) {
        groups[branch.estado] = [];
      }
      groups[branch.estado].push(branch);
      return groups;
    }, {} as GroupedBranches);
  }, [branches, searchTerm]);

  const sortedStates = Object.keys(groupedBranches).sort();
  
  // Fetch all branches and check which ones are linked to this event
  useEffect(() => {
    const fetchBranches = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        // Get all branches
        const { data: allBranches, error: branchError } = await supabase
          .from('filiais')
          .select('id, nome, cidade, estado')
          .order('nome');
        
        if (branchError) throw branchError;
        
        // Get linked branches for this event
        const { data: eventBranches, error: linkError } = await supabase
          .from('eventos_filiais')
          .select('filial_id')
          .eq('evento_id', eventId);
        
        if (linkError) throw linkError;
        
        // Create a map of linked branch IDs
        const linkedBranchIds = eventBranches?.reduce((acc: Record<string, boolean>, item) => {
          acc[item.filial_id] = true;
          return acc;
        }, {}) || {};
        
        // Set initial selected branches
        setSelectedBranches(linkedBranchIds);
        
        // Combine data to create the branch list with link status
        const branchesWithLinkStatus = allBranches?.map(branch => ({
          ...branch,
          is_linked: !!linkedBranchIds[branch.id]
        })) || [];
        
        setBranches(branchesWithLinkStatus);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Erro ao carregar filiais');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBranches();
  }, [eventId]);
  
  const handleToggleBranch = (branchId: string) => {
    setSelectedBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  const handleToggleState = (estado: string) => {
    const stateBranches = groupedBranches[estado];
    const allSelected = stateBranches.every(branch => selectedBranches[branch.id]);
    
    const newSelections = { ...selectedBranches };
    stateBranches.forEach(branch => {
      newSelections[branch.id] = !allSelected;
    });
    
    setSelectedBranches(newSelections);
  };

  const handleToggleStateExpansion = (estado: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [estado]: !prev[estado]
    }));
  };

  const isStateFullySelected = (estado: string): boolean => {
    return groupedBranches[estado].every(branch => selectedBranches[branch.id]);
  };

  const isStatePartiallySelected = (estado: string): boolean => {
    const stateBranches = groupedBranches[estado];
    const selectedCount = stateBranches.filter(branch => selectedBranches[branch.id]).length;
    return selectedCount > 0 && selectedCount < stateBranches.length;
  };
  
  const saveChanges = async () => {
    if (!eventId) return;
    
    setIsSaving(true);
    try {
      // Get currently linked branches
      const { data: currentLinks, error: fetchError } = await supabase
        .from('eventos_filiais')
        .select('filial_id')
        .eq('evento_id', eventId);
      
      if (fetchError) throw fetchError;
      
      // Create maps for current and desired state
      const currentLinkedMap = (currentLinks || []).reduce((acc: Record<string, boolean>, item) => {
        acc[item.filial_id] = true;
        return acc;
      }, {});
      
      // Determine branches to add and remove
      const branchesToAdd = [];
      const branchesToRemove = [];
      
      for (const branch of branches) {
        const isCurrentlyLinked = currentLinkedMap[branch.id];
        const shouldBeLinked = selectedBranches[branch.id];
        
        if (!isCurrentlyLinked && shouldBeLinked) {
          branchesToAdd.push({
            evento_id: eventId,
            filial_id: branch.id
          });
        } else if (isCurrentlyLinked && !shouldBeLinked) {
          branchesToRemove.push(branch.id);
        }
      }
      
      // Add new links
      if (branchesToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('eventos_filiais')
          .insert(branchesToAdd);
        
        if (addError) throw addError;
      }
      
      // Remove old links
      for (const branchId of branchesToRemove) {
        const { error: removeError } = await supabase
          .from('eventos_filiais')
          .delete()
          .eq('evento_id', eventId)
          .eq('filial_id', branchId);
        
        if (removeError) throw removeError;
      }
      
      // Update local state to reflect changes
      setBranches(branches.map(branch => ({
        ...branch,
        is_linked: !!selectedBranches[branch.id]
      })));
      
      toast.success('Filiais vinculadas ao evento atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating branch links:', error);
      toast.error('Erro ao atualizar filiais do evento');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    branches,
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    selectedBranches,
    expandedStates,
    groupedBranches,
    sortedStates,
    handleToggleBranch,
    handleToggleState,
    handleToggleStateExpansion,
    isStateFullySelected,
    isStatePartiallySelected,
    saveChanges
  };
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  is_linked: boolean;
}

interface GroupedBranches {
  [estado: string]: Branch[];
}

export function EventBranchesSection({ eventId }: { eventId: string | null }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<Record<string, boolean>>({});
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  
  // Group branches by state
  const groupedBranches: GroupedBranches = React.useMemo(() => {
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
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filiais Vinculadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar filial..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={saveChanges} 
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
          
          <div className="space-y-2">
            {sortedStates.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhuma filial encontrada</p>
              </div>
            ) : (
              sortedStates.map((estado) => {
                const stateBranches = groupedBranches[estado];
                const isExpanded = expandedStates[estado];
                const isFullySelected = isStateFullySelected(estado);
                const isPartiallySelected = isStatePartiallySelected(estado);
                
                return (
                  <Collapsible key={estado} open={isExpanded} onOpenChange={() => handleToggleStateExpansion(estado)}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isFullySelected}
                              ref={(el: HTMLInputElement | null) => {
                                if (el) el.indeterminate = isPartiallySelected && !isFullySelected;
                              }}
                              onCheckedChange={() => handleToggleState(estado)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium">{estado}</span>
                            <span className="text-sm text-muted-foreground">
                              ({stateBranches.filter(b => selectedBranches[b.id]).length}/{stateBranches.length} selecionadas)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {stateBranches.length} filiais
                            </span>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="border-t">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Vincular</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Cidade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stateBranches.map((branch) => (
                                <TableRow key={branch.id}>
                                  <TableCell>
                                    <Checkbox 
                                      checked={!!selectedBranches[branch.id]} 
                                      onCheckedChange={() => handleToggleBranch(branch.id)}
                                    />
                                  </TableCell>
                                  <TableCell>{branch.nome}</TableCell>
                                  <TableCell>{branch.cidade}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

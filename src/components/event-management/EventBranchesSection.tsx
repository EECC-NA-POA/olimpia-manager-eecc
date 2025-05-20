
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  is_linked: boolean;
}

export function EventBranchesSection({ eventId }: { eventId: string | null }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<Record<string, boolean>>({});
  
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

  const filteredBranches = branches.filter(branch => 
    branch.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <Card>
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
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Vincular</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Nenhuma filial encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <Checkbox 
                        checked={!!selectedBranches[branch.id]} 
                        onCheckedChange={() => handleToggleBranch(branch.id)}
                      />
                    </TableCell>
                    <TableCell>{branch.nome}</TableCell>
                    <TableCell>{branch.cidade}</TableCell>
                    <TableCell>{branch.estado}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

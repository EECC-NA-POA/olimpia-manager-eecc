
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useEventBranches } from './event-branches/useEventBranches';
import { BranchesHeader } from './event-branches/BranchesHeader';
import { StateSection } from './event-branches/StateSection';
import { EmptyState } from './event-branches/EmptyState';
import { NewBranchDialog } from './event-branches/NewBranchDialog';

export function EventBranchesSection({ eventId }: { eventId: string | null }) {
  const [isNewBranchDialogOpen, setIsNewBranchDialogOpen] = useState(false);
  
  const {
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
    saveChanges,
    createBranch
  } = useEventBranches(eventId);
  
  const handleCreateBranch = async (data: { nome: string; cidade: string; estado: string }) => {
    await createBranch(data);
    setIsNewBranchDialogOpen(false);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="text-base sm:text-lg">Filiais Vinculadas</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          <BranchesHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSave={saveChanges}
            isSaving={isSaving}
            onNewBranch={() => setIsNewBranchDialogOpen(true)}
          />
          
          <div className="space-y-2">
            {sortedStates.length === 0 ? (
              <EmptyState />
            ) : (
              sortedStates.map((estado) => {
                const stateBranches = groupedBranches[estado];
                const isExpanded = expandedStates[estado];
                const isFullySelected = isStateFullySelected(estado);
                const isPartiallySelected = isStatePartiallySelected(estado);
                
                return (
                  <StateSection
                    key={estado}
                    estado={estado}
                    branches={stateBranches}
                    isExpanded={isExpanded}
                    isFullySelected={isFullySelected}
                    isPartiallySelected={isPartiallySelected}
                    selectedBranches={selectedBranches}
                    onToggleState={handleToggleState}
                    onToggleExpansion={handleToggleStateExpansion}
                    onToggleBranch={handleToggleBranch}
                  />
                );
              })
            )}
          </div>
        </div>
      </CardContent>
      
      <NewBranchDialog
        isOpen={isNewBranchDialogOpen}
        onClose={() => setIsNewBranchDialogOpen(false)}
        onSave={handleCreateBranch}
        isSaving={isSaving}
      />
    </Card>
  );
}

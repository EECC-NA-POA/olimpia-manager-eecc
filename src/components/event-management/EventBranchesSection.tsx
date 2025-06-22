
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useEventBranches } from './event-branches/useEventBranches';
import { BranchesHeader } from './event-branches/BranchesHeader';
import { StateSection } from './event-branches/StateSection';
import { EmptyState } from './event-branches/EmptyState';

export function EventBranchesSection({ eventId }: { eventId: string | null }) {
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
    saveChanges
  } = useEventBranches(eventId);
  
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
          <BranchesHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSave={saveChanges}
            isSaving={isSaving}
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
    </Card>
  );
}

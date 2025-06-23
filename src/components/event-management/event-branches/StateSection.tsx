
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BranchesTable } from './BranchesTable';
import type { Branch } from './types';

interface StateSectionProps {
  estado: string;
  branches: Branch[];
  isExpanded: boolean;
  isFullySelected: boolean;
  isPartiallySelected: boolean;
  selectedBranches: Record<string, boolean>;
  onToggleState: (estado: string) => void;
  onToggleExpansion: (estado: string) => void;
  onToggleBranch: (branchId: string) => void;
}

export function StateSection({
  estado,
  branches,
  isExpanded,
  isFullySelected,
  isPartiallySelected,
  selectedBranches,
  onToggleState,
  onToggleExpansion,
  onToggleBranch
}: StateSectionProps) {
  return (
    <Collapsible key={estado} open={isExpanded} onOpenChange={() => onToggleExpansion(estado)}>
      <div className="border rounded-lg">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isFullySelected ? true : isPartiallySelected ? 'indeterminate' : false}
                onCheckedChange={() => onToggleState(estado)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="font-medium">{estado}</span>
              <span className="text-sm text-muted-foreground">
                ({branches.filter(b => selectedBranches[b.id]).length}/{branches.length} selecionadas)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {branches.length} filiais
              </span>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t">
            <BranchesTable 
              branches={branches}
              selectedBranches={selectedBranches}
              onToggleBranch={onToggleBranch}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

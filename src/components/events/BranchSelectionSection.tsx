
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EventFormValues } from './EventFormSchema';
import type { Branch } from '@/types/api';
import { cn } from '@/lib/utils';
import { checkboxRow, checkboxStateRow } from '@/lib/utils/form-layout';

interface BranchSelectionSectionProps {
  form: UseFormReturn<EventFormValues>;
  branches: Branch[];
}

export function BranchSelectionSection({ form, branches }: BranchSelectionSectionProps) {
  // Group branches by state
  const groupedBranches = branches.reduce((groups, branch) => {
    if (!groups[branch.estado]) {
      groups[branch.estado] = [];
    }
    groups[branch.estado].push(branch);
    return groups;
  }, {} as Record<string, Branch[]>);

  // Sort states alphabetically
  const sortedStates = Object.keys(groupedBranches).sort();

  // Handle "Select all by state" functionality
  const handleSelectAllByState = (state: string, checked: boolean) => {
    const currentValues = form.getValues('selectedBranches') || [];
    const stateBranchIds = groupedBranches[state].map(branch => branch.id);
    
    if (checked) {
      // Add all branch IDs from this state (avoiding duplicates)
      const newValues = [...new Set([...currentValues, ...stateBranchIds])];
      form.setValue('selectedBranches', newValues, { shouldValidate: true });
    } else {
      // Remove all branch IDs from this state
      const newValues = currentValues.filter(id => !stateBranchIds.includes(id));
      form.setValue('selectedBranches', newValues, { shouldValidate: true });
    }
  };

  // Calculate if all branches in a state are selected
  const isStateFullySelected = (state: string): boolean => {
    const currentValues = form.getValues('selectedBranches') || [];
    const stateBranchIds = groupedBranches[state].map(branch => branch.id);
    return stateBranchIds.every(id => currentValues.includes(id));
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="selectedBranches"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Filiais que podem participar do evento</FormLabel>
            <FormDescription>
              Selecione as filiais que poderão visualizar e se inscrever neste evento
            </FormDescription>
            <FormControl>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-4">
                  {sortedStates.map(state => (
                    <div key={state} className="space-y-2">
                      <div className={checkboxStateRow}>
                        <Checkbox
                          id={`state-${state}`}
                          checked={isStateFullySelected(state)}
                          onCheckedChange={(checked) => handleSelectAllByState(state, !!checked)}
                        />
                        <label 
                          htmlFor={`state-${state}`}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {state} (Selecionar todas)
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 ml-6 mt-1">
                        {groupedBranches[state]
                          .sort((a, b) => a.nome.localeCompare(b.nome))
                          .map(branch => (
                            <div key={branch.id} className={checkboxRow}>
                              <Checkbox
                                id={`branch-${branch.id}`}
                                checked={field.value?.includes(branch.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), branch.id]);
                                  } else {
                                    field.onChange(field.value?.filter(id => id !== branch.id) || []);
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`branch-${branch.id}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {branch.nome} ({branch.cidade})
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}


import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EventFormValues } from './EventFormSchema';
import type { Branch } from '@/types/api';

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
                      <h4 className="font-medium text-sm">{state}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {groupedBranches[state]
                          .sort((a, b) => a.nome.localeCompare(b.nome))
                          .map(branch => (
                            <div key={branch.id} className="flex items-center space-x-2">
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
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

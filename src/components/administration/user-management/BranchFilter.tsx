import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building } from "lucide-react";

interface Branch {
  id: string;
  nome: string;
  sigla?: string;
  estado?: string;
}

interface BranchFilterProps {
  branches: Branch[];
  selectedBranchId: string | null;
  onBranchChange: (branchId: string | null) => void;
  isMaster: boolean;
}

export function BranchFilter({ branches, selectedBranchId, onBranchChange, isMaster }: BranchFilterProps) {
  if (!isMaster) return null;

  return (
    <div className="w-full md:w-[220px]">
      <Select 
        value={selectedBranchId || "all"} 
        onValueChange={(value) => onBranchChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="border-olimpics-green-primary/20 focus:ring-olimpics-green-primary/30">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por filial" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as filiais</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.nome} {branch.sigla ? `(${branch.sigla})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
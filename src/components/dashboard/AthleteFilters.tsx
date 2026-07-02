import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AthleteFiltersProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  branches: { id: string; nome: string; }[];
  hideFilial?: boolean;
}

export function AthleteFilters({
  nameFilter,
  onNameFilterChange,
  branchFilter,
  onBranchFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  branches,
  hideFilial = false
}: AthleteFiltersProps) {
  return (
    <div className="space-y-4 mb-6 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-text">
        <Filter className="h-5 w-5" />
        Filtros
      </h3>
      <div className={`grid grid-cols-1 ${hideFilial ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="name-filter">Nome do Atleta</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name-filter"
              placeholder="Buscar por nome..."
              value={nameFilter}
              onChange={(e) => onNameFilterChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {!hideFilial && (
          <div className="space-y-2">
            <Label>Filial</Label>
            <Select
              value={branchFilter}
              onValueChange={onBranchFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as filiais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as filiais</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Status de Pagamento</Label>
          <Select
            value={paymentStatusFilter}
            onValueChange={onPaymentStatusFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="isento">Isento</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
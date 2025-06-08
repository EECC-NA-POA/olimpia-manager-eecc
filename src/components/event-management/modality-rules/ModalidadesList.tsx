
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Modalidade {
  id: number;
  nome: string;
  categoria: string;
  tipo_pontuacao: string;
  tipo_modalidade: string;
}

interface ModalidadesListProps {
  modalidades: Modalidade[];
  selectedModalidadeId: number | null;
  onModalidadeSelect: (id: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ModalidadesList({
  modalidades,
  selectedModalidadeId,
  onModalidadeSelect,
  searchTerm,
  onSearchChange
}: ModalidadesListProps) {
  const filteredModalidades = modalidades.filter(modalidade =>
    modalidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (modalidade.categoria && modalidade.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Modalidades</h3>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modalidades..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {filteredModalidades.map((modalidade) => (
          <div
            key={modalidade.id}
            className={`p-3 border-b cursor-pointer hover:bg-accent transition-colors ${
              selectedModalidadeId === modalidade.id ? 'bg-accent' : ''
            }`}
            onClick={() => onModalidadeSelect(modalidade.id)}
          >
            <div className="font-medium">{modalidade.nome}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span>{modalidade.tipo_modalidade}</span>
              <span>•</span>
              <span>{modalidade.categoria || 'Sem categoria'}</span>
              <span>•</span>
              <span>{modalidade.tipo_pontuacao}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

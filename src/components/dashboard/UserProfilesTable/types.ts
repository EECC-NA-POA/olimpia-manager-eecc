
export interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  numero_documento: string | null;
  tipo_documento: string | null;
  filial_id: number | null;
  created_at: string;
  papeis?: Array<{
    id: number;
    nome?: string;
    codigo: string;
  }>;
  pagamentos?: Array<{
    status: string;
  }>;
}

export interface Branch {
  id: string; // Changed to string to match api.ts
  nome: string;
  cidade?: string;
  estado?: string;
}

export interface UserProfilesTableProps {
  data: UserProfile[];
  branches: Branch[];
  isLoading: boolean;
}

export interface UserSearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  branchFilter: string;
  setBranchFilter: (filter: string) => void;
  branches: Branch[];
  setCurrentPage: (page: number) => void;
}

export interface UsersTableProps {
  data: UserProfile[];
  branches: Branch[];
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

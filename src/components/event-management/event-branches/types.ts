
export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  is_linked: boolean;
}

export interface GroupedBranches {
  [estado: string]: Branch[];
}

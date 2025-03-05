
import { User } from '@supabase/supabase-js';

export interface UserRole {
  nome: string;
  codigo: string;
  descricao: string | null;
}

export interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  papeis?: UserRole[];
  tipo_documento?: string;
  numero_documento?: string;
  genero?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: any) => Promise<{ user: AuthUser | null; error: Error | null; }>;
  resendVerificationEmail: (email: string) => Promise<void>;
  currentEventId: string | null;
}

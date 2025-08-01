import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Trash2, Mail, Phone, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { UserDeletionDialog } from '@/components/admin/UserDeletionDialog';
import { BranchFilter } from './BranchFilter';
import { toast } from 'sonner';
import { fetchBranches } from '@/lib/api';

interface BranchUser {
  id: string;
  nome_completo: string;
  email: string | null;
  telefone: string;
  numero_documento: string;
  tipo_documento: string;
  genero: string;
  data_nascimento: string;
  ativo: boolean;
  confirmado: boolean;
  data_criacao: string;
  filial: {
    nome: string;
    estado: string;
  } | null;
  auth_exists: boolean;
  tipo_cadastro: string;
}

interface UsersListProps {
  eventId: string;
}

export function UsersList({ eventId }: UsersListProps) {
  const { user } = useAuth();
  const [userToDelete, setUserToDelete] = useState<BranchUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string | null>(null);
  const itemsPerPage = 10;

  // First, get all branches to find the user's actual branch
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Validate if filial_id is a valid UUID
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Determine the user's branch ID with enhanced validation
  const { userBranchId, branchValidationError } = useMemo(() => {
    if (!user?.filial_id || !branches) {
      return { userBranchId: null, branchValidationError: null };
    }
    
    // Check if filial_id is a valid UUID
    if (isValidUUID(user.filial_id)) {
      const branchById = branches.find(branch => branch.id === user.filial_id);
      if (branchById) {
        return { userBranchId: branchById.id, branchValidationError: null };
      } else {
        return { 
          userBranchId: null, 
          branchValidationError: `Filial com ID ${user.filial_id} não encontrada no sistema.` 
        };
      }
    }
    
    // If filial_id is not a valid UUID, it's likely corrupted data
    return { 
      userBranchId: null, 
      branchValidationError: `Filial inválida: "${user.filial_id}". Entre em contato com o administrador para corrigir sua configuração de filial.` 
    };
  }, [user?.filial_id, branches, branchesLoading]);

  const { data: users, isLoading: usersLoading, error } = useQuery({
    queryKey: ['branch-users', userBranchId, selectedBranchFilter, user?.is_master],
    queryFn: async () => {
      const isMaster = user?.is_master || false;
      
      if (!isMaster && !userBranchId) {
        throw new Error('Filial não encontrada no sistema');
      }

      // For master users, use selectedBranchFilter; for regular users, use userBranchId
      const branchIdToUse = isMaster ? selectedBranchFilter : userBranchId;

      // Use RPC function to get users with auth status
      const { data, error } = await supabase
        .rpc('get_users_with_auth_status', { 
          p_filial_id: branchIdToUse,
          p_is_master: isMaster
        });

      if (error) {
        console.error('Error calling get_users_with_auth_status:', error);
        if (error.message.includes('algum-id') || error.message.includes('Invalid input syntax for type uuid')) {
          throw new Error('Dados corrompidos detectados. Execute o script SQL de limpeza para corrigir os IDs de filial inválidos.');
        }
        throw error;
      }

      // Transform the data to match our BranchUser interface
      return data.map((userData: any): BranchUser => ({
        id: userData.id,
        nome_completo: userData.nome_completo,
        email: userData.email,
        telefone: userData.telefone,
        numero_documento: userData.documento_numero,
        tipo_documento: userData.tipo_documento || 'N/A',
        genero: userData.genero || 'N/A',
        data_nascimento: userData.data_nascimento || '',
        ativo: userData.ativo,
        confirmado: userData.confirmado || false,
        data_criacao: userData.data_criacao,
        filial: userData.filial_nome ? {
          nome: userData.filial_nome,
          estado: userData.filial_estado
        } : null,
        auth_exists: userData.has_auth,
        tipo_cadastro: userData.has_auth ? 'Completo' : 'Apenas Usuário'
      }));
    },
    enabled: (!!userBranchId || !!user?.is_master) && !!branches && !branchesLoading,
  });

  const isLoading = branchesLoading || usersLoading;

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = user.nome_completo.toLowerCase().includes(searchLower);
      const matchesDocument = user.numero_documento.toLowerCase().includes(searchLower);
      return matchesName || matchesDocument;
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // Show branch validation error if exists
  if (branchValidationError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground mb-2">Problema de Configuração</p>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 mb-2">
              <strong>Erro na configuração da filial:</strong>
            </p>
            <p className="text-sm text-red-600">{branchValidationError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isInvalidBranch = error.message.includes('Filial não encontrada');
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground mb-2">
            {isInvalidBranch ? 'Filial não encontrada' : 'Erro ao carregar usuários'}
          </p>
          <p className="text-sm text-red-600 mb-4">{error.message}</p>
          {isInvalidBranch && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Sua filial não foi encontrada no sistema. 
                Entre em contato com o administrador para verificar sua configuração.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum usuário encontrado na sua filial.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou documento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary/30"
          />
        </div>
        <BranchFilter 
          branches={branches || []}
          selectedBranchId={selectedBranchFilter}
          onBranchChange={(branchId) => {
            setSelectedBranchFilter(branchId);
            setCurrentPage(1);
          }}
          isMaster={user?.is_master || false}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Tipo de Cadastro</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Filial</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((branchUser) => (
            <TableRow key={branchUser.id}>
              <TableCell className="font-medium">
                {branchUser.nome_completo}
              </TableCell>
              <TableCell>
                {branchUser.email ? (
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-left justify-start"
                    onClick={() => handleEmailClick(branchUser.email!)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {branchUser.email}
                  </Button>
                ) : (
                  <span className="text-muted-foreground">Não informado</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-left justify-start"
                  onClick={() => handlePhoneClick(branchUser.telefone)}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {branchUser.telefone}
                </Button>
              </TableCell>
              <TableCell>
                {branchUser.numero_documento} ({branchUser.tipo_documento})
              </TableCell>
              <TableCell>
                {branchUser.tipo_cadastro === 'Completo' && (
                  <Badge className="bg-olimpics-green-primary text-white">Completo</Badge>
                )}
                {branchUser.tipo_cadastro === 'Apenas Usuário' && (
                  <Badge variant="secondary">Apenas Usuário</Badge>
                )}
                {branchUser.tipo_cadastro === 'Apenas Auth' && (
                  <Badge variant="outline">Apenas Auth</Badge>
                )}
                {branchUser.tipo_cadastro === 'Incompleto' && (
                  <Badge variant="destructive">Incompleto</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={branchUser.ativo ? "default" : "destructive"}>
                  {branchUser.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                {branchUser.filial?.nome || 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${!branchUser.email 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'text-destructive hover:text-destructive'
                  }`}
                  disabled={!branchUser.email}
                  onClick={() => {
                    if (!branchUser.email) {
                      toast.error('Usuário sem email válido não pode ser excluído');
                      return;
                    }
                    setUserToDelete(branchUser);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {userToDelete && (
        <UserDeletionDialog
          user={userToDelete}
          open={!!userToDelete}
          onOpenChange={(open) => !open && setUserToDelete(null)}
        />
      )}
    </div>
  );
}
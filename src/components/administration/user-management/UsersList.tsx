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
import { toast } from 'sonner';

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
  const itemsPerPage = 10;

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['branch-users', user?.filial_id],
    queryFn: async () => {
      if (!user?.filial_id) {
        throw new Error('Usuário sem filial definida');
      }

      // Use RPC function to get users with auth status
      const { data, error } = await supabase
        .rpc('get_users_with_auth_status', { p_filial_id: user.filial_id });

      if (error) {
        throw error;
      }

      // Transform the data to match our BranchUser interface
      return data.map((user: any): BranchUser => ({
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email,
        telefone: user.telefone,
        numero_documento: user.numero_documento,
        tipo_documento: user.tipo_documento,
        genero: user.genero,
        data_nascimento: user.data_nascimento,
        ativo: user.ativo,
        confirmado: user.confirmado,
        data_criacao: user.data_criacao,
        filial: user.filial_nome ? {
          nome: user.filial_nome,
          estado: user.filial_estado
        } : null,
        auth_exists: user.auth_exists,
        tipo_cadastro: user.tipo_cadastro
      }));
    },
    enabled: !!user?.filial_id,
  });

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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar usuários: {error.message}</p>
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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
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
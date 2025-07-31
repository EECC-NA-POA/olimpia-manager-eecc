import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { UserDeletionDialog } from '@/components/admin/UserDeletionDialog';

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
  filiais: {
    nome: string;
  } | null;
}

interface UsersListProps {
  eventId: string;
}

export function UsersList({ eventId }: UsersListProps) {
  const { user } = useAuth();
  const [userToDelete, setUserToDelete] = useState<BranchUser | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['branch-users', user?.filial_id],
    queryFn: async () => {
      if (!user?.filial_id) {
        throw new Error('Usuário sem filial definida');
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome_completo,
          email,
          telefone,
          numero_documento,
          tipo_documento,
          genero,
          data_nascimento,
          ativo,
          confirmado,
          data_criacao,
          filiais(nome)
        `)
        .eq('filial_id', user.filial_id)
        .eq('ativo', true)
        .order('nome_completo');

      if (error) throw error;
      return data?.map(user => ({
        ...user,
        filiais: user.filiais ? user.filiais[0] : null
      })) || [];
    },
    enabled: !!user?.filial_id,
  });


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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Filial</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((branchUser) => (
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
                <Badge variant={branchUser.confirmado ? "default" : "secondary"}>
                  {branchUser.confirmado ? "Confirmado" : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell>
                {branchUser.filiais?.nome || 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setUserToDelete(branchUser)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LoadingState } from '@/components/dashboard/components/LoadingState';

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
  const queryClient = useQueryClient();

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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // First, deactivate user in usuarios table
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Then, delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        // If auth deletion fails, revert the usuarios table change
        await supabase
          .from('usuarios')
          .update({ ativo: true })
          .eq('id', userId);
        throw authError;
      }
    },
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['branch-users'] });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário: ' + error.message);
    },
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o usuário <strong>{branchUser.nome_completo}</strong>? 
                        Esta ação irá remover o acesso de autenticação do usuário e desativá-lo no sistema.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUserMutation.mutate(branchUser.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
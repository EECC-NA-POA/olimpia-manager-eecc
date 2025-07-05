
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2 } from 'lucide-react';
import { UserProfileModal } from '@/components/dashboard/UserProfileModal';
import { UserDeletionDialog } from '@/components/admin/UserDeletionDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserProfile, Branch, UsersTableProps } from './types';

export function UsersTable({ data, branches }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return 'N/A';
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.nome : 'Filial não encontrada';
  };

  const getUserRoles = (user: UserProfile) => {
    if (!user.papeis || user.papeis.length === 0) return 'Nenhum perfil';
    return user.papeis.map(papel => papel.nome || papel.codigo).join(', ');
  };

  const getPaymentStatus = (user: UserProfile) => {
    if (!user.pagamentos || user.pagamentos.length === 0) {
      return <Badge variant="secondary">Sem pagamento</Badge>;
    }

    const payment = user.pagamentos[0];
    const statusMap = {
      'pendente': <Badge variant="outline">Pendente</Badge>,
      'confirmado': <Badge variant="default" className="bg-green-600">Confirmado</Badge>,
      'cancelado': <Badge variant="destructive">Cancelado</Badge>,
      'isento': <Badge variant="secondary" className="bg-blue-600">Isento</Badge>
    };

    return statusMap[payment.status as keyof typeof statusMap] || 
           <Badge variant="secondary">{payment.status}</Badge>;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Nome</TableHead>
              <TableHead className="font-semibold text-gray-900">Email</TableHead>
              <TableHead className="font-semibold text-gray-900">Documento</TableHead>
              <TableHead className="font-semibold text-gray-900">Filial</TableHead>
              <TableHead className="font-semibold text-gray-900">Perfis</TableHead>
              <TableHead className="font-semibold text-gray-900">Status Pagamento</TableHead>
              <TableHead className="font-semibold text-gray-900">Data Criação</TableHead>
              <TableHead className="font-semibold text-gray-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.nome_completo}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.numero_documento ? 
                    `${user.tipo_documento || 'CPF'}: ${user.numero_documento}` : 
                    'N/A'
                  }
                </TableCell>
                <TableCell>{getBranchName(user.filial_id)}</TableCell>
                <TableCell className="max-w-xs truncate" title={getUserRoles(user)}>
                  {getUserRoles(user)}
                </TableCell>
                <TableCell>{getPaymentStatus(user)}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserToDelete(user)}
                      title="Excluir usuário"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}

      {userToDelete && (
        <UserDeletionDialog
          user={{
            id: userToDelete.id,
            nome_completo: userToDelete.nome_completo,
            email: userToDelete.email,
            numero_documento: userToDelete.numero_documento || ''
          }}
          open={!!userToDelete}
          onOpenChange={(open) => !open && setUserToDelete(null)}
        />
      )}
    </>
  );
}

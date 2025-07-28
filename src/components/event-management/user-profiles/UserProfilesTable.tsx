import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone } from 'lucide-react';
import { UserProfileDataAlternative } from '@/lib/api/profiles/fetchUserProfilesAlternative';
import { UserProfileEditDialog } from './UserProfileEditDialog';

interface UserProfilesTableProps {
  userProfiles: UserProfileDataAlternative[];
  eventId: string;
}

export function UserProfilesTable({ userProfiles, eventId }: UserProfilesTableProps) {
  const [editingUser, setEditingUser] = useState<UserProfileDataAlternative | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditUser = (user: UserProfileDataAlternative) => {
    console.log('Editando usuário:', user);
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Perfis</TableHead>
              <TableHead>Status Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userProfiles.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.nome_completo}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  {user.telefone ? (
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.telefone}
                    </p>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.profiles.length > 0 ? (
                      user.profiles.map((profile) => (
                        <Badge key={profile.id} variant="secondary">
                          {profile.nome}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Sem perfil</Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {user.latestPaymentStatus ? (
                    <Badge 
                      variant={user.latestPaymentStatus === 'pago' ? 'default' : 'destructive'}
                    >
                      {user.latestPaymentStatus}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Não informado</Badge>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserProfileEditDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        user={editingUser}
        eventId={eventId}
      />
    </div>
  );
}
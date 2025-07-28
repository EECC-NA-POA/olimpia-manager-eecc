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
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </a>
                  </div>
                </TableCell>
                
                <TableCell>
                  {user.telefone ? (
                    <a
                      href={`https://wa.me/55${user.telefone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Entrando em contato via sistema.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 hover:text-green-600 cursor-pointer transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {user.telefone}
                    </a>
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
                  {user.paymentStatus ? (
                    <Badge 
                      variant={
                        user.paymentStatus === 'confirmado' ? 'default' :
                        user.paymentStatus === 'isento' ? 'secondary' :
                        user.paymentStatus === 'cancelado' ? 'destructive' :
                        'outline'
                      }
                    >
                      {user.paymentStatus === 'confirmado' ? 'Confirmado' :
                       user.paymentStatus === 'isento' ? 'Isento' :
                       user.paymentStatus === 'cancelado' ? 'Cancelado' :
                       'Pendente'}
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
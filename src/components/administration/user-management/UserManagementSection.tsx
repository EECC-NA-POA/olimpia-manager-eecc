import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UsersList } from './UsersList';
import { CreateUserDialog } from './CreateUserDialog';

interface UserManagementSectionProps {
  eventId: string;
}

export function UserManagementSection({ eventId }: UserManagementSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Gestão de Usuários</CardTitle>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
          >
            <Plus className="h-4 w-4" />
            Criar Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <UsersList eventId={eventId} />
        </CardContent>
      </Card>

      <CreateUserDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
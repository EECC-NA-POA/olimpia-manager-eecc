
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationForm } from './NotificationForm';
import { useQueryClient } from '@tanstack/react-query';

interface CreateNotificationDialogProps {
  eventId: string;
  userId: string;
  userBranchId?: string;
  isOpen: boolean;
  onClose: () => void;
  isRepresentanteDelegacao?: boolean;
  isOrganizer?: boolean;
}

export function CreateNotificationDialog({
  eventId,
  userId,
  userBranchId,
  isOpen,
  onClose,
  isRepresentanteDelegacao = false,
  isOrganizer = false
}: CreateNotificationDialogProps) {
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Notificação</DialogTitle>
        </DialogHeader>
        
        <NotificationForm
          eventId={eventId}
          userId={userId}
          userBranchId={userBranchId}
          onSuccess={handleSuccess}
          isRepresentanteDelegacao={isRepresentanteDelegacao}
          isOrganizer={isOrganizer}
        />
      </DialogContent>
    </Dialog>
  );
}

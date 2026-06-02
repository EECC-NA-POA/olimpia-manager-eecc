
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
  userBranchIds?: string[];
  isOpen: boolean;
  onClose: () => void;
  isRepresentanteDelegacao?: boolean;
  isOrganizer?: boolean;
}

export function CreateNotificationDialog({
  eventId,
  userId,
  userBranchIds,
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Nova Notificação</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
        <NotificationForm
          eventId={eventId}
          userId={userId}
          userBranchIds={userBranchIds}
          onSuccess={handleSuccess}
          isRepresentanteDelegacao={isRepresentanteDelegacao}
          isOrganizer={isOrganizer}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
}

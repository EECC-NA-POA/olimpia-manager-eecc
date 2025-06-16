
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationForm } from './NotificationForm';

interface CreateNotificationDialogProps {
  eventId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  isBranchFiltered?: boolean;
  branchId?: number;
}

export function CreateNotificationDialog({
  eventId,
  userId,
  isOpen,
  onClose,
  isBranchFiltered = false,
  branchId
}: CreateNotificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Notificação</DialogTitle>
          <DialogDescription>
            Crie uma nova notificação para os participantes do evento.
          </DialogDescription>
        </DialogHeader>
        <NotificationForm
          eventId={eventId}
          userId={userId}
          onSuccess={onClose}
          isBranchFiltered={isBranchFiltered}
          branchId={branchId}
        />
      </DialogContent>
    </Dialog>
  );
}

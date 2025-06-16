
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
  isOrganizer?: boolean;
}

export function CreateNotificationDialog({
  eventId,
  userId,
  isOpen,
  onClose,
  isBranchFiltered = false,
  branchId,
  isOrganizer = false
}: CreateNotificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Notificação</DialogTitle>
          <DialogDescription>
            {isBranchFiltered 
              ? "Crie uma nova notificação para os participantes da sua filial."
              : "Crie uma nova notificação para os participantes do evento."
            }
          </DialogDescription>
        </DialogHeader>
        <NotificationForm
          eventId={eventId}
          userId={userId}
          onSuccess={onClose}
          isBranchFiltered={isBranchFiltered}
          branchId={branchId}
          isOrganizer={isOrganizer}
        />
      </DialogContent>
    </Dialog>
  );
}

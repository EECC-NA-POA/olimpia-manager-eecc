
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AthleteInfoGrid } from './AthleteInfoGrid';
import { ModalitiesTable } from './ModalitiesTable';
import { AthleteBadges } from './AthleteBadges';
import { PaymentStatusControls } from './PaymentStatusControls';
import { AthleteModality } from '@/lib/api';
import CopyableCode from '@/components/CopyableCode';

interface AthleteDialogContentProps {
  nome: string;
  numeroIdentificador?: string;
  isDependent: boolean;
  isExempt: boolean;
  email: string | null;
  telefone: string;
  filialNome: string;
  tipoDocumento: string;
  numeroDocumento: string;
  genero: string;
  onWhatsAppClick: (phone: string) => void;
  registradorInfo: any;
  onPaymentStatusChange?: (status: string) => void;
  paymentControlProps?: {
    value: string;
    disabled: boolean;
    isUpdating: boolean;
    onInputChange: (value: string) => void;
    onSave: () => void;
    onBlur: () => void;
    currentStatus?: string;
  };
  modalitiesProps?: {
    modalidades: AthleteModality[];
    justifications: Record<string, string>;
    isUpdating: Record<string, boolean>;
    modalityStatuses: Record<string, string>;
    getStatusBadgeStyle: (status: string) => string;
    onJustificationChange: (modalityId: string, value: string) => void;
    onStatusChange: (modalityId: string, status: string) => void;
  };
  feeInfo?: {
    valor: number;
    isento: boolean;
    pix_key: string | null;
    qr_code_image: string | null;
    qr_code_codigo: string | null;
    perfil: {
      id: number;
      nome: string;
    } | null;
  };
  readOnly?: boolean;
}
export const AthleteDialogContent: React.FC<AthleteDialogContentProps> = ({
  nome,
  numeroIdentificador,
  isDependent,
  isExempt,
  email,
  telefone,
  filialNome,
  tipoDocumento,
  numeroDocumento,
  genero,
  onWhatsAppClick,
  registradorInfo,
  onPaymentStatusChange,
  paymentControlProps,
  modalitiesProps,
  feeInfo,
  readOnly
}) => {
  const hasModalities = modalitiesProps?.modalidades.length > 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2">
          {nome}
          <AthleteBadges
            numeroIdentificador={numeroIdentificador}
            isDependent={isDependent}
            isExempt={isExempt}
          />
        </DialogTitle>
        <DialogDescription className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <AthleteInfoGrid
              email={email}
              telefone={telefone}
              filialNome={filialNome}
              tipoDocumento={tipoDocumento}
              numeroDocumento={numeroDocumento}
              genero={genero}
              onWhatsAppClick={onWhatsAppClick}
              registradorInfo={registradorInfo}
              hasRegistrador={isDependent}
              showRegistradorEmail={true}
            />
            {onPaymentStatusChange && paymentControlProps && (
              <div className="pt-4 border-t border-gray-200">
                <PaymentStatusControls
                  onPaymentStatusChange={onPaymentStatusChange}
                  readOnly={readOnly}
                  {...paymentControlProps}
                />
              </div>
            )}
            {feeInfo && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold mb-3">Informações da Taxa de Inscrição</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Perfil:</span>
                      <p className="font-medium">{feeInfo.perfil?.nome || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <p className="font-medium">
                        {feeInfo.isento ? 'Isento' : `R$ ${feeInfo.valor.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogDescription>
      </DialogHeader>

      {hasModalities && modalitiesProps && (
        <ScrollArea className="h-[50vh] w-full rounded-md border p-4">
          <ModalitiesTable {...modalitiesProps} readOnly={readOnly} />
        </ScrollArea>
      )}
    </>
  );
};

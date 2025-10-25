
import React from 'react';
import { Mail, Phone, Building2, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AthleteInfoGridProps {
  email: string | null;
  telefone: string;
  filialNome?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  genero: string;
  onWhatsAppClick: (phone: string) => void;
  registradorInfo?: {
    nome_completo: string;
    email: string;
    telefone: string;
  };
  hasRegistrador?: boolean;
  showRegistradorEmail?: boolean;
}

export const AthleteInfoGrid: React.FC<AthleteInfoGridProps> = ({
  email,
  telefone,
  filialNome,
  tipoDocumento,
  numeroDocumento,
  genero,
  onWhatsAppClick,
  registradorInfo,
  hasRegistrador
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{email}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {telefone}
          <Button
            variant="link"
            className="text-olimpics-green-primary p-0 h-auto ml-2"
            onClick={() => onWhatsAppClick(telefone)}
          >
            WhatsApp
          </Button>
        </span>
      </div>

      {filialNome && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{filialNome}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {tipoDocumento}: {numeroDocumento}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">Gênero: {genero}</span>
      </div>

      {hasRegistrador && registradorInfo && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm">
            <h4 className="font-medium text-muted-foreground mb-2">Informações do Responsável:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{registradorInfo.nome_completo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{registradorInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {registradorInfo.telefone}
                  <Button
                    variant="link"
                    className="text-olimpics-green-primary p-0 h-auto ml-2"
                    onClick={() => onWhatsAppClick(registradorInfo.telefone)}
                  >
                    WhatsApp
                  </Button>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

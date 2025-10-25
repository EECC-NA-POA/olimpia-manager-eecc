
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { UserPlus2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleteModality } from "@/lib/api";

interface AthleteCardHeaderProps {
  nome: string;
  isCurrentUser: boolean;
  hasRegistrador: boolean;
  statusPagamento: string;
  getStatusBadgeStyle: (status: string) => string;
  modalidades?: AthleteModality[];
  isDependent: boolean;
}

export const AthleteCardHeader: React.FC<AthleteCardHeaderProps> = ({
  nome,
  isCurrentUser,
  isDependent,
  statusPagamento,
  getStatusBadgeStyle,
  modalidades = [],
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-foreground">{nome}</h3>
          {isCurrentUser && (
            <Badge variant="secondary" className="bg-olimpics-orange-primary text-white">
              Meu Cadastro
            </Badge>
          )}
          {isDependent && (
            <Badge variant="secondary" className="bg-blue-500 text-white">
              <UserPlus2 className="h-3 w-3 mr-1" />
              Dependente
            </Badge>
          )}
        </div>
        <Badge className={cn("capitalize", getStatusBadgeStyle(statusPagamento))}>
          {statusPagamento}
        </Badge>
      </div>
      {modalidades.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {modalidades.map((modalidade) => (
            <Badge
              key={modalidade.id}
              className={cn("capitalize text-xs", getStatusBadgeStyle(modalidade.status))}
            >
              {modalidade.modalidade}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

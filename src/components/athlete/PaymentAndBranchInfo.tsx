
import React from 'react';
import { CreditCard, Building2, MapPin } from "lucide-react";

interface PaymentAndBranchInfoProps {
  pagamento_status?: string;
  pagamento_valor?: number;
  filial_nome?: string;
  filial_cidade?: string;
  filial_estado?: string;
}

export default function PaymentAndBranchInfo({ 
  pagamento_status, 
  pagamento_valor,
  filial_nome,
  filial_cidade,
  filial_estado
}: PaymentAndBranchInfoProps) {
  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return 'Valor não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
          <CreditCard className="h-5 w-5" />
          Informações de Pagamento
        </h3>
        <div className="space-y-3">
          <p className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Status do Pagamento: {' '}
              <span className={`font-medium ${pagamento_status === 'confirmado' ? 'text-green-600' : pagamento_status === 'isento' ? 'text-blue-600' : 'text-orange-500'}`}>
                {pagamento_status === 'confirmado' ? 'Confirmado' : pagamento_status === 'isento' ? 'Isento' : 'Pendente'}
              </span>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Valor do Pagamento: {' '}
              <span className={`font-medium ${pagamento_status === 'confirmado' ? 'text-green-600' : pagamento_status === 'isento' ? 'text-blue-600' : 'text-orange-500'}`}>
                {pagamento_status === 'isento' ? 'Isento' : formatCurrency(pagamento_valor)}
              </span>
            </span>
          </p>
        </div>
      </div>

      {filial_nome && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
            <Building2 className="h-5 w-5" />
            Informações da Filial
          </h3>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{filial_nome}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {filial_cidade}, {filial_estado}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

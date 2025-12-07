
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Coins, Users, Shield } from "lucide-react";
import { formatToCurrency } from "@/utils/formatters";

interface SummaryCardsProps {
  totals: {
    inscricoes: number;
    pago: number;
    pendente: number;
    isento?: number;
  };
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4 w-full max-w-full">
      <Card className="hover:shadow-lg transition-shadow min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Total de Inscritos
            </CardTitle>
          </div>
          <Users className="h-4 w-4 text-olimpics-green-primary flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold">{totals.inscricoes.toLocaleString()}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
            Inscrições confirmadas e pendentes
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Total Pago
            </CardTitle>
          </div>
          <Coins className="h-4 w-4 text-green-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
            {formatToCurrency(totals.pago)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
            Pagamentos já confirmados
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow min-w-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Total Pendente
            </CardTitle>
          </div>
          <Activity className="h-4 w-4 text-yellow-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600 truncate">
            {formatToCurrency(totals.pendente)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
            Pagamentos aguardando confirmação
          </p>
        </CardContent>
      </Card>

      {totals.isento !== undefined && totals.isento > 0 && (
        <Card className="hover:shadow-lg transition-shadow min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Total Isentos
              </CardTitle>
            </div>
            <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {totals.isento.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
              Atletas isentos de pagamento
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

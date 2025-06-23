
import { BranchAnalytics } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Coins, Users, Shield } from "lucide-react";
import { formatToCurrency } from "@/utils/formatters";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface InfoIconProps {
  tooltip: string;
}

const InfoIcon = ({ tooltip }: InfoIconProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="ml-2 cursor-help">
        <Activity className="h-4 w-4 text-muted-foreground opacity-70" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Inscritos
              <InfoIcon tooltip="Número total de atletas inscritos no evento" />
            </CardTitle>
          </div>
          <Users className="h-4 w-4 text-olimpics-green-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.inscricoes.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Inscrições confirmadas e pendentes
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pago
              <InfoIcon tooltip="Valor total confirmado em pagamentos" />
            </CardTitle>
          </div>
          <Coins className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatToCurrency(totals.pago)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pagamentos já confirmados
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendente
              <InfoIcon tooltip="Valor total pendente de confirmação" />
            </CardTitle>
          </div>
          <Activity className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatToCurrency(totals.pendente)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pagamentos aguardando confirmação
          </p>
        </CardContent>
      </Card>

      {totals.isento !== undefined && totals.isento > 0 && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Isentos
                <InfoIcon tooltip="Número de atletas isentos de pagamento" />
              </CardTitle>
            </div>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totals.isento.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Atletas isentos de pagamento
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

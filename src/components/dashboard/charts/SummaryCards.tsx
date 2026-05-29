
import { Users, Coins, Clock, Gift } from "lucide-react";
import { formatToCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totals: {
    inscricoes: number;
    pago: number;
    pendente: number;
    isento?: number;
  };
}

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}

function KpiCard({ icon: Icon, label, value, sub, accent }: KpiCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-3 sm:p-4 flex flex-col gap-2", accent)}>
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-background/70 p-1.5 flex-shrink-0">
          <Icon className="h-3.5 w-3.5 text-foreground/70" />
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight">{label}</p>
      </div>
      <div>
        <p className="text-base sm:text-xl font-bold text-foreground leading-tight break-all">{value}</p>
        {sub && <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  const showIsento = (totals.isento ?? 0) > 0;

  return (
    <div className={cn(
      "grid gap-3",
      showIsento ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
    )}>
      <KpiCard
        icon={Users}
        label="Total de Inscritos"
        value={totals.inscricoes.toLocaleString('pt-BR')}
        sub="confirmados + pendentes"
        accent=""
      />
      <KpiCard
        icon={Coins}
        label="Total Pago"
        value={formatToCurrency(totals.pago)}
        accent="border-emerald-200"
      />
      <KpiCard
        icon={Clock}
        label="Total Pendente"
        value={formatToCurrency(totals.pendente)}
        accent="border-amber-200"
      />
      {showIsento && (
        <KpiCard
          icon={Gift}
          label="Isentos"
          value={String(totals.isento)}
          sub="sem cobrança"
          accent="border-sky-200"
        />
      )}
    </div>
  );
}

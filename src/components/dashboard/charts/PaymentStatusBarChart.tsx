import { CheckCircle2, Clock, XCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatusData {
  name: string;
  confirmado: number;
  pendente: number;
  cancelado: number;
  isento: number;
  total: number;
  confirmadoPct: number;
  pendentePct: number;
  canceladoPct: number;
  isentoPct: number;
}

interface PaymentStatusBarChartProps {
  data: PaymentStatusData[];
  chartConfig?: any;
  title?: string;
  description?: string;
}

const STATUS = [
  { key: 'confirmado' as const, pctKey: 'confirmadoPct' as const, label: 'Confirmado', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle2 },
  { key: 'pendente'   as const, pctKey: 'pendentePct'   as const, label: 'Pendente',   color: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  Icon: Clock },
  { key: 'isento'     as const, pctKey: 'isentoPct'     as const, label: 'Isento',     color: 'bg-sky-500',    text: 'text-sky-700',    bg: 'bg-sky-50',    border: 'border-sky-200',    Icon: Shield },
  { key: 'cancelado'  as const, pctKey: 'canceladoPct'  as const, label: 'Cancelado',  color: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    Icon: XCircle },
] as const;

export function PaymentStatusBarChart({ data }: PaymentStatusBarChartProps) {
  if (!data || data.length === 0) return null;

  const d = data[0];
  const visible = STATUS.filter(s => d[s.key] > 0);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Mini-cards por status */}
      <div className={cn(
        "grid gap-3",
        visible.length === 1 ? "grid-cols-1" :
        visible.length === 2 ? "grid-cols-2" :
        visible.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
      )}>
        {visible.map(s => (
          <div key={s.key} className={cn("rounded-xl border p-3 flex items-center gap-3", s.bg, s.border)}>
            <s.Icon className={cn("h-5 w-5 flex-shrink-0", s.text)} />
            <div className="min-w-0">
              <p className={cn("text-xl font-bold leading-none", s.text)}>{d[s.key]}</p>
              <p className={cn("text-xs mt-0.5 font-medium", s.text)}>{s.label}</p>
              <p className="text-[11px] text-muted-foreground">{d[s.pctKey].toFixed(0)}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra segmentada */}
      <div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {visible.map(s => (
            <div
              key={s.key}
              className={cn("h-full transition-all", s.color)}
              style={{ width: `${d[s.pctKey]}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
          <span className="flex gap-2">
            {visible.map(s => (
              <span key={s.key} className="flex items-center gap-1">
                <span className={cn("inline-block h-2 w-2 rounded-full", s.color)} />
                {s.label}
              </span>
            ))}
          </span>
          <span className="font-medium">{d.total} total</span>
        </div>
      </div>
    </div>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList
} from "recharts";
import { BranchAnalytics } from "@/types/api";

interface Props {
  data: BranchAnalytics[];
}

const STATUS_SEGMENTS = [
  { key: 'confirmado', label: 'Confirmada', color: '#10b981' },
  { key: 'pendente',   label: 'Pendente',   color: '#f59e0b' },
  { key: 'cancelado',  label: 'Cancelada',  color: '#f87171' },
  { key: 'rejeitado',  label: 'Rejeitada',  color: '#9ca3af' },
] as const;

type StatusKey = typeof STATUS_SEGMENTS[number]['key'];

interface ModalityRow {
  name: string;
  confirmado: number;
  pendente: number;
  cancelado: number;
  rejeitado: number;
  total: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const row: ModalityRow = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {STATUS_SEGMENTS.filter(s => row[s.key] > 0).map(s => (
        <p key={s.key} className="text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}: {row[s.key]}
        </p>
      ))}
      <p className="text-foreground font-medium mt-1">Total: {row.total}</p>
    </div>
  );
}

export function ModalitiesChart({ data }: Props) {
  // modalidades_populares is event-wide and repeated identically in every branch
  // row, with one entry per (modalidade × filial × status da inscrição) — so read
  // one row, keep only the branches being displayed, and SUM the slices.
  const selectedBranches = new Set(data.map(b => b.filial));
  const source = data[0]?.modalidades_populares || [];

  const map = new Map<string, ModalityRow>();
  source.forEach(m => {
    if (m.filial && !selectedBranches.has(m.filial)) return;
    // status_pagamento fallback keeps the chart working until the view migration runs
    const status = (m.status_inscricao ?? m.status_pagamento ?? 'pendente') as StatusKey;
    if (!map.has(m.modalidade)) {
      map.set(m.modalidade, { name: m.modalidade, confirmado: 0, pendente: 0, cancelado: 0, rejeitado: 0, total: 0 });
    }
    const row = map.get(m.modalidade)!;
    if (status in row) {
      row[status] += m.total_inscritos;
    }
    row.total += m.total_inscritos;
  });

  if (map.size === 0) return null;

  const sorted = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const visibleSegments = STATUS_SEGMENTS.filter(s => sorted.some(row => row[s.key] > 0));
  const lastSegmentKey = visibleSegments[visibleSegments.length - 1]?.key;

  const chartHeight = sorted.length * 36 + 20;

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 12, fill: '#555' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#e6f7ee' }} />
          {visibleSegments.map(s => (
            <Bar key={s.key} dataKey={s.key} stackId="status" name={s.label} fill={s.color} barSize={20}>
              {s.key === lastSegmentKey && (
                <LabelList
                  dataKey="total"
                  position="right"
                  style={{ fontSize: 12, fontWeight: 600, fill: '#555' }}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pl-1">
        {visibleSegments.map(s => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

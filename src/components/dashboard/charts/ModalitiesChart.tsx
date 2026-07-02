import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from "recharts";
import { BranchAnalytics } from "@/types/api";

interface Props {
  data: BranchAnalytics[];
}

const BRAND = "#009B40";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} inscritos</p>
    </div>
  );
}

export function ModalitiesChart({ data }: Props) {
  // modalidades_populares is event-wide and repeated identically in every branch
  // row, with one entry per (modalidade × filial × status_pagamento) — so read
  // one row, keep only the branches being displayed, and SUM the slices.
  const selectedBranches = new Set(data.map(b => b.filial));
  const source = data[0]?.modalidades_populares || [];
  const map = new Map<string, number>();
  source.forEach(m => {
    if (m.filial && !selectedBranches.has(m.filial)) return;
    map.set(m.modalidade, (map.get(m.modalidade) ?? 0) + m.total_inscritos);
  });

  if (map.size === 0) return null;

  const sorted = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const chartHeight = sorted.length * 36 + 20;

  return (
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
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={BRAND} opacity={Math.max(0.4, 1 - i * 0.055)} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            style={{ fontSize: 12, fontWeight: 600, fill: '#555' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

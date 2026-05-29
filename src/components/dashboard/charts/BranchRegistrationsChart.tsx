import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

export interface BranchRegistrationData {
  name: string;
  confirmados: number;
  pendentes: number;
  cancelados?: number;
  isentos?: number;
  total: number;
}

interface Props {
  data: BranchRegistrationData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="text-xs">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function BranchRegistrationsChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  const hasCancelados = data.some(d => (d.cancelados ?? 0) > 0);
  const hasIsentos    = data.some(d => (d.isentos    ?? 0) > 0);

  // Shorten branch names for the axis
  const display = data.map(d => ({
    ...d,
    name: d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name,
  }));

  const chartH = Math.max(200, data.length * 60);

  return (
    <ResponsiveContainer width="100%" height={chartH}>
      <BarChart
        data={display}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fill: '#555' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar dataKey="confirmados" name="Confirmados" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
        <Bar dataKey="pendentes"   name="Pendentes"   fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
        {hasIsentos    && <Bar dataKey="isentos"    name="Isentos"    fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={12} />}
        {hasCancelados && <Bar dataKey="cancelados" name="Cancelados" fill="#f87171" radius={[0, 4, 4, 0]} barSize={12} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

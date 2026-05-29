
import { BranchAnalytics } from "@/types/api";
import { SummaryCards } from "../charts/SummaryCards";
import { PaymentStatusBarChart } from "../charts/PaymentStatusBarChart";
import { BranchRegistrationsChart } from "../charts/BranchRegistrationsChart";
import { ModalitiesChart } from "../charts/ModalitiesChart";
import { transformPaymentStatusData, transformBranchRegistrationsData } from "../charts/dataTransformers";

interface StatisticsTabProps {
  data: BranchAnalytics[];
  currentBranchId?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function StatisticsTab({ data, currentBranchId }: StatisticsTabProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center py-16 text-sm text-muted-foreground">
        Não há dados estatísticos disponíveis para este evento.
      </p>
    );
  }

  const filteredData = currentBranchId
    ? data.filter(item => item.filial_id === currentBranchId)
    : data;

  if (filteredData.length === 0) {
    return (
      <p className="text-center py-16 text-sm text-muted-foreground">
        Não há dados disponíveis para esta filial.
      </p>
    );
  }

  // ── Totals ──────────────────────────────────────────────────
  const totals = filteredData.reduce(
    (acc, b) => {
      acc.inscricoes += b.total_inscritos_geral;
      acc.pago       += Number(b.valor_total_pago) || 0;
      acc.pendente   += Number(b.valor_total_pendente) || 0;
      b.inscritos_por_status_pagamento.forEach(s => {
        if (s.status_pagamento === 'isento') acc.isento += s.quantidade;
      });
      return acc;
    },
    { inscricoes: 0, pago: 0, pendente: 0, isento: 0 }
  );

  // For delegation single-branch view, use raw branch values to avoid double-counting
  const branchRecord = currentBranchId ? filteredData[0] : undefined;
  if (branchRecord) {
    totals.inscricoes = Number(branchRecord.total_inscritos_geral) || 0;
    totals.pago       = Number(branchRecord.valor_total_pago)      || 0;
    totals.pendente   = Number(branchRecord.valor_total_pendente)  || 0;
  }

  const paymentData       = transformPaymentStatusData(filteredData, {});
  const branchData        = transformBranchRegistrationsData(filteredData);
  const showBranchChart   = branchData.length > 1;

  // Check if modalities data exists
  const hasModalities = filteredData.some(b => (b.modalidades_populares?.length ?? 0) > 0);

  // Categories — event-wide totals repeated per branch row, read only from first record
  const categoryMap = new Map<string, number>();
  (filteredData[0]?.atletas_por_categoria || []).forEach(c => {
    categoryMap.set(c.categoria, c.quantidade);
  });
  const hasCategories = categoryMap.size > 0;

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <SummaryCards totals={totals} />

      {/* Payment status */}
      <Section title="Status de Inscrições">
        <PaymentStatusBarChart data={paymentData} />
      </Section>

      {/* Modalities */}
      {hasModalities && (
        <Section title="Inscrições por Modalidade">
          <ModalitiesChart data={filteredData} />
        </Section>
      )}

      {/* Categories */}
      {hasCategories && (
        <Section title="Atletas por Categoria">
          <div className="space-y-1.5">
            {Array.from(categoryMap.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([cat, qty]) => {
                const max = Math.max(...categoryMap.values());
                return (
                  <div key={cat} className="flex items-center gap-3 text-sm">
                    <span className="w-28 flex-shrink-0 text-xs text-muted-foreground truncate">{cat}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-olimpics-green-primary rounded-full"
                        style={{ width: `${(qty / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold text-foreground">{qty}</span>
                  </div>
                );
              })}
          </div>
        </Section>
      )}

      {/* Branch breakdown — only if multiple branches */}
      {showBranchChart && (
        <Section title="Inscrições por Filial">
          <BranchRegistrationsChart data={branchData} />
        </Section>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp } from "lucide-react";

import { adminDashboard } from "../../services/adminService";
import { Alert, Badge, PageHeader, PageLoader, btnSecondary, card, inputCls } from "../../components/common/ui";
import { getApiError, money, toDateInput } from "../../utils/format";
import type { DailySales, DashboardSummary, LowStockProduct, TopProduct } from "../../types/dashboard";

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return toDateInput(d); };

const addDays = (yyyyMmDd: string, n: number) => {
  const d = new Date(`${yyyyMmDd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000) + 1;

const startOfMonth = (offset = 0) => { const d = new Date(); return toDateInput(new Date(Date.UTC(d.getFullYear(), d.getMonth() + offset, 1))); };
const endOfMonth = (offset = 0) => { const d = new Date(); return toDateInput(new Date(Date.UTC(d.getFullYear(), d.getMonth() + offset + 1, 0))); };

const PRESETS = [
  { label: "7 days", range: () => [daysAgo(6), daysAgo(0)] },
  { label: "30 days", range: () => [daysAgo(29), daysAgo(0)] },
  { label: "90 days", range: () => [daysAgo(89), daysAgo(0)] },
  { label: "This month", range: () => [startOfMonth(), daysAgo(0)] },
  { label: "Last month", range: () => [startOfMonth(-1), endOfMonth(-1)] },
];

/** % change vs the previous period of the same length; null when there is nothing to compare */
function Delta({ now, before }: { now: number; before?: number }) {
  if (before === undefined) return null;
  if (before === 0) return now === 0 ? null : <span className="text-xs font-medium text-slate-400">new</span>;
  const pct = ((now - before) / before) * 100;
  if (Math.abs(pct) < 0.05) return <span className="whitespace-nowrap text-xs text-slate-400">no change</span>;
  const up = pct > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold ${up ? "text-green-600" : "text-red-600"}`}>
      <Icon size={13} /> {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function Stat({ label, value, hint, delta }: { label: string; value: string; hint?: string; delta?: React.ReactNode }) {
  return (
    <div className={`${card} p-5`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {delta}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SalesChart({ data }: { data: DailySales[] }) {
  const max = Math.max(1, ...data.map((d) => d.sales));
  const W = 720, H = 180, gap = 2;
  const bar = Math.max(2, (W - gap * data.length) / Math.max(1, data.length));
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label="Sales per day">
      {data.map((d, i) => {
        const h = (d.sales / max) * H;
        return (
          <g key={d.date}>
            <rect x={i * (bar + gap)} y={H - h} width={bar} height={Math.max(h, d.sales > 0 ? 2 : 0)} rx={2} className="fill-slate-800">
              <title>{`${d.date.slice(0, 10)}: ${money(d.sales)} (${d.orders} orders)`}</title>
            </rect>
          </g>
        );
      })}
      <line x1={0} y1={H} x2={W} y2={H} className="stroke-slate-200" />
      {data.length > 0 && (
        <>
          <text x={0} y={H + 16} className="fill-slate-400 text-[11px]">{data[0].date.slice(0, 10)}</text>
          <text x={W} y={H + 16} textAnchor="end" className="fill-slate-400 text-[11px]">{data[data.length - 1].date.slice(0, 10)}</text>
        </>
      )}
    </svg>
  );
}

export default function AdminDashboard() {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(daysAgo(0));
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [previous, setPrevious] = useState<DashboardSummary | null>(null);
  const [sales, setSales] = useState<DailySales[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [low, setLow] = useState<LowStockProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const length = daysBetween(from, to);
    const prevTo = addDays(from, -1);
    const prevFrom = addDays(prevTo, -(length - 1));
    Promise.all([
      adminDashboard.summary(from, to),
      adminDashboard.salesByDay(from, to),
      adminDashboard.topProducts(from, to, 5),
      adminDashboard.lowStock(5, 10),
      adminDashboard.summary(prevFrom, prevTo).catch(() => null), // comparison is optional
    ])
      .then(([s, d, t, l, prev]) => {
        if (cancelled) return;
        setSummary(s); setSales(d); setTop(t); setLow(l); setPrevious(prev); setError("");
      })
      .catch((e) => !cancelled && setError(getApiError(e, "Unable to load the dashboard.")))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [from, to]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Sales and stock at a glance."
        actions={
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {PRESETS.map((p) => {
              const [f, t] = p.range();
              const active = f === from && t === to;
              return (
                <button key={p.label} type="button" onClick={() => { setFrom(f); setTo(t); }}
                  className={active ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white" : btnSecondary + " !px-3 !py-2"}
                  aria-pressed={active}>{p.label}</button>
              );
            })}
            <input type="date" className={`${inputCls} !w-40`} value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} aria-label="From" />
            <span className="text-slate-400">to</span>
            <input type="date" className={`${inputCls} !w-40`} value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} aria-label="To" />
          </div>
        }
      />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {loading && !summary ? <PageLoader /> : summary && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Gross sales" value={money(summary.grossSales)} hint="excl. cancelled orders" delta={<Delta now={summary.grossSales} before={previous?.grossSales} />} />
            <Stat label="Collected" value={money(summary.collectedRevenue)} hint="payments marked paid" delta={<Delta now={summary.collectedRevenue} before={previous?.collectedRevenue} />} />
            <Stat label="Outstanding" value={money(summary.outstandingPayments)} hint="payments still pending" />
            <Stat label="Avg order value" value={money(summary.averageOrderValue)} delta={<Delta now={summary.averageOrderValue} before={previous?.averageOrderValue} />} />
            <Stat label="Orders" value={String(summary.totalOrders)} hint={`${summary.cancelledOrders} cancelled`} delta={<Delta now={summary.totalOrders} before={previous?.totalOrders} />} />
            <Stat label="New customers" value={String(summary.newCustomers)} delta={<Delta now={summary.newCustomers} before={previous?.newCustomers} />} />
            <Stat label="Refunds due" value={String(summary.refundsDue)} hint="paid orders that were cancelled" />
          </div>

          <div className={`${card} p-5`}>
            <h2 className="mb-3 font-semibold text-slate-900">Sales per day <span className="text-xs font-normal text-slate-400">· changes compare with the previous {daysBetween(from, to)} days</span></h2>
            <SalesChart data={sales} />
          </div>

          <div className={`${card} p-5`}>
            <h2 className="mb-3 font-semibold text-slate-900">Orders by status</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary.ordersByStatus).map(([status, n]) => (
                <Link key={status} to={`/admin/orders?status=${status}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 hover:border-slate-400">
                  <Badge value={status} /> <span className="font-semibold text-slate-900">{n}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={`${card} p-5`}>
              <h2 className="mb-3 font-semibold text-slate-900">Top products</h2>
              {top.length === 0 ? <p className="text-sm text-slate-500">No sales in this period.</p> : (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {top.map((p) => (
                      <tr key={p.productId}>
                        <td className="py-2 pr-2 font-medium text-slate-900">{p.productName}</td>
                        <td className="py-2 text-right text-slate-500">{p.unitsSold} sold</td>
                        <td className="py-2 pl-3 text-right font-semibold">{money(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className={`${card} p-5`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Low stock</h2>
                <Link to="/admin/inventory" className="text-sm text-slate-600 hover:underline">Manage</Link>
              </div>
              {low.length === 0 ? <p className="text-sm text-slate-500">Nothing is running low.</p> : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {low.map((p) => (
                    <li key={p.productId} className="flex items-center justify-between py-2">
                      <span><span className="font-medium text-slate-900">{p.name}</span> <span className="text-slate-400">· {p.categoryName}</span></span>
                      <span className={p.stockQuantity === 0 ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>{p.stockQuantity} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

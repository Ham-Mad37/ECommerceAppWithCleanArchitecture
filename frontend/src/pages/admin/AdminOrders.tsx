import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Search } from "lucide-react";

import Pagination from "../../components/common/Pagination";
import { ListSkeleton } from "../../components/common/Skeleton";
import { adminOrders } from "../../services/adminService";
import { Alert, Badge, Empty, PageHeader, btnPrimary, btnSecondary, card, inputCls } from "../../components/common/ui";
import { downloadCsv } from "../../utils/csv";
import { formatDate, getApiError, money } from "../../utils/format";
import type { PagedResult } from "../../types/common";
import type { AdminOrderFilters, AdminOrderListItem, OrderStatus } from "../../types/order";

const STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAGE_SIZE = 15;
const FETCH_SIZE = 100;
const MAX_FETCH_PAGES = 20; // safety cap: 2,000 orders for search / export

// one valid next step per status - same order flow as the backend
const nextStep = (o: AdminOrderListItem) => {
  switch (o.status) {
    case "Pending": return { label: "Approve", act: () => adminOrders.confirm(o.id) };
    case "Confirmed": return { label: "Start processing", act: () => adminOrders.startProcessing(o.id) };
    case "Processing": return { label: "Ship", act: () => adminOrders.ship(o.id) };
    case "Shipped": return { label: "Deliver", act: () => adminOrders.deliver(o.id) };
    default: return null;
  }
};

/** loads every page of orders for the given filters (used by search and CSV export) */
async function fetchAll(filters: AdminOrderFilters): Promise<AdminOrderListItem[]> {
  const out: AdminOrderListItem[] = [];
  for (let page = 1; page <= MAX_FETCH_PAGES; page++) {
    const res = await adminOrders.list({ ...filters, page, pageSize: FETCH_SIZE });
    out.push(...res.items);
    if (page >= res.totalPages) break;
  }
  return out;
}

const matches = (o: AdminOrderListItem, q: string) => {
  const needle = q.trim().toLowerCase().replace(/^#/, "");
  if (!needle) return true;
  return String(o.id) === needle || o.customerName.toLowerCase().includes(needle) || o.customerEmail.toLowerCase().includes(needle);
};

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "") as OrderStatus | "";
  const customerId = params.get("customerId") ? Number(params.get("customerId")) : undefined;
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const q = params.get("q") ?? "";

  const [page, setPage] = useState(1);
  const [paged, setPaged] = useState<PagedResult<AdminOrderListItem> | null>(null); // normal mode
  const [all, setAll] = useState<AdminOrderListItem[] | null>(null);               // search mode
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filters = useMemo<AdminOrderFilters>(() => ({ status, customerId, from, to }), [status, customerId, from, to]);
  const searching = q.trim() !== "";

  const load = useCallback(async () => {
    try {
      setError("");
      if (searching) { setAll(await fetchAll(filters)); setPaged(null); }
      else { setPaged(await adminOrders.list({ ...filters, page, pageSize: PAGE_SIZE })); setAll(null); }
    } catch (e) { setError(getApiError(e, "Unable to load orders.")); }
  }, [filters, page, searching]);
  useEffect(() => { setSelected(new Set()); void load(); }, [load]);

  // ---- what the table shows ----
  const view = useMemo(() => {
    if (paged) return { items: paged.items, totalPages: paged.totalPages, count: paged.totalCount, page: paged.pageNumber };
    const hits = (all ?? []).filter((o) => matches(o, q));
    const totalPages = Math.max(Math.ceil(hits.length / PAGE_SIZE), 1);
    const p = Math.min(page, totalPages);
    return { items: hits.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE), totalPages, count: hits.length, page: p };
  }, [paged, all, q, page]);

  const loaded = paged !== null || all !== null;

  // ---- filters (kept in the URL) ----
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };
  const [searchText, setSearchText] = useState(q);
  useEffect(() => setSearchText(q), [q]);
  const timer = useRef<number | undefined>(undefined);
  const onSearch = (v: string) => {
    setSearchText(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFilter("q", v.trim()), 350);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // ---- actions ----
  const advanceable = view.items.filter((o) => nextStep(o));
  const allTicked = advanceable.length > 0 && advanceable.every((o) => selected.has(o.id));
  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(allTicked ? new Set() : new Set(advanceable.map((o) => o.id)));

  const advanceMany = async (orders: AdminOrderListItem[]) => {
    setBusy(true); setError(""); setNotice("");
    const failed: string[] = [];
    let done = 0;
    for (const o of orders) {
      const step = nextStep(o);
      if (!step) continue;
      try { await step.act(); done++; }
      catch (e) { failed.push(`#${o.id}: ${getApiError(e, "rejected")}`); }
    }
    await load();
    setSelected(new Set());
    if (done) setNotice(`${done} order${done === 1 ? "" : "s"} updated.`);
    if (failed.length) setError(`Could not update ${failed.join(" · ")}`);
    setBusy(false);
  };

  const exportCsv = async () => {
    try {
      setBusy(true); setError("");
      const rows = (await fetchAll(filters)).filter((o) => matches(o, q));
      downloadCsv(
        `orders-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Order", "Date", "Customer", "Email", "Status", "Payment method", "Payment status", "Total"],
        rows.map((o) => [o.id, o.createdAt.slice(0, 10), o.customerName, o.customerEmail, o.status, o.paymentMethod ?? "", o.paymentStatus ?? "", o.total])
      );
      setNotice(`Exported ${rows.length} orders.`);
    } catch (e) { setError(getApiError(e, "Export failed.")); }
    finally { setBusy(false); }
  };

  const hasFilters = status || from || to || customerId || q;

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${view.count} order${view.count === 1 ? "" : "s"}`}
        actions={<button className={btnSecondary} disabled={busy || !loaded} onClick={exportCsv}><Download size={16} /> Export CSV</button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${inputCls} pl-9`} value={searchText} onChange={(e) => onSearch(e.target.value)} placeholder="Order # or customer..." aria-label="Search orders" />
        </div>
        <select className={`${inputCls} !w-44`} value={status} onChange={(e) => setFilter("status", e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" className={`${inputCls} !w-44`} value={from} onChange={(e) => setFilter("from", e.target.value)} aria-label="From" />
        <input type="date" className={`${inputCls} !w-44`} value={to} onChange={(e) => setFilter("to", e.target.value)} aria-label="To" />
        {customerId && <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Customer #{customerId}</span>}
        {hasFilters && <button className={btnSecondary} onClick={() => { setParams({}, { replace: true }); setSearchText(""); setPage(1); }}>Clear</button>}
      </div>

      {selected.size > 0 && (
        <div className="fade-in mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
          <span className="text-sm font-medium text-slate-700">{selected.size} selected</span>
          <button className={btnPrimary} disabled={busy} onClick={() => advanceMany(view.items.filter((o) => selected.has(o.id)))}>
            {busy ? "Working..." : "Advance to next step"}
          </button>
          <button className={btnSecondary} disabled={busy} onClick={() => setSelected(new Set())}>Clear selection</button>
          <span className="text-xs text-slate-400">Each order moves one step (Pending → Confirmed → ...).</span>
        </div>
      )}

      {notice && <div className="mb-4"><Alert kind="success">{notice}</Alert></div>}
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      {!loaded ? <ListSkeleton rows={5} /> : view.items.length === 0 ? <Empty title="No orders match these filters" /> : (
        <>
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all actionable orders" checked={allTicked} onChange={toggleAll} disabled={advanceable.length === 0} className="h-4 w-4 accent-slate-900" /></th>
                  <th className="px-3 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {view.items.map((o) => {
                  const step = nextStep(o);
                  return (
                    <tr key={o.id} className={`hover:bg-slate-50 ${selected.has(o.id) ? "bg-slate-50" : ""}`}>
                      <td className="px-4 py-3">{step && <input type="checkbox" aria-label={`Select order ${o.id}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="h-4 w-4 accent-slate-900" />}</td>
                      <td className="px-3 py-3"><Link to={`/admin/orders/${o.id}`} className="font-semibold text-slate-900 hover:underline">#{o.id}</Link></td>
                      <td className="px-4 py-3"><div className="font-medium text-slate-900">{o.customerName}</div><div className="text-xs text-slate-500">{o.customerEmail}</div></td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3"><Badge value={o.status} /></td>
                      <td className="px-4 py-3">{o.paymentStatus ? <Badge value={o.paymentStatus} /> : <span className="text-slate-400">-</span>}</td>
                      <td className="px-4 py-3 text-right font-semibold">{money(o.total)}</td>
                      <td className="px-4 py-3 text-right">
                        {step
                          ? <button className={o.status === "Pending" ? btnPrimary : btnSecondary} disabled={busy} onClick={() => advanceMany([o])}>{step.label}</button>
                          : <span className="text-slate-400">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={view.page} totalPages={view.totalPages} hasPreviousPage={view.page > 1} hasNextPage={view.page < view.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";

import { adminDashboard } from "../../services/adminService";
import StockAdjustModal from "../../components/admin/StockAdjustModal";
import { Alert, Empty, PageHeader, PageLoader, btnSecondary, card, inputCls } from "../../components/common/ui";
import { getApiError } from "../../utils/format";
import type { LowStockProduct } from "../../types/dashboard";

export default function AdminInventory() {
  const [threshold, setThreshold] = useState(10);
  const [items, setItems] = useState<LowStockProduct[] | null>(null);
  const [error, setError] = useState("");
  const [adjusting, setAdjusting] = useState<LowStockProduct | null>(null);

  const load = useCallback(async () => {
    try { setItems(await adminDashboard.lowStock(threshold, 200)); setError(""); }
    catch (e) { setError(getApiError(e, "Unable to load inventory.")); }
  }, [threshold]);
  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Active products at or below the stock threshold." actions={
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Threshold
          <input type="number" min={0} max={10000} className={`${inputCls} !w-24`} value={threshold}
            onChange={(e) => setThreshold(Math.max(0, Math.min(10000, Number(e.target.value) || 0)))} />
        </label>
      } />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {!items ? <PageLoader /> : items.length === 0 ? <Empty title="Everything is well stocked" /> : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">In stock</th><th className="px-5 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => (
                <tr key={p.productId}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3 text-slate-600">{p.categoryName}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${p.stockQuantity === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stockQuantity}</td>
                  <td className="px-5 py-3 text-right"><button className={btnSecondary} onClick={() => setAdjusting(p)}>Adjust</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <StockAdjustModal
        product={adjusting ? { id: adjusting.productId, name: adjusting.name, stockQuantity: adjusting.stockQuantity } : null}
        onClose={() => setAdjusting(null)}
        onSaved={load}
      />
    </div>
  );
}

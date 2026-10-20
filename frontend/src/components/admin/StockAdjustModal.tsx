import { useState, type FormEvent } from "react";

import { adminProducts } from "../../services/adminService";
import { Alert, Field, Modal, btnPrimary, btnSecondary, inputCls } from "../common/ui";
import { getApiError } from "../../utils/format";

interface Props {
  product: { id: number; name: string; stockQuantity: number } | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Positive number adds stock, negative removes it (PATCH /products/{id}/stock). */
export default function StockAdjustModal({ product, onClose, onSaved }: Props) {
  const [delta, setDelta] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const amount = Number(delta);
  const valid = Number.isInteger(amount) && amount !== 0 && (product ? product.stockQuantity + amount >= 0 : false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !valid) return;
    try {
      setSaving(true);
      await adminProducts.adjustStock(product.id, amount);
      setDelta("");
      setError("");
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err, "Unable to adjust stock."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={product !== null} title="Adjust stock" onClose={onClose}>
      {product && (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <p className="text-sm text-slate-600">
            <strong>{product.name}</strong> currently has <strong>{product.stockQuantity}</strong> in stock.
          </p>
          <Field label="Change" hint="Use 25 to add 25 units, or -3 to remove 3.">
            <input type="number" step={1} className={inputCls} value={delta} onChange={(e) => setDelta(e.target.value)} autoFocus required />
          </Field>
          {delta !== "" && valid && (
            <p className="text-sm text-slate-500">New stock: <strong>{product.stockQuantity + amount}</strong></p>
          )}
          {delta !== "" && !valid && <p className="text-sm text-red-600">Enter a whole number that doesn't take stock below zero.</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={onClose}>Cancel</button>
            <button className={btnPrimary} disabled={!valid || saving}>{saving ? "Saving..." : "Apply"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

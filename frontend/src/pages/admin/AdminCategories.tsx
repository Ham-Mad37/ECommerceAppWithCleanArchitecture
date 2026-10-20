import { useCallback, useEffect, useState, type FormEvent } from "react";

import { adminCategories } from "../../services/adminService";
import { Alert, Badge, Empty, Modal, PageHeader, PageLoader, Field, btnPrimary, btnSecondary, card, inputCls } from "../../components/common/ui";
import { getApiError } from "../../utils/format";
import type { CategoryList } from "../../types/category";

export default function AdminCategories() {
  const [items, setItems] = useState<CategoryList[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CategoryList | "new" | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try { setItems(await adminCategories.list()); setError(""); }
    catch (e) { setError(getApiError(e, "Unable to load categories.")); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const open = (c: CategoryList | "new") => { setName(c === "new" ? "" : c.name); setFormError(""); setEditing(c); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing === "new") await adminCategories.create(name.trim());
      else if (editing) await adminCategories.update(editing.id, name.trim());
      setEditing(null);
      await load();
    } catch (err) { setFormError(getApiError(err, "Unable to save the category.")); }
    finally { setSaving(false); }
  };

  const toggle = async (c: CategoryList) => {
    try { await (c.isActive ? adminCategories.deactivate(c.id) : adminCategories.activate(c.id)); await load(); }
    catch (e) { setError(getApiError(e, "Unable to change the category.")); }
  };

  return (
    <div>
      <PageHeader title="Categories" subtitle="Inactive categories are hidden from the store." actions={<button className={btnPrimary} onClick={() => open("new")}>New category</button>} />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {!items ? <PageLoader /> : items.length === 0 ? <Empty title="No categories yet" /> : (
        <div className={`${card} overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3"><Badge value={c.isActive ? "Active" : "Inactive"} /></td>
                  <td className="px-5 py-3 text-right">
                    <button className="mr-4 font-medium text-slate-700 hover:underline" onClick={() => open(c)}>Rename</button>
                    <button className="font-medium text-slate-700 hover:underline" onClick={() => toggle(c)}>{c.isActive ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} title={editing === "new" ? "New category" : "Rename category"} onClose={() => setEditing(null)}>
        <form onSubmit={submit} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus /></Field>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
            <button className={btnPrimary} disabled={saving || !name.trim()}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

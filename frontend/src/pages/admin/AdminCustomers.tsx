import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { adminCustomers } from "../../services/adminService";
import { Alert, Badge, Empty, Field, Modal, PageHeader, PageLoader, btnPrimary, btnSecondary, card, inputCls } from "../../components/common/ui";
import { getApiError } from "../../utils/format";
import type { CustomerListItem } from "../../types/customer";

export default function AdminCustomers() {
  const [items, setItems] = useState<CustomerListItem[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CustomerListItem | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try { setItems(await adminCustomers.list()); setError(""); }
    catch (e) { setError(getApiError(e, "Unable to load customers.")); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((c) => !q || `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q));
  }, [items, query]);

  const open = (c: CustomerListItem) => { setEditing(c); setFirst(c.firstName); setLast(c.lastName); setFormError(""); };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      await adminCustomers.update(editing.id, first.trim(), last.trim());
      setEditing(null);
      await load();
    } catch (err) { setFormError(getApiError(err, "Unable to save the customer.")); }
    finally { setSaving(false); }
  };

  const toggle = async (c: CustomerListItem) => {
    const verb = c.isActive ? "Deactivate" : "Activate";
    if (!window.confirm(`${verb} ${c.firstName} ${c.lastName}?`)) return;
    try { await (c.isActive ? adminCustomers.deactivate(c.id) : adminCustomers.activate(c.id)); await load(); }
    catch (e) { setError(getApiError(e, "Unable to change the customer.")); }
  };

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${items?.length ?? 0} registered`} actions={
        <input className={`${inputCls} !w-64`} placeholder="Search name or email..." value={query} onChange={(e) => setQuery(e.target.value)} />
      } />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {!items ? <PageLoader /> : filtered.length === 0 ? <Empty title="No customers found" /> : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.firstName} {c.lastName}</td>
                  <td className="px-5 py-3 text-slate-600">{c.email}</td>
                  <td className="px-5 py-3"><Badge value={c.isActive ? "Active" : "Inactive"} /></td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <Link to={`/admin/orders?customerId=${c.id}`} className="mr-4 font-medium text-slate-700 hover:underline">Orders</Link>
                    <button className="mr-4 font-medium text-slate-700 hover:underline" onClick={() => open(c)}>Edit</button>
                    <button className="font-medium text-slate-700 hover:underline" onClick={() => toggle(c)}>{c.isActive ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} title="Edit customer" onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <p className="text-sm text-slate-500">{editing?.email}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><input className={inputCls} value={first} onChange={(e) => setFirst(e.target.value)} required maxLength={100} /></Field>
            <Field label="Last name"><input className={inputCls} value={last} onChange={(e) => setLast(e.target.value)} required maxLength={100} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
            <button className={btnPrimary} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { addressService } from "../../services/addressService";
import { Alert, Empty, Field, Modal, PageLoader, btnDanger, btnPrimary, btnSecondary, card, inputCls } from "../../components/common/ui";
import { getApiError } from "../../utils/format";
import type { Address, AddressPayload } from "../../types/address";

const blank: AddressPayload = { recipientName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "" };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [form, setForm] = useState<AddressPayload>(blank);
  const [makeDefault, setMakeDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      setAddresses(await addressService.getAddresses());
      setError("");
    } catch (e) {
      setError(getApiError(e, "Unable to load your addresses."));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openNew = () => { setForm(blank); setMakeDefault(false); setFormError(""); setEditing("new"); };
  const openEdit = (a: Address) => {
    const { id: _id, isDefault: _d, ...rest } = a;
    void _id; void _d;
    setForm({ ...blank, ...rest, line2: rest.line2 ?? "", state: rest.state ?? "", postalCode: rest.postalCode ?? "" });
    setFormError(""); setEditing(a);
  };

  const set = (key: keyof AddressPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      setSaving(true);
      if (editing === "new") await addressService.createAddress({ ...form, makeDefault });
      else if (editing) await addressService.updateAddress(editing.id, form);
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(getApiError(err, "Unable to save the address."));
    } finally {
      setSaving(false);
    }
  };

  const run = async (action: () => Promise<void>) => {
    try { await action(); await load(); } catch (e) { setError(getApiError(e, "Action failed.")); }
  };

  if (!addresses && !error) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/profile" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={17} /> Profile</Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Addresses</h1>
        <button className={btnPrimary} onClick={openNew}><Plus size={17} /> Add address</button>
      </div>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <div className="space-y-4">
        {addresses?.length === 0 && <Empty title="No addresses yet">Add one to place your first order.</Empty>}
        {addresses?.map((a) => (
          <div key={a.id} className={`${card} flex flex-wrap items-start justify-between gap-4 p-5`}>
            <div className="flex gap-3">
              <MapPin className="mt-1 shrink-0 text-slate-400" size={20} />
              <div className="text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">
                  {a.recipientName}
                  {a.isDefault && <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">Default</span>}
                </p>
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p>{a.city}{a.state ? `, ${a.state}` : ""} {a.postalCode ?? ""}, {a.country}</p>
                <p>{a.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!a.isDefault && <button className={btnSecondary} onClick={() => run(() => addressService.setDefault(a.id))}><Star size={16} /> Make default</button>}
              <button className={btnSecondary} onClick={() => openEdit(a)} aria-label="Edit"><Pencil size={16} /></button>
              <button className={btnDanger} aria-label="Delete" onClick={() => window.confirm("Delete this address?") && run(() => addressService.deleteAddress(a.id))}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={editing !== null} title={editing === "new" ? "Add address" : "Edit address"} onClose={() => setEditing(null)}>
        <form onSubmit={submit} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <Field label="Recipient name"><input className={inputCls} value={form.recipientName} onChange={set("recipientName")} required maxLength={150} /></Field>
          <Field label="Phone" hint="Digits, spaces and dashes, 7-20 characters."><input className={inputCls} value={form.phone} onChange={set("phone")} required /></Field>
          <Field label="Address line 1"><input className={inputCls} value={form.line1} onChange={set("line1")} required maxLength={200} /></Field>
          <Field label="Address line 2 (optional)"><input className={inputCls} value={form.line2 ?? ""} onChange={set("line2")} maxLength={200} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City"><input className={inputCls} value={form.city} onChange={set("city")} required maxLength={100} /></Field>
            <Field label="State / region"><input className={inputCls} value={form.state ?? ""} onChange={set("state")} maxLength={100} /></Field>
            <Field label="Postal code"><input className={inputCls} value={form.postalCode ?? ""} onChange={set("postalCode")} maxLength={20} /></Field>
            <Field label="Country"><input className={inputCls} value={form.country} onChange={set("country")} required maxLength={100} /></Field>
          </div>
          {editing === "new" && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} /> Make this my default address
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
            <button className={btnPrimary} disabled={saving}>{saving ? "Saving..." : "Save address"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

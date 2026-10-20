import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Package, Pencil, Search, Star, Trash2 } from "lucide-react";

import Pagination from "../../components/common/Pagination";
import StockAdjustModal from "../../components/admin/StockAdjustModal";
import { Alert, Badge, Empty, Field, Modal, PageHeader, PageLoader, btnDanger, btnPrimary, btnSecondary, card, inputCls } from "../../components/common/ui";
import { adminProducts } from "../../services/adminService";
import { categoryService } from "../../services/categoryService";
import { productService } from "../../services/productService";
import { getApiError, money } from "../../utils/format";
import type { CategoryList } from "../../types/category";
import type { PagedResult } from "../../types/common";
import type { Product, ProductList, ProductPayload } from "../../types/product";

const blank: ProductPayload = { name: "", description: "", price: 0, stockQuantity: 0, categoryId: 0 };

export default function AdminProducts() {
  const [data, setData] = useState<PagedResult<ProductList> | null>(null);
  const [categories, setCategories] = useState<CategoryList[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [status, setStatus] = useState<"" | "true" | "false">("");
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<{ id?: number } | null>(null);
  const [form, setForm] = useState<ProductPayload>(blank);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [stockFor, setStockFor] = useState<ProductList | null>(null);
  const [imagesFor, setImagesFor] = useState<Product | null>(null);
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setData(await productService.getProducts({
        pageNumber: page, pageSize: 10, search, categoryId,
        isActive: status === "" ? undefined : status === "true",
        sortBy: "id", sortDirection: "desc",
      }));
      setError("");
    } catch (e) { setError(getApiError(e, "Unable to load products.")); }
  }, [page, search, categoryId, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { categoryService.getCategories().then(setCategories).catch(() => setCategories([])); }, []);

  const openNew = () => {
    setForm({ ...blank, categoryId: categories.find((c) => c.isActive)?.id ?? 0 });
    setFormError(""); setEditing({});
  };

  const openEdit = async (p: ProductList) => {
    try {
      const full = await productService.getProductById(p.id); // list DTO has no description
      setForm({ name: full.name, description: full.description ?? "", price: full.price, stockQuantity: full.stockQuantity, categoryId: full.categoryId });
      setFormError(""); setEditing({ id: p.id });
    } catch (e) { setError(getApiError(e, "Unable to open the product.")); }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing?.id) await adminProducts.update(editing.id, form);
      else await adminProducts.create(form);
      setEditing(null);
      await load();
    } catch (err) { setFormError(getApiError(err, "Unable to save the product.")); }
    finally { setSaving(false); }
  };

  const toggle = async (p: ProductList) => {
    try { await (p.isActive ? adminProducts.deactivate(p.id) : adminProducts.activate(p.id)); await load(); }
    catch (e) { setError(getApiError(e, "Unable to change the product.")); }
  };

  const openImages = async (p: ProductList) => {
    try { setImageError(""); setImagesFor(await productService.getProductById(p.id)); }
    catch (e) { setError(getApiError(e, "Unable to open the images.")); }
  };
  const refreshImages = async () => {
    if (!imagesFor) return;
    setImagesFor(await productService.getProductById(imagesFor.id));
    await load();
  };
  const imageAction = async (action: () => Promise<unknown>) => {
    try { setImageError(""); await action(); await refreshImages(); }
    catch (e) { setImageError(getApiError(e, "Image action failed.")); }
  };
  const onFile = async (file?: File) => {
    if (!file || !imagesFor) return;
    setUploading(true);
    await imageAction(() => adminProducts.uploadImage(imagesFor.id, file));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const setField = <K extends keyof ProductPayload>(k: K, v: ProductPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Products" subtitle={`${data?.totalCount ?? 0} products`} actions={<button className={btnPrimary} onClick={openNew}>New product</button>} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className={`${inputCls} !w-48`} value={categoryId ?? ""} onChange={(e) => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (inactive)"}</option>)}
        </select>
        <select className={`${inputCls} !w-40`} value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}>
          <option value="">Any status</option><option value="true">Active</option><option value="false">Inactive</option>
        </select>
      </div>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      {!data ? <PageLoader /> : data.items.length === 0 ? <Empty title="No products match" /> : (
        <>
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Price</th><th className="px-5 py-3 text-right">Stock</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.primaryImageUrl
                          ? <img src={p.primaryImageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><Package size={18} className="text-slate-400" /></div>}
                        <span className="font-medium text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.categoryName}</td>
                    <td className="px-5 py-3 text-right">{money(p.price)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${p.stockQuantity <= 5 ? "text-amber-600" : ""}`}>{p.stockQuantity}</td>
                    <td className="px-5 py-3"><Badge value={p.isActive ? "Active" : "Inactive"} /></td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <button className="mr-3 font-medium text-slate-700 hover:underline" onClick={() => openEdit(p)}><Pencil size={14} className="mr-1 inline" />Edit</button>
                      <button className="mr-3 font-medium text-slate-700 hover:underline" onClick={() => openImages(p)}><ImagePlus size={14} className="mr-1 inline" />Images</button>
                      <button className="mr-3 font-medium text-slate-700 hover:underline" onClick={() => setStockFor(p)}>Stock</button>
                      <button className="font-medium text-slate-700 hover:underline" onClick={() => toggle(p)}>{p.isActive ? "Deactivate" : "Activate"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.pageNumber} totalPages={data.totalPages} hasPreviousPage={data.pageNumber > 1} hasNextPage={data.pageNumber < data.totalPages} onPageChange={setPage} />
        </>
      )}

      {/* create / edit */}
      <Modal open={editing !== null} title={editing?.id ? "Edit product" : "New product"} onClose={() => setEditing(null)}>
        <form onSubmit={submit} className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => setField("name", e.target.value)} required maxLength={100} /></Field>
          <Field label="Description"><textarea className={inputCls} rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} maxLength={1000} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price"><input type="number" min={0} step="0.01" className={inputCls} value={form.price} onChange={(e) => setField("price", Number(e.target.value))} required /></Field>
            <Field label="Stock"><input type="number" min={0} step={1} className={inputCls} value={form.stockQuantity} onChange={(e) => setField("stockQuantity", Math.trunc(Number(e.target.value)))} required /></Field>
            <Field label="Category">
              <select className={inputCls} value={form.categoryId} onChange={(e) => setField("categoryId", Number(e.target.value))} required>
                <option value={0} disabled>Choose...</option>
                {categories.filter((c) => c.isActive || c.id === form.categoryId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
            <button className={btnPrimary} disabled={saving || form.categoryId === 0}>{saving ? "Saving..." : "Save product"}</button>
          </div>
        </form>
      </Modal>

      {/* images */}
      <Modal open={imagesFor !== null} title={`Images - ${imagesFor?.name ?? ""}`} onClose={() => setImagesFor(null)} wide>
        {imagesFor && (
          <div className="space-y-4">
            {imageError && <Alert>{imageError}</Alert>}
            <p className="text-sm text-slate-500">JPEG, PNG or WebP, up to 5 MB, max 8 images. The first image becomes the primary one.</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {imagesFor.images.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 p-2">
                    {img.isPrimary
                      ? <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Star size={14} fill="currentColor" /> Primary</span>
                      : <button className="text-xs font-medium text-slate-700 hover:underline" onClick={() => imageAction(() => adminProducts.setPrimaryImage(imagesFor.id, img.id))}>Make primary</button>}
                    <button className={`${btnDanger} !px-2 !py-1`} aria-label="Delete image" onClick={() => window.confirm("Delete this image?") && imageAction(() => adminProducts.deleteImage(imagesFor.id, img.id))}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <button className={btnPrimary} disabled={uploading || imagesFor.images.length >= 8} onClick={() => fileRef.current?.click()}>
              <ImagePlus size={17} /> {uploading ? "Uploading..." : "Upload image"}
            </button>
          </div>
        )}
      </Modal>

      <StockAdjustModal product={stockFor} onClose={() => setStockFor(null)} onSaved={load} />
    </div>
  );
}

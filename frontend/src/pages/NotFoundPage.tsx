import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100"><Compass size={36} className="text-slate-400" /></div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-400">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">We couldn't find <span className="font-mono">{pathname}</span>.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Go home</Link>
        <Link to="/products" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Browse products</Link>
      </div>
    </div>
  );
}

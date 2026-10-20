import { useEffect } from "react";
import { useToast } from "../../context/ToastContext";

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  useEffect(() => {}, [toasts]);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-sm rounded-lg px-4 py-3 shadow-md text-sm flex items-center justify-between gap-3 ${
            t.type === "success" ? "bg-green-50 text-green-800 border border-green-100" : t.type === "error" ? "bg-red-50 text-red-800 border border-red-100" : "bg-slate-50 text-slate-900 border border-slate-100"
          }`}>
          <div>{t.message}</div>
          <button onClick={() => remove(t.id)} className="text-xs text-slate-500">Close</button>
        </div>
      ))}
    </div>
  );
}

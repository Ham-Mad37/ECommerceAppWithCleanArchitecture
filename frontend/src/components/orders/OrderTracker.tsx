import { Check, XCircle } from "lucide-react";
import type { OrderStatus } from "../../types/order";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "Pending", label: "Placed" },
  { status: "Confirmed", label: "Confirmed" },
  { status: "Processing", label: "Processing" },
  { status: "Shipped", label: "Shipped" },
  { status: "Delivered", label: "Delivered" },
];

export default function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        <XCircle size={22} className="shrink-0" />
        <span className="font-medium">This order was cancelled.</span>
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="flex items-start" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const isCurrent = i === current && status !== "Delivered";
        return (
          <li key={step.status} className="relative flex flex-1 flex-col items-center text-center" aria-current={isCurrent ? "step" : undefined}>
            {i < STEPS.length - 1 && (
              <span className={`absolute left-1/2 top-4 h-0.5 w-full ${i < current ? "bg-slate-900" : "bg-slate-200"}`} />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                done ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-400"
              } ${isCurrent ? "ring-4 ring-slate-900/15" : ""}`}
            >
              {done ? <Check size={16} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`mt-2 text-[11px] font-medium sm:text-sm ${done ? "text-slate-900" : "text-slate-400"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

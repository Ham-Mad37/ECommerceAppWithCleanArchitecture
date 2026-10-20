import { createContext, useContext, useState, type ReactNode } from "react";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
};

type ToastContextType = {
  toasts: Toast[];
  push: (message: string, type?: Toast["type"]) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (message: string, type: Toast["type"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const t = { id, message, type } as Toast;
    setToasts((s) => [t, ...s]);

    // Auto remove after 4s
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 4000);
  };

  const remove = (id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

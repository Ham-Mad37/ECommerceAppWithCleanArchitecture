import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export interface SavedItem {
  productId: number;
  productName: string;
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
}

/** "Save for later" list. Lives in this browser only (the API has no wishlist), one list per user. */
export function useSavedForLater() {
  const { user } = useAuth();
  const key = `saved-for-later:${user?.userId ?? "guest"}`;
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setItems(raw ? (JSON.parse(raw) as SavedItem[]) : []);
    } catch {
      setItems([]);
    }
  }, [key]);

  const persist = useCallback((next: SavedItem[]) => {
    setItems(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage blocked: list lives in memory only */ }
  }, [key]);

  const save = useCallback((item: SavedItem) => persist([item, ...items.filter((i) => i.productId !== item.productId)]), [items, persist]);
  const remove = useCallback((productId: number) => persist(items.filter((i) => i.productId !== productId)), [items, persist]);

  return { items, save, remove };
}

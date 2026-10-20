import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Order } from "../types/order";

export function useReorder() {
  const { reorder } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const run = async (order: Order) => {
    setBusyId(order.id);
    setMessage("");
    try {
      const { added, failed } = await reorder(order.items);
      if (failed.length === 0) navigate("/cart");
      else if (added > 0) setMessage(`Added ${added} item${added === 1 ? "" : "s"} to your cart. Unavailable now: ${failed.join(", ")}.`);
      else setMessage(`These items are unavailable right now: ${failed.join(", ")}.`);
    } finally {
      setBusyId(null);
    }
  };

  return { run, busyId, message };
}

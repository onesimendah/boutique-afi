"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice, STATUS_LABELS } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-mustard/20 text-ink",
  CONFIRMED: "bg-indigo/10 text-indigo",
  DELIVERED: "bg-palm/15 text-palm",
  CANCELLED: "bg-line text-muted",
};

export function OrdersList({ createdId }: { createdId?: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Impossible de charger vos commandes.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: string) {
    if (!confirm("Annuler cette commande ?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status: data.order.status } : o)) ?? null);
    } finally {
      setCancelling(null);
    }
  }

  if (error) {
    return (
      <div>
        <p className="text-danger">{error}</p>
        <button onClick={load} className="btn-ghost mt-3">
          Recharger
        </button>
      </div>
    );
  }

  if (!orders) return <p className="text-muted">Chargement…</p>;

  if (orders.length === 0) {
    return (
      <div className="py-6">
        <p>Vous n'avez pas encore passé de commande.</p>
        <Link href="/" className="btn-primary mt-4">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <>
      {createdId && (
        <p role="status" className="mb-6 rounded-md bg-palm/10 p-4 font-semibold text-palm">
          Commande enregistrée. Elle apparaît en attente jusqu'à sa confirmation par la boutique.
        </p>
      )}
      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className={`rounded-md border bg-white p-5 ${order.id === createdId ? "border-palm" : "border-line"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-display text-lg font-bold">Commande n° {order.id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <ul className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <p>
                Total <span className="ml-1 font-display text-lg font-extrabold tabular-nums">{formatPrice(order.total)}</span>
              </p>
              {order.status === "PENDING" && (
                <button
                  onClick={() => cancel(order.id)}
                  disabled={cancelling === order.id}
                  className="text-sm font-semibold text-danger underline disabled:opacity-50"
                >
                  {cancelling === order.id ? "Annulation…" : "Annuler la commande"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

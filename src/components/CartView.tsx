"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

export function CartView({ loggedIn }: { loggedIn: boolean }) {
  const { items, total, ready, setQuantity, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function checkout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "La commande n'a pas pu être enregistrée.");
        return;
      }
      clear();
      router.push(`/orders?created=${data.order.id}`);
      router.refresh();
    } catch {
      setError("Connexion au serveur impossible. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className="py-10">
        <p className="text-lg">Votre panier est vide.</p>
        <Link href="/" className="btn-primary mt-4">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.productId} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-0 flex-1 basis-40">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted tabular-nums">{formatPrice(item.price)} l'unité</p>
            </div>
            <QuantityStepper
              value={item.quantity}
              max={item.stock}
              label={item.name}
              onChange={(q) => setQuantity(item.productId, q)}
            />
            <p className="w-28 text-right font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
            <button
              onClick={() => remove(item.productId)}
              className="text-sm font-semibold text-muted underline hover:text-danger"
            >
              Retirer
            </button>
          </li>
        ))}
      </ul>

      <div className="h-fit rounded-md border border-line bg-white p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-extrabold tabular-nums">{formatPrice(total)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">Paiement au retrait en boutique.</p>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        {loggedIn ? (
          <button onClick={checkout} disabled={submitting} className="btn-primary mt-4 w-full">
            {submitting ? "Envoi de la commande…" : "Passer la commande"}
          </button>
        ) : (
          <>
            <Link href="/login?next=/cart" className="btn-primary mt-4 w-full">
              Se connecter pour commander
            </Link>
            <p className="mt-2 text-center text-sm text-muted">Votre panier sera conservé.</p>
          </>
        )}
      </div>
    </div>
  );
}

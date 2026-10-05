"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

// Résumé du panier affiché à côté de la liste des produits
export function CartSummary() {
  const { items, total, count, ready } = useCart();

  return (
    <>
      <aside className="sticky top-6 hidden rounded-md border border-line bg-white p-5 md:block">
        <h2 className="font-display text-lg font-bold">Votre panier</h2>
        {!ready ? null : items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Ajoutez des produits pour commencer votre commande.</p>
        ) : (
          <>
            <ul className="mt-3 space-y-1 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-3">
                  <span className="truncate">
                    {i.quantity} × {i.name}
                  </span>
                  <span className="tabular-nums">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-display text-xl font-extrabold tabular-nums">{formatPrice(total)}</span>
            </div>
            <Link href="/cart" className="btn-primary mt-4 w-full">
              Voir le panier
            </Link>
          </>
        )}
      </aside>

      {/* barre fixe en bas sur mobile */}
      {ready && count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted">{count} article(s)</p>
              <p className="font-display text-lg font-extrabold tabular-nums">{formatPrice(total)}</p>
            </div>
            <Link href="/cart" className="btn-primary">
              Voir le panier
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

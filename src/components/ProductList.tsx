"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

const CATEGORY_COLORS: Record<string, string> = {
  "Épicerie": "bg-mustard text-ink",
  "Petit-déjeuner": "bg-palm text-white",
  "Entretien": "bg-indigo text-white",
  "Boissons": "bg-violet-700 text-white",
};

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const cart = useCart();

  async function load() {
    setStatus("loading");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => ["Tout", ...new Set(products.map((p) => p.category))], [products]);

  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter(
      (p) => (category === "Tout" || p.category === category) && p.name.toLowerCase().includes(term)
    );
    const groups = new Map<string, Product[]>();
    for (const p of filtered) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
    return [...groups.entries()];
  }, [products, category, search]);

  if (status === "loading") {
    return <p className="py-10 text-muted">Chargement des produits…</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-md border border-danger/30 bg-white p-5">
        <p className="font-semibold text-danger">Impossible de charger les produits.</p>
        <p className="mt-1 text-sm text-muted">Vérifiez votre connexion puis relancez le chargement.</p>
        <button onClick={load} className="btn-ghost mt-3">
          Recharger
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Rechercher un produit"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input sm:max-w-xs"
          aria-label="Rechercher un produit"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par rayon">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                category === c ? "border-indigo bg-indigo text-white" : "border-line bg-white hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="py-8 text-muted">Aucun produit ne correspond à « {search} ». Essayez un autre mot.</p>
      )}

      {grouped.map(([cat, items]) => (
        <section key={cat} className="mb-8">
          <h2 className="mb-2 border-b-2 border-ink pb-1 font-display text-xl font-bold">{cat}</h2>
          <ul className="divide-y divide-line">
            {items.map((product) => {
              const inCart = cart.items.find((i) => i.productId === product.id);
              const soldOut = product.stock === 0;
              return (
                <li key={product.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-display text-lg font-bold ${
                      CATEGORY_COLORS[product.category] ?? "bg-line text-ink"
                    }`}
                  >
                    {product.name[0]}
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted">
                      {product.description}
                      {soldOut && <span className="ml-2 font-semibold text-danger">Rupture de stock</span>}
                      {!soldOut && product.stock <= 5 && (
                        <span className="ml-2 font-semibold text-palm">Plus que {product.stock}</span>
                      )}
                    </p>
                  </div>
                  <p className="w-28 text-right font-display font-bold tabular-nums">{formatPrice(product.price)}</p>
                  <div className="flex w-32 justify-end">
                    {inCart ? (
                      <QuantityStepper
                        value={inCart.quantity}
                        max={product.stock}
                        label={product.name}
                        onChange={(q) => cart.setQuantity(product.id, q)}
                      />
                    ) : (
                      <button onClick={() => cart.add(product)} disabled={soldOut} className="btn-ghost py-1.5">
                        Ajouter
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

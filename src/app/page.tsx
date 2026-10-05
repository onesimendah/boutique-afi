import { ProductList } from "@/components/ProductList";
import { CartSummary } from "@/components/CartSummary";

export default function HomePage() {
  return (
    <>
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Vos courses du quartier, prêtes à récupérer.
        </h1>
        <p className="mt-3 text-lg text-muted">
          Choisissez vos articles, validez la commande et suivez son statut depuis votre compte.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <ProductList />
        <div>
          <CartSummary />
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

export function Header({ user }: { user: { name: string } | null }) {
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`hover:text-indigo ${pathname === href ? "text-indigo underline underline-offset-4" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-indigo">
          Boutique Afi
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold">
          {navLink("/", "Produits")}
          {user && navLink("/orders", "Mes commandes")}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-muted sm:inline">Bonjour {user.name}</span>
              <button onClick={logout} className="font-semibold hover:text-danger">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold hover:text-indigo">
                Connexion
              </Link>
              <Link href="/register" className="btn-ghost py-1.5">
                Créer un compte
              </Link>
            </>
          )}
          <Link href="/cart" className="btn-primary py-1.5" aria-label={`Panier, ${count} article(s)`}>
            Panier
            <span className="min-w-6 rounded bg-mustard px-1.5 text-center text-ink">{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

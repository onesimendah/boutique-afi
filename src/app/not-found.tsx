import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="font-display text-3xl font-extrabold">Page introuvable</h1>
      <p className="mt-2 text-muted">Ce lien ne mène à aucune page de la boutique.</p>
      <Link href="/" className="btn-primary mt-6">
        Retour aux produits
      </Link>
    </div>
  );
}

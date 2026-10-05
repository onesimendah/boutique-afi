import { CartView } from "@/components/CartView";
import { getSession } from "@/lib/auth";

export default async function CartPage() {
  const session = await getSession();

  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-extrabold">Panier</h1>
      <CartView loggedIn={!!session} />
    </>
  );
}

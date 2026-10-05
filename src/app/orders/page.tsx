import { OrdersList } from "@/components/OrdersList";

type Props = { searchParams: Promise<{ created?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { created } = await searchParams;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-display text-3xl font-extrabold">Mes commandes</h1>
      <OrdersList createdId={created} />
    </div>
  );
}

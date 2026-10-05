import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validation";
import { handleError, HttpError } from "@/lib/http";

export const dynamic = "force-dynamic";

const orderSelect = {
  id: true,
  status: true,
  total: true,
  createdAt: true,
  items: { select: { id: true, name: true, unitPrice: true, quantity: true } },
} as const;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "Connexion requise");

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: orderSelect,
    });
    return NextResponse.json({ orders });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "Connexion requise");

    const { items } = createOrderSchema.parse(await req.json());

    // si le même produit arrive deux fois, on additionne les quantités
    const quantities = new Map<string, number>();
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...quantities.keys()] } },
      });
      if (products.length !== quantities.size) {
        throw new HttpError(400, "Un ou plusieurs produits n'existent plus");
      }

      // Le total est recalculé côté serveur avec les prix en base,
      // on ne fait jamais confiance au prix envoyé par le client.
      let total = 0;
      for (const product of products) {
        const qty = quantities.get(product.id)!;
        // décrément conditionnel : échoue si le stock a bougé entre-temps
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (updated.count === 0) {
          throw new HttpError(409, `Stock insuffisant pour « ${product.name} »`);
        }
        total += product.price * qty;
      }

      return tx.order.create({
        data: {
          userId: session.userId,
          total,
          items: {
            create: products.map((p) => ({
              productId: p.id,
              name: p.name,
              unitPrice: p.price,
              quantity: quantities.get(p.id)!,
            })),
          },
        },
        select: orderSelect,
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

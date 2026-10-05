import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateOrderSchema } from "@/lib/validation";
import { handleError, HttpError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

// Le client peut seulement annuler une commande encore en attente.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "Connexion requise");

    const { id } = await params;
    updateOrderSchema.parse(await req.json());

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { id, userId: session.userId },
        include: { items: true },
      });
      if (!existing) throw new HttpError(404, "Commande introuvable");
      if (existing.status !== "PENDING") {
        throw new HttpError(409, "Seule une commande en attente peut être annulée");
      }

      // on remet les articles en stock
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        select: { id: true, status: true },
      });
    });

    return NextResponse.json({ order });
  } catch (err) {
    return handleError(err);
  }
}

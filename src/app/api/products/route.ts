import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, description: true, category: true, price: true, stock: true },
    });
    return NextResponse.json({ products });
  } catch (err) {
    return handleError(err);
  }
}

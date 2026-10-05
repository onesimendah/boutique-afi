import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { handleError, HttpError } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const data = registerSchema.parse(await req.json());

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new HttpError(409, "Un compte existe déjà avec cet email");

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
      },
      select: { id: true, name: true, email: true },
    });

    await createSession({ userId: user.id, name: user.name, email: user.email });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

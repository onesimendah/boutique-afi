import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { handleError, HttpError } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const { email, password } = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    // même message dans les deux cas pour ne pas révéler si l'email existe
    if (!user || !valid) throw new HttpError(401, "Email ou mot de passe incorrect");

    await createSession({ userId: user.id, name: user.name, email: user.email });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return handleError(err);
  }
}

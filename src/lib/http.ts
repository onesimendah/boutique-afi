import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// Point unique de gestion des erreurs pour les routes API
export function handleError(err: unknown) {
  if (err instanceof HttpError) {
    return jsonError(err.status, err.message);
  }
  if (err instanceof ZodError) {
    return jsonError(400, "Données invalides", err.flatten().fieldErrors);
  }
  if (err instanceof SyntaxError) {
    return jsonError(400, "Corps de requête JSON invalide");
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return jsonError(409, "Cette ressource existe déjà");
  }
  console.error(err);
  return jsonError(500, "Erreur serveur, réessayez plus tard");
}

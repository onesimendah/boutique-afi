import { SignJWT, jwtVerify } from "jose";

// Partie "edge-safe" : utilisée par le middleware, donc pas d'import de next/headers ici
export const SESSION_COOKIE = "session";
export const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 jours

export type SessionPayload = { userId: string; name: string; email: string };

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET manquant ou trop court (32 caractères minimum)");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

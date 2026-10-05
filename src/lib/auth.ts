import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DURATION, signSession, verifySession, type SessionPayload } from "./session";

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

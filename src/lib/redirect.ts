// N'accepte que des chemins internes pour éviter les redirections ouvertes (?next=https://...)
export function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

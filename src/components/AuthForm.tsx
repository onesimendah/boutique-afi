"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";
type FieldErrors = Partial<Record<"name" | "email" | "password", string[]>>;

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        if (data.details) setFieldErrors(data.details);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Connexion au serveur impossible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="mx-auto max-w-sm py-6">
      <h1 className="font-display text-3xl font-extrabold">{isRegister ? "Créer un compte" : "Connexion"}</h1>
      <p className="mt-1 text-muted">
        {isRegister ? "Pour passer commande et suivre vos achats." : "Accédez à vos commandes."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {isRegister && (
          <Field label="Nom" name="name" autoComplete="name" errors={fieldErrors.name} />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" errors={fieldErrors.email} />
        <Field
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          hint={isRegister ? "8 caractères minimum" : undefined}
          errors={fieldErrors.password}
        />

        {error && (
          <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Patientez…" : isRegister ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        {isRegister ? "Déjà un compte ? " : "Pas encore de compte ? "}
        <Link
          href={`${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(next)}`}
          className="font-semibold text-indigo underline"
        >
          {isRegister ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  errors?: string[];
};

function Field({ label, name, type = "text", autoComplete, hint, errors }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={!!errors?.length}
        className={`input mt-1 ${errors?.length ? "border-danger" : ""}`}
      />
      {errors?.length ? (
        <span className="mt-1 block text-sm text-danger">{errors[0]}</span>
      ) : hint ? (
        <span className="mt-1 block text-sm text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

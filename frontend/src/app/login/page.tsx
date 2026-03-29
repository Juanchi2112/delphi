"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-stone-950 font-bold text-lg">
            D
          </span>
          <span className="text-stone-50 font-semibold text-2xl tracking-tight">
            Delphi
          </span>
        </div>

        {/* Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-stone-50 text-center mb-1">
            {mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
          </h1>
          <p className="text-sm text-stone-500 text-center mb-6">
            {mode === "login"
              ? "Accede a tu dashboard de riesgo"
              : "Registrate para monitorear tus campos"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-stone-800/50 border border-stone-700 rounded-lg text-sm text-stone-50 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-stone-800/50 border border-stone-700 rounded-lg text-sm text-stone-50 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-500 text-stone-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting
                ? "Cargando..."
                : mode === "login"
                  ? "Entrar"
                  : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="text-sm text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
            >
              {mode === "login"
                ? "No tenes cuenta? Registrate"
                : "Ya tenes cuenta? Inicia sesion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

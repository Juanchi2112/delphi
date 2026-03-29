"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward (to register), -1 = back (to login)

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { nombre } } });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push("/");
    }
  };

  const toggleMode = () => {
    const next = mode === "login" ? "register" : "login";
    setDirection(next === "register" ? 1 : -1);
    setMode(next);
    setError(null);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-stone-950 font-bold text-lg">
            D
          </span>
          <span className="text-stone-50 font-semibold text-2xl tracking-tight">
            Delphi
          </span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-8 relative"
        >
          {/* Mode indicator pills */}
          <div className="flex items-center justify-center gap-1 mb-6 bg-stone-800/60 rounded-lg p-1">
            <button
              type="button"
              onClick={() => mode !== "login" && toggleMode()}
              className={`relative flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer ${
                mode === "login" ? "text-stone-50" : "text-stone-500 hover:text-stone-400"
              }`}
            >
              {mode === "login" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-stone-700/80 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">Iniciar sesion</span>
            </button>
            <button
              type="button"
              onClick={() => mode !== "register" && toggleMode()}
              className={`relative flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer ${
                mode === "register" ? "text-stone-50" : "text-stone-500 hover:text-stone-400"
              }`}
            >
              {mode === "register" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-stone-700/80 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">Registrarse</span>
            </button>
          </div>

          {/* Animated form area */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={mode}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <p className="text-sm text-stone-500 text-center mb-6">
                  {mode === "login"
                    ? "Accede a tu dashboard de riesgo"
                    : "Registrate para monitorear tus campos"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-800/50 border border-stone-700 rounded-lg text-sm text-stone-50 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                  )}

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

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 overflow-hidden"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-emerald-500 text-stone-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting
                      ? "Cargando..."
                      : mode === "login"
                        ? "Entrar"
                        : "Crear cuenta"}
                  </motion.button>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <a
            href="/"
            className="text-sm text-stone-600 hover:text-stone-400 transition-colors"
          >
            ← Volver al inicio
          </a>
        </motion.div>
      </div>
    </div>
  );
}

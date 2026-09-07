"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { signInWithEmailPassword } from "@/lib/authSlice";
import type { AppDispatch } from "@/lib/store";

const darkGlassStyle: CSSProperties = {
  background: "rgba(10, 8, 6, 0.55)",
  backdropFilter: "blur(24px) saturate(1.2)",
  WebkitBackdropFilter: "blur(24px) saturate(1.2)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
};

const inputClassName =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40 focus:bg-white/10 focus:ring-2 focus:ring-white/10";

function getAuthErrorMessage(errorCode?: string) {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "E-posta veya şifre hatalı.";

    case "auth/user-not-found":
      return "Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.";

    case "auth/wrong-password":
      return "Şifre hatalı.";

    case "auth/too-many-requests":
      return "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.";

    case "auth/user-disabled":
      return "Bu hesap devre dışı bırakılmış.";

    case "auth/invalid-email":
      return "Geçersiz e-posta adresi.";

    case "auth/network-request-failed":
      return "Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.";

    default:
      return "Bilinmeyen bir hata oluştu.";
  }
}

export function Login({ onCancel }: { onCancel?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await dispatch(
        signInWithEmailPassword({
          email,
          password,
        }),
      ).unwrap();

      onCancel?.();
    } catch (err: unknown) {
      const errorCode =
        typeof err === "object" && err !== null && "code" in err
          ? String(err.code)
          : undefined;

      setError(getAuthErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <section
        className="w-full max-w-md rounded-card p-6 shadow-card sm:p-8"
        style={darkGlassStyle}
        aria-labelledby="login-title"
      >
        <div className="mb-6 space-y-2">
          <p
            className="text-2xl font-light italic text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shelfie
          </p>

          <h1
            id="login-title"
            className="text-2xl font-semibold tracking-tight text-white"
          >
            Giriş Yap
          </h1>

          <p className="text-sm text-white/60">
            Kitap takibine kaldığın yerden devam et.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-white/80">
              E-posta
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@site.com"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-white/80"
            >
              Şifre
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="submit"
              className="w-full rounded-xl bg-white text-stone-950 hover:bg-white/90"
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel?.()}
              className="w-full rounded-xl border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Geri
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
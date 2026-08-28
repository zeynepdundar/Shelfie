'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { signInWithEmailPassword } from "@/lib/authSlice";
import { AppDispatch } from "@/lib/store";

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

const inputClassName =
  "w-full rounded-xl border border-white/20 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-300/40";

export function Login({ onCancel }: { onCancel?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await dispatch(
        signInWithEmailPassword({
          email,
          password,
        })
      ).unwrap();

      onCancel?.();
    } catch (err: unknown) {
      const errorCode =
        typeof err === "object" &&
        err !== null &&
        "code" in err
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
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        aria-labelledby="login-title"
      >
        <div className="mb-6 space-y-2">
          <h1
            id="login-title"
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            Giriş Yap
          </h1>

          <p className="text-sm text-slate-500">
            Kitap takibine kaldığın yerden devam et.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="space-y-5"
          aria-busy={loading}
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              E-posta
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@site.com"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Şifre
            </label>

            <input
              id="password"
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
              className="w-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel?.()}
              className="w-full sm:w-auto"
            >
              Geri
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
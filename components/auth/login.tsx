'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { signInWithEmailPassword } from "@/lib/authSlice";
import { AppDispatch } from "@/lib/store";

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
      const result = await dispatch(signInWithEmailPassword({ email, password })).unwrap();
      console.log("Giriş başarılı:", result);
      onCancel?.();
    } catch (err: any) {
        const errorCode = err?.code;
        let msg = "Giriş yapılamadı.";
        
        switch (errorCode) {
          case "auth/invalid-credential":
            msg = "E-posta veya şifre hatalı.";
            break;
          case "auth/user-not-found":
            msg = "Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.";
            break;
          case "auth/wrong-password":
            msg = "Şifre hatalı.";
            break;
          case "auth/too-many-requests":
            msg = "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.";
            break;
          case "auth/user-disabled":
            msg = "Bu hesap devre dışı bırakılmış.";
            break;
          case "auth/invalid-email":
            msg = "Geçersiz e-posta adresi.";
            break;
          case "auth/network-request-failed":
            msg = "Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.";
            break;
          default:
            msg = err?.message || "Bilinmeyen bir hata oluştu.";
        }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl border-white/30 bg-white/30 p-6 sm:p-8 shadow-lg backdrop-blur-md">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Giriş Yap</h2>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm text-slate-700">E-posta</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@site.com"
              className="rounded-md border border-white/50 bg-white/60 px-3 py-2 text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-slate-700">Şifre</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-md border border-white/50 bg-white/60 px-3 py-2 text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onCancel?.()}>
              Geri
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
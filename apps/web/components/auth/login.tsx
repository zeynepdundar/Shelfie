"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { GlassCard } from "@/components/ui/glass";
import { AuthPanel } from "@/components/auth/auth-panel";

interface AuthScreenProps {
  onBack?: () => void;
  /** Karşılama ekranından gelen hata kodu (ör. misafir başlatılamadı). */
  initialError?: string | null;
}

/** Tam sayfa giriş/kayıt ekranı. Oturum açılınca kök sayfa Kütüphane'ye geçer. */
export function AuthScreen({ onBack, initialError }: AuthScreenProps) {
  const t = useTranslations("auth");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <GlassCard
        as="section"
        variant="dark"
        className="w-full max-w-md p-6 sm:p-8"
        aria-labelledby="auth-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p
              className="text-2xl font-light italic text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Shelfie
            </p>
            <h1
              id="auth-title"
              className="text-2xl font-semibold tracking-tight text-white"
            >
              {t("title")}
            </h1>
            <p className="text-sm text-white/60">{t("subtitle")}</p>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t("back")}
              title={t("back")}
              className="sf-icon-button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <AuthPanel initialError={initialError} />
      </GlassCard>
    </main>
  );
}

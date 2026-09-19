"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/hooks";
import {
  continueAsGuest,
  sendPasswordReset,
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmailPassword,
} from "@/lib/authSlice";

/** Kullanıcı popup'ı kendisi kapattıysa hata göstermeye gerek yok. */
const SILENT_ERRORS = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

/** Çevirisi olan hata kodları; gerisi "unknown" mesajına düşer. */
const KNOWN_ERRORS = new Set([
  "auth/invalid-credential",
  "auth/user-not-found",
  "auth/wrong-password",
  "auth/invalid-email",
  "auth/missing-password",
  "auth/weak-password",
  "auth/email-already-in-use",
  "auth/credential-already-in-use",
  "auth/provider-already-linked",
  "auth/too-many-requests",
  "auth/user-disabled",
  "auth/network-request-failed",
  "auth/popup-blocked",
  "auth/operation-not-allowed",
  "auth/admin-restricted-operation",
  "auth/configuration-not-found",
  "auth/invalid-api-key",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.",
  "auth/unauthorized-domain",
]);

type Tab = "signIn" | "signUp";
type Busy = "google" | "email" | "guest" | "reset" | null;

interface AuthPanelProps {
  /**
   * auth: giriş ekranı — giriş/kayıt sekmeleri ve misafir seçeneği.
   * upgrade: misafir hesabı kalıcı yapma — yalnızca bağlama (Google / kayıt).
   */
  mode?: "auth" | "upgrade";
  /** Açılışta gösterilecek hata kodu (ör. misafir başlatılamadıysa). */
  initialError?: string | null;
  onDone?: () => void;
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-4 w-4">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

export function AuthPanel({
  mode = "auth",
  initialError = null,
  onDone,
}: AuthPanelProps) {
  const t = useTranslations("auth");
  const dispatch = useAppDispatch();
  const isUpgrade = mode === "upgrade";

  const [tab, setTab] = useState<Tab>(isUpgrade ? "signUp" : "signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [errorCode, setErrorCode] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = isUpgrade || tab === "signUp";

  function errorMessage(code: string) {
    if (!KNOWN_ERRORS.has(code)) {
      // Tanınmayan kodu gizleme: hem mesajda hem konsolda görünsün ki
      // sorunun kaynağı (ör. konsol ayarı) bulunabilsin.
      console.error("[auth]", code);
      return t("errors.unknownWithCode", { code });
    }
    const key = code.startsWith("auth/api-key-not-valid")
      ? "invalid-api-key"
      : code.replace("auth/", "");
    return t(`errors.${key}`);
  }

  /** Thunk'ı çalıştırır; hata kodunu yakalar, bitince onDone çağırır. */
  async function run(kind: Exclude<Busy, null>, action: () => Promise<unknown>) {
    setBusy(kind);
    setErrorCode(null);
    setNotice(null);
    try {
      await action();
      if (kind !== "reset") onDone?.();
    } catch (reason) {
      const code = typeof reason === "string" ? reason : "auth/unknown";
      if (!SILENT_ERRORS.has(code)) setErrorCode(code);
    } finally {
      setBusy(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const credentials = { email: email.trim(), password };
    void run("email", () =>
      dispatch(
        isSignUp
          ? signUpWithEmailPassword(credentials)
          : signInWithEmailPassword(credentials)
      ).unwrap()
    );
  }

  function onResetPassword() {
    if (!email.trim()) {
      setNotice(null);
      setErrorCode("auth/missing-email-for-reset");
      return;
    }
    void run("reset", async () => {
      await dispatch(sendPasswordReset(email.trim())).unwrap();
      setNotice(t("resetSent", { email: email.trim() }));
    });
  }

  const shownError =
    errorCode === "auth/missing-email-for-reset"
      ? t("errors.missing-email-for-reset")
      : errorCode
        ? errorMessage(errorCode)
        : null;

  return (
    <div className="flex flex-col gap-5">
      {shownError && (
        <div role="alert" aria-live="polite" className="sf-alert-error">
          {shownError}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-tile border border-mint/35 bg-mint/10 px-4 py-3 text-sm font-medium text-mint"
        >
          {notice}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-3"
        disabled={busy !== null}
        onClick={() =>
          void run("google", () => dispatch(signInWithGoogle()).unwrap())
        }
      >
        <GoogleIcon />
        {busy === "google"
          ? t("working")
          : isUpgrade
            ? t("google.link")
            : t("google.continue")}
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/45">
        <span className="h-px flex-1 bg-white/15" />
        {t("orEmail")}
        <span className="h-px flex-1 bg-white/15" />
      </div>

      {!isUpgrade && (
        <div className="sf-segmented w-full" role="group">
          {(["signIn", "signUp"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => {
                setTab(key);
                setErrorCode(null);
                setNotice(null);
              }}
              className="sf-segmented-item flex-1 justify-center"
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-busy={busy !== null}>
        <div className="sf-field">
          <label htmlFor={`${mode}-email`} className="sf-label">
            {t("email")}
          </label>
          <input
            id={`${mode}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            className="sf-input"
          />
        </div>

        <div className="sf-field">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={`${mode}-password`} className="sf-label">
              {t("password")}
            </label>
            {!isSignUp && (
              <button
                type="button"
                onClick={onResetPassword}
                disabled={busy !== null}
                className="text-xs font-medium text-accent-ink underline-offset-4 hover:underline disabled:opacity-50"
              >
                {busy === "reset" ? t("working") : t("forgotPassword")}
              </button>
            )}
          </div>
          <input
            id={`${mode}-password`}
            type="password"
            required
            minLength={isSignUp ? 6 : undefined}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="sf-input"
          />
          {isSignUp && <p className="sf-meta">{t("passwordHint")}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "email"
            ? t("working")
            : isUpgrade
              ? t("submit.link")
              : isSignUp
                ? t("submit.signUp")
                : t("submit.signIn")}
        </Button>
      </form>

      {!isUpgrade && (
        <div className="flex flex-col items-center gap-1 border-t border-white/10 pt-4 text-center">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              void run("guest", () => dispatch(continueAsGuest()).unwrap())
            }
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <UserRound className="h-4 w-4" />
            {busy === "guest" ? t("working") : t("guest.continue")}
          </button>
          <p className="sf-meta">{t("guest.hint")}</p>
        </div>
      )}
    </div>
  );
}

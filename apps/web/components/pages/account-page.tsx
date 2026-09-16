"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useLocale, useTranslations } from "next-intl";
import { Check, LogOut, Pencil, X } from "lucide-react";

import type { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { signOutUser, updateDisplayName } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardHeader } from "@/components/ui/glass";
import { Avatar } from "@/components/layout/UserMenu";

/**
 * Diller kendi adlarıyla listelenir — yanlış dilde kalan bir kullanıcı
 * "Türkçe"yi arar, "Turkish"i değil.
 */
const LOCALES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
] as const;

/** Dil seçimi: iki seçenek de görünür, aktif olan işaretli. */
function LanguageField() {
  const locale = useLocale();
  const pathname = usePathname();

  const withoutLocale =
    pathname.replace(/^\/(en|tr)(?=\/|$)/, "").replace(/\/+$/, "") || "/";

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
      {LOCALES.map((option) => {
        const isActive = option.code === locale;

        return (
          <Link
            key={option.code}
            href={`/${option.code}${withoutLocale === "/" ? "" : withoutLocale}`}
            aria-current={isActive ? "true" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ${
              isActive
                ? "bg-white/15 font-medium text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isActive && <Check className="h-3.5 w-3.5 text-accent-ink" />}
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

/** Görünen adı yerinde düzenleyen satır. */
function DisplayNameField({ value }: { value: string | null }) {
  const t = useTranslations("account");
  const dispatch = useAppDispatch();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ad başka bir yerden değişirse (örn. yeniden giriş) taslak da tazelensin
  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  function cancel() {
    setEditing(false);
    setDraft(value ?? "");
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);

    try {
      await dispatch(updateDisplayName(draft)).unwrap();
      setEditing(false);
    } catch (reason) {
      setError(typeof reason === "string" ? reason : t("nameError"));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="truncate text-sm text-white">
          {value || <span className="text-white/40">{t("notSet")}</span>}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t("editName")}
          title={t("editName")}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="flex flex-col items-end gap-2"
    >
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancel();
          }}
          maxLength={60}
          placeholder={t("namePlaceholder")}
          aria-label={t("fields.displayName")}
          className="w-full min-w-0 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/40 focus:bg-white/10 sm:w-64"
        />

        <button
          type="submit"
          disabled={saving}
          aria-label={t("save")}
          title={t("save")}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          aria-label={t("cancel")}
          title={t("cancel")}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}

export function AccountPage() {
  const t = useTranslations("account");
  const navT = useTranslations("nav");
  const dispatch = useAppDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const books = useSelector((state: RootState) => state.books.books);

  if (!user) return null;

  const name = user.displayName || user.email || "";
  const completed = books.filter((book) => book.isCompleted).length;

  return (
    <div className="sf-page">
      <div className="sf-container">
        <header className="sf-page-header">
          <div>
            <h1 className="sf-title-page">{t("title")}</h1>
            <p className="sf-page-header-sub">{t("subtitle")}</p>
          </div>
        </header>

        <GlassCard>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar name={name} photoURL={user.photoURL} size={64} />
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-white">
                  {name}
                </p>
                <p className="mt-0.5 text-sm text-white/50">
                  {t("booksCompleted", { count: completed })}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="shrink-0 gap-2"
              onClick={() => dispatch(signOutUser())}
            >
              <LogOut className="h-4 w-4" />
              {navT("logout")}
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader
            size="md"
            title={t("details.title")}
            description={t("details.hint")}
          />

          <dl className="flex flex-col">
            <div className="flex flex-col gap-1 border-b border-white/10 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <dt className="text-sm text-white/50">
                {t("fields.displayName")}
              </dt>
              <dd className="min-w-0 sm:text-right">
                <DisplayNameField value={user.displayName} />
              </dd>
            </div>

            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <dt className="text-sm text-white/50">{t("fields.email")}</dt>
              <dd className="truncate text-sm text-white sm:text-right">
                {user.email || t("notSet")}
              </dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader
            size="md"
            title={t("preferences.title")}
            description={t("preferences.hint")}
          />

          <dl className="flex flex-col">
            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <dt className="text-sm text-white/50">{navT("language")}</dt>
              <dd className="min-w-0">
                <LanguageField />
              </dd>
            </div>
          </dl>
        </GlassCard>
      </div>
    </div>
  );
}

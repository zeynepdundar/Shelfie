"use client";

import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

import type { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { signOutUser } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardHeader } from "@/components/ui/glass";
import { Avatar } from "@/components/layout/UserMenu";

export function AccountPage() {
  const t = useTranslations("account");
  const navT = useTranslations("nav");
  const dispatch = useAppDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const books = useSelector((state: RootState) => state.books.books);

  if (!user) return null;

  const name = user.displayName || user.email || "";
  const completed = books.filter((book) => book.isCompleted).length;

  const rows = [
    { label: t("fields.displayName"), value: user.displayName || t("notSet") },
    { label: t("fields.email"), value: user.email || t("notSet") },
    { label: t("fields.uid"), value: user.uid },
  ];

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
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-white/10 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
              >
                <dt className="text-sm text-white/50">{row.label}</dt>
                <dd className="truncate text-sm text-white sm:text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </GlassCard>
      </div>
    </div>
  );
}

"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";

import type { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { signOutUser } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const darkGlassStyle: CSSProperties = {
  background: "rgba(10, 8, 6, 0.55)",
  backdropFilter: "blur(24px) saturate(1.2)",
  WebkitBackdropFilter: "blur(24px) saturate(1.2)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
};

const glassStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.10)",
  backdropFilter: "blur(20px) saturate(1.4)",
  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
};

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const dispatch = useAppDispatch();

  const readCount = useSelector(
    (state: RootState) =>
      state.books.books.filter((book) => book.isCompleted).length,
  );

  const otherLocale = locale === "tr" ? "en" : "tr";
  const withoutLocale =
    pathname.replace(/^\/(en|tr)(?=\/|$)/, "").replace(/\/+$/, "") ||
    "/";

  const switchLocaleHref = `/${otherLocale}${
    withoutLocale === "/" ? "" : withoutLocale
  }`;

  const views = [
    { path: "/", label: `📊 ${t("overview")}` },
    { path: "/treasures", label: `💎 ${t("treasures")}` },
  ];

  function handleSignOut() {
    dispatch(signOutUser());
    onNavigate?.();
  }

  return (
    <>
      <div className="mb-10">
        <p
          className="mb-0.5 text-2xl font-light italic text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Shelfie
        </p>

        <p className="text-xs uppercase tracking-widest text-white/40">
          {t("tagline")}
        </p>
      </div>

      <nav className="mb-6 flex flex-col gap-1">
        {views.map((view) => {
          const isActive = withoutLocale === view.path;

          return (
            <Link
              key={view.path}
              href={`/${locale}${view.path === "/" ? "" : view.path}`}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-white/15 font-medium text-white"
                  : "text-white/50 hover:bg-white/[0.08] hover:text-white/80"
              }`}
            >
              {view.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 flex flex-col gap-1">
        <p className="mb-1 px-4 text-xs uppercase tracking-widest text-white/30">
          {t("account")}
        </p>

        <Link
          href={switchLocaleHref}
          onClick={onNavigate}
          className="rounded-xl px-4 py-2 text-left text-sm text-white/40 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70"
        >
          {otherLocale.toUpperCase()}
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl px-4 py-2 text-left text-sm text-white/40 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70"
        >
          {t("logout")}
        </button>
      </div>

      <div
        className="mt-auto rounded-2xl p-4 text-center"
        style={glassStyle}
      >
        <p
          className="text-2xl font-light text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {readCount}
        </p>

        <p className="text-xs uppercase tracking-widest text-white/45">
          {t("booksRead")}
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside
      className="sticky top-0 z-10 hidden shrink-0 flex-col overflow-y-auto md:flex"
      style={{
        ...darkGlassStyle,
        width: 240,
        height: "100dvh",
        padding: "32px 16px",
      }}
    >
      <SidebarBody />
    </aside>
  );
}

export function SidebarMobileBar() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <div
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:hidden"
      style={darkGlassStyle}
    >
      <Link href={`/${locale}`} className="flex flex-col">
        <span
          className="text-lg font-light italic text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Shelfie
        </span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("menu")}</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          aria-describedby={undefined}
          className="flex flex-col gap-0 overflow-y-auto text-white"
          style={{
            ...darkGlassStyle,
            width: 240,
            maxWidth: "100vw",
            height: "100dvh",
            padding: "32px 16px",
          }}
        >
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
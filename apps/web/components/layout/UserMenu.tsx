"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { ChevronsUpDown, LogOut, Languages, UserRound } from "lucide-react";

import type { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { signOutUser } from "@/lib/authSlice";
import { glassStyle } from "@/components/ui/glass";

/** Görünen ad yoksa e-postanın baş harflerinden bir avatar üretilir. */
function initials(name: string) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const otherLocale = locale === "tr" ? "en" : "tr";
  const withoutLocale =
    pathname.replace(/^\/(en|tr)(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  const switchLocaleHref = `/${otherLocale}${
    withoutLocale === "/" ? "" : withoutLocale
  }`;

  // Dışarı tıklama ve Escape ile kapansın
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const name = user.displayName || user.email || "";
  const itemClass =
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white";

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className="relative mt-auto">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-0.5 rounded-xl p-1.5"
          style={glassStyle}
        >
          <Link
            href={`/${locale}/account`}
            onClick={close}
            role="menuitem"
            className={itemClass}
          >
            <UserRound className="h-4 w-4" />
            {t("accountPage")}
          </Link>

          <Link
            href={switchLocaleHref}
            onClick={close}
            role="menuitem"
            className={itemClass}
          >
            <Languages className="h-4 w-4" />
            {otherLocale.toUpperCase()}
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              dispatch(signOutUser());
              close();
            }}
            className={itemClass}
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors duration-200 hover:bg-white/[0.06]"
        style={glassStyle}
      >
        <Avatar name={name} photoURL={user.photoURL} />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">
            {name}
          </span>
          {user.displayName && user.email && (
            <span className="block truncate text-xs text-white/45">
              {user.email}
            </span>
          )}
        </span>

        <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/40" />
      </button>
    </div>
  );
}

export function Avatar({
  name,
  photoURL,
  size = 36,
}: {
  name: string;
  photoURL?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-xs font-semibold uppercase text-white/80"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {photoURL && !failed ? (
        <img
          src={photoURL}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

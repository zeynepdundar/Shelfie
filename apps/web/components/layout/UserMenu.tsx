"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { ChevronUp, LogOut, UserRound } from "lucide-react";

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
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Menüde tek satır: ad varsa ad, yoksa e-posta. İkisi birden gösterilmiyor.
  const label = user.isAnonymous
    ? user.displayName || t("guest")
    : user.displayName || user.email || "";
  const itemClass =
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white";

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    // Hesap alanı gezinmeden ince bir çizgiyle ayrılır; kutu içine alınmaz ki
    // üstteki düz gezinme satırlarıyla aynı dili konuşsun.
    <div ref={containerRef} className="relative mt-auto border-t border-white/15 pt-3">
      {open && (
        <div
          role="menu"
          aria-label={t("accountPage")}
          className="absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-0.5 rounded-xl p-1.5"
          style={glassStyle}
        >
          {/* Kimlik bloğu: tetikleyici tek satır kaldığı için hangi hesapta
              olunduğu buradan okunur. Ad yoksa yalnızca e-posta görünür. */}
          {(user.displayName || user.email) && (
            <>
              <div className="px-3 pb-2 pt-1.5">
                {user.displayName && (
                  <p className="truncate text-sm font-medium text-white">
                    {user.displayName}
                  </p>
                )}
                {user.email && (
                  <p className="truncate text-xs text-white/45">{user.email}</p>
                )}
              </div>
              <div className="mx-1 mb-1 h-px bg-white/10" />
            </>
          )}

          <Link
            href={`/${locale}/account`}
            onClick={close}
            role="menuitem"
            className={itemClass}
          >
            <UserRound className="h-4 w-4" />
            {t("accountPage")}
          </Link>

          <div className="mx-1 my-1 h-px bg-white/10" />

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
        className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left transition-colors duration-200 hover:bg-white/[0.08] ${
          open ? "bg-white/[0.08]" : ""
        }`}
      >
        {/* Üstteki gezinme satırları birer glifle başlıyor; bu ikon hesap
            satırını da aynı hizaya oturtuyor. */}
        <UserRound className="h-4 w-4 shrink-0 text-white/45" />

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
          {label}
        </span>

        <ChevronUp
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
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

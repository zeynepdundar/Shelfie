'use client';

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";

import type { RootState } from "@/lib/store";
import { PageLoading } from "@/components/ui/glass";
import { Sidebar, SidebarMobileBar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: LayoutProps) {
  const status = useSelector((state: RootState) => state.auth.status);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("nav");

  const withoutLocale =
    pathname.replace(/^\/(en|tr)(?=\/|$)/, "").replace(/\/+$/, "") || "/";

  // Kök sayfa kendi içinde karşılama/giriş ekranını yönetiyor; korumalı olan
  // diğer sayfalar oturum kapanınca oraya dönmeli, yoksa boş sayfada kalınır.
  const isPublicRoute = withoutLocale === "/";
  const isResolved = status === "authenticated" || status === "unauthenticated";

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoute) {
      router.replace(`/${locale}`);
    }
  }, [status, isPublicRoute, locale, router]);

  // Firebase oturumu okunana kadar ne karşılama ekranı ne de panel gösterilir,
  // yoksa giriş yapmış kullanıcı her yenilemede bir an karşılama ekranını görür.
  if (!isResolved) {
    return <PageLoading label={t("checkingSession")} />;
  }

  if (status !== "authenticated") {
    // Yönlendirme tamamlanana kadar boş sayfa yerine yükleniyor durumu
    return isPublicRoute ? (
      <main>{children}</main>
    ) : (
      <PageLoading label={t("checkingSession")} />
    );
  }

  return (
    <div className="relative z-10 flex min-h-full">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <SidebarMobileBar />
        <main>{children}</main>
      </div>
    </div>
  );
}

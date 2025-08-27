"use client";
import { Menu } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { signOutUser } from "@/lib/authSlice";
import { useLocale, useTranslations } from "next-intl";

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <Image
    src="/logo-books.svg"
    alt="Books on a shelf"
    width={30}
    height={30}
  />,
  name = "shelfie",
  homeUrl = "https://www.launchuicomponents.com/",
  customNavigation,
  className,
}: NavbarProps) {
  const pathname = usePathname();
  const isAuthenticated = useSelector((state: RootState) => state.auth.status === "authenticated");
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const t = useTranslations("nav");

  const otherLocale = locale === "tr" ? "en" : "tr";
  const withoutLocale = pathname?.replace(/^\/(en|tr)/, "") || "/";
  const localized = (path: string) => `/${locale}${path}`;
  const switchLocaleHref = `/${otherLocale}${withoutLocale}`;

  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 bg-[#0a5b6f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a5b6f]/80", className)}>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={`/${locale}`}
              className="flex items-center gap-2 text-xl font-bold text-white"
            >
              {logo}
              {name}
            </a>
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-2 ml-4">
                <Link
                  href={localized("/")}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-semibold transition-colors border-b-2 border-transparent",
                    "hover:text-amber-300 hover:border-amber-300",
                    withoutLocale === "/" ? "text-amber-300 border-amber-300" : "text-white"
                  )}
                >
                  {t("overview")}
                </Link>
                <Link
                  href={localized("/treasures")}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-semibold transition-colors border-b-2 border-transparent",
                    "hover:text-amber-300 hover:border-amber-300",
                    withoutLocale === "/treasures" ? "text-amber-300 border-amber-300" : "text-white"
                  )}
                >
                  {t("treasures")}
                </Link>
              </nav>
            )}
          </NavbarLeft>
          <NavbarRight>
            <div className="hidden md:flex items-center gap-3 pr-2">
              <Link href={switchLocaleHref} className="text-white/80 hover:text-white text-sm underline">
                {otherLocale.toUpperCase()}
              </Link>
              {isAuthenticated && (
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => dispatch(signOutUser())}
                >
                  {t("logout")}
                </Button>
              )}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                {isAuthenticated && (
                  <nav className="grid gap-6 text-lg font-semibold">
                    <Link
                      href={localized("/")}
                      className={cn(
                        withoutLocale === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t("overview")}
                    </Link>
                    <Link
                      href={localized("/treasures")}
                      className={cn(
                        withoutLocale === "/treasures" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t("treasures")}
                    </Link>
                    <Button
                      variant="secondary"
                      className="justify-start"
                      onClick={() => dispatch(signOutUser())}
                    >
                      {t("logout")}
                    </Button>
                    <Link href={switchLocaleHref} className="text-sm underline">
                      {otherLocale.toUpperCase()}
                    </Link>
                  </nav>
                )}
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}

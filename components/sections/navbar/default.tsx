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
  const navLinkClass = (path: string) =>
    cn(
      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200",
      withoutLocale === path
        ? "bg-white/10 text-white"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 pt-4",
        className
      )}
    >
      <div className="max-w-container relative mx-auto">
        <NavbarComponent className="rounded-[1.75rem] border border-white/10 bg-[#0a5b6f] px-4 py-3 shadow-2xl shadow-black/20 sm:px-5">
          <NavbarLeft className="gap-6">
            <Link
              href={`/${locale}`}
              className="group flex shrink-0 items-center gap-2 text-white"
            >
              <Image
                src="/logo-books.svg"
                alt=""
                width={28}
                height={28}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                {name}
              </span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden items-center gap-1 md:flex">
                <Link
                  href={localized("/")}
                  className={navLinkClass("/")}
                >
                  {t("overview")}
                </Link>

                <Link
                  href={localized("/treasures")}
                  className={navLinkClass("/treasures")}
                >
                  {t("treasures")}
                </Link>
              </nav>
            )}
          </NavbarLeft>
          <NavbarRight>
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href={switchLocaleHref}
                className={cn(
                  "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-[0.2em] text-white/85",
                  "transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                )}
              >
                {otherLocale.toUpperCase()}
              </Link>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
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
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 text-white md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-white/10 bg-slate-950 text-white">
                {isAuthenticated && (
                  <nav className="grid gap-4 pt-8 text-base font-medium">
                    <Link
                      href={localized("/")}
                      className={navLinkClass("/")}
                    >
                      {t("overview")}
                    </Link>
                    <Link
                      href={localized("/treasures")}
                      className={navLinkClass("/treasures")}
                    >
                      {t("treasures")}
                    </Link>
                    <Button
                      variant="outline"
                      className="justify-start border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                      onClick={() => dispatch(signOutUser())}
                    >
                      {t("logout")}
                    </Button>
                    <Link
                      href={switchLocaleHref}
                      className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-[0.2em] text-white/85"
                    >
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

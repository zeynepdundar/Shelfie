"use client";
import { Menu, User, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import Navigation from "../../ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { signOutUser } from "@/lib/authSlice";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <Image
    className="dark:invert"
    src="/favicon.png"
    alt="Shelfie logomark"
    width={30}
    height={30}
  />,
  name = "shelfie",
  homeUrl = "https://www.launchuicomponents.com/",
  mobileLinks = [
    { text: "Getting Started", href: "https://www.launchuicomponents.com/" },
    { text: "Components", href: "https://www.launchuicomponents.com/" },
    { text: "Documentation", href: "https://www.launchuicomponents.com/" },
  ],
  actions = [
    { text: "Sign in", href: "https://www.launchuicomponents.com/", isButton: false },
    {
      text: "Get Started",
      href: "https://www.launchuicomponents.com/",
      isButton: true,
      variant: "primary",
    },
  ],
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.status === 'authenticated');
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 bg-[#0a5b6f]", className)}>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
              {name}
            </a>
            {showNavigation && (customNavigation || <Navigation />)}
          </NavbarLeft>
          <NavbarRight>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(signOutUser())}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            ) : (
              actions.map((action, index) =>
                action.isButton ? (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                  >
                    <a href={action.href}>
                      {action.icon}
                      {action.text}
                      {action.iconRight}
                    </a>
                  </Button>
                ) : (
                  <a
                    key={index}
                    href={action.href}
                    className="hidden text-sm md:block"
                  >
                    {action.text}
                  </a>
                ),
              )
            )}
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
                <nav className="grid gap-6 text-lg font-medium">
                  <a
                    href={homeUrl}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <span>{name}</span>
                  </a>
                  {mobileLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}

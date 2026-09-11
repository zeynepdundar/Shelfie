'use client';
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Sidebar, SidebarMobileBar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: LayoutProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.status === "authenticated"
  );

  if (!isAuthenticated) {
    return <main>{children}</main>;
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

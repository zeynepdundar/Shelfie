'use client';
import { ReactNode } from "react";

interface HomeLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
  showLogin: boolean;
}

export function HomeLayout({ children, isAuthenticated, showLogin }: HomeLayoutProps) {
  return (
    <div className="font-sans grid grid-rows-[10px_1fr_10px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <main className={`flex flex-col gap-[32px] row-start-2 w-full ${
        isAuthenticated || showLogin ? 'items-center' : 'items-start'
      }`}>
        {children}
      </main>
    </div>
  );
}

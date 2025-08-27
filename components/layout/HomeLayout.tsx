'use client';
import { ReactNode } from "react";
import Navbar from "../sections/navbar/default";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface HomeLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.status === "authenticated"
  );
  return (
    <div className="flex flex-col min-h-screen"> 
      {isAuthenticated && <Navbar />}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );  
}

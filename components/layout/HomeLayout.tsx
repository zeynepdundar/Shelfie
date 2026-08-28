'use client';
import { ReactNode } from "react";
import Navbar from "../sections/navbar/default";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface LayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: LayoutProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.status === "authenticated"
  );
  return (
    <>
      {isAuthenticated && <Navbar />}
      <main>{children}</main>
    </>
  );
}

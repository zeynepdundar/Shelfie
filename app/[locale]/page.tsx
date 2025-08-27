'use client';
import { useState } from "react";
import { Login } from "@/components/auth/login";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { WelcomeScreen } from "@/components/pages/welcome-page";
import { OverviewPage } from "@/components/pages/overview-page";
import { HomeLayout } from "@/components/layout/HomeLayout";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.status === "authenticated"
  );

  if (isAuthenticated) {
    return <OverviewPage user={user} />;
  }

  if (showLogin) {
    return <Login onCancel={() => setShowLogin(false)} />;
  }

  return <WelcomeScreen onGetStarted={() => setShowLogin(true)} />;
}
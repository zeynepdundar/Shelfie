'use client';

import { useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/lib/store";
import { Login } from "@/components/auth/login";
import { WelcomeScreen } from "@/components/pages/welcome-page";
import { LibraryPage } from "@/components/pages/library-page";

/** Kök sayfa: giriş yapıldıysa Kütüphane, yapılmadıysa karşılama/giriş akışı. */
export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.status === "authenticated"
  );

  if (isAuthenticated) {
    return <LibraryPage user={user} />;
  }

  if (showLogin) {
    return <Login onCancel={() => setShowLogin(false)} />;
  }

  return <WelcomeScreen onGetStarted={() => setShowLogin(true)} />;
}

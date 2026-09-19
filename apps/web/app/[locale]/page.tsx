'use client';

import { useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { continueAsGuest } from "@/lib/authSlice";
import { AuthScreen } from "@/components/auth/login";
import { WelcomeScreen } from "@/components/pages/welcome-page";
import { LibraryPage } from "@/components/pages/library-page";

/**
 * Kök sayfa: oturum varsa Kütüphane, yoksa karşılama ekranı.
 * "Get Started" kayıt formu göstermeden misafir hesabı açar; hesabı olan
 * kullanıcı giriş ekranına geçer.
 */
export default function Home() {
  const dispatch = useAppDispatch();
  const [showAuth, setShowAuth] = useState(false);
  const [startingGuest, setStartingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.status === "authenticated"
  );

  async function startAsGuest() {
    setStartingGuest(true);
    try {
      await dispatch(continueAsGuest()).unwrap();
    } catch (reason) {
      // Misafir girişi kapalıysa ya da ağ yoksa giriş ekranında açıklanır
      setGuestError(typeof reason === "string" ? reason : "auth/unknown");
      setShowAuth(true);
    } finally {
      setStartingGuest(false);
    }
  }

  if (isAuthenticated) {
    return <LibraryPage user={user} />;
  }

  if (showAuth) {
    return (
      <AuthScreen
        initialError={guestError}
        onBack={() => {
          setShowAuth(false);
          setGuestError(null);
        }}
      />
    );
  }

  return (
    <WelcomeScreen
      onGetStarted={() => void startAsGuest()}
      onSignIn={() => setShowAuth(true)}
      starting={startingGuest}
    />
  );
}

'use client';
import { useState } from "react";
import { Login } from "@/components/auth/login";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { HeroSection } from "@/components/pages/hero-section";
import { WelcomeDashboard } from "@/components/pages/welcome-dashboard";
import { HomeLayout } from "@/components/pages/home-layout";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.status === 'authenticated');

  const renderContent = () => {
    if (isAuthenticated) {
      return <WelcomeDashboard user={user} />;
    } else if (showLogin) {
      return <Login onCancel={() => setShowLogin(false)} />;
    } else {
      return <HeroSection onGetStarted={() => setShowLogin(true)} />;
    }
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} showLogin={showLogin}>
      {renderContent()}
    </HomeLayout>
  );
}
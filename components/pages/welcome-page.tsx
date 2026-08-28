'use client';

import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden px-6 sm:px-10 py-12 flex items-center">
      {/* Background layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_600px_at_15%_30%,rgba(10,91,111,0.35),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(700px_500px_at_0%_80%,rgba(255,193,7,0.25),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,0,0,0.25),rgba(0,0,0,0.15))]"
      />

      {/* Content */}
      <section className="w-full max-w-xl ml-4 sm:ml-8 md:ml-12 lg:ml-20 flex flex-col items-start justify-center gap-8 text-left">
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
            Your personal reading space.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200/90 leading-relaxed">
            Organize your library, save favorites, and track your reading journey in one calm place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            onClick={onGetStarted}
            size="lg"
            variant="default"
            className="w-full sm:w-auto"
          >
            Get Started
          </Button>
        </div>

      </section>
    </main>
  );
}
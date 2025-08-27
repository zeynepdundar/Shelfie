'use client';
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-screen w-full px-6 sm:px-10 py-12 flex">
      {/* Background glow layers */}
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

      {/* Left aligned content */}
      <div className="w-full max-w-2xl flex flex-col items-start justify-center gap-6 text-left ml-4 sm:ml-8 md:ml-12 lg:ml-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          Read. Track. Improve Your Reading Habit.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-200">
          Organize your library, discover your favorites, and track your reading journey.
        </p>

        <div className="flex flex-col gap-4 w-full sm:w-auto">
          <Button
            onClick={onGetStarted}
            className="self-start bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

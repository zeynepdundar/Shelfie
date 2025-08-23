'use client';
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <>
      <h1 className="text-6xl font-bold text-white dark:text-white">
        Read. Track. Improve Your Reading Habit.
      </h1>
      <p className="text-xl text-gray-200 dark:text-gray-300">
        Organize your library, discover your favorites, and track your reading journey.
      </p>

      <div className="flex flex-col gap-4">
        <Button
          className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg text-lg font-semibold"
          onClick={onGetStarted}
        >
          Get Started
        </Button>
      </div>
    </>
  );
}

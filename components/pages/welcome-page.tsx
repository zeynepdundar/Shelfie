"use client";

import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <main className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-transparent text-white">
      {/* The existing bookshelf background remains visible behind this screen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,18,22,0.65)_0%,rgba(8,18,22,0.45)_45%,rgba(8,18,22,0.15)_100%)]"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center gap-3 px-6 py-8 sm:px-10 lg:px-16">
        <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#FFC703]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z" />
            <path d="M12 6v14" />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight">Shelfie</span>
      </header>

      <section
        aria-labelledby="welcome-heading"
        className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
      >
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#FFC703]">
            YOUR READING LIFE, YEAR BY YEAR
          </p>

          <h1
            id="welcome-heading"
            className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Every book becomes part of
            <span className="block text-[#b8d8cf]">your story.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
            Keep track of the books you’ve read, save your favorites, and explore
            your reading habits over time.
          </p>

          <Button
            type="button"
            onClick={onGetStarted}
            size="lg"
            className="mt-9 h-12 w-full gap-3 rounded-full bg-[#FFC703] px-7 text-base font-semibold text-[#17282d] shadow-lg shadow-black/10 transition-colors hover:bg-[#E6B303] focus-visible:ring-2 focus-visible:ring-[#FFC703] focus-visible:ring-offset-4 focus-visible:ring-offset-[#101e23] sm:w-auto"
          >
            Get Started
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Button>
        </div>

      </section>
    </main>
  );
}

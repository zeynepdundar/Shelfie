"use client";

import type { ReactNode } from "react";
import { Star } from "lucide-react";

import { BookCover } from "@/components/books/BookCover";

import { cn } from "@/lib/utils";
import { glassStyle } from "@/components/ui/glass";

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={cn(
            "h-3 w-3 fill-current",
            step <= value ? "star-filled" : "star-empty"
          )}
        />
      ))}
    </span>
  );
}

export interface BookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  /** Durum rozeti: "Okundu", "Okunuyor"... */
  status?: { label: string; tone: "success" | "accent" | "neutral" };
  /** Kartın sağ üstünde beliren küçük aksiyon (favoriden çıkar vb.). */
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Yatay listelerde kullanılan dikey kitap kartı: üstte kapak, altta bilgi. */
export function BookCard({
  title,
  author,
  coverUrl,
  rating,
  status,
  action,
  onClick,
  className,
}: BookCardProps) {
  const interactive = typeof onClick === "function";

  return (
    <article
      className={cn(
        "group relative flex w-[148px] shrink-0 snap-start flex-col gap-3 rounded-xl p-3 transition-colors duration-200",
        interactive && "cursor-pointer hover:bg-white/[0.16]",
        className
      )}
      style={glassStyle}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <BookCover src={coverUrl} size="lg" />

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[0.9rem] font-semibold leading-snug text-white">
          {title}
        </h3>
        <p className="mt-1 truncate text-[0.78rem] text-white/50">{author}</p>

        <div className="mt-2.5 flex flex-col items-start gap-1.5">
          {status && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
                status.tone === "success"
                  ? "bg-mint/15 text-mint"
                  : status.tone === "accent"
                    ? "bg-accent-strong/20 text-accent-soft"
                    : "bg-white/10 text-white/70"
              )}
            >
              {status.label}
            </span>
          )}
          {typeof rating === "number" && rating > 0 && <Rating value={rating} />}
        </div>
      </div>

      {action && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
          {action}
        </div>
      )}
    </article>
  );
}

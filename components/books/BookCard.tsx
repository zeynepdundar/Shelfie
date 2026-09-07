"use client";

import type { ReactNode } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { glassStyle } from "@/components/ui/glass";

/* Kapağı olmayan kitaplar için sırt rengi paleti. Başlıktan türetilir ki
   aynı kitap her zaman aynı renkte görünsün. */
const SPINE_COLORS = [
  "#e8590c",
  "#12b886",
  "#e03131",
  "#1c7ed6",
  "#c2255c",
  "#5f3dc4",
  "#f08c00",
  "#0ca678",
  "#7048e8",
  "#1098ad",
  "#d6336c",
  "#74b816",
];

function spineColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return SPINE_COLORS[hash % SPINE_COLORS.length];
}

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
        "group relative flex w-[160px] shrink-0 snap-start flex-col gap-3 rounded-xl p-3 transition-colors duration-200",
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
      <span
        aria-hidden
        className="block aspect-[3/4] w-full overflow-hidden rounded-lg"
        style={{ background: spineColor(title) }}
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </span>

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

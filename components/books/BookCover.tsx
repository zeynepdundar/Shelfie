"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

/** Kapağı olmayan kitapların cilt rengi. */
const PLACEHOLDER_COLOR = "#1b5e9e";

/* Uygulamadaki tek kapak bileşeni. Kapak görseli varsa onu, yoksa aynı
   yer tutucuyu gösterir — böylece kapaklı ve kapaksız kitaplar her yerde
   aynı biçimde görünür. Kitap hissi asimetrik köşelerden, sol kenardaki
   sırt gölgesinden ve çapraz ışıktan gelir. */
const SIZES = {
  sm: {
    frame: "h-20 w-14",
    radius: "rounded-l-[1px] rounded-r-[3px]",
    spine: "w-[4px]",
    spineEdge: "left-[4px]",
    icon: "h-5 w-5",
    shadow: "shadow-[0_6px_14px_-8px_rgba(0,0,0,0.8)]",
  },
  md: {
    frame: "h-16 w-12",
    radius: "rounded-l-[1px] rounded-r-[3px]",
    spine: "w-[4px]",
    spineEdge: "left-[4px]",
    icon: "h-4 w-4",
    shadow: "shadow-[0_6px_14px_-8px_rgba(0,0,0,0.8)]",
  },
  lg: {
    frame: "aspect-[2/3] w-full",
    radius: "rounded-l-[2px] rounded-r-[4px]",
    spine: "w-[7px]",
    spineEdge: "left-[7px]",
    icon: "h-8 w-8",
    shadow: "shadow-[0_8px_18px_-8px_rgba(0,0,0,0.85)]",
  },
} as const;

export interface BookCoverProps {
  src?: string;
  alt?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function BookCover({
  src,
  alt = "",
  size = "lg",
  className,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const style = SIZES[size];
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden ring-1 ring-inset ring-white/10",
        style.frame,
        style.radius,
        style.shadow,
        className
      )}
      style={{ backgroundColor: PLACEHOLDER_COLOR }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-white/45">
          <BookOpen className={style.icon} />
        </span>
      )}

      {/* Sırt gölgesi + sayfa kenarındaki ince ışık */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 bg-gradient-to-r from-black/55 to-transparent",
          style.spine
        )}
      />
      <span
        className={cn("absolute inset-y-0 w-px bg-white/20", style.spineEdge)}
      />
      <span className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/25" />
    </span>
  );
}

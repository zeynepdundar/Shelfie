import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Shelfie buton sistemi.
 * Tüm butonlar hap (pill) formundadır — navbar ve welcome ekranıyla aynı dil.
 *  • default / glow : sarı, birincil aksiyon (Ekle, Kaydet, Başla)
 *  • primary        : koyu yeşil, ikincil ama dolu aksiyon
 *  • outline        : çerçeveli, nötr aksiyon (Geri, İptal)
 *  • ghost          : yazı butonu
 *  • destructive    : silme / geri alınamaz aksiyon
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "rounded-full font-semibold",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-accent-strong text-on-accent",
          "shadow-accent",
          "border border-accent-hover/40",
          "hover:bg-accent-hover",
        ].join(" "),

        glow: [
          "bg-accent-strong text-on-accent",
          "shadow-accent",
          "border border-accent-hover/40",
          "hover:bg-accent-hover",
        ].join(" "),

        primary: [
          "bg-brand text-white",
          "hover:bg-brand-light",
        ].join(" "),

        secondary: [
          "bg-control text-ink",
          "border border-control-border",
          "hover:bg-control-hover",
        ].join(" "),

        outline: [
          "border border-control-border bg-control text-ink",
          "backdrop-blur-md",
          "hover:bg-control-hover hover:text-ink",
        ].join(" "),

        ghost: ["text-ink/70", "hover:bg-control-hover hover:text-ink"].join(" "),

        destructive: [
          "bg-destructive text-white",
          "hover:brightness-110",
        ].join(" "),

        link: [
          "text-accent-ink underline-offset-4",
          "hover:underline",
        ].join(" "),
      },

      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

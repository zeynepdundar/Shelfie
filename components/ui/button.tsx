import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "rounded-xl font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-amber-400 text-slate-900",
          "border border-amber-300/60",
          "shadow-sm shadow-amber-100/50",
          "hover:bg-amber-300",
          "hover:shadow-md hover:shadow-amber-200/40",
        ].join(" "),

        primary: [
          "bg-slate-900 text-white",
          "shadow-sm",
          "hover:bg-slate-800",
          "hover:shadow-md",
        ].join(" "),

        secondary: [
          "bg-amber-50 text-amber-900",
          "border border-amber-100",
          "hover:bg-amber-100/80",
        ].join(" "),

        outline: [
          "border border-slate-200",
          "bg-white/70 backdrop-blur-sm",
          "text-slate-800",
          "hover:bg-slate-100/80",
          "hover:border-slate-300",
        ].join(" "),

        ghost: [
          "text-slate-700",
          "hover:bg-amber-50",
          "hover:text-slate-900",
        ].join(" "),

        destructive: [
          "bg-red-500 text-white",
          "hover:bg-red-600",
          "shadow-sm",
        ].join(" "),

        glow: [
          "bg-amber-400/90 text-slate-900",
          "border border-amber-200/50",
          "backdrop-blur-md",
          "shadow-lg shadow-amber-200/30",
          "hover:bg-amber-300",
        ].join(" "),

        link: [
          "text-slate-900 underline-offset-4",
          "hover:underline",
        ].join(" "),
      },

      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
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
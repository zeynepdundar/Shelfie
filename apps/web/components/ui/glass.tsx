"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Cam yüzeyler — TEK KAYNAK
   Uygulamadaki bütün cam kartlar bu dosyadan gelir. Bir yüzeyin opaklığını ya da
   bulanıklığını değiştirmek istersen aşağıdaki iki nesneyi düzenlemen yeterli;
   sidebar, giriş kartı ve tüm sayfa kartları birlikte değişir.
   ========================================================================== */

/** Açık cam: içerik kartları, kart içi kutucuklar. */
export const glassStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.10)",
  backdropFilter: "blur(20px) saturate(1.4)",
  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
};

/** Koyu cam: sidebar, mobil bar, giriş ekranı kartı. */
export const darkGlassStyle: CSSProperties = {
  background: "rgba(10, 8, 6, 0.55)",
  backdropFilter: "blur(24px) saturate(1.2)",
  WebkitBackdropFilter: "blur(24px) saturate(1.2)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
};

/* -------------------------------------------------------------------------- */

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "light" | "dark";
  /** Anlamlı etiket gerektiğinde: "section", "article", "aside"... */
  as?: "div" | "section" | "article" | "aside";
}

/** Sayfalardaki temel cam kart. */
export function GlassCard({
  variant = "light",
  as: Tag = "div",
  className,
  style,
  ...props
}: GlassCardProps) {
  return (
    <Tag
      className={cn("min-w-0 rounded-2xl p-5 text-white", className)}
      style={{
        ...(variant === "dark" ? darkGlassStyle : glassStyle),
        ...style,
      }}
      {...props}
    />
  );
}

/** Kart içindeki gömülü alan (grafik kutusu, liste zemini). */
export function GlassInset({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-xl bg-white/[0.05] p-4", className)}
      {...props}
    />
  );
}

interface GlassCardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Sağ tarafta duran aksiyon: sayaç, yıl seçici, buton... */
  action?: ReactNode;
  /** Başlığın solundaki ikon rozeti. */
  icon?: LucideIcon;
  size?: "md" | "lg";
  className?: string;
}

/** Kart başlığı: başlık + açıklama + isteğe bağlı aksiyon. */
export function GlassCardHeader({
  title,
  description,
  action,
  icon: Icon,
  size = "lg",
  className,
}: GlassCardHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          {Icon && <IconBadge icon={Icon} />}
          <div>
            <h2
              className={cn(
                "font-semibold text-white",
                size === "lg" ? "text-xl" : "text-lg"
              )}
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-white/60">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

interface IconBadgeProps {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

/** Kartların sağ üstündeki yuvarlak köşeli ikon kutusu. */
export function IconBadge({ icon: Icon, className, iconClassName }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-white/10 p-3 text-white/80",
        className
      )}
    >
      <Icon className={cn("h-5 w-5", iconClassName)} />
    </span>
  );
}

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  /** İsteğe bağlı: verilmezse kart sadece rakama odaklanır. */
  icon?: LucideIcon;
}

/** Sayfa üstündeki özet istatistik kartı. Vurgu rakamda. */
export function StatCard({ label, value, note, icon }: StatCardProps) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-white/60">
            {label}
          </p>
          <p
            className="mt-3 text-4xl font-light leading-none tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value}
          </p>
          {note && <p className="mt-2.5 text-xs text-white/50">{note}</p>}
        </div>
        {icon && <IconBadge icon={icon} />}
      </div>
    </GlassCard>
  );
}

interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}

/** Kart içindeki küçük sayı kutusu. */
export function StatTile({ label, value, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.05] p-4",
        className
      )}
    >
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

interface MetricProps {
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
}

/** Kartın içindeki büyük rakam + alt satır + ikon. */
export function GlassMetric({ value, hint, icon }: MetricProps) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-4xl font-semibold tracking-tight text-white">
          {value}
        </p>
        {hint && <p className="mt-1 text-sm text-white/60">{hint}</p>}
      </div>
      <IconBadge icon={icon} />
    </div>
  );
}

/** Yatay ilerleme çubuğu. */
export function GlassProgress({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-white/70 transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** Boş durum kutusu. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-6 py-14 text-center">
      <IconBadge icon={icon} className="mb-4 rounded-full p-4" iconClassName="h-7 w-7" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Sayfa yüklenirken gösterilen hap. */
export function PageLoading({ label }: { label: ReactNode }) {
  return (
    <div className="sf-page px-4 py-16">
      <div className="relative mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
        <div
          className="flex items-center gap-4 rounded-full px-5 py-3"
          style={glassStyle}
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          <span className="text-sm text-white/70">{label}</span>
        </div>
      </div>
    </div>
  );
}

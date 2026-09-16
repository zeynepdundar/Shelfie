/**
 * Menü ikonları: editöryal çizgi illüstrasyonlar.
 * Çizgiler `currentColor` ile gelir (menü satırının rengini alır),
 * her ikonda tek bir renk aksanı vardır.
 */

const CORAL = "#e8836b";
const BUTTER = "#f0cf85";
const COBALT = "#7a9fe6";
const GREEN = "#71b596";

type IconProps = {
  className?: string;
};

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Kütüphane: üst üste duran üç kitap. */
export function LibraryIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <rect x="3.7" y="16.2" width="16.6" height="3.4" rx="0.7" />
      <path d="M6.6 16.2v3.4" />
      <rect
        x="4.9"
        y="12.8"
        width="14.2"
        height="3.4"
        rx="0.7"
        fill={CORAL}
        fillOpacity="0.9"
      />
      <path d="M7.8 12.8v3.4" />
      <rect x="5.9" y="9.4" width="12" height="3.4" rx="0.7" />
      <path d="M8.8 9.4v3.4" />
    </svg>
  );
}

/** İstatistikler: rafta farklı boylarda duran kitaplar. */
export function StatsIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <rect x="4.4" y="13.4" width="2.9" height="6.4" rx="0.6" />
      <rect
        x="8.5"
        y="9.4"
        width="2.9"
        height="10.4"
        rx="0.6"
        fill={COBALT}
        fillOpacity="0.9"
      />
      <rect x="12.6" y="11.6" width="2.9" height="8.2" rx="0.6" />
      <path d="M17.2 19.8l1.6-5.9 2.5.7-1.4 5.2z" />
      <path d="M4.4 16.4h2.9M8.5 12.4h2.9M12.6 14.6h2.9" />
      <path d="M3 20.4h18" />
    </svg>
  );
}

/** Hazinem: sandık ve elmas. */
export function TreasuresIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path
        d="M9.8 2.6h4.4l1.4 2.2-3.6 3.9-3.6-3.9z"
        fill={GREEN}
        fillOpacity="0.9"
      />
      <path d="M8.4 4.8h7.2M9.8 2.6l2.2 2.2M14.2 2.6l-2.2 2.2" />
      <path d="M3.9 12.4c0-1.8 1.5-2.8 3.1-2.8h10c1.6 0 3.1 1 3.1 2.8z" />
      <path d="M3.9 12.4h16.2v5.9c0 .9-.7 1.6-1.6 1.6H5.5c-.9 0-1.6-.7-1.6-1.6z" />
      <path d="M3.9 12.4h16.2" />
      <rect
        x="10.9"
        y="11.3"
        width="2.2"
        height="2.6"
        rx="0.5"
        fill={BUTTER}
        fillOpacity="0.85"
      />
      <path d="M7.3 9.7v10.2M16.7 9.7v10.2" />
    </svg>
  );
}

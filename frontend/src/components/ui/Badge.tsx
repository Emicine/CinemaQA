import clsx from "clsx";

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "success" | "error" | "warning" | "neutral" | "info";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: "bg-success/15 text-success",
  error:   "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  neutral: "bg-white/10 text-text-secondary",
  info:    "bg-blue-500/15 text-blue-400",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-block px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide",
        BADGE_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── GenrePill ────────────────────────────────────────────────────────────────
export function GenrePill({
  genre,
  active,
  onClick,
}: {
  genre: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1 rounded text-xs font-medium border transition-all",
        active
          ? "bg-white text-background border-white"
          : "bg-transparent text-text-secondary border-border hover:border-white/50 hover:text-white",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      {genre.replace("_", " ")}
    </button>
  );
}

// ─── MaturityRating ───────────────────────────────────────────────────────────
export function MaturityRating({ rating = "UA" }: { rating?: string }) {
  return (
    <span className="border border-text-secondary text-text-secondary text-[11px] px-2 py-px rounded-sm font-medium">
      {rating}
    </span>
  );
}

// ─── LiveBadge ────────────────────────────────────────────────────────────────
export function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-success border border-success px-3 py-1 rounded-full font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      LIVE
    </span>
  );
}

// ─── FillingBadge ─────────────────────────────────────────────────────────────
export function FillingBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] text-warning font-semibold">
      ⚡ Filling Fast
    </span>
  );
}

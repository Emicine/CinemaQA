import clsx from "clsx";

// ─── Base skeleton pulse ──────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded bg-surface-2",
        className
      )}
    />
  );
}

// ─── Movie Card Skeleton ──────────────────────────────────────────────────────
export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px]">
      <Skeleton className="w-full h-[300px] rounded" />
      <Skeleton className="mt-2 h-3 w-3/4" />
      <Skeleton className="mt-1.5 h-2.5 w-1/2" />
    </div>
  );
}

// ─── Movie Row Skeleton ───────────────────────────────────────────────────────
export function MovieRowSkeleton() {
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between px-12 mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex gap-2 px-12 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Hero Skeleton ────────────────────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <div className="h-[90vh] bg-surface flex items-end px-12 pb-20">
      <div className="w-full max-w-xl">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-20 w-4/5 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36 rounded" />
          <Skeleton className="h-12 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Movie Grid Skeleton ──────────────────────────────────────────────────────
export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="w-full aspect-[2/3] rounded" />
          <Skeleton className="mt-2 h-3 w-3/4" />
          <Skeleton className="mt-1.5 h-2.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─── Show Detail Skeleton ─────────────────────────────────────────────────────
export function MovieDetailSkeleton() {
  return (
    <main>
      <div className="relative h-[65vh] bg-surface flex items-end px-12 pb-12">
        <div className="flex items-end gap-10 w-full">
          <Skeleton className="hidden md:block w-44 h-64 rounded-lg shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-14 w-3/4 mb-4" />
            <div className="flex gap-4 mb-4">
              {[80, 60, 100, 80, 120].map((w, i) => (
                <Skeleton key={i} className={`h-4 w-${w / 4}`} />
              ))}
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-36 rounded" />
              <Skeleton className="h-11 w-32 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-12 py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-20 rounded" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg mb-4" />
        ))}
      </div>
    </main>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-t border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Seat Map Skeleton ────────────────────────────────────────────────────────
export function SeatMapSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Legend */}
      <div className="flex gap-6 justify-center mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-4 rounded bg-surface-2" />
            <div className="w-16 h-3 rounded bg-surface-2" />
          </div>
        ))}
      </div>
      {/* Screen */}
      <div className="text-center mb-10">
        <div className="w-3/5 mx-auto h-1 bg-surface-2 rounded mb-2" />
        <div className="h-3 w-32 mx-auto bg-surface-2 rounded" />
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 mb-2 justify-center">
          <div className="w-7 h-4 bg-surface-2 rounded" />
          {Array.from({ length: 12 }).map((_, j) => (
            <div key={j} className="w-8 h-7 bg-surface-2 rounded-t" />
          ))}
          <div className="w-7 h-4 bg-surface-2 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-6">
      <Skeleton className="h-3 w-28 mb-4" />
      <Skeleton className="h-10 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

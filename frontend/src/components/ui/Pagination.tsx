"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build visible page range (max 5 buttons)
  const range: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) range.push(i);
  } else {
    range.push(0);
    if (currentPage > 3) range.push("…");
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages - 2, currentPage + 1);
      i++
    ) {
      range.push(i);
    }
    if (currentPage < totalPages - 4) range.push("…");
    range.push(totalPages - 1);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="w-9 h-9 rounded border border-border hover:border-white/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-text-secondary hover:text-white transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {showPageNumbers &&
        range.map((item, idx) =>
          item === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-text-secondary text-sm"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              className={clsx(
                "w-9 h-9 rounded text-sm font-semibold transition-all",
                item === currentPage
                  ? "bg-primary text-white border border-primary"
                  : "border border-border text-text-secondary hover:border-white/60 hover:text-white"
              )}
            >
              {(item as number) + 1}
            </button>
          )
        )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="w-9 h-9 rounded border border-border hover:border-white/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-text-secondary hover:text-white transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Load More Button ─────────────────────────────────────────────────────────
export function LoadMoreButton({
  onClick,
  loading,
  hasMore,
}: {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={onClick}
        disabled={loading}
        className="border border-border hover:border-white/60 text-white px-10 py-3 rounded text-sm font-semibold transition-all disabled:opacity-50 hover:bg-white/5"
      >
        {loading ? "Loading…" : "Load More"}
      </button>
    </div>
  );
}

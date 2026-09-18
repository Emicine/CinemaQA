"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Monitor, TrendingUp, ChevronRight, Search } from "lucide-react";
import { useTheatres } from "@/hooks";
import { MovieGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState, EmptyState } from "@/components/ui/ErrorStates";
import { Pagination } from "@/components/ui/Pagination";

const CITY_COLORS: Record<string, string> = {
  Mumbai: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  Delhi: "linear-gradient(135deg, #870000 0%, #190a05 100%)",
  Bangalore: "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
  Kolkata: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
  Chennai: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  Hyderabad: "linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)",
  default: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
};

export default function TheatresPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useTheatres(page, 12);

  const theatres = (data?.pageData ?? []).filter(
    (t) =>
      !search ||
      t.theatreName.toLowerCase().includes(search.toLowerCase()) ||
      t.theatreLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="pt-[68px] min-h-screen">
      <div className="px-12 pt-12 pb-8">
        <h1 className="font-display text-6xl tracking-wide mb-2">THEATRES</h1>
        <p className="text-text-secondary text-sm">
          {data?.totalElements ?? 0} cinemas across Belgium
        </p>
      </div>

      {/* Search */}
      <div className="px-12 pb-8">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="w-full h-10 bg-surface border border-border rounded pl-9 pr-4 text-white text-sm outline-none placeholder:text-text-secondary focus:border-white/60 transition-colors"
          />
        </div>
      </div>

      <div className="px-12 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load theatres." onRetry={refetch} />
        ) : theatres.length === 0 ? (
          <EmptyState variant="search" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {theatres.map((theatre, i) => {
              const gradient =
                CITY_COLORS[theatre.theatreLocation] ?? CITY_COLORS.default;

              return (
                <motion.div
                  key={theatre.theatreId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/theatres/${theatre.theatreId}`}
                    className="group block bg-surface rounded-lg overflow-hidden border border-border hover:border-white/30 transition-all"
                  >
                    {/* Banner */}
                    <div
                      className="h-20 relative overflow-hidden"
                      style={{ background: gradient }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-lg tracking-widest opacity-60">
                          {theatre.theatreLocation.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                          {theatre.theatreName}
                        </h3>
                        <ChevronRight
                          size={16}
                          className="text-text-secondary group-hover:text-white transition-colors shrink-0 mt-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-text-secondary text-sm mb-3">
                        <MapPin size={13} />
                        {theatre.theatreLocation}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-surface-2 rounded p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Monitor size={12} className="text-text-secondary" />
                          </div>
                          <div className="text-lg font-bold">
                            {theatre.totalScreens ?? 0}
                          </div>
                          <div className="text-[10px] text-text-secondary uppercase tracking-wider">
                            Screens
                          </div>
                        </div>
                        <div className="bg-surface-2 rounded p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp size={12} className="text-success" />
                          </div>
                          <div className="text-lg font-bold text-success">
                            {((theatre.totalBookings ?? 0) / 1000).toFixed(1)}K
                          </div>
                          <div className="text-[10px] text-text-secondary uppercase tracking-wider">
                            Bookings
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!search && data && data.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}
      </div>
    </main>
  );
}

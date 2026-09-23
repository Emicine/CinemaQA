"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMovies } from "@/hooks";
import { MovieGridSkeleton } from "@/components/ui/Skeletons";
import { ErrorState, EmptyState } from "@/components/ui/ErrorStates";
import { GenrePill } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import type { Genre } from "@/types";

const GENRES: Genre[] = [
  "ACTION",
  "THRILLER",
  "HORROR",
  "COMEDY",
  "SUSPENSE",
  "DRAMA",
  "ROMANCE",
  "SCIENCE_FICTION",
];

const GENRE_GRADIENTS: Record<string, string> = {
  ACTION:
    "linear-gradient(135deg, #254896 0%, #07152F 100%)",

  THRILLER:
    "linear-gradient(135deg, #324B96 0%, #091630 100%)",

  HORROR:
    "linear-gradient(135deg, #101D3A 0%, #030916 100%)",

  COMEDY:
    "linear-gradient(135deg, #B8862C 0%, #35250B 100%)",

  SUSPENSE:
    "linear-gradient(135deg, #214A78 0%, #07152F 100%)",

  DRAMA:
    "linear-gradient(135deg, #254B67 0%, #0A203A 100%)",

  ROMANCE:
    "linear-gradient(135deg, #493A79 0%, #161535 100%)",

  SCIENCE_FICTION:
    "linear-gradient(135deg, #1C4C79 0%, #07152F 100%)",
};

const PAGE_SIZE = 18;

export default function MoviesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  const { data, isLoading, isError, refetch } = useMovies(page, PAGE_SIZE);

  // Client-side filter for search + genre (backend doesn't support filter params)
  const filtered = useMemo(() => {
    const movies = data?.pageData ?? [];
    return movies.filter((m) => {
      const matchesSearch =
        !search ||
        m.movieName.toLowerCase().includes(search.toLowerCase()) ||
        m.movieDirector.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = !selectedGenre || m.movieGenre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [data, search, selectedGenre]);

  return (
    <main className="pt-[68px] min-h-screen">
      {/* Page header */}
      <div className="px-12 pt-12 pb-8">
        <h1 className="font-display text-6xl tracking-wide mb-2">ALL MOVIES</h1>
        <p className="text-text-secondary text-sm">
          {data?.totalElements ?? 0} titles in our catalogue
        </p>
      </div>

      {/* Filters bar */}
      <div className="px-12 pb-8 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search movies or directors…"
            className="w-full h-10 bg-surface border border-border rounded pl-9 pr-4 text-white text-sm outline-none placeholder:text-text-secondary focus:border-white/60 transition-colors"
          />
        </div>

        {/* Genre pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-text-secondary" />
          <GenrePill
            genre="All"
            active={!selectedGenre}
            onClick={() => { setSelectedGenre(null); setPage(0); }}
          />
          {GENRES.map((g) => (
            <GenrePill
              key={g}
              genre={g}
              active={selectedGenre === g}
              onClick={() => { setSelectedGenre(selectedGenre === g ? null : g); setPage(0); }}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-12 pb-16">
        {isLoading ? (
          <MovieGridSkeleton count={PAGE_SIZE} />
        ) : isError ? (
          <ErrorState
            message="Failed to load movies. Is the backend running?"
            onRetry={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            variant={search || selectedGenre ? "search" : "movies"}
            action={
              search || selectedGenre
                ? {
                    label: "Clear filters",
                    onClick: () => { setSearch(""); setSelectedGenre(null); },
                  }
                : undefined
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
          >
            {filtered.map((movie, i) => (
              <motion.div
                key={movie.movieId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Link href={`/movies/${movie.movieId}`} className="group block">
                  {/* Poster */}
                  <div
                    className="w-full aspect-[2/3] rounded overflow-hidden relative mb-3 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-card-hover"
                    style={{ background: GENRE_GRADIENTS[movie.movieGenre] ?? GENRE_GRADIENTS.DRAMA }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                      <span className="font-display text-base leading-tight tracking-wide opacity-80">
                        {movie.movieName}
                      </span>
                      <span className="text-xs text-white/40 mt-1">
                        {movie.movieReleaseDate?.slice(0, 4)}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-sm bg-primary px-4 py-2 rounded">
                        View
                      </span>
                    </div>
                  </div>

                  {/* Info below poster */}
                  <div className="px-0.5">
                    <div className="font-semibold text-sm text-white group-hover:text-primary transition-colors truncate">
                      {movie.movieName}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                      <span>{movie.movieGenre.replace("_", " ")}</span>
                      <span>·</span>
                      <span>{movie.movieReleaseDate?.slice(0, 4)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination — only when not filtering client-side */}
        {!search && !selectedGenre && data && data.totalPages > 1 && (
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

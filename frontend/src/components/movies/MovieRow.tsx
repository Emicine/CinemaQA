"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import type { Movie } from "@/types";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showRank?: boolean;
}

export function MovieRow({ title, movies, showRank = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = dir === "left" ? -600 : 600;
    rowRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center justify-between px-12 mb-6">
        <h2 className="font-display text-section tracking-[0.05em] uppercase">
          <span className="text-primary">✦</span> {title}
        </h2>
        <button className="text-xs text-text-secondary hover:text-white transition-colors">
          See All ›
        </button>
      </div>

      {/* Row with fade edges + scroll buttons */}
      <div className="relative group">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #07152F, transparent)" }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #07152F, transparent)" }}
        />

        {/* Scroll left btn */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface/90 border border-border flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-2 hover:scale-110"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scroll right btn */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface/90 border border-border flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-2 hover:scale-110"
        >
          <ChevronRight size={20} />
        </button>

        {/* Draggable scroll row */}
        <motion.div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto px-12 pb-8"
          style={{ scrollbarWidth: "none" }}
          drag="x"
          dragConstraints={rowRef}
          dragElastic={0.1}
        >
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.movieId}
              movie={movie}
              rank={showRank ? i + 1 : undefined}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

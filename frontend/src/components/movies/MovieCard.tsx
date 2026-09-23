"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp } from "lucide-react";
import type { Movie } from "@/types";
import clsx from "clsx";

// Deterministic gradient per movie based on genre
const GENRE_GRADIENTS: Record<string, string> = {
  ACTION:
    "linear-gradient(135deg, #254896 0%, #07152F 100%)",

  THRILLER:
    "linear-gradient(135deg, #263E7A 0%, #091630 100%)",

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

interface MovieCardProps {
  movie: Movie;
  rank?: number;
}

export function MovieCard({ movie, rank }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const gradient =
    GENRE_GRADIENTS[movie.movieGenre] || GENRE_GRADIENTS.DRAMA;

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setHovered(true), 300);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHovered(false);
  };

  const genreLabel = movie.movieGenre.replace("_", " ");
  const durationHours = Math.floor(movie.movieDuration / 60);
  const durationMins = movie.movieDuration % 60;
  const duration = durationHours > 0
    ? `${durationHours}h ${durationMins}m`
    : `${durationMins}m`;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: rank ? "180px" : "200px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rank Number (Top 10) */}
      {rank && (
        <div
          className="absolute -left-6 bottom-0 font-display text-[90px] leading-none pointer-events-none select-none"
          style={{
            WebkitTextStroke: "2px #444",
            color: "transparent",
          }}
        >
          {rank}
        </div>
      )}

      {/* Card Art wrapped in Link */}
      <Link href={`/movies/${movie.movieId}`}>
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full rounded overflow-hidden cursor-pointer relative shadow-md"
          style={{ height: "300px", background: gradient }}
        >
          {movie.moviePosterUrl && (
            <img 
              src={movie.moviePosterUrl} 
              alt={movie.movieName}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Poster content (only visible if no poster image) */}
          {!movie.moviePosterUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0">
              <div className="font-display text-xl leading-tight tracking-wide opacity-80">
                {movie.movieName}
              </div>
              <div className="mt-2 text-xs text-white/50">{movie.movieReleaseDate?.slice(0, 4)}</div>
            </div>
          )}

          {/* Gradient overlay on poster to ensure text readability */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(3, 9, 22, 0.9) 0%, transparent 65%)",
            }}
          />

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
            <div className="text-xs font-semibold text-white truncate">
              {movie.movieName}
            </div>
            <div className="text-xs text-white/60 mt-0.5">{duration}</div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info } from "lucide-react";
import type { Movie } from "@/types";

const GENRE_BG: Record<string, string> = {
  ACTION:
    "radial-gradient(ellipse at 70% 40%, rgba(37,72,150,0.45), transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(7,21,47,0.85), transparent 70%)",

  THRILLER:
    "radial-gradient(ellipse at 70% 40%, rgba(50,75,150,0.45), transparent 60%)",

  HORROR:
    "radial-gradient(ellipse at 60% 50%, rgba(8,18,40,0.75), transparent 60%)",

  COMEDY:
    "radial-gradient(ellipse at 70% 40%, rgba(244,201,93,0.22), transparent 60%)",

  DRAMA:
    "radial-gradient(ellipse at 70% 40%, rgba(30,80,120,0.4), transparent 60%)",

  ROMANCE:
    "radial-gradient(ellipse at 70% 40%, rgba(80,65,150,0.4), transparent 60%)",

  SCIENCE_FICTION:
    "radial-gradient(ellipse at 70% 40%, rgba(45,80,160,0.5), transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(10,60,90,0.4), transparent 60%)",

  SUSPENSE:
    "radial-gradient(ellipse at 70% 40%, rgba(30,55,110,0.5), transparent 60%)",
};

interface HeroBillboardProps {
  movies: Movie[];
}

export function HeroBillboard({ movies }: HeroBillboardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % Math.min(movies.length, 5));
    }, 8000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies.length) return null;

  const movie = movies[activeIndex];
  const bg = GENRE_BG[movie.movieGenre] || GENRE_BG.DRAMA;

  const durationHours = Math.floor(movie.movieDuration / 60);
  const durationMins = movie.movieDuration % 60;
  const duration = `${durationHours}h ${durationMins}m`;
  const genreLabel = movie.movieGenre.replace("_", " ");
  const year = movie.movieReleaseDate?.slice(0, 4);

  return (
    <div className="relative h-[90vh] flex items-end overflow-hidden">
      {/* BG */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.movieId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          style={{
          background:
            "linear-gradient(135deg, #0A1E42 0%, #07152F 55%, #050F25 100%)",
        }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: bg }} />
          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-b
          from-transparent
          via-[#07152F]/30
          to-[#07152F]
        "
      />

      <div
        className="
          absolute inset-0
          bg-gradient-to-r
          from-[#07152F]
          via-[#07152F]/70
          to-transparent
        "
        style={{ width: "60%" }}
      />

      {/* Content */}
      <div className="relative z-10 px-12 pb-20 max-w-[700px]">
        {/* Badge */}
        <motion.div
          key={`badge-${movie.movieId}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 border border-primary text-primary text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded mb-6"
          style={{ background: "rgba(229,9,20,0.1)" }}
        >
          ★ Featured Film
        </motion.div>

        {/* Title */}
        <motion.h1
          key={`title-${movie.movieId}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display leading-none mb-4"
          style={{ fontSize: "clamp(48px, 7vw, 80px)", letterSpacing: "0.04em", textShadow: "0 4px 32px rgba(0,0,0,0.8)" }}
        >
          {movie.movieName.toUpperCase()}
        </motion.h1>

        {/* Meta */}
        <motion.div
          key={`meta-${movie.movieId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 flex-wrap mb-5"
        >
          <span className="text-success font-bold text-sm">
            {Math.max(70, Math.min(99, 80 + movie.movieId * 3))}% Match
          </span>
          <span className="text-text-secondary text-sm">{year}</span>
          <span
            className="border border-text-secondary text-text-secondary text-xs px-2 py-px rounded-sm"
          >
            UA
          </span>
          <span className="text-text-secondary text-sm">{duration}</span>
          <span className="text-text-secondary text-sm">{genreLabel}</span>
        </motion.div>

        {/* Synopsis */}
        <motion.p
          key={`synopsis-${movie.movieId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/80 text-base leading-relaxed mb-8 clamp-3"
          style={{ maxWidth: "560px" }}
        >
          {movie.movieDescription}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          key={`cta-${movie.movieId}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3"
        >
          <Link
            href={`/movies/${movie.movieId}`}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded font-semibold text-base flex items-center gap-2.5 transition-all hover:scale-105"
          >
            <Play size={18} fill="white" /> Book Tickets
          </Link>
          <button className="bg-white/15 hover:bg-white/20 text-white px-8 py-3.5 rounded font-semibold text-base flex items-center gap-2.5 transition-all backdrop-blur-sm"
            style={{ border: "2px solid rgba(255,255,255,0.4)" }}
          >
            <Plus size={18} /> My List
          </button>
          <Link
            href={`/movies/${movie.movieId}`}
            className="btn-icon"
          >
            <Info size={18} />
          </Link>
        </motion.div>
      </div>

      {/* Dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 right-12 flex gap-2 z-10">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

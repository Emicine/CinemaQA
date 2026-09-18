import { notFound } from "next/navigation";
import Link from "next/link";
import { movieService } from "@/services/movieService";
import { showService } from "@/services";
import { ShowSelector } from "@/components/movies/ShowSelector";
import type { Movie, Show } from "@/types";
import { Play, Plus, Clock, Calendar, Star } from "lucide-react";

const GENRE_BG: Record<string, string> = {
  ACTION: "linear-gradient(135deg, #870000, #190a05)",
  THRILLER: "linear-gradient(135deg, #0f0c29, #302b63)",
  HORROR: "linear-gradient(135deg, #000, #1a0000)",
  COMEDY: "linear-gradient(135deg, #f7971e, #ffd200)",
  DRAMA: "linear-gradient(135deg, #1f4037, #99f2c8)",
  ROMANCE: "linear-gradient(135deg, #834d9b, #d04ed6)",
  SCIENCE_FICTION: "linear-gradient(135deg, #2d1b69, #11998e)",
  SUSPENSE: "linear-gradient(135deg, #141e30, #243b55)",
};

interface MoviePageProps {
  params: { movieId: string };
}

async function getData(movieId: number) {
  try {
    const [movie, showsData] = await Promise.all([
      movieService.getById(movieId),
      showService.getByMovie(movieId, 0, 50),
    ]);
    return { movie, shows: showsData.pageData };
  } catch {
    return null;
  }
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const movieId = Number(params.movieId);
  if (isNaN(movieId)) return notFound();

  const data = await getData(movieId);
  if (!data) return notFound();

  const { movie, shows } = data;

  const durationHours = Math.floor(movie.movieDuration / 60);
  const durationMins = movie.movieDuration % 60;
  const duration = `${durationHours}h ${durationMins}m`;
  const genreLabel = movie.movieGenre.replace("_", " ");
  const year = movie.movieReleaseDate?.slice(0, 4);
  const posterBg = GENRE_BG[movie.movieGenre] || GENRE_BG.DRAMA;

  return (
    <main>
      {/* Hero section */}
      <div className="relative min-h-[65vh] flex items-end overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0" style={{ background: "#141414" }}>
          <div
            className="absolute inset-0 opacity-60"
            style={{ backgroundImage: GENRE_BG[movie.movieGenre] ?? GENRE_BG.DRAMA }}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-background" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, #141414 0%, transparent 40%)" }}
        />

        {/* Content */}
        <div className="relative z-10 px-12 pb-12 flex items-end gap-10 w-full">
          {/* Poster */}
          <div
            className="hidden md:flex shrink-0 w-44 h-64 rounded-lg items-center justify-center shadow-modal overflow-hidden"
            style={{ background: posterBg }}
          >
            <span className="font-display text-lg text-center px-3 leading-tight tracking-wide opacity-80">
              {movie.movieName}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <h1
              className="font-display leading-none mb-3"
              style={{ fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "0.03em" }}
            >
              {movie.movieName.toUpperCase()}
            </h1>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <span className="flex items-center gap-1.5 text-warning text-sm font-medium">
                <Star size={14} fill="currentColor" /> 8.4 / 10
              </span>
              <span
                className="border border-text-secondary text-text-secondary text-xs px-2 py-px rounded-sm"
              >
                UA
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary text-sm">
                <Clock size={14} /> {duration}
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary text-sm">
                <Calendar size={14} /> {year}
              </span>
              <span className="border border-border text-white text-xs px-3 py-1 rounded">
                {genreLabel}
              </span>
              <span className="text-text-secondary text-sm">
                Dir. {movie.movieDirector}
              </span>
            </div>

            <p className="text-white/75 text-base leading-relaxed max-w-2xl mb-6 clamp-3">
              {movie.movieDescription}
            </p>

            <div className="flex gap-3">
              <Link
                href={`#shows`}
                className="bg-primary hover:bg-primary-hover text-white px-7 py-3 rounded font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
              >
                <Play size={16} fill="white" /> Book Tickets
              </Link>
              <button className="bg-white/10 hover:bg-white/20 text-white px-7 py-3 rounded font-semibold text-sm flex items-center gap-2 transition-all"
                style={{ border: "2px solid rgba(255,255,255,0.3)" }}>
                <Plus size={16} /> My Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show selector */}
      <div id="shows" className="px-12 py-10">
        <ShowSelector movie={movie} shows={shows} />
      </div>
    </main>
  );
}

import { Suspense } from "react";
import { HeroBillboard } from "@/components/home/HeroBillboard";
import { MovieRow } from "@/components/movies/MovieRow";
import { movieService } from "@/services/movieService";
import type { Movie } from "@/types";

// Fetch on the server — no auth needed for public movie list
async function getMovies(): Promise<Movie[]> {
  try {
    const result = await movieService.getAll(0, 20);
    return result.pageData;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const movies = await getMovies();

  const actionMovies = movies.filter(
    (m) => m.movieGenre === "ACTION" || m.movieGenre === "THRILLER"
  );
  const dramaMovies = movies.filter(
    (m) => m.movieGenre === "DRAMA" || m.movieGenre === "ROMANCE"
  );
  const scifiMovies = movies.filter(
    (m) => m.movieGenre === "SCIENCE_FICTION" || m.movieGenre === "HORROR"
  );

  return (
    <main>
      {/* Hero Billboard — rotates top 5 movies */}
      <Suspense fallback={<div className="h-[90vh] bg-background" />}>
        <HeroBillboard movies={movies.slice(0, 5)} />
      </Suspense>

      {/* Content Rows */}
      <div className="pt-4 pb-24">
        <MovieRow title="Now Showing" movies={movies} />
        <MovieRow
          title="Top Rated This Week"
          movies={[...movies].sort(() => Math.random() - 0.5)}
          showRank
        />
        {actionMovies.length > 0 && (
          <MovieRow title="Action Thrillers" movies={actionMovies} />
        )}
        {dramaMovies.length > 0 && (
          <MovieRow title="Drama & Romance" movies={dramaMovies} />
        )}
        {scifiMovies.length > 0 && (
          <MovieRow title="Sci-Fi & Horror" movies={scifiMovies} />
        )}
      </div>
    </main>
  );
}

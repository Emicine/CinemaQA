"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Search } from "lucide-react";
import { movieService } from "@/services/movieService";
import { parseApiError } from "@/lib/axios";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { Movie, MovieRequestDTO } from "@/types";

const GENRES = [
  { value: "ACTION", label: "Action" },
  { value: "THRILLER", label: "Thriller" },
  { value: "HORROR", label: "Horror" },
  { value: "COMEDY", label: "Comedy" },
  { value: "SUSPENSE", label: "Suspense" },
  { value: "DRAMA", label: "Drama" },
  { value: "ROMANCE", label: "Romance" },
  { value: "SCIENCE_FICTION", label: "Science Fiction" },
];

interface MovieFormProps {
  open: boolean;
  onClose: () => void;
  movie?: Movie | null; // null = create mode, Movie = edit mode
}

export function MovieFormModal({ open, onClose, movie }: MovieFormProps) {
  const qc = useQueryClient();
  const isEdit = !!movie;
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<MovieRequestDTO>({
    defaultValues: movie
      ? {
          movieName: movie.movieName,
          movieGenre: movie.movieGenre,
          movieDirector: movie.movieDirector,
          movieReleaseDate: movie.movieReleaseDate,
          movieDescription: movie.movieDescription,
          movieDuration: movie.movieDuration,
          moviePosterUrl: movie.moviePosterUrl,
        }
      : {},
  });

  useEffect(() => {
    if (open) {
      reset(
        movie
          ? {
              movieName: movie.movieName,
              movieGenre: movie.movieGenre,
              movieDirector: movie.movieDirector,
              movieReleaseDate: movie.movieReleaseDate,
              movieDescription: movie.movieDescription,
              movieDuration: movie.movieDuration,
              moviePosterUrl: movie.moviePosterUrl,
            }
          : {
              movieName: "",
              movieGenre: "ACTION",
              movieDirector: "",
              movieReleaseDate: "",
              movieDescription: "",
              movieDuration: 120,
              moviePosterUrl: "",
            }
      );
    }
  }, [open, movie, reset]);

  const createMutation = useMutation({
    mutationFn: (data: MovieRequestDTO) => movieService.create(data),
    onSuccess: (m) => {
      toast.success(`"${m.movieName}" added to catalogue.`);
      qc.invalidateQueries({ queryKey: ["movies"] });
      onClose();
    },
    onError: (e) => toast.error(parseApiError(e).message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: MovieRequestDTO) =>
      movieService.update(movie!.movieId, data),
    onSuccess: (m) => {
      toast.success(`"${m.movieName}" updated.`);
      qc.invalidateQueries({ queryKey: ["movies"] });
      onClose();
    },
    onError: (e) => toast.error(parseApiError(e).message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const searchTMDB = async () => {
    const title = getValues("movieName");
    if (!title) {
      toast.error("Please enter a movie title to search first.");
      return;
    }

    setIsSearching(true);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
    if (!apiKey) {
      toast.error("Missing TMDB API Key. Please add NEXT_PUBLIC_TMDB_KEY to your .env.local");
      setIsSearching(false);
      return;
    }

    try {
      // 1. Search for the movie
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&api_key=${apiKey}`
      );
      if (searchRes.status === 401) throw new Error("Invalid TMDB API Key.");
      const searchData = await searchRes.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        toast.error("Movie not found on TMDB.");
        return;
      }
      
      const tmdbId = searchData.results[0].id;

      // 2. Get full details (for runtime, genres, credits)
      const detailsRes = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits`
      );
      const details = await detailsRes.json();

      // Find director
      const director = details.credits?.crew?.find((c: any) => c.job === "Director");
      
      // Map genre safely
      if (details.genres && details.genres.length > 0) {
        // Simple mapping based on text. For exact match, replace spaces.
        const genreName = details.genres[0].name.toUpperCase().replace(" ", "_");
        if (GENRES.some(g => g.value === genreName)) {
           setValue("movieGenre", genreName);
        } else if (genreName === "SCI-FI") {
           setValue("movieGenre", "SCIENCE_FICTION");
        }
      }

      // Autofill fields
      setValue("movieName", details.title || searchData.results[0].title);
      setValue("movieDescription", details.overview);
      setValue("movieReleaseDate", details.release_date);
      if (details.runtime) setValue("movieDuration", details.runtime);
      if (director) setValue("movieDirector", director.name);
      if (details.poster_path) setValue("moviePosterUrl", `https://image.tmdb.org/t/p/w500${details.poster_path}`);
      
      toast.success("Movie details & poster auto-filled from TMDB!");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch from TMDB.");
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (data: MovieRequestDTO) => {
    const payload = { ...data, movieDuration: Number(data.movieDuration) };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Movie" : "Add Movie"}
      subtitle={
        isEdit
          ? `Editing "${movie?.movieName}"`
          : "Add a new movie to the catalogue"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Movie Title"
                placeholder="e.g. Oppenheimer"
                error={errors.movieName?.message}
                {...register("movieName", { required: "Title is required" })}
              />
            </div>
            {!isEdit && (
              <button
                type="button"
                onClick={searchTMDB}
                disabled={isSearching}
                title="Auto-fill from TMDB"
                className="bg-surface-2 border border-border hover:border-white/40 disabled:opacity-50 text-white p-2.5 rounded transition-colors mb-[2px]"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            )}
          </div>
          <Select
            label="Genre"
            options={GENRES}
            {...register("movieGenre", { required: true })}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Director"
            placeholder="e.g. Christopher Nolan"
            error={errors.movieDirector?.message}
            {...register("movieDirector", { required: "Director is required" })}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="e.g. 180"
            error={errors.movieDuration?.message}
            {...register("movieDuration", {
              required: "Duration is required",
              min: { value: 1, message: "Must be at least 1 minute" },
            })}
          />
        </div>

        {/* Row 3 */}
        <Input
          label="Release Date"
          type="date"
          error={errors.movieReleaseDate?.message}
          {...register("movieReleaseDate", {
            required: "Release date is required",
          })}
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="Brief synopsis of the movie…"
          {...register("movieDescription")}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-border hover:border-white/60 text-white px-5 py-2.5 rounded text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Add Movie"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

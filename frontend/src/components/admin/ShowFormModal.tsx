"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { showService, movieService } from "@/services";
import { parseApiError } from "@/lib/axios";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import type { ShowRequestDTO, Show } from "@/types";

interface ShowFormModalProps {
  open: boolean;
  onClose: () => void;
  show?: Show | null;
  theatreId: number;
}

export function ShowFormModal({
  open,
  onClose,
  show,
  theatreId,
}: ShowFormModalProps) {
  const qc = useQueryClient();
  const isEdit = !!show;

  const { data: moviesData } = useQuery({
    queryKey: ["movies", 0, 100],
    queryFn: () => movieService.getAll(0, 100),
    enabled: open,
  });

  const movieOptions = (moviesData?.pageData ?? []).map((m) => ({
    value: String(m.movieId),
    label: m.movieName,
  }));

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ShowRequestDTO & { screenId: string; movieId: string }>({
      defaultValues: show
        ? {
            movieId: String(show.movie.movieId),
            screenId: String(show.screen.screenId),
            startTime: show.startTime.slice(0, 16),
            endTime: show.endTime.slice(0, 16),
          }
        : {},
    });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: (d: ShowRequestDTO) => showService.create(d),
    onSuccess: () => {
      toast.success("Show scheduled!");
      qc.invalidateQueries({ queryKey: ["shows", "theatre", theatreId] });
      onClose();
    },
    onError: (e) => toast.error(parseApiError(e).message),
  });

  const updateMutation = useMutation({
    mutationFn: (d: ShowRequestDTO) => showService.update(show!.showId, d),
    onSuccess: () => {
      toast.success("Show updated!");
      qc.invalidateQueries({ queryKey: ["shows", "theatre", theatreId] });
      onClose();
    },
    onError: (e) => toast.error(parseApiError(e).message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: ShowRequestDTO & { screenId: string; movieId: string }) => {
    const payload: ShowRequestDTO = {
    movieId: Number(data.movieId),
    screenId: Number(data.screenId),
    startTime: data.startTime,
    endTime: data.endTime,
    };
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
      title={isEdit ? "Edit Show" : "Schedule Show"}
      subtitle="Set a movie, screen, and time slot"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label="Movie"
          options={[{ value: "", label: "Select a movie…" }, ...movieOptions]}
          {...register("movieId", { required: "Movie is required" })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
              Start Time
            </label>
            <input
              type="datetime-local"
              className="h-11 bg-surface border border-border rounded px-4 text-white text-sm outline-none focus:border-white/60 transition-colors"
              {...register("startTime", { required: "Start time required" })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
              End Time
            </label>
            <input
              type="datetime-local"
              className="h-11 bg-surface border border-border rounded px-4 text-white text-sm outline-none focus:border-white/60 transition-colors"
              {...register("endTime", { required: "End time required" })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
            Screen ID
          </label>
          <input
            type="number"
            placeholder="e.g. 3"
            className="h-11 bg-surface border border-border rounded px-4 text-white text-sm outline-none focus:border-white/60 transition-colors"
            {...register("screenId", { required: "Screen ID required" })}
          />
          <p className="text-xs text-text-secondary">
            Enter the Screen ID from this theatre's screen list.
          </p>
        </div>

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
            {isEdit ? "Save Changes" : "Schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

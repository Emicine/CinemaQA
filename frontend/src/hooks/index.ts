import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { movieService, showService, theatreService, reservationService, userService } from "@/services";
import { parseApiError } from "@/lib/axios";
import { useAuthStore, useBookingStore } from "@/store";
import type { ReservationRequestDTO } from "@/types";

// ─── User Hooks ───────────────────────────────────────────────────────────────

export function useUsers(page = 0, pageSize = 50) {
  return useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => userService.getAll(page, pageSize),
  });
}

// ─── Movie Hooks ──────────────────────────────────────────────────────────────

export function useMovies(page = 0, pageSize = 12) {
  return useQuery({
    queryKey: ["movies", page, pageSize],
    queryFn: () => movieService.getAll(page, pageSize),
  });
}

export function useMovie(movieId: number) {
  return useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => movieService.getById(movieId),
    enabled: !!movieId,
  });
}

export function useDeleteMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (movieId: number) => movieService.delete(movieId),
    onSuccess: (message) => {
      toast.success(message);
      qc.invalidateQueries({ queryKey: ["movies"] });
    },
    onError: (error) => {
      toast.error(parseApiError(error).message);
    },
  });
}

// ─── Show Hooks ───────────────────────────────────────────────────────────────

export function useShowsByMovie(movieId: number) {
  return useQuery({
    queryKey: ["shows", "movie", movieId],
    queryFn: () => showService.getByMovie(movieId),
    enabled: !!movieId,
  });
}

export function useShow(showId: number) {
  return useQuery({
    queryKey: ["show", showId],
    queryFn: () => showService.getById(showId),
    enabled: !!showId,
  });
}

// ─── Theatre Hooks ────────────────────────────────────────────────────────────

export function useTheatres(page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ["theatres", page, pageSize],
    queryFn: () => theatreService.getAll(page, pageSize),
  });
}

// ─── Reservation Hooks ────────────────────────────────────────────────────────

export function useUserReservations(userId: number, page = 0) {
  return useQuery({
    queryKey: ["reservations", userId, page],
    queryFn: () => reservationService.getForUser(userId, page),
    enabled: !!userId,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  const clearBooking = useBookingStore((s) => s.clearBooking);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: ReservationRequestDTO) =>
      reservationService.create(payload),
    onSuccess: () => {
      toast.success("Booking confirmed! 🎬 Enjoy the movie!");
      clearBooking();
      if (user) {
        qc.invalidateQueries({ queryKey: ["reservations", user.userId] });
      }
    },
    onError: (error) => {
      const { status, message } = parseApiError(error);
      // Backend returns 409 when ReentrantLock detects a conflict
      if (status === 409) {
        toast.error("One or more seats were just taken. Please reselect.");
      } else {
        toast.error(message);
      }
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (reservationId: number) =>
      reservationService.cancel(reservationId),
    onSuccess: () => {
      toast.success("Reservation cancelled successfully.");
      if (user) {
        qc.invalidateQueries({ queryKey: ["reservations", user.userId] });
      }
    },
    onError: (error) => {
      const { message } = parseApiError(error);
      toast.error(message);
    },
  });
}

// ─── Auth Booking Flow ────────────────────────────────────────────────────────

export function useBookingSubmit() {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const selectedShow = useBookingStore((s) => s.selectedShow);
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending } = useCreateReservation();

  const submit = useCallback(() => {
    if (!user || !selectedShow || selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    const payload: ReservationRequestDTO = {
      userId: user.userId,
      showId: selectedShow.showId,
      showSeats: selectedSeats.map((s) => ({ seatId: s.seatId })),
    };

    mutate(payload);
  }, [user, selectedShow, selectedSeats, mutate]);

  return { submit, isPending };
}

// ─── Scroll lock for modals ───────────────────────────────────────────────────

export function useScrollLock(locked: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.overflow = locked ? "hidden" : "";
  }
}

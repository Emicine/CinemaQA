"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Ticket, Calendar, MapPin, Clock,
  Film, CheckCircle, XCircle, Loader2
} from "lucide-react";
import { useUserReservations, useCancelReservation } from "@/hooks";
import { useAuthStore } from "@/store";
import { TableRowSkeleton } from "@/components/ui/Skeletons";
import { EmptyState, ErrorState } from "@/components/ui/ErrorStates";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import type { Reservation } from "@/types";
import { useEffect } from "react";

// ─── Reservation Card ─────────────────────────────────────────────────────────
function ReservationCard({
  reservation,
  onCancel,
}: {
  reservation: Reservation;
  onCancel: (id: number) => void;
}) {
  const showTime = new Date(reservation.show.startTime);
  const isUpcoming = showTime > new Date();
  const isCancelled = reservation.reservationStatus === "CANCELLED";
  const canCancel =
    isUpcoming &&
    !isCancelled &&
    showTime > new Date(Date.now() + 30 * 60 * 1000); // 30 min buffer

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface rounded-lg overflow-hidden border ${
        isCancelled ? "border-border opacity-60" : "border-border hover:border-border/80"
      } transition-colors`}
    >
      {/* Movie banner */}
      <div
        className="h-2 w-full"
        style={{
          background: isCancelled
            ? "#333"
            : isUpcoming
            ? "linear-gradient(to right, #E50914, #C11119)"
            : "linear-gradient(to right, #46D369, #2d8a4e)",
        }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
              <Film size={18} className="text-text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {reservation.show.movie.movieName}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Booking #{reservation.reservationId.toString().padStart(6, "0")}
              </p>
            </div>
          </div>
          <Badge
            variant={
              isCancelled ? "error" : isUpcoming ? "success" : "neutral"
            }
          >
            {isCancelled
              ? "Cancelled"
              : isUpcoming
              ? "Confirmed"
              : "Completed"}
          </Badge>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={13} className="text-text-secondary shrink-0" />
            <span className="text-text-secondary">
              {format(showTime, "EEE, MMM d yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={13} className="text-text-secondary shrink-0" />
            <span className="text-text-secondary">
              {format(showTime, "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={13} className="text-text-secondary shrink-0" />
            <span className="text-text-secondary truncate">
              {reservation.show.theatre.theatreName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Ticket size={13} className="text-text-secondary shrink-0" />
            <span className="text-text-secondary">
              {reservation.seatsReserved.length} Seat
              {reservation.seatsReserved.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Seat tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {reservation.seatsReserved.map((ss) => (
            <span
              key={ss.showSeatId}
              className="bg-surface-2 text-white text-xs px-2 py-1 rounded"
            >
              Row {ss.seat.rowId} · Seat {ss.seat.seatNumber}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-xs text-text-secondary">Total Paid</span>
            <div className="font-display text-2xl tracking-wide">
              €{reservation.totalAmount.toLocaleString()}
            </div>
          </div>
          {canCancel && (
            <button
              onClick={() => onCancel(reservation.reservationId)}
              className="border border-primary/40 hover:border-primary hover:bg-primary/10 text-primary px-4 py-2 rounded text-sm font-semibold transition-all"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(0);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const { data, isLoading, isError, refetch } = useUserReservations(
    user?.userId ?? 0,
    page
  );

  const { mutate: cancelReservation, isPending: cancelling } =
    useCancelReservation();

  const reservations = data?.pageData ?? [];

  const upcoming = reservations.filter(
    (r) =>
      r.reservationStatus === "BOOKED" &&
      new Date(r.show.startTime) > new Date()
  );
  const past = reservations.filter(
    (r) =>
      r.reservationStatus !== "BOOKED" ||
      new Date(r.show.startTime) <= new Date()
  );

  const handleCancel = (id: number) => setConfirmId(id);

  const handleConfirmCancel = () => {
    if (!confirmId) return;
    cancelReservation(confirmId, {
      onSettled: () => setConfirmId(null),
    });
  };

  return (
    <main className="pt-[68px] min-h-screen">
      <div className="px-12 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Ticket size={24} className="text-primary" />
          <div>
            <h1 className="font-display text-6xl tracking-wide">MY BOOKINGS</h1>
            <p className="text-text-secondary text-sm mt-1">
              {user?.firstName}'s reservation history
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg h-52 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            message="Could not load your reservations."
            onRetry={() => refetch()}
          />
        ) : reservations.length === 0 ? (
          <EmptyState
            variant="reservations"
            action={{ label: "Browse Movies", onClick: () => router.push("/movies") }}
          />
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-3xl tracking-wide mb-5 flex items-center gap-2">
                  <CheckCircle size={20} className="text-success" />
                  UPCOMING
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcoming.map((r) => (
                    <ReservationCard
                      key={r.reservationId}
                      reservation={r}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <section>
                <h2 className="font-display text-3xl tracking-wide mb-5 flex items-center gap-2 text-text-secondary">
                  <XCircle size={20} />
                  PAST &amp; CANCELLED
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {past.map((r) => (
                    <ReservationCard
                      key={r.reservationId}
                      reservation={r}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </section>
            )}

            <Pagination
              currentPage={page}
              totalPages={data?.totalPages ?? 1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Cancel confirm dialog */}
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel this booking?"
        message="This action cannot be undone. Refunds may apply based on cancellation policy."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Booking"
        destructive
        loading={cancelling}
      />
    </main>
  );
}

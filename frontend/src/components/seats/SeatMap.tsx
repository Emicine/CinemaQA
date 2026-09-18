"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, X, Loader2 } from "lucide-react";
import type { Show, ShowSeat, SelectedSeat, SeatType } from "@/types";
import { useBookingStore, useAuthStore, useUIStore } from "@/store";
import { useBookingSubmit } from "@/hooks";
import clsx from "clsx";

// ─── Seat colour per type ─────────────────────────────────────────────────────
const SEAT_COLORS: Record<SeatType, string> = {
  COUPLE_SOFA: "#1a2a4a",
  SINGLE_SOFA: "#2a1a4a",
  SINGLE: "#2a1a0a",
  COUPLE: "#0a1a0a",
};

const SEAT_LABELS: Record<SeatType, string> = {
  COUPLE_SOFA: "Couple Sofa",
  SINGLE_SOFA: "Single Sofa",
  SINGLE: "Standard",
  COUPLE: "Couple",
};

// ─── Individual Seat Button ───────────────────────────────────────────────────
interface SeatButtonProps {
  showSeat: ShowSeat;
  isSelected: boolean;
  onToggle: (showSeat: ShowSeat) => void;
}

function SeatButton({ showSeat, isSelected, onToggle }: SeatButtonProps) {
  const { seatStatus, seat } = showSeat;
  const isBooked = seatStatus === "BOOKED";
  const isCouple = seat.seatType === "COUPLE" || seat.seatType === "COUPLE_SOFA";
  const isSofa = seat.seatType.includes("SOFA");

  const baseColor = SEAT_COLORS[seat.seatType];

  return (
    <motion.button
      disabled={isBooked}
      onClick={() => !isBooked && onToggle(showSeat)}
      whileTap={{ scale: isBooked ? 1 : 0.9 }}
      className={clsx(
        "relative rounded-t flex-shrink-0 transition-all duration-150 border-none outline-none",
        isBooked && "cursor-not-allowed opacity-40",
        !isBooked && !isSelected && "hover:brightness-150",
        isSofa ? "h-9 rounded-t-lg" : "h-7",
        isCouple ? "w-16" : "w-8"
      )}
      style={{
        background: isSelected
          ? "var(--color-success, #46D369)"
          : isBooked
          ? "#222"
          : baseColor,
        transform: isSelected ? "scale(1.08)" : undefined,
      }}
      title={`${SEAT_LABELS[seat.seatType]} — €${seat.seatPrice}`}
    />
  );
}

// ─── Row of seats ─────────────────────────────────────────────────────────────
interface SeatRowProps {
  rowLabel: string;
  seats: ShowSeat[];
  selectedIds: Set<number>;
  onToggle: (showSeat: ShowSeat) => void;
}

function SeatRow({ rowLabel, seats, selectedIds, onToggle }: SeatRowProps) {
  const mid = Math.floor(seats.length / 2);

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 text-center text-xs text-text-secondary font-semibold shrink-0">
        {rowLabel}
      </span>

      {seats.map((ss, i) => (
        <>
          {i === mid && (
            <span key={`aisle-${i}`} className="w-6 shrink-0" />
          )}
          <SeatButton
            key={ss.showSeatId}
            showSeat={ss}
            isSelected={selectedIds.has(ss.showSeatId)}
            onToggle={onToggle}
          />
        </>
      ))}

      <span className="w-7 text-center text-xs text-text-secondary font-semibold shrink-0">
        {rowLabel}
      </span>
    </div>
  );
}

// ─── Main SeatMap ─────────────────────────────────────────────────────────────
interface SeatMapProps {
  show: Show;
}

export function SeatMap({ show }: SeatMapProps) {
  const { selectedSeats, addSeat, removeSeat, clearBooking, totalAmount } =
    useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { submit, isPending } = useBookingSubmit();

  const selectedIds = new Set(selectedSeats.map((s) => s.showSeatId));

  // Group show seats by rowId
  const rowMap = new Map<number, ShowSeat[]>();
  for (const ss of show.showSeats) {
    const row = ss.seat.rowId;
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(ss);
  }

  // Sort rows and seats within rows
  const rows = [...rowMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rowId, seats]) => ({
      rowId,
      label: String.fromCharCode(64 + rowId), // 1→A, 2→B …
      seats: seats.sort((a, b) => a.seat.seatNumber - b.seat.seatNumber),
    }));

  const handleToggle = useCallback(
    (showSeat: ShowSeat) => {
      if (!isAuthenticated) {
        openAuthModal("login");
        return;
      }
      if (selectedIds.has(showSeat.showSeatId)) {
        removeSeat(showSeat.showSeatId);
      } else {
        if (selectedSeats.length >= 8) return; // max 8
        const label = `${String.fromCharCode(64 + showSeat.seat.rowId)}${showSeat.seat.seatNumber}`;
        const s: SelectedSeat = {
          showSeatId: showSeat.showSeatId,
          seatId: showSeat.seat.seatId,
          label,
          price: showSeat.seat.seatPrice,
          seatType: showSeat.seat.seatType,
        };
        addSeat(s);
      }
    },
    [isAuthenticated, selectedIds, selectedSeats.length, addSeat, removeSeat, openAuthModal]
  );

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex flex-wrap gap-5 justify-center mb-10">
        {(Object.entries(SEAT_LABELS) as [SeatType, string][]).map(
          ([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-5 h-4 rounded-t"
                style={{ background: SEAT_COLORS[type] }}
              />
              <span className="text-xs text-text-secondary">{label}</span>
            </div>
          )
        )}
        <div className="flex items-center gap-2">
          <div className="w-5 h-4 rounded-t bg-success" />
          <span className="text-xs text-text-secondary">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-4 rounded-t bg-[#222] opacity-50" />
          <span className="text-xs text-text-secondary">Booked</span>
        </div>
      </div>

      {/* Screen */}
      <div className="text-center mb-10">
        <div
          className="w-3/5 mx-auto h-1 mb-2 rounded"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)",
          }}
        />
        <p className="text-xs text-text-secondary tracking-[0.2em] uppercase">
          All Eyes This Way — Screen
        </p>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col gap-2 w-fit mx-auto">
          {rows.map((row) => (
            <SeatRow
              key={row.rowId}
              rowLabel={row.label}
              seats={row.seats}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* Pricing summary */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(SEAT_LABELS).map(([type, label]) => {
          const price = show.showSeats.find(
            (ss) => ss.seat.seatType === type
          )?.seat.seatPrice;
          if (!price) return null;
          return (
            <div key={type} className="bg-surface rounded-lg p-4 text-center">
              <div className="text-xs text-text-secondary mb-1">{label}</div>
              <div className="font-display text-2xl text-white">€{price}</div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border"
            style={{ background: "rgba(31,31,31,0.96)", backdropFilter: "blur(12px)" }}
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              {/* Left — seats */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Ticket size={20} className="text-primary shrink-0" />
                <div>
                  <div className="text-xs text-text-secondary mb-1">
                    {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""} Selected
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.showSeatId}
                        className="bg-success text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {s.label}
                        <button
                          onClick={() => removeSeat(s.showSeatId)}
                          className="hover:opacity-70"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — total + CTA */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-text-secondary">Total</div>
                  <div className="font-display text-3xl tracking-wide">
                    €{totalAmount.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={clearBooking}
                  className="border border-border text-white px-4 py-3 rounded text-sm hover:border-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={submit}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-8 py-3 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  Proceed to Pay →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

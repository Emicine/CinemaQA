"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { MapPin, Clock, Zap } from "lucide-react";
import { useBookingStore } from "@/store";
import type { Movie, Show } from "@/types";
import clsx from "clsx";

interface ShowSelectorProps {
  movie: Movie;
  shows: Show[];
}

// Showtimes that appear "filling fast" (rule: within 3 hrs of a busy prime slot)
const FILLING_HOURS = [18, 19, 20, 21]; // 6–9 PM

function isFillingFast(startTime: string) {
  const hour = new Date(startTime).getHours();
  return FILLING_HOURS.includes(hour);
}

export function ShowSelector({ movie, shows }: ShowSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("All");
  const { setShow } = useBookingStore();

  // Build 14-day date chips
  const datechips = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Filter shows by selected date
  const showsByDate = useMemo(() => {
    return shows.filter((s) => {
      const showDate = new Date(s.startTime);
      return isSameDay(showDate, selectedDate);
    });
  }, [shows, selectedDate]);

  // Group filtered shows by theatre
  const theatreGroups = useMemo(() => {
    const map = new Map<
      number,
      { theatre: Show["theatre"]; shows: Show[] }
    >();
    for (const show of showsByDate) {
      if (!map.has(show.theatre.theatreId)) {
        map.set(show.theatre.theatreId, {
          theatre: show.theatre,
          shows: [],
        });
      }
      map.get(show.theatre.theatreId)!.shows.push(show);
    }
    return [...map.values()];
  }, [showsByDate]);

  // Unique locations
  const locations = useMemo(() => {
    const locs = [...new Set(shows.map((s) => s.theatre.theatreLocation))];
    return ["All", ...locs];
  }, [shows]);

  const filteredGroups =
    selectedLocation === "All"
      ? theatreGroups
      : theatreGroups.filter(
          (g) => g.theatre.theatreLocation === selectedLocation
        );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="font-display text-section tracking-[0.05em]">
          SELECT DATE & THEATRE
        </h2>

        {/* Location filter */}
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="bg-surface border border-border text-white px-4 py-2 rounded text-sm font-body outline-none"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Date chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8" style={{ scrollbarWidth: "none" }}>
        {datechips.map((date) => {
          const active = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={clsx(
                "flex-shrink-0 rounded px-5 py-2.5 text-center transition-all border",
                active
                  ? "bg-primary border-primary text-white"
                  : "border-border text-white hover:border-white/50"
              )}
            >
              <div
                className={clsx(
                  "text-[11px] font-bold tracking-wider uppercase",
                  active ? "text-white/70" : "text-text-secondary"
                )}
              >
                {format(date, "EEE")}
              </div>
              <div className="text-lg font-semibold mt-0.5">
                {format(date, "d MMM")}
              </div>
            </button>
          );
        })}
      </div>

      {/* Theatre groups */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <div className="text-5xl mb-4">🎬</div>
          <div className="text-lg font-medium mb-2">No shows on this date</div>
          <div className="text-sm">Try selecting a different date or location.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredGroups.map(({ theatre, shows: theatreShows }) => (
            <div
              key={theatre.theatreId}
              className="bg-surface rounded-lg p-6"
            >
              {/* Theatre header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{theatre.theatreName}</h3>
                  <div className="flex items-center gap-1.5 text-text-secondary text-sm mt-1">
                    <MapPin size={13} />
                    {theatre.theatreLocation}
                    <span className="mx-2">·</span>
                    IMAX · Dolby Atmos
                  </div>
                </div>
              </div>

              {/* Showtimes */}
              <div className="flex flex-wrap gap-3">
                {theatreShows
                  .sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime()
                  )
                  .map((show) => {
                    const filling = isFillingFast(show.startTime);
                    const time = format(new Date(show.startTime), "h:mm a");

                    return (
                      <Link
                        key={show.showId}
                        href={`/movies/${movie.movieId}/shows/${show.showId}/seats`}
                        onClick={() => setShow(show)}
                        className={clsx(
                          "flex flex-col items-center px-4 py-2 rounded border text-sm font-semibold transition-all hover:scale-105",
                          filling
                            ? "border-warning text-warning hover:bg-warning hover:text-black"
                            : "border-success text-success hover:bg-success hover:text-black"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {time}
                        </div>
                        {filling && (
                          <div className="flex items-center gap-1 text-[10px] mt-0.5 opacity-80">
                            <Zap size={9} />
                            Filling Fast
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

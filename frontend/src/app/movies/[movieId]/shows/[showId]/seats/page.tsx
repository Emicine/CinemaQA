import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { showService } from "@/services";
import { SeatMap } from "@/components/seats/SeatMap";
import { ChevronLeft, MapPin, Clock, Monitor } from "lucide-react";

interface SeatsPageProps {
  params: { movieId: string; showId: string };
}

async function getShow(showId: number) {
  try {
    return await showService.getById(showId);
  } catch {
    return null;
  }
}

export default async function SeatsPage({ params }: SeatsPageProps) {
  const showId = Number(params.showId);
  if (isNaN(showId)) return notFound();

  const show = await getShow(showId);
  if (!show) return notFound();

  const startTime = new Date(show.startTime);
  const endTime = new Date(show.endTime);

  return (
    <main className="pt-[68px] pb-40 min-h-screen">
      {/* Breadcrumb header */}
      <div className="px-12 pt-8 pb-6 border-b border-border">
        <Link
          href={`/movies/${show.movie.movieId}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm mb-4"
        >
          <ChevronLeft size={16} /> Back to Show Selection
        </Link>

        <h1 className="font-display text-5xl tracking-wide mb-2">
          {show.movie.movieName.toUpperCase()}
        </h1>

        {/* Show meta */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {format(startTime, "EEEE, MMM d · h:mm a")} – {format(endTime, "h:mm a")}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {show.theatre.theatreName}, {show.theatre.theatreLocation}
          </span>
          <span className="flex items-center gap-1.5">
            <Monitor size={14} />
            {show.screen.screenName}
          </span>
          <span className="border border-border px-2 py-0.5 rounded text-xs font-semibold">
            IMAX
          </span>
        </div>
      </div>

      {/* Seat map */}
      <div className="px-6 md:px-12 pt-10">
        <SeatMap show={show} />
      </div>
    </main>
  );
}

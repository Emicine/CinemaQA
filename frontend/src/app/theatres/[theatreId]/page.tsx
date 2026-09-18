import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { theatreService, showService } from "@/services";
import { MapPin, Monitor, TrendingUp, Ticket, Clock, Film, ChevronLeft } from "lucide-react";

interface TheatrePageProps {
  params: { theatreId: string };
}

async function getData(theatreId: number) {
  try {
    const [theatre, showsData] = await Promise.all([
      theatreService.getById(theatreId),
      showService.getByTheatre(theatreId, 0, 20),
    ]);
    return { theatre, shows: showsData.pageData };
  } catch {
    return null;
  }
}

export default async function TheatrePage({ params }: TheatrePageProps) {
  const theatreId = Number(params.theatreId);
  if (isNaN(theatreId)) return notFound();

  const data = await getData(theatreId);
  if (!data) return notFound();

  const { theatre, shows } = data;

  const upcomingShows = shows
    .filter((s) => new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <main className="pt-[68px] min-h-screen">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden bg-surface">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "linear-gradient(135deg, #1f4037, #99f2c8)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="px-12 -mt-12 pb-16">
        {/* Back */}
        <Link
          href="/theatres"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> All Theatres
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-display text-6xl tracking-wide mb-2">
              {theatre.theatreName.toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin size={14} />
              <span>{theatre.theatreLocation}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            {[
              { icon: Monitor, value: theatre.totalScreens ?? 0, label: "Screens" },
              { icon: Ticket, value: ((theatre.totalBookings ?? 0) / 1000).toFixed(1) + "K", label: "Bookings" },
              { icon: TrendingUp, value: "€" + ((theatre.totalRevenue ?? 0) / 1e5).toFixed(1) + "L", label: "Revenue", color: "text-success" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface rounded-lg p-4 text-center min-w-[90px]">
                <stat.icon size={16} className={`mx-auto mb-1.5 ${stat.color ?? "text-text-secondary"}`} />
                <div className={`font-display text-2xl ${stat.color ?? "text-white"}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Screens */}
        {theatre.screens?.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-3xl tracking-wide mb-4">SCREENS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {theatre.screens.map((screen) => (
                <div key={screen.screenId} className="bg-surface rounded-lg p-4 text-center border border-border">
                  <Monitor size={18} className="text-text-secondary mx-auto mb-2" />
                  <div className="font-semibold text-sm">{screen.screenName}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    {screen.seats?.length ?? 0} seats
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Shows */}
        <section>
          <h2 className="font-display text-3xl tracking-wide mb-4">NOW SHOWING</h2>
          {upcomingShows.length === 0 ? (
            <div className="text-text-secondary text-sm py-8 text-center">
              No upcoming shows scheduled at this theatre.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingShows.map((show) => (
                <Link
                  key={show.showId}
                  href={`/movies/${show.movie.movieId}/shows/${show.showId}/seats`}
                  className="bg-surface rounded-lg p-4 flex items-center gap-4 border border-border hover:border-white/30 transition-all group"
                >
                  <div
                    className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #2d1b69, #11998e)" }}
                  >
                    <Film size={22} className="text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold group-hover:text-primary transition-colors truncate">
                      {show.movie.movieName}
                    </div>
                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {format(new Date(show.startTime), "EEE, MMM d · h:mm a")}
                      </span>
                      <span>{show.screen.screenName}</span>
                    </div>
                  </div>
                  <div className="text-xs text-success border border-success px-2 py-1 rounded font-semibold shrink-0">
                    Book →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

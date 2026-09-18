"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart2, Ticket, Clock, TrendingUp, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { showService, theatreService } from "@/services";
import { parseApiError } from "@/lib/axios";
import { useAuthStore, useIsTheatreAdmin } from "@/store";
import { ShowFormModal } from "@/components/admin/ShowFormModal";
import { ConfirmDialog } from "@/components/ui/Modal";
import { TableRowSkeleton } from "@/components/ui/Skeletons";
import type { Show } from "@/types";

export default function TheatreAdminPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const isTheatreAdmin = useIsTheatreAdmin();
  const [showFormOpen, setShowFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isTheatreAdmin) router.push("/");
  }, [isAuthenticated, isTheatreAdmin, router]);

  const { data: theatresData, isLoading: loadingTheatres } = useQuery({
    queryKey: ["theatres", 0, 50],
    queryFn: () => theatreService.getAll(0, 50),
    enabled: isAuthenticated,
  });

  const assignedTheatre = theatresData?.pageData.find((t) =>
    t.theatreAdmins?.some((a) => a.user.userId === user?.userId)
  );

  const { data: showsData, isLoading: loadingShows } = useQuery({
    queryKey: ["shows", "theatre", assignedTheatre?.theatreId],
    queryFn: () => showService.getByTheatre(assignedTheatre!.theatreId, 0, 50),
    enabled: !!assignedTheatre,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => showService.delete(id),
    onSuccess: (msg) => {
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["shows", "theatre", assignedTheatre?.theatreId] });
      setDeleteId(null);
    },
    onError: (e) => toast.error(parseApiError(e).message),
  });

  const shows = showsData?.pageData ?? [];
  const upcomingShows = shows
    .filter((s) => new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (loadingTheatres) {
    return (
      <div className="pt-[68px] min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="pt-[68px] min-h-screen">
      <div className="px-12 py-10">
        <div className="mb-10">
          <h1 className="font-display text-6xl tracking-wide mb-1">
            {assignedTheatre?.theatreName?.toUpperCase() ?? "THEATRE DASHBOARD"}
          </h1>
          <p className="text-text-secondary text-sm">
            {assignedTheatre?.theatreLocation} · Theatre Admin Dashboard
          </p>
        </div>

        {assignedTheatre && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Revenue", value: `€${((assignedTheatre.totalRevenue ?? 0) / 1e5).toFixed(1)}L`, icon: TrendingUp, color: "#E50914" },
              { label: "Bookings", value: (assignedTheatre.totalBookings ?? 0).toLocaleString(), icon: Ticket, color: "#46D369" },
              { label: "Screens", value: String(assignedTheatre.totalScreens ?? 0), icon: BarChart2, color: "#fff" },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-secondary font-semibold tracking-widest uppercase">{stat.label}</span>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
                <div className="font-display text-4xl tracking-wide" style={{ color: stat.color }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Upcoming Shows
              <span className="text-xs text-text-secondary font-normal">({upcomingShows.length})</span>
            </h3>
            <button
              onClick={() => { setEditingShow(null); setShowFormOpen(true); }}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Schedule Show
            </button>
          </div>

          {loadingShows ? (
            <table className="w-full"><tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</tbody></table>
          ) : upcomingShows.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">No upcoming shows scheduled.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#161616]">
                    {["Movie", "Screen", "Date & Time", "Duration", "Availability", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary tracking-widest uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingShows.map((show) => {
                    const available = show.showSeats?.filter(s => s.seatStatus === "AVAILABLE").length ?? 0;
                    const total = show.showSeats?.length ?? 0;
                    const pct = total > 0 ? (available / total) * 100 : 100;
                    return (
                      <tr key={show.showId} className="border-t border-border/50 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 font-semibold">{show.movie.movieName}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{show.screen.screenName}</td>
                        <td className="px-4 py-3.5">{format(new Date(show.startTime), "EEE, MMM d · h:mm a")}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{Math.floor(show.movie.movieDuration / 60)}h {show.movie.movieDuration % 60}m</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 50 ? "#46D369" : pct > 20 ? "#E6B616" : "#E50914" }} />
                            </div>
                            <span className="text-xs text-text-secondary">{available}/{total}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingShow(show); setShowFormOpen(true); }} className="border border-border hover:border-white text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"><Edit2 size={11} /> Edit</button>
                            <button onClick={() => setDeleteId(show.showId)} className="border border-primary/40 hover:border-primary hover:bg-primary/10 text-primary px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"><Trash2 size={11} /> Cancel</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ShowFormModal open={showFormOpen} onClose={() => setShowFormOpen(false)} show={editingShow} theatreId={assignedTheatre?.theatreId ?? 0} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId!)} title="Cancel this show?" message="All seat reservations will be voided." confirmLabel="Cancel Show" destructive loading={deleteMutation.isPending} />
    </main>
  );
}

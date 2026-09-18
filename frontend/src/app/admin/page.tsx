"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Building2, Users, TrendingUp, Trash2, Edit2, Plus, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { movieService, theatreService } from "@/services";
import { useIsSuperAdmin, useAuthStore } from "@/store";
import { parseApiError } from "@/lib/axios";
import { ConfirmDialog } from "@/components/ui/Modal";
import { LiveBadge } from "@/components/ui/Badge";
import { MovieFormModal } from "@/components/admin/MovieFormModal";
import { TheatreFormModal } from "@/components/admin/TheatreFormModal";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeletons";
import type { Movie } from "@/types";
import { useRouter } from "next/navigation";

function StatCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: React.ElementType; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-secondary font-semibold tracking-widest uppercase">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center">
          <Icon size={18} style={{ color: accent ?? "#999" }} />
        </div>
      </div>
      <div className="font-display text-4xl tracking-wide mb-1" style={{ color: accent ?? "#fff" }}>{value}</div>
      <div className="text-xs text-text-secondary">{sub}</div>
    </motion.div>
  );
}

function MoviesTable() {
  const qc = useQueryClient();
  const [movieFormOpen, setMovieFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["movies", 0, 50], queryFn: () => movieService.getAll(0, 50) });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => movieService.delete(id),
    onSuccess: (msg) => { toast.success(msg); qc.invalidateQueries({ queryKey: ["movies"] }); setDeleteId(null); },
    onError: (e) => toast.error(parseApiError(e).message),
  });
  const movies = data?.pageData ?? [];

  return (
    <>
      <div className="bg-surface rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2"><Film size={16} className="text-primary" /> Movies <span className="text-xs text-text-secondary font-normal">({data?.totalElements ?? 0})</span></h3>
          <button onClick={() => { setEditingMovie(null); setMovieFormOpen(true); }} className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition-colors"><Plus size={14} /> Add Movie</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#161616]">{["Title","Genre","Director","Duration","Bookings","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary tracking-widest uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {isLoading ? Array.from({length:5}).map((_,i)=><TableRowSkeleton key={i} cols={6}/>) : movies.map(movie=>(
                <tr key={movie.movieId} className="border-t border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-semibold">{movie.movieName}</td>
                  <td className="px-4 py-3.5"><span className="bg-warning/15 text-warning text-xs font-semibold px-2 py-0.5 rounded">{movie.movieGenre.replace("_"," ")}</span></td>
                  <td className="px-4 py-3.5 text-text-secondary">{movie.movieDirector}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{Math.floor(movie.movieDuration/60)}h {movie.movieDuration%60}m</td>
                  <td className="px-4 py-3.5">{(movie.totalBookings??0).toLocaleString()}</td>
                  <td className="px-4 py-3.5"><div className="flex gap-2">
                    <button onClick={()=>{setEditingMovie(movie);setMovieFormOpen(true);}} className="border border-border hover:border-white text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"><Edit2 size={11}/> Edit</button>
                    <button onClick={()=>setDeleteId(movie.movieId)} className="border border-primary/40 hover:border-primary hover:bg-primary/10 text-primary px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"><Trash2 size={11}/> Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <MovieFormModal open={movieFormOpen} onClose={()=>setMovieFormOpen(false)} movie={editingMovie}/>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>deleteMutation.mutate(deleteId!)} title="Delete this movie?" message="All associated shows and bookings will also be removed." confirmLabel="Delete" destructive loading={deleteMutation.isPending}/>
    </>
  );
}

function TheatresTable() {
  const qc = useQueryClient();
  const [theatreFormOpen, setTheatreFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["theatres", 0, 50], queryFn: () => theatreService.getAll(0, 50) });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => theatreService.delete(id),
    onSuccess: (msg) => { toast.success(msg); qc.invalidateQueries({ queryKey: ["theatres"] }); setDeleteId(null); },
    onError: (e) => toast.error(parseApiError(e).message),
  });
  const theatres = data?.pageData ?? [];

  return (
    <>
      <div className="bg-surface rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2"><Building2 size={16} className="text-primary" /> Theatres <span className="text-xs text-text-secondary font-normal">({data?.totalElements ?? 0})</span></h3>
          <button onClick={()=>setTheatreFormOpen(true)} className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition-colors"><Plus size={14}/> Add Theatre</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#161616]">{["Theatre","Location","Screens","Revenue","Bookings","Admins","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary tracking-widest uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {isLoading ? Array.from({length:4}).map((_,i)=><TableRowSkeleton key={i} cols={7}/>) : theatres.map(t=>(
                <tr key={t.theatreId} className="border-t border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-semibold">{t.theatreName}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{t.theatreLocation}</td>
                  <td className="px-4 py-3.5">{t.totalScreens??0}</td>
                  <td className="px-4 py-3.5 text-success font-semibold">€{((t.totalRevenue??0)/1e5).toFixed(1)}L</td>
                  <td className="px-4 py-3.5">{(t.totalBookings??0).toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex -space-x-1">
                      {(t.theatreAdmins??[]).slice(0,3).map(a=>(
                        <div key={a.id} title={a.user.username} className="w-6 h-6 rounded-full bg-primary border border-surface flex items-center justify-center text-[9px] font-bold">{a.user.firstName?.[0]}{a.user.lastName?.[0]}</div>
                      ))}
                      {(t.theatreAdmins?.length??0)===0&&<span className="text-text-secondary text-xs">None</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><div className="flex gap-2">
                    <button onClick={()=>toast("Assign admin to "+t.theatreName)} className="border border-border hover:border-white text-white px-3 py-1.5 rounded text-xs transition-colors">Admins</button>
                    <button onClick={()=>setDeleteId(t.theatreId)} className="border border-primary/40 hover:border-primary hover:bg-primary/10 text-primary px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"><Trash2 size={11}/> Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TheatreFormModal open={theatreFormOpen} onClose={()=>setTheatreFormOpen(false)}/>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>deleteMutation.mutate(deleteId!)} title="Delete theatre?" message="All screens, shows, and bookings in this theatre will be removed." confirmLabel="Delete" destructive loading={deleteMutation.isPending}/>
    </>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const isSuperAdmin = useIsSuperAdmin();
  const isAuthenticated = useAuthStore(s=>s.isAuthenticated);
  useEffect(()=>{ if(!isAuthenticated||!isSuperAdmin) router.push("/"); },[isAuthenticated,isSuperAdmin,router]);
  const {data:moviesData,isLoading:lm}=useQuery({queryKey:["movies",0,50],queryFn:()=>movieService.getAll(0,50),enabled:isSuperAdmin});
  const {data:theatresData,isLoading:lt}=useQuery({queryKey:["theatres",0,50],queryFn:()=>theatreService.getAll(0,50),enabled:isSuperAdmin});
  const totalRevenue=theatresData?.pageData.reduce((s,t)=>s+(t.totalRevenue??0),0)??0;
  const totalBookings=theatresData?.pageData.reduce((s,t)=>s+(t.totalBookings??0),0)??0;

  return (
    <main className="pt-[68px] min-h-screen">
      <div className="px-12 py-10">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1"><Shield size={22} className="text-primary"/><h1 className="font-display text-6xl tracking-wide">SUPER ADMIN</h1></div>
            <p className="text-text-secondary text-sm pl-9">Full control — movies, theatres, users</p>
          </div>
          <LiveBadge/>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {lm||lt ? Array.from({length:4}).map((_,i)=><StatCardSkeleton key={i}/>) : <>
            <StatCard label="Total Revenue" value={`€${(totalRevenue/1e6).toFixed(1)}M`} sub="All theatres" icon={TrendingUp} accent="#E50914"/>
            <StatCard label="Total Bookings" value={totalBookings.toLocaleString()} sub="All time" icon={Users}/>
            <StatCard label="Active Movies" value={String(moviesData?.totalElements??0)} sub="In catalogue" icon={Film}/>
            <StatCard label="Theatres" value={String(theatresData?.totalElements??0)} sub="Across Belgium" icon={Building2} accent="#46D369"/>
          </>}
        </div>
        <div className="flex flex-col gap-8">
          <MoviesTable/>
          <TheatresTable/>
        </div>
      </div>
    </main>
  );
}

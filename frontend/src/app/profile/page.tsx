"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User, Mail, Shield, Calendar, Edit2,
  Save, Loader2, LogOut, Ticket, Star
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store";
import { userService } from "@/services";
import { useUserReservations } from "@/hooks";
import { parseApiError } from "@/lib/axios";
import { FloatingInput } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const ROLE_DISPLAY: Record<string, { label: string; variant: "success" | "warning" | "info" }> = {
  ROLE_SUPER_ADMIN: { label: "Super Admin", variant: "warning" },
  ROLE_THEATRE_ADMIN: { label: "Theatre Admin", variant: "info" },
  ROLE_USER: { label: "Member", variant: "success" },
};

interface ProfileForm {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, token, clearAuth } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const { data: reservationsData } = useUserReservations(user?.userId ?? 0, 0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await userService.update(user.userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password || user.username, // keep existing if blank
      });
      if (token) setAuth(updated, token);
      toast.success("Profile updated successfully!");
      setEditing(false);
      reset({ firstName: data.firstName, lastName: data.lastName, password: "", confirmPassword: "" });
    } catch (e) {
      toast.error(parseApiError(e).message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/");
    toast.success("Signed out successfully.");
  };

  if (!user) return null;

  const roleInfo = ROLE_DISPLAY[user.userRole] ?? ROLE_DISPLAY.ROLE_USER;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const totalReservations = reservationsData?.totalElements ?? 0;
  const totalSpent = (reservationsData?.pageData ?? []).reduce(
    (s, r) => s + r.totalAmount,
    0
  );

  return (
    <main className="pt-[68px] min-h-screen">
      <div className="px-12 py-10 max-w-4xl mx-auto">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg p-8 mb-6 flex items-center justify-between gap-6 flex-wrap"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-wide">
                {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                <span className="text-text-secondary text-sm">@{user.username}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setEditing((p) => !p)}
              className="border border-border hover:border-white/60 text-white px-4 py-2 rounded text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Edit2 size={14} /> {editing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              onClick={handleLogout}
              className="border border-primary/40 hover:border-primary hover:bg-primary/10 text-primary px-4 py-2 rounded text-sm font-semibold transition-all flex items-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Bookings", value: totalReservations, icon: Ticket, color: "text-primary" },
            { label: "Total Spent", value: `€${totalSpent.toLocaleString()}`, icon: Star, color: "text-warning" },
            { label: "Member Since", value: user.userCreatedAt ? new Date(user.userCreatedAt).getFullYear() : "—", icon: Calendar, color: "text-success" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg p-5 text-center"
            >
              <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
              <div className="font-display text-3xl tracking-wide mb-1">{stat.value}</div>
              <div className="text-xs text-text-secondary">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Info / Edit form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg p-6 mb-6"
        >
          <h2 className="font-display text-2xl tracking-wide mb-6">
            {editing ? "EDIT PROFILE" : "ACCOUNT DETAILS"}
          </h2>

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="First Name"
                  {...register("firstName", { required: "Required" })}
                  error={errors.firstName?.message}
                />
                <FloatingInput
                  label="Last Name"
                  {...register("lastName", { required: "Required" })}
                  error={errors.lastName?.message}
                />
              </div>
              <FloatingInput
                label="New Password (leave blank to keep current)"
                type="password"
                {...register("password")}
              />
              <FloatingInput
                label="Confirm New Password"
                type="password"
                {...register("confirmPassword", {
                  validate: (v) =>
                    !watch("password") ||
                    v === watch("password") ||
                    "Passwords don't match",
                })}
                error={errors.confirmPassword?.message}
              />
              <button
                type="submit"
                disabled={saving}
                className="self-start bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-8 py-3 rounded text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: `${user.firstName} ${user.lastName}`, icon: User },
                { label: "Username", value: `@${user.username}`, icon: User },
                { label: "Email", value: user.userEmail, icon: Mail },
                { label: "Role", value: roleInfo.label, icon: Shield },
              ].map((field) => (
                <div key={field.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                    <field.icon size={15} className="text-text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary font-semibold tracking-widest uppercase mb-1">
                      {field.label}
                    </div>
                    <div className="text-sm font-medium">{field.value || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/reservations"
            className="bg-surface hover:bg-surface-2 border border-border hover:border-white/40 rounded-lg p-5 transition-all flex items-center gap-3"
          >
            <Ticket size={20} className="text-primary" />
            <div>
              <div className="font-semibold text-sm">My Bookings</div>
              <div className="text-xs text-text-secondary mt-0.5">
                {totalReservations} reservation{totalReservations !== 1 ? "s" : ""}
              </div>
            </div>
          </Link>
          <Link
            href="/movies"
            className="bg-surface hover:bg-surface-2 border border-border hover:border-white/40 rounded-lg p-5 transition-all flex items-center gap-3"
          >
            <Star size={20} className="text-warning" />
            <div>
              <div className="font-semibold text-sm">Browse Movies</div>
              <div className="text-xs text-text-secondary mt-0.5">Find your next film</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

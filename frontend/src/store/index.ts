import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import type { AuthState, BookingState, User, Show, SelectedSeat } from "@/types";
import { authService } from "@/services/authService";

// ─── Auth Store ───────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) => {
        Cookies.set("rc_token", token, { expires: 1 / 96 });
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        Cookies.remove("rc_token");
        Cookies.remove("rc_user");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "rc-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── Derived helpers ──────────────────────────────────────────────────────────

export const useCurrentRole = () => {
  const token = useAuthStore((s) => s.token);
  if (!token) return null;
  return authService.getRoleFromToken(token);
};

export const useIsSuperAdmin = () => useCurrentRole() === "ROLE_SUPER_ADMIN";
export const useIsTheatreAdmin = () => {
  const role = useCurrentRole();
  return role === "ROLE_THEATRE_ADMIN" || role === "ROLE_SUPER_ADMIN";
};

// ─── Booking Store ────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingState>()((set, get) => ({
  selectedShow: null,
  selectedSeats: [],
  totalAmount: 0,

  setShow: (show: Show) =>
    set({ selectedShow: show, selectedSeats: [], totalAmount: 0 }),

  addSeat: (seat: SelectedSeat) => {
    const current = get().selectedSeats;
    if (current.find((s) => s.showSeatId === seat.showSeatId)) return;
    const updated = [...current, seat];
    set({
      selectedSeats: updated,
      totalAmount: updated.reduce((sum, s) => sum + s.price, 0),
    });
  },

  removeSeat: (showSeatId: number) => {
    const updated = get().selectedSeats.filter(
      (s) => s.showSeatId !== showSeatId
    );
    set({
      selectedSeats: updated,
      totalAmount: updated.reduce((sum, s) => sum + s.price, 0),
    });
  },

  clearBooking: () =>
    set({ selectedShow: null, selectedSeats: [], totalAmount: 0 }),
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIState {
  authModalOpen: boolean;
  authMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  toggleAuthMode: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  authModalOpen: false,
  authMode: "login",

  openAuthModal: (mode = "login") =>
    set({ authModalOpen: true, authMode: mode }),

  closeAuthModal: () => set({ authModalOpen: false }),

  toggleAuthMode: () =>
    set((s) => ({ authMode: s.authMode === "login" ? "signup" : "login" })),
}));

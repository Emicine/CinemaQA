// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = "ROLE_USER" | "ROLE_THEATRE_ADMIN" | "ROLE_SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "DELETED";
export type SeatType = "COUPLE_SOFA" | "SINGLE_SOFA" | "SINGLE" | "COUPLE";
export type SeatStatus = "AVAILABLE" | "BOOKED";
export type ReservationStatus = "BOOKED" | "CANCELLED";
export type Genre =
  | "ACTION"
  | "THRILLER"
  | "HORROR"
  | "COMEDY"
  | "SUSPENSE"
  | "DRAMA"
  | "ROMANCE"
  | "SCIENCE_FICTION";

// ─── Entities ────────────────────────────────────────────────────────────────

export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  userStatus: UserStatus;
  userRole: UserRole;
  userCreatedAt: string;
  userUpdatedAt: string;
}

export interface Movie {
  movieId: number;
  movieName: string;
  movieGenre: Genre;
  movieDirector: string;
  movieReleaseDate: string;
  movieDescription: string;
  movieDuration: number;
  moviePosterUrl?: string;
  totalBookings: number;
}

export interface Seat {
  seatId: number;
  rowId: number;
  seatNumber: number;
  seatType: SeatType;
  seatPrice: number;
}

export interface Screen {
  screenId: number;
  screenName: string;
  seats: Seat[];
}

export interface TheatreVsAdmin {
  id: number;
  user: User;
}

export interface Theatre {
  theatreId: number;
  theatreName: string;
  theatreLocation: string;
  totalScreens: number;
  totalBookings: number;
  totalRevenue: number;
  theatreAdmins: TheatreVsAdmin[];
  screens: Screen[];
}

export interface ShowSeat {
  showSeatId: number;
  seatStatus: SeatStatus;
  seat: Seat;
}

export interface Show {
  showId: number;
  movie: Movie;
  theatre: Theatre;
  screen: Screen;
  startTime: string;
  endTime: string;
  showSeats: ShowSeat[];
}

export interface Reservation {
  reservationId: number;
  user: User;
  show: Show;
  seatsReserved: ShowSeat[];
  reservationTime: string;
  updatedTime: string;
  totalAmount: number;
  reservationStatus: ReservationStatus;
}

// ─── API Response DTOs ────────────────────────────────────────────────────────

export interface APIResponseDTO<T = unknown> {
  message?: string;
  data: T;
}

export interface PagedAPIResponseDTO<T = unknown> {
  pageData: T[];
  totalElements: number;
  totalPages: number;
  currentLimit: number;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface UserRequestDTO {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  userEmail: string;
}

export interface AuthRequestDTO {
  userName: string;
  password: string;
}

export interface AuthResponseDTO {
  authenticationToken: string;
}

export interface MovieRequestDTO {
  movieName: string;
  movieGenre: string;
  movieDirector: string;
  movieReleaseDate: string;
  movieDescription: string;
  movieDuration: number;
  moviePosterUrl?: string;
}

export interface SeatRequestDTO {
  rowId: number;
  seatNumber: number;
  seatType: string;
  seatPrice: number;
}

export interface ScreenRequestDTO {
  screenName: string;
  seats: SeatRequestDTO[];
}

export interface TheatreRequestDTO {
  theatreName: string;
  theatreLocation: string;
  theatreAdminId: number;
  screens: ScreenRequestDTO[];
}

export interface ShowRequestDTO {
  movieId: number;
  screenId: number;
  startTime: string;
  endTime: string;
}

export interface ShowSeatRequestDTO {
  seatId: number;
}

export interface ReservationRequestDTO {
  userId: number;
  showId: number;
  showSeats: ShowSeatRequestDTO[];
}

export interface TheatreAdminRequestDTO {
  userId: number;
  theatreId: number;
}

// ─── Frontend State Types ─────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export interface SelectedSeat {
  showSeatId: number;
  seatId: number;
  label: string; // e.g. "A3"
  price: number;
  seatType: SeatType;
}

export interface BookingState {
  selectedShow: Show | null;
  selectedSeats: SelectedSeat[];
  totalAmount: number;
  addSeat: (seat: SelectedSeat) => void;
  removeSeat: (showSeatId: number) => void;
  clearBooking: () => void;
  setShow: (show: Show) => void;
}

export interface ToastOptions {
  type: "success" | "error" | "warning";
  message: string;
  duration?: number;
}

// ─── UI Helper Types ───────────────────────────────────────────────────────────

export interface SeatRowConfig {
  rowLabel: string;
  seats: ShowSeat[];
  hasAisle: boolean;
  aisleAfter: number;
}

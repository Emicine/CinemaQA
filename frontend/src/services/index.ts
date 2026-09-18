import api from "@/lib/axios";
import type {
  Show,
  Theatre,
  Reservation,
  APIResponseDTO,
  PagedAPIResponseDTO,
  ShowRequestDTO,
  TheatreRequestDTO,
  TheatreAdminRequestDTO,
  ReservationRequestDTO,
} from "@/types";

// ─── External Services ────────────────────────────────────────────────────────
export * from "./movieService";
export * from "./authService";

// ─── Show Service ─────────────────────────────────────────────────────────────

export const showService = {
  async getAll(page = 0, pageSize = 12): Promise<PagedAPIResponseDTO<Show>> {
    const r = await api.get<PagedAPIResponseDTO<Show>>(
      `/api/shows/all?page=${page}&pageSize=${pageSize}`
    );
    return r.data;
  },

  async getById(showId: number): Promise<Show> {
    const r = await api.get<APIResponseDTO<Show>>(`/api/shows/show/${showId}`);
    return r.data.data;
  },

  async getByMovie(movieId: number, page = 0, pageSize = 20): Promise<PagedAPIResponseDTO<Show>> {
    const r = await api.get<PagedAPIResponseDTO<Show>>(
      `/api/shows/movie/${movieId}?page=${page}&pageSize=${pageSize}`
    );
    return r.data;
  },

  async getByTheatre(theatreId: number, page = 0, pageSize = 20): Promise<PagedAPIResponseDTO<Show>> {
    const r = await api.get<PagedAPIResponseDTO<Show>>(
      `/api/shows/theatre/${theatreId}?page=${page}&pageSize=${pageSize}`
    );
    return r.data;
  },

  async getByScreen(screenId: number, page = 0, pageSize = 20): Promise<PagedAPIResponseDTO<Show>> {
    const r = await api.get<PagedAPIResponseDTO<Show>>(
      `/api/shows/screen/${screenId}?page=${page}&pageSize=${pageSize}`
    );
    return r.data;
  },

  async create(payload: ShowRequestDTO): Promise<Show> {
    const r = await api.post<APIResponseDTO<Show>>("/api/shows/show/create", payload);
    return r.data.data;
  },

  async update(showId: number, payload: ShowRequestDTO): Promise<Show> {
    const r = await api.put<APIResponseDTO<Show>>(`/api/shows/show/${showId}`, payload);
    return r.data.data;
  },

  async delete(showId: number): Promise<string> {
    const r = await api.delete<APIResponseDTO<null>>(`/api/shows/show/${showId}`);
    return r.data.message ?? "Show deleted.";
  },
};

// ─── Theatre Service ──────────────────────────────────────────────────────────

export const theatreService = {
  async getAll(page = 0, pageSize = 12): Promise<PagedAPIResponseDTO<Theatre>> {
    const r = await api.get<PagedAPIResponseDTO<Theatre>>(
      `/api/theatres/all?page=${page}&pageSize=${pageSize}`
    );
    return r.data;
  },

  async getById(theatreId: number): Promise<Theatre> {
    const r = await api.get<APIResponseDTO<Theatre>>(`/api/theatres/theatre/${theatreId}`);
    return r.data.data;
  },

  async create(payload: TheatreRequestDTO): Promise<Theatre> {
    const r = await api.post<APIResponseDTO<Theatre>>("/api/theatres/theatre/create", payload);
    return r.data.data;
  },

  async update(theatreId: number, payload: TheatreRequestDTO): Promise<Theatre> {
    const r = await api.put<APIResponseDTO<Theatre>>(
      `/api/theatres/theatre/${theatreId}`,
      payload
    );
    return r.data.data;
  },

  async delete(theatreId: number): Promise<string> {
    const r = await api.delete<APIResponseDTO<null>>(
      `/api/theatres/theatre/${theatreId}`
    );
    return r.data.message ?? "Theatre deleted.";
  },

  async addAdmin(payload: TheatreAdminRequestDTO): Promise<Theatre> {
    const r = await api.post<APIResponseDTO<Theatre>>(
      "/api/theatres/theatre/admin",
      payload
    );
    return r.data.data;
  },

  async removeAdmin(payload: TheatreAdminRequestDTO): Promise<Theatre> {
    const r = await api.delete<APIResponseDTO<Theatre>>(
      "/api/theatres/theatre/admin",
      { data: payload }
    );
    return r.data.data;
  },
};

// ─── Reservation Service ──────────────────────────────────────────────────────

export const reservationService = {
  async getForUser(
    userId: number,
    page = 0,
    pageSize = 10
  ): Promise<PagedAPIResponseDTO<Reservation>> {
    const r = await api.get<PagedAPIResponseDTO<Reservation>>(
      `/api/reservations/user/${userId}/all?page=${page}&pageSize=${pageSize}`
    );
    return r.data;
  },

  /**
   * POST /api/reservations/reserve [ROLE_USER]
   * Backend uses ReentrantLock — catch 409 for seat conflicts.
   */
  async create(payload: ReservationRequestDTO): Promise<Reservation> {
    const r = await api.post<APIResponseDTO<Reservation>>(
      "/api/reservations/reserve",
      payload
    );
    return r.data.data;
  },

  /**
   * PUT /api/reservations/cancel/:reservationId
   * @PreAuthorize checks ownership.
   */
  async cancel(reservationId: number): Promise<boolean> {
    const r = await api.put<APIResponseDTO<null>>(
      `/api/reservations/cancel/${reservationId}`
    );
    return r.status === 201;
  },
};

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  async getAll(page = 0, pageSize = 20) {
    const r = await api.get(`/api/users/all?page=${page}&pageSize=${pageSize}`);
    return r.data;
  },

  async getById(userId: number) {
    const r = await api.get(`/api/users/user/${userId}`);
    return r.data.data;
  },

  async update(userId: number, payload: { firstName: string; lastName: string; password: string }) {
    const r = await api.put(`/api/users/user/${userId}`, payload);
    return r.data.data;
  },

  async delete(userId: number) {
    const r = await api.delete(`/api/users/user/${userId}`);
    return r.data.message;
  },
};

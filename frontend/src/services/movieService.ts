import api from "@/lib/axios";
import type {
  Movie,
  APIResponseDTO,
  PagedAPIResponseDTO,
  MovieRequestDTO,
} from "@/types";

// ─── Movie Service ────────────────────────────────────────────────────────────

export const movieService = {
  /**
   * GET /api/movies/all?page=0&pageSize=10
   */
  async getAll(page = 0, pageSize = 12): Promise<PagedAPIResponseDTO<Movie>> {
    const response = await api.get<PagedAPIResponseDTO<Movie>>(
      `/api/movies/all?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  /**
   * GET /api/movies/movie/:movieId
   */
  async getById(movieId: number): Promise<Movie> {
    const response = await api.get<APIResponseDTO<Movie>>(
      `/api/movies/movie/${movieId}`
    );
    return response.data.data;
  },

  /**
   * POST /api/movies/movie/create  [ROLE_SUPER_ADMIN]
   */
  async create(payload: MovieRequestDTO): Promise<Movie> {
    const response = await api.post<APIResponseDTO<Movie>>(
      "/api/movies/movie/create",
      payload
    );
    return response.data.data;
  },

  /**
   * PUT /api/movies/movie/:movieId  [ROLE_SUPER_ADMIN]
   */
  async update(movieId: number, payload: MovieRequestDTO): Promise<Movie> {
    const response = await api.put<APIResponseDTO<Movie>>(
      `/api/movies/movie/${movieId}`,
      payload
    );
    return response.data.data;
  },

  /**
   * DELETE /api/movies/movie/:movieId  [ROLE_SUPER_ADMIN]
   */
  async delete(movieId: number): Promise<string> {
    const response = await api.delete<APIResponseDTO<null>>(
      `/api/movies/movie/${movieId}`
    );
    return response.data.message ?? "Movie deleted.";
  },
};

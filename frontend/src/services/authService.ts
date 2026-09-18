import api, { setAuthToken } from "@/lib/axios";
import type {
  AuthRequestDTO,
  AuthResponseDTO,
  UserRequestDTO,
  APIResponseDTO,
  User,
} from "@/types";

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /auth/login
   * Authenticates user and stores the JWT token in a cookie.
   */
  async login(credentials: AuthRequestDTO): Promise<string> {
    const response = await api.post<AuthResponseDTO>("/auth/login", credentials);
    const token = response.data.authenticationToken;
    setAuthToken(token);
    return token;
  },

  /**
   * POST /auth/signup
   * Registers a new ROLE_USER account and stores the JWT token.
   */
  async signup(payload: UserRequestDTO): Promise<string> {
    const response = await api.post<AuthResponseDTO>("/auth/signup", payload);
    const token = response.data.authenticationToken;
    setAuthToken(token);
    return token;
  },

  /**
   * Decodes a JWT token (without verification, for client-side claims).
   * The backend verifies the signature — this is for UI role-checking only.
   */
  decodeToken(token: string): { sub: string; ROLES: Array<{ authority: string }>; exp: number } | null {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  },

  /**
   * Extract user role from token claims.
   */
  getRoleFromToken(token: string): string | null {
    const decoded = authService.decodeToken(token);
    if (!decoded?.ROLES?.length) return null;
    return decoded.ROLES[0].authority;
  },

  /**
   * Check if token is expired.
   */
  isTokenExpired(token: string): boolean {
    const decoded = authService.decodeToken(token);
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  },
};

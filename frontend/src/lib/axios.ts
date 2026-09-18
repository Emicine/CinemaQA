import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── Request Interceptor — Attach JWT Bearer Token ────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token from cookie (set at login/signup)
    const token = Cookies.get("rc_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor — Handle 401 / 403 ─────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — clear auth and redirect to login
      Cookies.remove("rc_token");
      Cookies.remove("rc_user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      // Forbidden — redirect home
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    // Re-throw so service layer can handle it
    return Promise.reject(error);
  }
);

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const setAuthToken = (token: string): void => {
  Cookies.set("rc_token", token, {
    expires: 1 / 96, // 15 minutes
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const clearAuthToken = (): void => {
  Cookies.remove("rc_token");
  Cookies.remove("rc_user");
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get("rc_token");
};

// ─── Error Parser ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
}

export const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const data = error.response?.data as { message?: string } | undefined;
    const message =
      data?.message ||
      error.message ||
      "An unexpected error occurred.";
    return { message, status };
  }
  return { message: "An unexpected error occurred.", status: 500 };
};

export default api;

"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Film, Search, Calendar, Inbox } from "lucide-react";
import { Button } from "./Button";

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorState
            message={this.state.error?.message ?? "Something went wrong"}
            onRetry={() => this.setState({ hasError: false })}
          />
        )
      );
    }
    return this.props.children;
  }
}

// ─── Error State ──────────────────────────────────────────────────────────────
export function ErrorState({
  title = "Oops! Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <AlertTriangle size={28} className="text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {message && (
        <p className="text-text-secondary text-sm max-w-md mb-6">{message}</p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          icon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

// ─── Empty State variants ─────────────────────────────────────────────────────
type EmptyVariant =
  | "movies"
  | "shows"
  | "reservations"
  | "search"
  | "generic";

const EMPTY_CONFIG: Record<
  EmptyVariant,
  { icon: React.ElementType; title: string; sub: string }
> = {
  movies: {
    icon: Film,
    title: "No movies found",
    sub: "Try a different genre or search term.",
  },
  shows: {
    icon: Calendar,
    title: "No shows on this date",
    sub: "Try selecting a different date or location.",
  },
  reservations: {
    icon: Inbox,
    title: "No bookings yet",
    sub: "Your confirmed reservations will appear here.",
  },
  search: {
    icon: Search,
    title: "No results found",
    sub: "Try a different keyword or browse our full catalogue.",
  },
  generic: {
    icon: Inbox,
    title: "Nothing here yet",
    sub: "Check back soon.",
  },
};

export function EmptyState({
  variant = "generic",
  action,
}: {
  variant?: EmptyVariant;
  action?: { label: string; onClick: () => void };
}) {
  const { icon: Icon, title, sub } = EMPTY_CONFIG[variant];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-5">
        <Icon size={26} className="text-text-secondary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-xs mb-6">{sub}</p>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
export function NotFound({ entity = "Page" }: { entity?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="font-display text-[120px] text-primary/20 leading-none mb-4">
        404
      </div>
      <h1 className="font-display text-5xl mb-4">{entity.toUpperCase()} NOT FOUND</h1>
      <p className="text-text-secondary mb-8 max-w-md">
        The {entity.toLowerCase()} you're looking for doesn't exist or has been removed.
      </p>
      <Button variant="primary" onClick={() => (window.location.href = "/")}>
        Back to Home
      </Button>
    </div>
  );
}

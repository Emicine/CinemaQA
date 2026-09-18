"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#141414] text-white font-sans">
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-[#E50914]/10 flex items-center justify-center mb-8">
            <AlertTriangle size={36} className="text-[#E50914]" />
          </div>
          <h1
            className="mb-4"
            style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "48px", letterSpacing: "0.04em" }}
          >
            SOMETHING WENT WRONG
          </h1>
          <p className="text-[#999] max-w-md mb-8">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C11119] text-white px-8 py-3 rounded font-semibold text-sm transition-colors"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </main>
      </body>
    </html>
  );
}

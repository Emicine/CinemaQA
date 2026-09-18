import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Big 404 */}
      <div
        className="font-display leading-none mb-6 select-none"
        style={{
          fontSize: "clamp(100px, 20vw, 200px)",
          WebkitTextStroke: "2px #333",
          color: "transparent",
        }}
      >
        404
      </div>

      <div className="font-display text-5xl tracking-wide mb-4">
        PAGE NOT FOUND
      </div>
      <p className="text-text-secondary max-w-md mb-10 leading-relaxed">
        The page you're looking for has gone dark. Perhaps it was moved,
        deleted, or you followed a broken link.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-semibold text-sm transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/movies"
          className="border border-border hover:border-white/60 text-white px-8 py-3 rounded font-semibold text-sm transition-colors"
        >
          Browse Movies
        </Link>
      </div>
    </main>
  );
}

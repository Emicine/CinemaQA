import { HeroSkeleton, MovieRowSkeleton } from "@/components/ui/Skeletons";

// Shown by Next.js App Router during server-side data fetching
export default function Loading() {
  return (
    <main>
      <HeroSkeleton />
      <div className="pt-4">
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
      </div>
    </main>
  );
}

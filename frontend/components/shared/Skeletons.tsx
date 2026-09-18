import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder matching PropertyCard / ProjectCard proportions. */
export function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-[22px] bg-white p-2.5 border border-teal-950/[0.07] shadow-card">
      <Skeleton className={`rounded-2xl w-full ${tall ? "aspect-[4/3]" : "h-48"}`} />
      <div className="px-2 pt-3.5 pb-1.5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between pt-3 border-t border-dashed border-teal-900/10">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8, tall = false }: { count?: number; tall?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} tall={tall} />
      ))}
    </div>
  );
}

/** Placeholder for the property / project detail layout (gallery + info card). */
export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-7 w-72 max-w-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[340px] lg:h-[500px] rounded-2xl" />
        <div className="card p-5 space-y-4">
          <Skeleton className="h-14 rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
          <Skeleton className="h-11 rounded-lg mt-auto" />
        </div>
      </div>
      <div className="card p-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Catalogue placeholder: dark search band + result grid, matching the
 * /properties and /projects layout so the page does not jump when it loads.
 */
export function CatalogueSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-teal-950">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-8">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="h-9 w-64 bg-white/10" />
          </div>
          <div className="rounded-2xl bg-white p-2 shadow-2xl shadow-black/25">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full sm:w-48 rounded-xl" />
        </div>
        <CardGridSkeleton count={count} tall />
      </div>
    </div>
  );
}

/** Generic page placeholder used by app/[locale]/loading.tsx. */
export function PageSkeleton() {
  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-28 py-10 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="w-14 h-10" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

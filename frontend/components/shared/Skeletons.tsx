import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder matching PropertyCard / ProjectCard proportions. */
export function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <Skeleton className={tall ? "h-56 rounded-none" : "h-48 rounded-none"} />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
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
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-40" />
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

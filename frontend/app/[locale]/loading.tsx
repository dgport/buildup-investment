import { PageSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <PageSkeleton />
    </div>
  );
}

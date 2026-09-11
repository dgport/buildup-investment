import { DetailSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DetailSkeleton />
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Building2, DollarSign, MapPin, Calendar } from "lucide-react";
import { useMyProperties, useDeleteProperty } from "@/lib/hooks/useProperties";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/types/properties";
import { PropertyStatus } from "@/lib/types/properties";
import { Pagination } from "@/components/shared/Pagination";

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL?.replace("/api", "") ??
  "http://localhost:3000";

const PROPERTIES_PER_PAGE = 9;

/**
 * Resolve a stored image path to a fully qualified URL.
 * The backend stores paths like "uploads/properties/image.jpg"
 * or full URLs when images come from external sources.
 */
function resolveImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const clean = imageUrl.replace(/^\/+/, "");
  return `${API_BASE}/${clean}`;
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
};

const DEAL_TYPE_STYLES: Record<string, string> = {
  SALE: "bg-blue-100 text-blue-700 border-blue-200",
  RENT: "bg-purple-100 text-purple-700 border-purple-200",
  DAILY_RENT: "bg-pink-100 text-pink-700 border-pink-200",
};

const DEAL_TYPE_LABELS: Record<string, string> = {
  SALE: "For Sale",
  RENT: "For Rent",
  DAILY_RENT: "Daily Rent",
};

function formatPropertyType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

// ─── Property Card ────────────────────────────────────────────────────────────

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function PropertyCard({
  property,
  onEdit,
  onDelete,
  isDeleting,
}: PropertyCardProps) {
  const title = property.translation?.title || "Untitled Property";
  const location =
    property.translation?.address ||
    property.regionName ||
    property.location ||
    "Location not specified";
  const imageUrl = property.galleryImages?.[0]?.imageUrl
    ? resolveImageUrl(property.galleryImages[0].imageUrl)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="w-16 h-16 text-gray-300" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <Badge
            className={`${STATUS_STYLES[property.status] ?? STATUS_STYLES.DRAFT} font-medium`}
          >
            {property.status}
          </Badge>
        </div>

        {property.hotSale && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white border-red-600">
              🔥 Hot Sale
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className={DEAL_TYPE_STYLES[property.dealType] ?? ""}>
            {DEAL_TYPE_LABELS[property.dealType] ?? property.dealType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formatPropertyType(property.propertyType)}
          </Badge>
          {property.totalArea && (
            <Badge variant="outline" className="text-xs">
              {property.totalArea}m²
            </Badge>
          )}
        </div>

        {property.price != null && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-blue-600">
              ${property.price.toLocaleString()}
            </span>
          </div>
        )}

        {(property.rooms || property.bedrooms || property.bathrooms) && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            {property.rooms && <span>{property.rooms} rooms</span>}
            {property.bedrooms && <span>{property.bedrooms} beds</span>}
            {property.bathrooms && <span>{property.bathrooms} baths</span>}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(property)}
            className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(property.id)}
            disabled={isDeleting}
            className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>

        {property.status === PropertyStatus.REJECTED &&
          property.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs font-medium text-red-700 mb-1">
                Rejection Reason:
              </p>
              <p className="text-xs text-red-600">{property.rejectionReason}</p>
            </div>
          )}
      </div>
    </div>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: user } = useCurrentUser();
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  // Fetch current page for the grid
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useMyProperties({
    page,
    limit: PROPERTIES_PER_PAGE,
  });

  // Fetch a large page to get accurate status counts across all properties
  const { data: allPropertiesResponse } = useMyProperties({
    page: 1,
    limit: 1000,
  });

  const deleteProperty = useDeleteProperty();

  const properties = propertiesResponse?.data ?? [];
  const meta = propertiesResponse?.meta;

  // Accurate counts derived from all properties, not just the current page
  const allProperties = allPropertiesResponse?.data ?? [];
  const approvedCount = allProperties.filter(
    (p) => p.status === PropertyStatus.APPROVED,
  ).length;
  const pendingCount = allProperties.filter(
    (p) => p.status === PropertyStatus.PENDING,
  ).length;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (property: Property) => {
    router.push(`/dashboard/properties/${property.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    try {
      await deleteProperty.mutateAsync(id);
      // If we deleted the last item on a page > 1, go back one page
      if (properties.length === 1 && page > 1) {
        handlePageChange(page - 1);
      }
    } catch (err: any) {
      alert(
        err.response?.data?.message ??
          err.message ??
          "Failed to delete property",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                My Properties
              </h1>
              {user && (
                <p className="text-gray-600">
                  Welcome back, {user.firstname} {user.lastname}
                </p>
              )}
            </div>
            <Button
              onClick={() => router.push("/dashboard/properties/new")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Property
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Properties
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {meta?.total ?? 0}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {approvedCount}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {pendingCount}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User info card */}
        {user && (
          <div className="mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
              <span className="text-blue-700 font-bold text-lg">
                {user.firstname.charAt(0)}
                {user.lastname.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-medium">
              Error loading properties. Please try again.
            </p>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteProperty.isPending}
                />
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 rounded-full p-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first property listing
                </p>
                <Button
                  onClick={() => router.push("/dashboard/properties/new")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Property
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

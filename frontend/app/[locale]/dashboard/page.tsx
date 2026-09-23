"use client";

import { PageLoader } from "@/components/shared/PageLoader";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  Plus,
  Building2,
  CheckCircle2,
  Clock,
  EyeOff,
  MapPin,
  Pencil,
  Trash2,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import {
  useMyProperties,
  useMyPropertyStats,
  useDeleteProperty,
} from "@/lib/hooks/useProperties";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination } from "@/components/shared/Pagination";
import { CardGridSkeleton } from "@/components/shared/Skeletons";
import { fallbackToFullImage, thumbnailUrl } from "@/lib/utils/image-utils";
import { formatMoney, useCurrency } from "@/lib/currency";
import { getErrorMessage } from "@/lib/api/api";
import { toast } from "sonner";
import { locales as SITE_LOCALES } from "@/i18n/routing";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { ROUTES } from "@/lib/constants/routes";
import {
  PROPERTY_LANGUAGES,
  PropertyStatus,
  type Property,
} from "@/lib/types/properties";

const PROPERTIES_PER_PAGE = 9;

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
};

const DEAL_TYPE_STYLES: Record<string, string> = {
  SALE: "bg-teal-100 text-teal-800 border-teal-200",
  RENT: "bg-purple-100 text-purple-700 border-purple-200",
  DAILY_RENT: "bg-pink-100 text-pink-700 border-pink-200",
};

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function DashboardPropertyCard({ property, onDelete, isDeleting }: PropertyCardProps) {
  const t = useTranslations("dashboard");
  const tp = useTranslations("properties");
  const tl = useTranslations("common.language");
  const { currency, exchangeRate } = useCurrency();

  const title = property.translation?.title || t("untitledProperty");
  const location =
    [property.regionName, property.translation?.address ?? property.address]
      .filter(Boolean)
      .join(", ") || t("locationNotSpecified");
  const coverSource = property.galleryImages?.[0]?.imageUrl;
  const cover = thumbnailUrl(coverSource);
  const missingLanguages = PROPERTY_LANGUAGES.filter((l) => (SITE_LOCALES as readonly string[]).includes(l)).filter(
    (lang) =>
      !property.translations?.some(
        (tr) => tr.language === lang && tr.title.trim(),
      ),
  );

  return (
    <div className="card card-hover overflow-hidden flex flex-col">
      <Link
        href={ROUTES.PROPERTY_EDIT(property.id)}
        className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 block"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={title}
            loading="lazy"
            onError={(e) => fallbackToFullImage(e, coverSource)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-1">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <Badge
            className={`${STATUS_STYLES[property.status] ?? STATUS_STYLES.DRAFT} font-medium`}
          >
            {tp(`enums.status.${property.status}`)}
          </Badge>
          {!property.public && (
            <Badge className="bg-gray-800 text-white border-gray-900 font-medium">
              <EyeOff className="w-3 h-3 mr-1" />
              {t("private")}
            </Badge>
          )}
        </div>
        {property.hotSale && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white border-red-600">
              🔥 {t("hotSale")}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2 left-3 bg-teal-950/80 text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded-md">
          ID {property.externalId}
        </div>
        {property.galleryImages.length > 0 && (
          <div className="absolute bottom-2 right-3 bg-teal-950/80 text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {property.galleryImages.length}
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className={DEAL_TYPE_STYLES[property.dealType] ?? ""}>
            {tp(`enums.dealType.${property.dealType}`)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tp(`enums.propertyType.${property.propertyType}`)}
          </Badge>
          {property.totalArea && (
            <Badge variant="outline" className="text-xs">
              {property.totalArea} m²
            </Badge>
          )}
        </div>

        <div className="mb-3">
          <span className="text-2xl font-bold text-teal-900">
            {formatMoney(property.price, currency, exchangeRate) ?? tp("priceOnRequest")}
          </span>
        </div>

        {(property.rooms || property.bedrooms || property.bathrooms) && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {property.rooms ? (
              <span>{property.rooms} {t("rooms")}</span>
            ) : null}
            {property.bedrooms ? (
              <span>{property.bedrooms} {t("beds")}</span>
            ) : null}
            {property.bathrooms ? (
              <span>{property.bathrooms} {t("baths")}</span>
            ) : null}
          </div>
        )}

        {missingLanguages.length > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
            {t("missingTranslations", {
              languages: missingLanguages.map((l) => tl(l)).join(", "),
            })}
          </p>
        )}

        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={ROUTES.PROPERTY_EDIT(property.id)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              {t("edit")}
            </Link>
          </Button>
          {property.public && property.status === PropertyStatus.APPROVED && (
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.PROPERTY(property.id)} target="_blank" aria-label={t("view")}>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(property.id)}
            disabled={isDeleting}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
            aria-label={t("delete")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {property.status === PropertyStatus.PENDING && (
          <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {t("pendingHint")}
          </p>
        )}

        {property.status === PropertyStatus.REJECTED &&
          property.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs font-medium text-red-700 mb-1">
                {t("rejectionReason")}
              </p>
              <p className="text-xs text-red-600">{property.rejectionReason}</p>
            </div>
          )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: "teal" | "green" | "yellow" | "gray";
}) {
  const tones = {
    teal: ["bg-teal-100", "text-teal-700", "text-gray-900"],
    green: ["bg-green-100", "text-green-600", "text-green-600"],
    yellow: ["bg-yellow-100", "text-yellow-600", "text-yellow-600"],
    gray: ["bg-gray-100", "text-gray-600", "text-gray-700"],
  }[tone];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${tones[2]}`}>{value}</p>
        </div>
        <div className={`${tones[0]} rounded-full p-3`}>
          <Icon className={`w-6 h-6 ${tones[1]}`} />
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tf = useTranslations("dashboard.form");

  const { data: user } = useCurrentUser();
  const confirm = useConfirm();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [actionError, setActionError] = useState<string | null>(null);
  const flash = searchParams.get("created") ? tf("created") : null;

  // Drop the ?created flag from the URL after the toast has been shown
  useEffect(() => {
    if (!searchParams.get("created")) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("created");
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
    }, 5000);
    return () => clearTimeout(timer);
  }, [searchParams, pathname, router]);

  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useMyProperties({ page, limit: PROPERTIES_PER_PAGE, lang: locale });
  const { data: stats } = useMyPropertyStats();
  const deleteProperty = useDeleteProperty();

  const properties = propertiesResponse?.data ?? [];
  const meta = propertiesResponse?.meta;
  const hiddenCount = properties.filter((p) => !p.public).length;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ description: t("deleteConfirm"), destructive: true }))) return;
    setActionError(null);
    try {
      await deleteProperty.mutateAsync(id);
      toast.success(t("deleted"));
      if (properties.length === 1 && page > 1) handlePageChange(page - 1);
    } catch (err) {
      const message = getErrorMessage(err, t("deleteFailed"));
      setActionError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {t("title")}
              </h1>
              {user && (
                <p className="text-gray-600">
                  {t("welcomeBack", {
                    name: `${user.firstname} ${user.lastname}`,
                  })}
                </p>
              )}
            </div>
            <Button
              asChild
              size="lg"
              className="bg-teal-900 hover:bg-teal-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href={ROUTES.PROPERTY_NEW}>
                <Plus className="w-5 h-5 mr-2" />
                {t("addProperty")}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("totalProperties")}
              value={stats?.total ?? meta?.total ?? 0}
              icon={Building2}
              tone="teal"
            />
            <StatCard
              label={t("approved")}
              value={stats?.approved ?? 0}
              icon={CheckCircle2}
              tone="green"
            />
            <StatCard
              label={t("pendingReview")}
              value={stats?.pending ?? 0}
              icon={Clock}
              tone="yellow"
            />
            <StatCard
              label={t("hidden")}
              value={hiddenCount}
              icon={EyeOff}
              tone="gray"
            />
          </div>
        </div>

        {flash && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{flash}</AlertDescription>
          </Alert>
        )}
        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="mb-6 card p-5 flex items-center gap-4">
            <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
              <span className="text-teal-800 font-bold text-lg">
                {user.firstname.charAt(0)}
                {user.lastname.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-medium">{t("loadError")}</p>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <DashboardPropertyCard
                  key={property.id}
                  property={property}
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
                  {t("noProperties")}
                </h3>
                <p className="text-gray-500 mb-6">{t("noPropertiesHint")}</p>
                <Button asChild size="lg" className="bg-teal-900 hover:bg-teal-800">
                  <Link href={ROUTES.PROPERTY_NEW}>
                    <Plus className="w-5 h-5 mr-2" />
                    {t("addFirstProperty")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Home,
  ImageIcon,
  Languages,
  MapPin,
  Flame,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePropertyAdmin, useUpdateProperty } from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PropertyType,
  DealType,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
  Region,
  REGION_NAMES,
  type UpdatePropertyDto,
  type Property,
} from "@/lib/types/properties";
import { PropertyImagesManager } from "../../_components/PropertyImagesManager";
import { PropertyTranslationsManager } from "../../_components/PropertyTranslationsManager";
import { PropertyLocationPicker } from "../../_components/PropertyLocationPicker";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { value: PropertyType.APARTMENT, label: "Apartment" },
  { value: PropertyType.VILLA, label: "Villa" },
  { value: PropertyType.COMMERCIAL, label: "Commercial" },
  { value: PropertyType.LAND, label: "Land" },
  { value: PropertyType.HOTEL, label: "Hotel" },
];

const DEAL_TYPES = [
  { value: DealType.SALE, label: "Sale" },
  { value: DealType.RENT, label: "Rent" },
  { value: DealType.DAILY_RENT, label: "Daily Rent" },
];

const HEATING_TYPES = [
  { value: HeatingType.CENTRAL_HEATING, label: "Central Heating" },
  { value: HeatingType.INDIVIDUAL, label: "Individual" },
  { value: HeatingType.GAS, label: "Gas" },
  { value: HeatingType.ELECTRIC, label: "Electric" },
  { value: HeatingType.NONE, label: "None" },
];

const HOT_WATER_TYPES = [
  { value: HotWaterType.CENTRAL_HEATING, label: "Central Heating" },
  { value: HotWaterType.BOILER, label: "Boiler" },
  { value: HotWaterType.SOLAR, label: "Solar" },
  { value: HotWaterType.NONE, label: "None" },
];

const PARKING_TYPES = [
  { value: ParkingType.PARKING_SPACE, label: "Parking Space" },
  { value: ParkingType.GARAGE, label: "Garage" },
  { value: ParkingType.OPEN_LOT, label: "Open Lot" },
  { value: ParkingType.NONE, label: "None" },
];

const OCCUPANCY_OPTIONS = [
  { value: Occupancy.ONE, label: "1 Person" },
  { value: Occupancy.TWO, label: "2 People" },
  { value: Occupancy.THREE, label: "3 People" },
  { value: Occupancy.FOUR, label: "4 People" },
  { value: Occupancy.FIVE, label: "5 People" },
  { value: Occupancy.SIX, label: "6 People" },
  { value: Occupancy.SEVEN, label: "7 People" },
  { value: Occupancy.EIGHT, label: "8 People" },
  { value: Occupancy.NINE, label: "9 People" },
  { value: Occupancy.TEN_PLUS, label: "10+ People" },
];

const AMENITIES: { key: keyof UpdatePropertyDto; label: string }[] = [
  { key: "hasConditioner", label: "Air Conditioner" },
  { key: "hasFurniture", label: "Furniture" },
  { key: "hasBed", label: "Bed" },
  { key: "hasSofa", label: "Sofa" },
  { key: "hasTable", label: "Table" },
  { key: "hasChairs", label: "Chairs" },
  { key: "hasStove", label: "Stove" },
  { key: "hasRefrigerator", label: "Refrigerator" },
  { key: "hasOven", label: "Oven" },
  { key: "hasWashingMachine", label: "Washing Machine" },
  { key: "hasKitchenAppliances", label: "Kitchen Appliances" },
  { key: "hasBalcony", label: "Balcony" },
  { key: "hasNaturalGas", label: "Natural Gas" },
  { key: "hasInternet", label: "Internet" },
  { key: "hasTV", label: "TV" },
  { key: "hasSewerage", label: "Sewerage" },
  { key: "isFenced", label: "Fenced" },
  { key: "hasYardLighting", label: "Yard Lighting" },
  { key: "hasGrill", label: "Grill" },
  { key: "hasAlarm", label: "Alarm" },
  { key: "hasVentilation", label: "Ventilation" },
  { key: "hasWater", label: "Water" },
  { key: "hasElectricity", label: "Electricity" },
  { key: "hasGate", label: "Gate" },
  { key: "isNonStandard", label: "Non-Standard Layout" },
];

type Tab = "details" | "images" | "translations";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "details", label: "Details", icon: Home },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "translations", label: "Translations", icon: Languages },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function propertyToFormData(p: Property): UpdatePropertyDto {
  return {
    propertyType: p.propertyType,
    dealType: p.dealType,
    region: p.region ?? undefined,
    address: p.address ?? undefined,
    location: p.location ?? undefined,
    contactPhone: p.contactPhone ?? undefined,
    hotSale: p.hotSale,
    public: p.public,
    price: p.price ?? undefined,
    totalArea: p.totalArea ?? undefined,
    rooms: p.rooms ?? undefined,
    bedrooms: p.bedrooms ?? undefined,
    bathrooms: p.bathrooms ?? undefined,
    floors: p.floors ?? undefined,
    floorsTotal: p.floorsTotal ?? undefined,
    ceilingHeight: p.ceilingHeight ?? undefined,
    isNonStandard: p.isNonStandard,
    occupancy: p.occupancy ?? undefined,
    heating: p.heating ?? undefined,
    hotWater: p.hotWater ?? undefined,
    parking: p.parking ?? undefined,
    balconyArea: p.balconyArea ?? undefined,
    hasConditioner: p.hasConditioner,
    hasFurniture: p.hasFurniture,
    hasBed: p.hasBed,
    hasSofa: p.hasSofa,
    hasTable: p.hasTable,
    hasChairs: p.hasChairs,
    hasStove: p.hasStove,
    hasRefrigerator: p.hasRefrigerator,
    hasOven: p.hasOven,
    hasWashingMachine: p.hasWashingMachine,
    hasKitchenAppliances: p.hasKitchenAppliances,
    hasBalcony: p.hasBalcony,
    hasNaturalGas: p.hasNaturalGas,
    hasInternet: p.hasInternet,
    hasTV: p.hasTV,
    hasSewerage: p.hasSewerage,
    isFenced: p.isFenced,
    hasYardLighting: p.hasYardLighting,
    hasGrill: p.hasGrill,
    hasAlarm: p.hasAlarm,
    hasVentilation: p.hasVentilation,
    hasWater: p.hasWater,
    hasElectricity: p.hasElectricity,
    hasGate: p.hasGate,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface EditPropertyPageProps {
  params: { id: string };
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const router = useRouter();
  const { data: property, isLoading } = usePropertyAdmin(params.id);
  const updateProperty = useUpdateProperty();

  const [tab, setTab] = useState<Tab>("details");
  const [formData, setFormData] = useState<UpdatePropertyDto>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (property) {
      setFormData(propertyToFormData(property));
      setHasChanges(false);
    }
  }, [property]);

  const updateField = <K extends keyof UpdatePropertyDto>(
    field: K,
    value: UpdatePropertyDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getCoords = () => {
    if (!formData.location) return null;
    const [lat, lng] = formData.location.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  const handleLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
  }) => {
    updateField(
      "location",
      `${location.coordinates[1]},${location.coordinates[0]}`,
    );
    updateField("address", location.address);
    setShowMap(false);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await updateProperty.mutateAsync({ id: params.id, data: formData });
      setHasChanges(false);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          err.message ??
          "Failed to update property",
      );
    }
  };

  const coords = getCoords();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </button>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Property
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {property.translation?.title ??
                    property.address ??
                    `#${property.externalId}`}
                </p>
              </div>
              {hasChanges && tab === "details" && (
                <Button
                  onClick={handleSubmit}
                  disabled={updateProperty.isPending}
                  className="bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProperty.isPending ? "Saving…" : "Save Changes"}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* ── Details tab ── */}
            {tab === "details" && (
              <div className="space-y-8">
                {/* Basic */}
                <Section title="Basic Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldSelect
                      label="Property Type"
                      value={formData.propertyType ?? ""}
                      onValueChange={(v) =>
                        updateField("propertyType", v as PropertyType)
                      }
                      options={PROPERTY_TYPES}
                    />
                    <FieldSelect
                      label="Deal Type"
                      value={formData.dealType ?? ""}
                      onValueChange={(v) =>
                        updateField("dealType", v as DealType)
                      }
                      options={DEAL_TYPES}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldInput
                      label="Price (USD)"
                      type="number"
                      value={formData.price ?? ""}
                      onChange={(e) =>
                        updateField(
                          "price",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="150000"
                    />
                    <FieldInput
                      label="Contact Phone"
                      type="tel"
                      value={formData.contactPhone ?? ""}
                      onChange={(e) =>
                        updateField("contactPhone", e.target.value || undefined)
                      }
                      placeholder="Leave empty to use default"
                    />
                  </div>

                  <div className="flex gap-6 pt-2">
                    <ToggleChip
                      icon={<Flame className="w-4 h-4" />}
                      label="Hot Sale"
                      active={formData.hotSale === true}
                      activeClass="bg-red-50 border-red-300 text-red-600"
                      onChange={(v) => updateField("hotSale", v)}
                    />
                    <ToggleChip
                      icon={
                        formData.public ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )
                      }
                      label={formData.public ? "Public" : "Private"}
                      active={formData.public === true}
                      activeClass="bg-green-50 border-green-300 text-green-600"
                      onChange={(v) => updateField("public", v)}
                    />
                  </div>
                </Section>

                {/* Location */}
                <Section title="Location">
                  <FieldSelect
                    label="Region"
                    value={formData.region ?? ""}
                    onValueChange={(v) => updateField("region", v as Region)}
                    options={Object.entries(REGION_NAMES).map(
                      ([value, label]) => ({
                        value,
                        label,
                      }),
                    )}
                    placeholder="Select a region"
                  />

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Address &amp; Coordinates
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={formData.address ?? ""}
                        placeholder="Pick a location on the map"
                        className="bg-gray-50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMap(true)}
                        className="shrink-0"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Pick
                      </Button>
                    </div>
                    {coords && (
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                        <p className="text-xs font-mono text-blue-700">
                          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                        </p>
                        <button
                          onClick={() => {
                            updateField("location", undefined);
                            updateField("address", undefined);
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </Section>

                {/* Property details */}
                <Section title="Property Details">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        field: "totalArea" as const,
                        label: "Area (m²)",
                        placeholder: "120",
                      },
                      {
                        field: "rooms" as const,
                        label: "Rooms",
                        placeholder: "3",
                      },
                      {
                        field: "bedrooms" as const,
                        label: "Bedrooms",
                        placeholder: "2",
                      },
                      {
                        field: "bathrooms" as const,
                        label: "Bathrooms",
                        placeholder: "1",
                      },
                      {
                        field: "floors" as const,
                        label: "Floor",
                        placeholder: "5",
                      },
                      {
                        field: "floorsTotal" as const,
                        label: "Total Floors",
                        placeholder: "10",
                      },
                      {
                        field: "ceilingHeight" as const,
                        label: "Ceiling (m)",
                        placeholder: "3.0",
                        step: "0.1",
                      },
                      {
                        field: "balconyArea" as const,
                        label: "Balcony (m²)",
                        placeholder: "10",
                        step: "0.1",
                      },
                    ].map(({ field, label, placeholder, step }) => (
                      <FieldInput
                        key={field}
                        label={label}
                        type="number"
                        step={step}
                        value={formData[field] ?? ""}
                        onChange={(e) =>
                          updateField(
                            field,
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        placeholder={placeholder}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FieldSelect
                      label="Heating"
                      value={formData.heating ?? ""}
                      onValueChange={(v) =>
                        updateField("heating", v as HeatingType)
                      }
                      options={HEATING_TYPES}
                      placeholder="Select"
                    />
                    <FieldSelect
                      label="Hot Water"
                      value={formData.hotWater ?? ""}
                      onValueChange={(v) =>
                        updateField("hotWater", v as HotWaterType)
                      }
                      options={HOT_WATER_TYPES}
                      placeholder="Select"
                    />
                    <FieldSelect
                      label="Parking"
                      value={formData.parking ?? ""}
                      onValueChange={(v) =>
                        updateField("parking", v as ParkingType)
                      }
                      options={PARKING_TYPES}
                      placeholder="Select"
                    />
                  </div>

                  <FieldSelect
                    label="Max Occupancy"
                    value={formData.occupancy ?? ""}
                    onValueChange={(v) =>
                      updateField("occupancy", v as Occupancy)
                    }
                    options={OCCUPANCY_OPTIONS}
                    placeholder="Select occupancy"
                  />
                </Section>

                {/* Amenities */}
                <Section title="Amenities">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AMENITIES.map(({ key, label }) => {
                      const checked = (formData[key] as boolean) === true;
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? "bg-blue-50 border-blue-300 text-blue-900"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) =>
                              updateField(key, c === true)
                            }
                            className="shrink-0"
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </Section>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Footer actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    onClick={handleSubmit}
                    disabled={updateProperty.isPending || !hasChanges}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProperty.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* ── Images tab ── */}
            {tab === "images" && (
              <PropertyImagesManager
                propertyId={params.id}
                onSuccess={() => {}}
              />
            )}

            {/* ── Translations tab ── */}
            {tab === "translations" && (
              <PropertyTranslationsManager propertyId={params.id} />
            )}
          </div>
        </div>
      </div>

      {showMap && (
        <PropertyLocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
          initialLocation={coords ?? null}
        />
      )}
    </>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        {...props}
        className={error ? "border-red-400 focus-visible:ring-red-400" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function FieldSelect({
  label,
  options,
  placeholder,
  value,
  onValueChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleChip({
  icon,
  label,
  active,
  activeClass,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeClass: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
        active
          ? activeClass
          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

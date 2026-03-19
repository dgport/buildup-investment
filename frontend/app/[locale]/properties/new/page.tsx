"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Save,
  Trash2,
  MapPin,
  GripVertical,
  ArrowLeft,
  Building2,
  Flame,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { useCreateProperty } from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  type CreatePropertyDto,
} from "@/lib/types/properties";

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM: CreatePropertyDto = {
  propertyType: PropertyType.APARTMENT,
  dealType: DealType.SALE,
  title: "",
  hotSale: false,
  public: true,
  isNonStandard: false,
};

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

const AMENITIES: { key: keyof CreatePropertyDto; label: string }[] = [
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

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Location" },
  { id: 3, label: "Details" },
  { id: 4, label: "Amenities" },
  { id: 5, label: "Photos" },
];

// ─── Page component ───────────────────────────────────────────────────────────

export default function CreatePropertyPage() {
  const router = useRouter();
  const createProperty = useCreateProperty();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreatePropertyDto>(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMap, setShowMap] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateField = <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Image handlers ──────────────────────────────────────────────────────────

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    const [movedFile] = newFiles.splice(draggedIndex, 1);
    const [movedPreview] = newPreviews.splice(draggedIndex, 1);

    newFiles.splice(targetIndex, 0, movedFile);
    newPreviews.splice(targetIndex, 0, movedPreview);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  // ── Location handlers ───────────────────────────────────────────────────────

  const handleLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      location: `${location.coordinates[1]},${location.coordinates[0]}`,
      address: location.address,
    }));
    setShowMap(false);
  };

  const getCoords = () => {
    if (!formData.location) return null;
    const [lat, lng] = formData.location.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!formData.propertyType) newErrors.propertyType = "Required";
      if (!formData.dealType) newErrors.dealType = "Required";
      if (!formData.title?.trim()) newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push("/dashboard");
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => {
        if (v === null || v === undefined) return false;
        if (typeof v === "string") return v.trim() !== "";
        return true;
      }),
    ) as CreatePropertyDto;

    try {
      await createProperty.mutateAsync({
        data: cleanedData,
        images: imageFiles.length > 0 ? imageFiles : undefined,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setErrors({
        submit:
          err.response?.data?.message ??
          err.message ??
          "Failed to create property",
      });
    }
  };

  const coords = getCoords();
  const isLastStep = step === STEPS.length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {step > 1 ? "Previous step" : "Back to dashboard"}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 rounded-xl p-2.5">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  New Property
                </h1>
                <p className="text-sm text-gray-500">
                  Step {step} of {STEPS.length} — {STEPS[step - 1].label}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        s.id <= step ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        s.id === step ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-300 shrink-0 mb-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* ── Step 1: Basics ── */}
            {step === 1 && (
              <div className="space-y-6">
                <SectionTitle>Basic Information</SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldSelect
                    label="Property Type"
                    required
                    value={formData.propertyType}
                    onValueChange={(v) =>
                      updateField("propertyType", v as PropertyType)
                    }
                    options={PROPERTY_TYPES}
                    error={errors.propertyType}
                  />
                  <FieldSelect
                    label="Deal Type"
                    required
                    value={formData.dealType}
                    onValueChange={(v) =>
                      updateField("dealType", v as DealType)
                    }
                    options={DEAL_TYPES}
                    error={errors.dealType}
                  />
                </div>

                <FieldInput
                  label="Title (English)"
                  required
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Luxury Apartment in Old Batumi"
                  error={errors.title}
                />

                <FieldTextarea
                  label="Description (English)"
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    updateField("description", e.target.value || undefined)
                  }
                  placeholder="Describe the property..."
                  rows={4}
                />

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
                  placeholder="e.g. 150000"
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
              </div>
            )}

            {/* ── Step 2: Location ── */}
            {step === 2 && (
              <div className="space-y-6">
                <SectionTitle>Location Details</SectionTitle>

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

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Street Address &amp; Pin
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
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mt-2">
                      <p className="text-xs font-mono text-blue-700">
                        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                      </p>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            location: "",
                            address: "",
                          }))
                        }
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Details ── */}
            {step === 3 && (
              <div className="space-y-6">
                <SectionTitle>Property Details</SectionTitle>

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
                  ].map(({ field, label, placeholder, step: s }) => (
                    <FieldInput
                      key={field}
                      label={label}
                      type="number"
                      step={s}
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
              </div>
            )}

            {/* ── Step 4: Amenities ── */}
            {step === 4 && (
              <div className="space-y-6">
                <SectionTitle>Amenities</SectionTitle>
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
                          onCheckedChange={(c) => updateField(key, c === true)}
                          className="shrink-0"
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 5: Photos ── */}
            {step === 5 && (
              <div className="space-y-6">
                <SectionTitle>Property Photos</SectionTitle>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <Upload className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB · Multiple files allowed
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>

                {imagePreviews.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Drag to reorder · First image is the cover photo
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`relative group rounded-xl overflow-hidden border border-gray-200 cursor-move transition-opacity ${
                            draggedIndex === index ? "opacity-40" : ""
                          }`}
                        >
                          <img
                            src={preview}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-28 object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Cover
                            </span>
                          )}
                          <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <GripVertical className="w-2.5 h-2.5" />
                            {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.submit && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={isLastStep ? handleSubmit : goNext}
                disabled={createProperty.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {createProperty.isPending
                  ? "Creating…"
                  : isLastStep
                    ? "Create Property"
                    : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* {showMap && (
        <ProjectLocationMapPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
          initialLocation={coords ?? null}
        />
      )} */}
    </>
  );
}

// ─── Small shared UI pieces ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100">
      {children}
    </h2>
  );
}

function FieldInput({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        {...props}
        className={`bg-white ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function FieldTextarea({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        {...props}
        className={`bg-white resize-none ${error ? "border-red-400" : ""}`}
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
  required,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger className={`bg-white ${error ? "border-red-400" : ""}`}>
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
      {error && <p className="text-xs text-red-500">{error}</p>}
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

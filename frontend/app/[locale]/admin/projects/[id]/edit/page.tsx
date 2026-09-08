"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, ExternalLink, Home, ImageIcon, LayoutList, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminDevelopers, useAdminProject, useProjectMutations } from "@/lib/hooks/useProjects";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";
import { AdminImageGallery } from "../../../_components/AdminImageGallery";
import { ProjectForm, diffProjectForm, projectToForm, type ProjectFormState } from "../../_components/ProjectForm";
import { UnitTypesManager } from "../../_components/UnitTypesManager";

type Tab = "details" | "images" | "unitTypes";
const TABS: { id: Tab; icon: React.ElementType }[] = [
  { id: "details", icon: Home },
  { id: "images", icon: ImageIcon },
  { id: "unitTypes", icon: LayoutList },
];

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const { data: project, isLoading, error } = useAdminProject(id);
  const { data: developers = [] } = useAdminDevelopers();
  const m = useProjectMutations();

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "details");
  const [original, setOriginal] = useState<ProjectFormState | null>(null);
  const [form, setForm] = useState<ProjectFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) {
      const mapped = projectToForm(project);
      setOriginal(mapped);
      setForm(mapped);
    }
  }, [project]);

  const changes = useMemo(() => (original && form ? diffProjectForm(original, form) : {}), [original, form]);
  const hasChanges = Object.keys(changes).length > 0;

  const onChange = <K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => ({ ...e, [key]: "", ...(String(key).startsWith("title") && { title: "" }) }));
    setSaved(false);
  };

  const save = async () => {
    if (!form) return;
    const next: Record<string, string> = {};
    if (!form.developerId) next.developerId = t("common.required");
    if (![form.titleKa, form.titleEn, form.titleRu].some((v) => v?.trim())) next.title = t("common.titleRequired");
    setErrors(next);
    if (Object.keys(next).length) return;
    setServerError(null);
    try {
      await m.update.mutateAsync({ id, data: changes });
      setSaved(true);
    } catch (e) {
      setServerError(getErrorMessage(e, t("common.saveError")));
    }
  };

  if (isLoading || (!form && !error)) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-800" /></div>;
  }
  if (error || !project || !form) {
    return <p className="text-gray-600">{t("common.loadError")}</p>;
  }

  return (
    <div className="space-y-5">
      <Link href={ROUTES.ADMIN_PROJECTS} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />{t("projects.title")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-teal-950">{t("projects.editTitle")}</h1>
          <p className="text-sm text-gray-500">{project.title ?? project.slug} · /{project.slug}</p>
        </div>
        {project.published && (
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.PROJECT(project.slug)} target="_blank"><ExternalLink className="w-4 h-4 mr-1.5" />{t("common.view")}</Link>
          </Button>
        )}
      </div>

      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {TABS.map(({ id: tabId, icon: Icon }) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${tab === tabId ? "border-teal-800 text-teal-800" : "border-transparent text-gray-500 hover:text-gray-900"}`}
          >
            <Icon className="w-4 h-4" />
            {t(`projects.tabs.${tabId}`)}
            {tabId === "details" && hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            {tabId === "images" && <span className="text-xs text-gray-400">({project.images.length})</span>}
            {tabId === "unitTypes" && <span className="text-xs text-gray-400">({project.unitTypes.length})</span>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {tab === "details" && (
          <>
            <ProjectForm data={form} onChange={onChange} developers={developers} errors={errors} />
            {serverError && <Alert variant="destructive" className="mt-6"><AlertDescription>{serverError}</AlertDescription></Alert>}
            {saved && !hasChanges && (
              <Alert className="mt-6 border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{t("common.saved")}</AlertDescription>
              </Alert>
            )}
            <div className="sticky bottom-4 flex gap-3 mt-8 pt-4 border-t border-gray-100 bg-white/95 backdrop-blur">
              <Button onClick={save} disabled={!hasChanges || m.update.isPending} className="bg-teal-900 hover:bg-teal-800 px-6">
                <Save className="w-4 h-4 mr-2" />{m.update.isPending ? t("common.saving") : t("common.save")}
              </Button>
              <Button variant="outline" disabled={!hasChanges} onClick={() => original && setForm(original)}>{t("common.cancel")}</Button>
            </div>
          </>
        )}

        {tab === "images" && (
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold text-gray-900">{t("projects.images.title")}</h2>
              <p className="text-xs text-gray-500">{t("projects.images.hint")}</p>
            </div>
            <AdminImageGallery
              images={project.images}
              onUpload={(files) => m.addImages.mutateAsync({ id, files })}
              onReorder={(imageIds) => m.reorderImages.mutateAsync({ id, imageIds })}
              onDelete={(imageId) => m.deleteImage.mutateAsync({ id, imageId })}
              emptyLabel={t("projects.images.empty")}
              deleteConfirm={t("projects.images.deleteConfirm")}
              coverLabel="Cover"
            />
          </div>
        )}

        {tab === "unitTypes" && <UnitTypesManager project={project} />}
      </div>
    </div>
  );
}

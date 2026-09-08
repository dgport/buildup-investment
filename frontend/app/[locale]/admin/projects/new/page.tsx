"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminDevelopers, useProjectMutations } from "@/lib/hooks/useProjects";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";
import type { ProjectInput } from "@/lib/types/projects";
import { EMPTY_PROJECT_FORM, ProjectForm, type ProjectFormState } from "../_components/ProjectForm";

export default function NewProjectPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const { data: developers = [] } = useAdminDevelopers();
  const { create } = useProjectMutations();
  const [form, setForm] = useState<ProjectFormState>(EMPTY_PROJECT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const onChange = <K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "", ...(String(key).startsWith("title") && { title: "" }) }));
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!form.developerId) next.developerId = t("common.required");
    if (![form.titleKa, form.titleEn, form.titleRu].some((v) => v?.trim())) next.title = t("common.titleRequired");
    setErrors(next);
    if (Object.keys(next).length) return;

    // Drop empty strings on create – nothing to "clear" yet
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => !(typeof v === "string" && v.trim() === "")),
    ) as ProjectInput;

    setServerError(null);
    try {
      const created = await create.mutateAsync(payload);
      router.push(`${ROUTES.ADMIN_PROJECT_EDIT(created.id)}?tab=images`);
    } catch (e) {
      setServerError(getErrorMessage(e, t("common.saveError")));
    }
  };

  return (
    <div className="space-y-5">
      <Link href={ROUTES.ADMIN_PROJECTS} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />{t("projects.title")}
      </Link>
      <h1 className="text-2xl font-bold text-teal-950">{t("projects.newTitle")}</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <ProjectForm data={form} onChange={onChange} developers={developers} errors={errors} />
        {serverError && (
          <Alert variant="destructive" className="mt-6"><AlertDescription>{serverError}</AlertDescription></Alert>
        )}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
          <Button onClick={submit} disabled={create.isPending} className="bg-teal-900 hover:bg-teal-800 px-6">
            <Save className="w-4 h-4 mr-2" />{create.isPending ? t("common.creating") : t("common.create")}
          </Button>
          <Button variant="outline" asChild><Link href={ROUTES.ADMIN_PROJECTS}>{t("common.cancel")}</Link></Button>
        </div>
      </div>
    </div>
  );
}

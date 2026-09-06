"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  BookOpen,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import {
  provisionSchool,
  ProvisionSchoolPayload,
  DEFAULT_10_PLUS_2_CLASSES,
  DEFAULT_10_PLUS_2_SUBJECTS,
} from "@/lib/services/organization-service";

export default function AddSchoolWizardPage() {
  const router = useRouter();
  const { currentOrganization, profile, refresh } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successResult, setSuccessResult] = React.useState<any>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const orgId = currentOrganization?.id || "";
  const actorId = profile?.id || "";

  // Simplified Form State: 10+2 Institutional Standard with Classes 1 to 12
  const [formData, setFormData] = React.useState<ProvisionSchoolPayload>({
    name: "",
    legalName: "",
    slug: "",
    schoolCode: "",
    schoolType: "10+2 Senior Secondary (Classes 1 to 12)",
    email: "",
    phone: "",
    currency: "INR",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    academicYearName: "2025-2026",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    classes: DEFAULT_10_PLUS_2_CLASSES,
    subjects: DEFAULT_10_PLUS_2_SUBJECTS,
    principalName: "",
    principalEmail: "",
    adminName: "",
    adminEmail: "",
  });

  const updateForm = (fields: Partial<ProvisionSchoolPayload>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setSubmitError("School name and URL slug are strictly required.");
      return;
    }
    if (!orgId) {
      setSubmitError("Organization context required. Please ensure you belong to an organization.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await provisionSchool(orgId, actorId, formData);
      setSuccessResult(created);
      await refresh();
    } catch (err: any) {
      console.error("Error provisioning school:", err);
      setSubmitError(
        err?.message || "An unexpected error occurred while saving the school to the database."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="ORGANIZATION_OWNER"
      userName={profile?.full_name || "Organization Owner"}
      userRoleTitle={currentOrganization?.name ? `Owner • ${currentOrganization.name}` : "Organization Owner"}
      epochText="Multi-School Network • Add New Campus"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Top Header Nav */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <Link
              href="/organization"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3 h-3" /> All Schools
            </Link>
            <span>•</span>
            <Link href="/owner/overview" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Campus Overview
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-600" />
                Add New School Campus
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Standard <strong>10+2 Institutional Setup</strong> (Classes 1 to 12) under{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  {currentOrganization?.name || "King's Educational Trust"}
                </strong>
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium px-3 py-1 text-xs gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> 10+2 Standard (Classes 1–12)
            </Badge>
          </div>
        </div>

        {!successResult ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: School Identity & Location */}
            <Card className="border-stone-200/80 dark:border-stone-800 shadow-xs">
              <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Building2 className="w-4 h-4 text-blue-600" /> 1. School Information &amp; Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      School Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saint Xavier Senior Secondary School"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                        updateForm({
                          name,
                          slug,
                          legalName: name,
                          schoolCode: `SCH-${name.slice(0, 3).toUpperCase()}`,
                        });
                      }}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Campus Code / Short Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SCH-SX"
                      value={formData.schoolCode}
                      onChange={(e) => updateForm({ schoolCode: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi / Pune"
                      value={formData.city}
                      onChange={(e) => updateForm({ city: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="admissions@school.edu.in"
                      value={formData.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Institutional Structure (10+2 Standard, Classes 1 to 12) */}
            <Card className="border-stone-200/80 dark:border-stone-800 shadow-xs">
              <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-serif font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Layers className="w-4 h-4 text-emerald-600" /> 2. Institutional Type &amp; Academic Classes
                  </CardTitle>
                  <Badge variant="neutral" className="text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
                    Auto-Synced with Database
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Institutional Standard
                    </label>
                    <input
                      type="text"
                      disabled
                      value="10+2 Senior Secondary (Classes 1 to 12)"
                      className="w-full h-9 px-3 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={formData.academicYearName}
                      onChange={(e) => updateForm({ academicYearName: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Auto-Provisioned Classes Preview */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Auto-Provisioned Classes (1 to 12) &amp; Sections (A &amp; B)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const grade = i + 1;
                      const stage = grade <= 5 ? "Primary" : grade <= 8 ? "Middle" : grade <= 10 ? "Secondary" : "Sr. Sec";
                      return (
                        <div
                          key={grade}
                          className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">Class {grade}</span>
                            <span className="text-[10px] text-slate-500">{stage} • Sec A, B</span>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Leadership Appointments */}
            <Card className="border-stone-200/80 dark:border-stone-800 shadow-xs">
              <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <CardTitle className="text-base font-serif font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <UserCheck className="w-4 h-4 text-amber-600" /> 3. Principal &amp; School Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Appointed Principal / Head of School
                    </span>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">Principal Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajeshwari Rao"
                        value={formData.principalName}
                        onChange={(e) => updateForm({ principalName: e.target.value })}
                        className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">Principal Official Email</label>
                      <input
                        type="email"
                        placeholder="principal@school.edu.in"
                        value={formData.principalEmail}
                        onChange={(e) => updateForm({ principalEmail: e.target.value })}
                        className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      School Operations Admin (Registrar)
                    </span>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">Admin Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sameer Kapoor"
                        value={formData.adminName}
                        onChange={(e) => updateForm({ adminName: e.target.value })}
                        className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">Admin Official Email</label>
                      <input
                        type="email"
                        placeholder="admin@school.edu.in"
                        value={formData.adminEmail}
                        onChange={(e) => updateForm({ adminEmail: e.target.value })}
                        className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 px-6 py-4">
                <Link href="/organization">
                  <Button variant="outline" size="sm" type="button" className="text-xs">
                    Cancel
                  </Button>
                </Link>

                <Button
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-2 shadow-sm font-medium px-6 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Provisioning School &amp; Classes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Create School (Classes 1–12)
                    </>
                  )}
                </Button>
              </CardFooter>

              {submitError && (
                <div className="mx-6 mb-4 flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div>
                    <p className="font-semibold">School was not saved</p>
                    <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{submitError}</p>
                  </div>
                </div>
              )}
            </Card>
          </form>
        ) : (
          /* SUCCESS CONFIRMATION */
          <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 text-center p-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
              School Successfully Provisioned!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
              <strong>{successResult.name || formData.name}</strong> is active with <strong>Classes 1 to 12</strong> and synced with the database under {currentOrganization?.name}.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <Link href="/organization">
                <Button variant="outline" size="sm" className="text-xs">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/school/overview">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                  Launch School Portal
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

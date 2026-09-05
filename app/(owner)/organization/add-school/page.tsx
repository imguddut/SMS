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
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { provisionSchool, ProvisionSchoolPayload } from "@/lib/services/organization-service";

export default function AddSchoolWizardPage() {
  const router = useRouter();
  const { currentOrganization, profile, refresh } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successResult, setSuccessResult] = React.useState<any>(null);

  const orgId = currentOrganization?.id || "e0000000-0000-0000-0000-000000000001";
  const actorId = profile?.id || "b0000000-0000-0000-0000-000000000002";

  // Form State across the 5 steps
  const [formData, setFormData] = React.useState<ProvisionSchoolPayload>({
    name: "",
    legalName: "",
    slug: "",
    schoolCode: "",
    schoolType: "K-12 Independent Secondary School",
    email: "",
    phone: "",
    currency: "INR",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    academicYearName: "Academic Year 2025–2026",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    classes: [
      { name: "Class 11 - Senior Secondary", gradeLevel: 11, sections: ["11-A", "11-B"] },
      { name: "Class 12 - Senior Secondary", gradeLevel: 12, sections: ["12-A", "12-B"] },
    ],
    subjects: ["Physics", "Chemistry", "Mathematics", "Computer Science", "English Core"],
    principalName: "",
    principalEmail: "",
    adminName: "",
    adminEmail: "",
  });

  const updateForm = (fields: Partial<ProvisionSchoolPayload>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await provisionSchool(orgId, actorId, formData);
      setSuccessResult(created);
      await refresh();
    } catch (err) {
      console.error("Error provisioning school:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="ORGANIZATION_OWNER"
      userName="Julian Vance-Moreau, D.Phil"
      userRoleTitle="Chancellor & Trust Chairman"
      epochText="Multi-School Provisioning Wizard • Transactional Enclave"
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/organization" className="text-xs text-amber-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Organization Dashboard
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Provision New School Campus
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Setting up a new operational school tenant under{" "}
            <strong>{currentOrganization?.name || "King's Educational Trust"}</strong>.
          </p>
        </div>

        {/* 5-Step Progress Stepper */}
        <div className="grid grid-cols-5 gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
          {[
            { step: 1, title: "Identity", icon: Building2 },
            { step: 2, title: "Location", icon: MapPin },
            { step: 3, title: "Academics", icon: BookOpen },
            { step: 4, title: "Leadership", icon: UserCheck },
            { step: 5, title: "Review", icon: CheckCircle2 },
          ].map(({ step, title, icon: Icon }) => (
            <div
              key={step}
              className={`flex flex-col items-center text-center p-2 rounded-lg transition-all ${
                currentStep === step
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold"
                  : currentStep > step
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-stone-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold ${
                  currentStep === step
                    ? "bg-amber-600 text-white shadow-xs"
                    : currentStep > step
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                }`}
              >
                {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className="text-xs">{title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Card Content */}
        {!successResult ? (
          <Card className="border-stone-200/80 dark:border-stone-800 shadow-sm">
            <CardContent className="p-6">
              {/* STEP 1: School Identity */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold">Step 1: School Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        School Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. King's Valley International School"
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                          updateForm({ name, slug, legalName: name });
                        }}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        Campus Slug / Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. kings-valley"
                        value={formData.slug}
                        onChange={(e) => updateForm({ slug: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        School Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KVIS-03"
                        value={formData.schoolCode}
                        onChange={(e) => updateForm({ schoolCode: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        Institution Type
                      </label>
                      <select
                        value={formData.schoolType}
                        onChange={(e) => updateForm({ schoolType: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      >
                        <option value="K-12 Independent Secondary School">K-12 Independent Secondary School</option>
                        <option value="CBSE Senior Secondary">CBSE Senior Secondary (10+2)</option>
                        <option value="Cambridge International School">Cambridge International / IGCSE</option>
                        <option value="International Baccalaureate World School">IB World School</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        Official Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="admissions@school.edu"
                        value={formData.email}
                        onChange={(e) => updateForm({ email: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        Base Operating Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => updateForm({ currency: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      >
                        <option value="INR">INR (₹ - Indian Rupee)</option>
                        <option value="CHF">CHF (Swiss Franc)</option>
                        <option value="USD">USD ($ - US Dollar)</option>
                        <option value="GBP">GBP (£ - British Pound)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold">Step 2: Campus Location & Address</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                        Campus Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="Plot 14, Institutional Area, Sector 62"
                        value={formData.address}
                        onChange={(e) => updateForm({ address: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">City</label>
                        <input
                          type="text"
                          placeholder="e.g. Noida / New Delhi"
                          value={formData.city}
                          onChange={(e) => updateForm({ city: e.target.value })}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">State / Province</label>
                        <input
                          type="text"
                          placeholder="e.g. Uttar Pradesh"
                          value={formData.state}
                          onChange={(e) => updateForm({ state: e.target.value })}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => updateForm({ country: e.target.value })}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">PIN / Postal Code</label>
                        <input
                          type="text"
                          placeholder="201309"
                          value={formData.postalCode}
                          onChange={(e) => updateForm({ postalCode: e.target.value })}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Academic Configuration */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold">Step 3: Academic Calendar & Classes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={formData.academicYearName}
                        onChange={(e) => updateForm({ academicYearName: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => updateForm({ startDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateForm({ endDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      Pre-Configured Class Cohorts
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.classes?.map((cls, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                          <span className="font-semibold text-xs block">{cls.name}</span>
                          <span className="text-[11px] text-stone-500">
                            Sections: {cls.sections.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Leadership Appointments */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold">Step 4: School Leadership & Administration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold">Appointed Principal / Head of School</span>
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-600 block mb-1">Principal Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Rajeshwari Rao"
                          value={formData.principalName}
                          onChange={(e) => updateForm({ principalName: e.target.value })}
                          className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-600 block mb-1">Principal Official Email</label>
                        <input
                          type="email"
                          placeholder="principal.valley@kingscollege.edu"
                          value={formData.principalEmail}
                          onChange={(e) => updateForm({ principalEmail: e.target.value })}
                          className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold">School Operations Admin (Registrar)</span>
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-600 block mb-1">Admin Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sameer Kapoor"
                          value={formData.adminName}
                          onChange={(e) => updateForm({ adminName: e.target.value })}
                          className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-600 block mb-1">Admin Official Email</label>
                        <input
                          type="email"
                          placeholder="admin.valley@kingscollege.edu"
                          value={formData.adminEmail}
                          onChange={(e) => updateForm({ adminEmail: e.target.value })}
                          className="w-full h-8 px-3 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Commit */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold">Step 5: Review Provisioning Specifications</h3>
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold">Ready for Transactional Execution</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 block">School Name</span>
                        <strong className="text-stone-900 dark:text-stone-100">{formData.name || "Untitled"}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Campus Code</span>
                        <strong className="text-stone-900 dark:text-stone-100">{formData.schoolCode || "Auto"}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Location</span>
                        <strong className="text-stone-900 dark:text-stone-100">{formData.city || "Not Set"}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Currency</span>
                        <strong className="text-stone-900 dark:text-stone-100">{formData.currency}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500">
                    Executing provisioning will atomically create the school tenant record, configure default academic years,
                    classes, sections, core curriculum subjects, and issue operational permissions to appointed leadership.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="text-xs gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={!formData.name && currentStep === 1}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning Campus...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Commit & Provision Campus
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          /* SUCCESS CONFIRMATION */
          <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 text-center p-8">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Campus Successfully Provisioned!
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
              <strong>{successResult.name || formData.name}</strong> is now an active operational school under{" "}
              {currentOrganization?.name}.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <Link href="/organization">
                <Button variant="outline" size="sm" className="text-xs">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/school/overview">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
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

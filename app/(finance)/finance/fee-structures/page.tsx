"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatIndianCurrency } from "@/lib/utils";
import {
  fetchFeeStructures,
  createFeeStructure,
  FeeStructureItem,
} from "@/lib/db/finance";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { FinanceQuoteBanner } from "@/components/ui/finance-quote-banner";
import {
  Layers,
  Plus,
  CheckCircle2,
  Building2,
  Receipt,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Download,
  GraduationCap,
  Users,
  Baby,
  BookOpen,
  FlaskConical,
  Trophy,
  Laptop,
  Activity,
  BarChart3,
} from "lucide-react";

export default function FeeStructuresPage() {
  const [feeStructures, setFeeStructures] = React.useState<FeeStructureItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: PDFStudentMetadata;
  } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    tierCategory: "SENIOR_BOARDING" as "SENIOR_BOARDING" | "JUNIOR_BOARDING" | "DAY_SCHOOL" | "SURCHARGE",
    formTarget: "",
    annualFee: 145000,
    termFee: 36250,
    currency: "INR",
    component1Name: "Academic Tuition & Advanced Science Labs",
    component1Amount: 95000,
    component2Name: "Smart Classroom, STEM & AI Lab Access",
    component2Amount: 30000,
    component3Name: "Sports, Co-Curricular & Examination Charges",
    component3Amount: 20000,
  });

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFeeStructures();
        setFeeStructures(data);
      } catch (err) {
        console.error("Failed to load fee structures", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStructures = feeStructures.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formTarget.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" ||
      (selectedCategory === "SENIOR_11_12" && item.formTarget.includes("12") || item.formTarget.includes("11") || item.tierCategory === "SENIOR_BOARDING") ||
      (selectedCategory === "SECONDARY_9_10" && item.formTarget.includes("9") || item.formTarget.includes("10") || item.tierCategory === "JUNIOR_BOARDING") ||
      (selectedCategory === "MIDDLE_6_8" && item.formTarget.includes("1") || item.formTarget.includes("6") || item.tierCategory === "DAY_SCHOOL");
    return matchesSearch && matchesCat;
  });

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTier: FeeStructureItem = {
        id: `fee-${Date.now()}`,
        name: formData.name,
        tierCategory: formData.tierCategory,
        formTarget: formData.formTarget,
        annualFee: Number(formData.annualFee),
        termFee: Number(formData.termFee),
        currency: "INR",
        tuitionComponents: [
          { name: formData.component1Name, amount: Number(formData.component1Amount) },
          { name: formData.component2Name, amount: Number(formData.component2Amount) },
          { name: formData.component3Name, amount: Number(formData.component3Amount) },
        ],
        activeScholarsCount: 0,
      };

      await createFeeStructure(newTier);
      setFeeStructures([newTier, ...feeStructures]);
      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setFormData({
          name: "",
          tierCategory: "SENIOR_BOARDING",
          formTarget: "",
          annualFee: 145000,
          termFee: 36250,
          currency: "INR",
          component1Name: "Academic Tuition & Advanced Science Labs",
          component1Amount: 95000,
          component2Name: "Smart Classroom, STEM & AI Lab Access",
          component2Amount: 30000,
          component3Name: "Sports, Co-Curricular & Examination Charges",
          component3Amount: 20000,
        });
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportFeeSchedule = (tier?: FeeStructureItem) => {
    let content = "";
    if (tier) {
      const components = tier.tuitionComponents
        .map((c) => `  - ${c.name}: ₹ ${c.amount.toLocaleString("en-IN")}`)
        .join("\n");

      content = `DELHI PUBLIC SCHOOL, R.K. PURAM • OFFICIAL TUITION & FEE SCHEDULE
=============================================================
Tier Schedule Name: ${tier.name}
Target Classification: ${tier.formTarget}
Academic Session: 2024–2025 (CBSE Curriculum)
Enrolled Scholars in Tier: ${tier.activeScholarsCount} Students

ANNUAL & TERM PRICING:
-------------------------------------------------------------
Annual Comprehensive Fee: ₹ ${tier.annualFee.toLocaleString("en-IN")}
Quarterly Term Installment: ₹ ${tier.termFee.toLocaleString("en-IN")} (4 Installments / Annum)

ITEMIZED TUITION COMPONENTS:
-------------------------------------------------------------
${components}

PAYMENT RULES & COMPLIANCE:
1. Fees are payable quarterly in advance before the 10th of the starting month.
2. Digital payments via BHIM UPI (dpsrkpuram.fees@sbi) or Net Banking Challan.
3. Merit scholarships and RTE waivers apply as per school governing council rules.

Authorized by: Accounts Officer & Bursar • Delhi Public School, R.K. Puram
Affiliated to CBSE, New Delhi • Affiliation No: 2730017`;
    } else {
      const tiersSummary = feeStructures
        .map(
          (t) =>
            `• ${t.name} (${t.formTarget})\n  Annual Fee: ₹ ${t.annualFee.toLocaleString("en-IN")} | Term Fee: ₹ ${t.termFee.toLocaleString("en-IN")}\n  Components:\n${t.tuitionComponents.map((c) => `    - ${c.name}: ₹ ${c.amount.toLocaleString("en-IN")}`).join("\n")}`
        )
        .join("\n\n");

      content = `DELHI PUBLIC SCHOOL, R.K. PURAM • COMPREHENSIVE ANNUAL FEE SCHEDULE
=============================================================
Academic Session: 2024–2025 (Classes 1 to 12 CBSE Board)
Governing Council Approved: Yes • Effective from 1st April 2024

FEE TIERS & STRUCTURES:
-------------------------------------------------------------
${tiersSummary}

Accounts Office • Treasury & Receivables Division
Delhi Public School, R.K. Puram, New Delhi • Managed via Agragati School OS`;
    }

    setPreviewDoc({
      isOpen: true,
      title: tier ? `Fee Schedule - ${tier.formTarget}` : "Annual School Fee Schedule 2024-2025",
      fileName: tier
        ? `Fee_Schedule_${tier.formTarget.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
        : "Annual_School_Fee_Schedule_2024_2025.pdf",
      content,
      studentMeta: {
        name: "School Accounts Bureau",
        form: tier ? tier.formTarget : "All Form Levels",
        institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
        institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017 • School Code: 85214",
        institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022",
        academicSession: "2024–2025",
      },
    });
  };

  const getTierIcon = (cat: string, name: string) => {
    if (name.includes("Class 12")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-400 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
      );
    }
    if (name.includes("Class 11")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
      );
    }
    if (cat === "JUNIOR_BOARDING" || name.includes("Secondary")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 flex items-center justify-center shrink-0">
        <Baby className="w-6 h-6" />
      </div>
    );
  };

  const getBadgeStyle = (cat: string, name: string) => {
    if (name.includes("Class 12")) {
      return "bg-[#FFFBEB] text-[#B45309] dark:bg-amber-950 dark:text-amber-300";
    }
    if (name.includes("Class 11")) {
      return "bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950 dark:text-blue-300";
    }
    if (cat === "JUNIOR_BOARDING") {
      return "bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950 dark:text-emerald-300";
    }
    return "bg-[#FFF1F2] text-[#E11D48] dark:bg-rose-950 dark:text-rose-300";
  };

  return (
    <AppShell
      role="ACCOUNTANT"
      userName="Mr. Suresh Menon"
      userRoleTitle="Accounts Officer & Bursar"
      epochText="Term 2 (CBSE) • Academic Year 2024–2025"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-bold text-[#A36829] uppercase tracking-wider">
                TUITION MATRICES &amp; SCHEDULES
              </span>
              <span className="text-slate-300 dark:text-stone-700 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                {feeStructures.length} Active Fee Schedules
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Fee Structures &amp; Tiers
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Configure canonical CBSE/ICSE composite tuition, STEM laboratory levies, sports development, and transport tariffs for the 2024–2025 academic session.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#A36829] hover:bg-[#8C531B] text-white gap-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Define Fee Structure
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search fee tier or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 text-xs text-[#0F172A] dark:text-stone-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Wings" },
              { id: "SENIOR_11_12", label: "Senior Secondary (11–12)" },
              { id: "SECONDARY_9_10", label: "Secondary (9–10)" },
              { id: "MIDDLE_6_8", label: "Middle Wing (6–8)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-[#A36829] text-white shadow-xs"
                    : "bg-white dark:bg-[#12161f] text-slate-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fee Structures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStructures.map((fee) => (
            <div
              key={fee.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs hover:border-[#A36829]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    {getTierIcon(fee.tierCategory, fee.name)}
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mb-1.5 ${getBadgeStyle(
                          fee.tierCategory,
                          fee.name
                        )}`}
                      >
                        {fee.tierCategory.replace("_", " ")}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl font-bold text-[#0F172A] dark:text-stone-100 leading-snug">
                        {fee.name}
                      </h3>
                      <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                        Target Class: <span className="font-semibold text-slate-700 dark:text-stone-300">{fee.formTarget}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-stone-100 block">
                      {formatIndianCurrency(fee.termFee)}
                    </span>
                    <span className="font-sans text-[11px] text-slate-400">per Term</span>
                    <span className="font-sans text-[10px] text-slate-500 block font-medium mt-0.5">
                      ({formatIndianCurrency(fee.annualFee)} / Annum)
                    </span>
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-stone-800 space-y-2.5">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    TUITION &amp; LEVY COMPONENTS
                  </span>
                  {fee.tuitionComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs font-sans py-1.5 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26]"
                    >
                      <span className="text-slate-600 dark:text-stone-300 flex items-center gap-2">
                        {idx === 0 ? (
                          <BookOpen className="w-3.5 h-3.5 text-[#B45309]" />
                        ) : idx === 1 ? (
                          <FlaskConical className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <Trophy className="w-3.5 h-3.5 text-[#059669]" />
                        )}
                        {comp.name}
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-stone-100 font-mono">
                        {formatIndianCurrency(comp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-sans text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A36829]" />
                  <strong className="text-[#0F172A] dark:text-stone-100">{fee.activeScholarsCount}</strong> Enrolled Students
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportFeeSchedule(fee)}
                    className="text-xs font-semibold h-8 rounded-xl text-slate-700 dark:text-stone-300 hover:bg-slate-100 border-slate-200 dark:border-stone-700"
                  >
                    Schedule PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold h-8 rounded-xl text-[#A36829] hover:bg-[#A36829]/10 border-[#A36829]/30 gap-1"
                  >
                    Edit Matrix
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Define Fee Structure Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Define Canonical Fee Schedule"
          description="Establish a new tuition and composite fee tier for the academic calendar."
          maxWidth="lg"
        >
          {formSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Fee Schedule Established</h3>
              <p className="font-sans text-xs text-slate-500">
                The fee structure has been written to the institutional ledger and is ready for billing cycles.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateFeeStructure} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                  Schedule Title
                </label>
                <Input
                  required
                  placeholder="e.g. Class 12 Senior Secondary (CBSE Science & AI Stream)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Tier Category
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-xs font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
                    value={formData.tierCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tierCategory: e.target.value as any,
                      })
                    }
                  >
                    <option value="SENIOR_BOARDING">Senior Secondary (Classes 11 &amp; 12)</option>
                    <option value="JUNIOR_BOARDING">Secondary Wing (Classes 9 &amp; 10)</option>
                    <option value="DAY_SCHOOL">Middle Wing (Classes 6 to 8)</option>
                    <option value="SURCHARGE">STEM Robotics &amp; Transport Surcharge</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Target Class / Section
                  </label>
                  <Input
                    required
                    placeholder="e.g. Class 12 (Science)"
                    value={formData.formTarget}
                    onChange={(e) => setFormData({ ...formData, formTarget: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Annual Fee (₹)
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.annualFee}
                    onChange={(e) => setFormData({ ...formData, annualFee: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Term Fee (₹)
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.termFee}
                    onChange={(e) => setFormData({ ...formData, termFee: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Component breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Tuition Component Breakdown (Annum)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      placeholder="Component 1 Name"
                      value={formData.component1Name}
                      onChange={(e) => setFormData({ ...formData, component1Name: e.target.value })}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={formData.component1Amount}
                      onChange={(e) => setFormData({ ...formData, component1Amount: Number(e.target.value) })}
                      className="text-xs bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      placeholder="Component 2 Name"
                      value={formData.component2Name}
                      onChange={(e) => setFormData({ ...formData, component2Name: e.target.value })}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={formData.component2Amount}
                      onChange={(e) => setFormData({ ...formData, component2Amount: Number(e.target.value) })}
                      className="text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#A36829] hover:bg-[#8C531B] text-white text-xs font-semibold"
                >
                  {isSubmitting ? "Committing..." : "Authorize Fee Structure"}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Bottom Banner */}
        <FinanceQuoteBanner
          icon={<BarChart3 className="w-6 h-6 text-[#A36829]" />}
          iconBgClass="bg-[#FDF6EC] text-[#A36829]"
          title="Well-Structured Fees. A Stronger Tomorrow."
          subtitle="Enabling quality education with transparent and efficient financial management."
          quote="Investing in education today builds brighter futures."
        />

        {previewDoc && (
          <PdfPreviewModal
            isOpen={previewDoc.isOpen}
            onClose={() => setPreviewDoc(null)}
            title={previewDoc.title}
            fileName={previewDoc.fileName}
            content={previewDoc.content}
            studentMeta={previewDoc.studentMeta}
          />
        )}
      </div>
    </AppShell>
  );
}

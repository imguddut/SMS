"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatIndianCurrency } from "@/lib/utils";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { FinanceQuoteBanner } from "@/components/ui/finance-quote-banner";
import {
  BarChart3,
  Download,
  Calendar,
  ShieldCheck,
  Building2,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Settings,
  Award,
  Hourglass,
  Receipt,
  FileText,
  Users,
} from "lucide-react";

export default function FinancialReportsPage() {
  const [selectedTab, setSelectedTab] = React.useState("ALL");
  const [isGeneratingModal, setIsGeneratingModal] = React.useState(false);
  const [generationSuccess, setGenerationSuccess] = React.useState(false);
  const [customReportConfig, setCustomReportConfig] = React.useState({
    title: "GST Realization & Form 10B Compliance Dossier",
    dateRange: "2024-04-01 to 2025-03-31",
    includeAuditorNotes: true,
  });

  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: PDFStudentMetadata;
  } | null>(null);

  const reports = [
    {
      id: "rep-01",
      category: "FEE_STATEMENTS",
      badgeType: "STATEMENT",
      title: "Quarterly Fee Realization & Collection Velocity Statement",
      subtitle: "Term 2 (Oct – Dec 2024)",
      generatedTime: "Today, 05:00 IST",
      format: "PDF • 2.8 MB",
      badgeClass: "bg-[#EFF6FF] text-[#2563EB]",
      iconBg: "bg-[#EFF6FF] text-[#2563EB]",
      btnBg: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white",
      sideIllustrationType: "velocity",
      sideDesc: "Shows fee collection progress and trends",
      getContent: () => `DELHI PUBLIC SCHOOL, R.K. PURAM • FEE REALIZATION STATEMENT
=============================================================
Report Period: Term 2 (Oct 2024 - Dec 2024)
Generated: Today, 05:00 IST • Principal e-Signed & Sealed
Session: 2024–2025 (CBSE Board)

EXECUTIVE COLLECTION VELOCITY:
-------------------------------------------------------------
Total Invoiced Quota:           ₹ 4,85,00,000.00
Realized Bank Receipts:         ₹ 4,58,81,000.00 (94.6% Velocity)
Pending Within 30-Day Terms:    ₹   18,24,000.00
Overdue Arrears:                ₹    7,95,000.00

WING REALIZATION BREAKDOWN:
-------------------------------------------------------------
1. Senior Secondary (Classes 11 & 12): ₹ 2,48,00,000 (97.2%)
2. Secondary Wing (Classes 9 & 10):    ₹ 1,34,00,000 (93.8%)
3. Middle Wing (Classes 6 to 8):       ₹   76,81,000 (91.4%)

Verified by: Principal & Bursar • Delhi Public School, R.K. Puram
Managed via Agragati School OS`,
    },
    {
      id: "rep-02",
      category: "TRIAL_BALANCE",
      badgeType: "AUDIT",
      title: "Annual School Trial Balance & Bank Reconciliation Statement",
      subtitle: "FY 2024–2025 (Year-to-Date)",
      generatedTime: "Yesterday, 18:30 IST",
      format: "CSV • 1.4 MB",
      badgeClass: "bg-[#ECFDF5] text-[#059669]",
      iconBg: "bg-[#ECFDF5] text-[#059669]",
      btnBg: "bg-[#059669] hover:bg-[#047857] text-white",
      sideIllustrationType: "bank",
      sideDesc: "Complete financial position of the school",
      getContent: () => `DELHI PUBLIC SCHOOL, R.K. PURAM • ANNUAL TRIAL BALANCE
=============================================================
Financial Year: 2024–2025 (Year-to-Date)
Standard: Ind AS / CBSE Institutional Accounting Guidelines

ACCOUNT HEAD                    DEBIT (₹)          CREDIT (₹)
-------------------------------------------------------------
Tuition & Academic Fees         -                  4,58,81,000.00
SBI Treasury Account            4,12,00,000.00     -
HDFC Bank Clearing A/C            46,81,000.00     -
Academic Salaries & Wages       2,84,00,000.00     -
STEM Lab & Robotics Supplies      38,50,000.00     -
Campus Utilities & Maintenance    24,10,000.00     -
Audited Balance Clearance       -                  -
-------------------------------------------------------------
TOTAL BALANCED GENERAL LEDGER:  ₹ 4,58,81,000.00   ₹ 4,58,81,000.00

Signatory: External Statutory Auditor & Bursar • DPS R.K. Puram`,
    },
    {
      id: "rep-03",
      category: "AGED_DEBTORS",
      badgeType: "AGING",
      title: "Student Fee Defaulters & Overdue Aging Register",
      subtitle: "As of Today",
      generatedTime: "Today, 08:00 IST",
      format: "PDF • 1.2 MB",
      badgeClass: "bg-[#FFFBEB] text-[#D97706]",
      iconBg: "bg-[#FFFBEB] text-[#D97706]",
      btnBg: "bg-[#A36829] hover:bg-[#8C531B] text-white",
      sideIllustrationType: "hourglass",
      sideDesc: "List of pending fees and overdue accounts",
      getContent: () => `DELHI PUBLIC SCHOOL, R.K. PURAM • AGED DEBTORS REGISTER
=============================================================
Aging Analysis: As of Today
Total Overdue Student Accounts: 28 Accounts
Cumulative Outstanding Balance: ₹ 7,95,000.00

AGING BUCKETS:
-------------------------------------------------------------
• 0–30 Days (Standard Grace):   ₹ 18,24,000 (Follow-up SMS sent)
• 31–60 Days (Notice Issued):   ₹  4,85,000 (18 Accounts)
• 61–90 Days (Dean Escalation): ₹  2,10,000 (7 Accounts)
• 90+ Days (Legal & Freeze):    ₹  1,00,000 (3 Accounts)

REPRESENTATIVE OPEN ACCOUNTS:
- Rohan Singhania (Class 12-A, ADM-2024-002): ₹ 36,250 [31–60 Days]
- Kabir Mehta (Class 10-B, ADM-2024-006): ₹ 23,750 [31–60 Days]

Bursary Collections Desk • Delhi Public School, R.K. Puram`,
    },
    {
      id: "rep-04",
      category: "TAX_COMPLIANCE",
      badgeType: "TAX",
      title: "RTE 25% Free Seat Reimbursement Government Filing Report",
      subtitle: "Academic Session 2024–2025",
      generatedTime: "3 days ago",
      format: "PDF • 4.1 MB",
      badgeClass: "bg-[#FFF1F2] text-[#E11D48]",
      iconBg: "bg-[#FFF1F2] text-[#E11D48]",
      btnBg: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
      sideIllustrationType: "tax",
      sideDesc: "For government compliance & filing",
      getContent: () => `DELHI PUBLIC SCHOOL, R.K. PURAM • RTE SECTION 12(1)(C) STATUTORY REIMBURSEMENT
=============================================================
Academic Year: 2024–2025 • Directorate of Education, Delhi
Filing Category: Section 12(1)(c) 25% Economically Weaker Section

BENEFICIARY DATA:
-------------------------------------------------------------
Total RTE Enrolled Scholars:    142 Students (Classes 1 to 8)
Government Notified Unit Cost:  ₹ 2,250 per pupil / month
Total Annual Claim Filed:       ₹ 38,34,000.00
State Directorate Approval:     Verified & Certified

Authorized Signatory: Principal & Chairman, Managing Committee
Delhi Public School, Sector XII, R.K. Puram, New Delhi - 110022`,
    },
  ];

  const filteredReports = reports.filter((r) => {
    if (selectedTab === "ALL") return true;
    if (selectedTab === "FEE" && r.category === "FEE_STATEMENTS") return true;
    if (selectedTab === "TRIAL" && r.category === "TRIAL_BALANCE") return true;
    if (selectedTab === "AGING" && r.category === "AGED_DEBTORS") return true;
    if (selectedTab === "TAX" && r.category === "TAX_COMPLIANCE") return true;
    return false;
  });

  const handleDownload = (report: typeof reports[0]) => {
    setPreviewDoc({
      isOpen: true,
      title: report.title,
      fileName: `${report.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      content: report.getContent(),
      studentMeta: {
        name: "Directorate of Finance & Audits",
        form: "All Campus Divisions",
        institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
        institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017 • School Code: 85214",
        institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022",
        academicSession: "2024–2025",
      },
    });
  };

  const handleCustomGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerationSuccess(true);
    setTimeout(() => {
      setIsGeneratingModal(false);
      setGenerationSuccess(false);
      setPreviewDoc({
        isOpen: true,
        title: customReportConfig.title,
        fileName: `${customReportConfig.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        content: `DELHI PUBLIC SCHOOL, R.K. PURAM • STATUTORY AUDIT REPORT
=============================================================
Report: ${customReportConfig.title}
Period: ${customReportConfig.dateRange}
Auditor Attestation: In full compliance with Indian Accounting Standards and CBSE Board mandates.

Signatory: Mr. Suresh Menon • Bursar & Accounts Bureau
Delhi Public School, R.K. Puram, New Delhi • Agragati OS`,
        studentMeta: {
          name: "Bursar Audit Bureau",
          form: "All Institutional Accounts",
          institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
          institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017 • School Code: 85214",
          institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022",
          academicSession: "2024–2025",
        },
      });
    }, 1000);
  };

  const renderSideIllustration = (type: string) => {
    if (type === "velocity") {
      return (
        <div className="flex flex-col items-center justify-center text-[#2563EB]">
          <div className="flex items-end gap-1 mb-1">
            <div className="w-2 h-4 bg-[#93C5FD] rounded-t-xs" />
            <div className="w-2 h-7 bg-[#60A5FA] rounded-t-xs" />
            <div className="w-2 h-10 bg-[#2563EB] rounded-t-xs" />
            <TrendingUp className="w-5 h-5 text-[#2563EB] ml-1 -mb-1" />
          </div>
        </div>
      );
    }
    if (type === "bank") {
      return (
        <div className="flex flex-col items-center justify-center text-[#059669]">
          <Building2 className="w-10 h-10" />
        </div>
      );
    }
    if (type === "hourglass") {
      return (
        <div className="flex flex-col items-center justify-center text-[#D97706]">
          <Hourglass className="w-10 h-10" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center text-[#E11D48]">
        <FileText className="w-10 h-10" />
      </div>
    );
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
                TREASURY STATEMENTS &amp; STATUTORY FILING
              </span>
              <span className="text-slate-300 dark:text-stone-700 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                CBSE &amp; Indian Accounting Standards (Ind AS)
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Financial Reports &amp; Statements
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Generate double-entry trial balances, aged debtor escalation registers, cash realization statements, and GST/Section 12A compliance dossiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsGeneratingModal(true)}
              className="bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] gap-2 text-xs font-semibold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              Custom Report Generator
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: "All Statements" },
            { id: "FEE", label: "Fee Statements" },
            { id: "TRIAL", label: "Trial Balances & Audits" },
            { id: "AGING", label: "Aged Debtors" },
            { id: "TAX", label: "GST & Tax Statements" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? "bg-[#A36829] text-white shadow-xs"
                  : "bg-white dark:bg-[#12161f] text-slate-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2x2 Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs hover:border-[#A36829]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${report.iconBg}`}
                    >
                      {report.badgeType === "STATEMENT" ? (
                        <BarChart3 className="w-6 h-6" />
                      ) : report.badgeType === "AUDIT" ? (
                        <FileSpreadsheet className="w-6 h-6" />
                      ) : report.badgeType === "AGING" ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        <Receipt className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mb-1.5 ${report.badgeClass}`}
                      >
                        {report.badgeType}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl font-bold text-[#0F172A] dark:text-stone-100 leading-snug">
                        {report.title}
                      </h3>
                      <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5 font-medium">
                        {report.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Side Illustration */}
                  <div className="hidden sm:flex flex-col items-center text-right shrink-0">
                    {renderSideIllustration(report.sideIllustrationType)}
                    <span className="text-[10px] text-slate-400 max-w-[120px] text-center mt-1 leading-tight">
                      {report.sideDesc}
                    </span>
                  </div>
                </div>

                {/* Metadata list */}
                <div className="mt-5 space-y-2 text-xs text-slate-600 dark:text-stone-400 font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Generated: {report.generatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Format: {report.format}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#16A34A] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Principal e-Signed &amp; Sealed</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-stone-800 flex justify-end">
                <Button
                  onClick={() => handleDownload(report)}
                  className={`${report.btnBg} gap-2 text-xs font-semibold h-9 px-5 rounded-xl shadow-xs`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Report Generator Modal */}
        <Modal
          isOpen={isGeneratingModal}
          onClose={() => setIsGeneratingModal(false)}
          title="Custom Financial Dossier Generator"
          description="Synthesize parameterized statutory accounting filings, trial balance ledgers, and Section 12A trust statements."
          maxWidth="lg"
        >
          {generationSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Dossier Synthesized</h3>
              <p className="font-sans text-xs text-slate-500">
                Opening preview document with authentic school header &amp; seal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCustomGeneration} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                  Report Type / Template
                </label>
                <Input
                  required
                  value={customReportConfig.title}
                  onChange={(e) =>
                    setCustomReportConfig({
                      ...customReportConfig,
                      title: e.target.value,
                    })
                  }
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                  Fiscal Date Range
                </label>
                <Input
                  required
                  value={customReportConfig.dateRange}
                  onChange={(e) =>
                    setCustomReportConfig({
                      ...customReportConfig,
                      dateRange: e.target.value,
                    })
                  }
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="auditorNotes"
                  checked={customReportConfig.includeAuditorNotes}
                  onChange={(e) =>
                    setCustomReportConfig({
                      ...customReportConfig,
                      includeAuditorNotes: e.target.checked,
                    })
                  }
                  className="rounded border-stone-300 text-[#A36829] focus:ring-[#A36829]"
                />
                <label htmlFor="auditorNotes" className="text-xs text-slate-700">
                  Include Statutory Auditor Verification &amp; School Seal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGeneratingModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#A36829] hover:bg-[#8C531B] text-white text-xs font-semibold"
                >
                  Generate Dossier
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Bottom Banner */}
        <FinanceQuoteBanner
          icon={<Award className="w-6 h-6 text-[#2563EB]" />}
          iconBgClass="bg-[#EFF6FF] text-[#2563EB]"
          title="Accurate Reports. Stronger Schools."
          subtitle="Compliance today, a brighter tomorrow."
          quote="Good finances build great futures."
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

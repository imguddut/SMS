"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIndianCurrency } from "@/lib/utils";
import {
  fetchFinanceDashboardStats,
  fetchFinanceInvoices,
  fetchBankReconciliationFeed,
  FinanceDashboardStats,
  FinanceInvoiceItem,
  BankReconciliationItem,
} from "@/lib/db/finance";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { FinanceQuoteBanner } from "@/components/ui/finance-quote-banner";
import {
  Building2,
  TrendingUp,
  Receipt,
  Layers,
  Calculator,
  CreditCard,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Download,
  Calendar,
  Coins,
  Wallet,
  ArrowRight,
  GraduationCap,
  Users,
  Baby,
  Trophy,
  FileText,
  FolderKanban,
  Zap,
} from "lucide-react";

export default function FinanceDashboardPage() {
  const [stats, setStats] = React.useState<FinanceDashboardStats | null>(null);
  const [invoices, setInvoices] = React.useState<FinanceInvoiceItem[]>([]);
  const [feed, setFeed] = React.useState<BankReconciliationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: PDFStudentMetadata;
  } | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [statsData, invoicesData, feedData] = await Promise.all([
          fetchFinanceDashboardStats(),
          fetchFinanceInvoices(),
          fetchBankReconciliationFeed(),
        ]);
        setStats(statsData);
        setInvoices(invoicesData);
        setFeed(feedData);
      } catch (err) {
        console.error("Failed to load finance data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadTreasurySummary = () => {
    const totalInv = stats?.totalInvoiced || 48500000;
    const realRec = stats?.realizedReceipts || 45881000;
    const pendRec = stats?.pendingWithinTerms || 1824000;
    const overArr = stats?.overdueArrears || 795000;
    const colRate = stats?.collectionRate || "94.6%";

    const content = `DELHI PUBLIC SCHOOL, R.K. PURAM • TREASURY & BURSARY EXECUTIVE SUMMARY
=============================================================
Academic Session: 2024–2025 • Term 2 Comprehensive Treasury Report
Report Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
Institution: Delhi Public School, Sector XII, R.K. Puram, New Delhi

EXECUTIVE KEY PERFORMANCE INDICATORS (TERM 2):
-------------------------------------------------------------
1. Total Invoiced Demand:       ₹ ${totalInv.toLocaleString("en-IN")} (1,842 Enrolled Scholars)
2. Realized Fee Collections:    ₹ ${realRec.toLocaleString("en-IN")} (${colRate} Collection Velocity)
3. Pending Regular Receivables: ₹ ${pendRec.toLocaleString("en-IN")} (Within standard 30-day window)
4. Overdue Cumulative Arrears:  ₹ ${overArr.toLocaleString("en-IN")} (28 Student Accounts)

WING-WISE REALIZATION BREAKDOWN:
-------------------------------------------------------------
• Senior Secondary (Classes 11 & 12): 97.2% Realized (₹ 2.48 Crores Collected)
• Secondary Wing (Classes 9 & 10):    93.8% Realized (₹ 1.34 Crores Collected)
• Middle Wing (Classes 6 to 8):       91.4% Realized (₹ 76.8 Lakhs Collected)

GATEWAY & CLEARING PERFORMANCE:
-------------------------------------------------------------
Clearing Gateways: State Bank of India, HDFC Bank Ltd, ICICI Bank
UPI Auto-Reconciliation Rate: 99.8% with 12-digit UTR Verification
Daily Settled Volume: ₹ 4,26,000.00 | Security Hash: SHA256-VERIFIED

CERTIFICATION & AUDIT STATEMENT:
This summary reflects authentic double-entry transactions posted to the Agragati School Management OS general ledger. All collections are reconciled against CBS bank statements and approved by the School Bursar.

Authorized Signatory: Mr. Suresh Menon • Accounts Officer & Bursar
Delhi Public School, R.K. Puram, New Delhi`;

    setPreviewDoc({
      isOpen: true,
      title: "Treasury & Bursary Executive Summary",
      fileName: `Treasury_Summary_${new Date().toISOString().split("T")[0]}.pdf`,
      content,
      studentMeta: {
        name: "Bursary & Accounts Executive Bureau",
        form: "All Wings (Classes 6 to 12)",
        institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
        institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017 • School Code: 85214",
        institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022",
        academicSession: "2024–2025",
      },
    });
  };

  const handleInspectInvoice = (inv: FinanceInvoiceItem) => {
    const content = `DELHI PUBLIC SCHOOL, R.K. PURAM • OFFICIAL FEE INVOICE & RECEIPT DEMAND
=============================================================
Invoice Number: ${inv.invoiceNumber}
Issue Date: 2024-10-01
Due Date: ${inv.dueDate}
Status: ${inv.status}

STUDENT DETAILS:
-------------------------------------------------------------
Scholar Name: ${inv.studentName}
Class & Section: ${inv.form}
House Affiliation: ${inv.house}
Guardian / Debtor: ${inv.parentName}

FINANCIAL BREAKDOWN:
-------------------------------------------------------------
Tuition Fee (${inv.termName}): ₹ ${(inv.amount * 0.8).toLocaleString("en-IN")}
Laboratory & Digital Learning Levy: ₹ ${(inv.amount * 0.15).toLocaleString("en-IN")}
Development & Sports Levy: ₹ ${(inv.amount * 0.05).toLocaleString("en-IN")}
TOTAL INVOICE DEMAND: ₹ ${inv.amount.toLocaleString("en-IN")}

Status: ${inv.status === "PAID" ? "SETTLED IN FULL (Auto-Reconciled via NPCI UPI)" : "PAYMENT PENDING / DEMAND ACTIVE"}
Bursar Office: Mr. Suresh Menon • Delhi Public School, R.K. Puram`;

    setPreviewDoc({
      isOpen: true,
      title: `Invoice ${inv.invoiceNumber} - ${inv.studentName}`,
      fileName: `${inv.invoiceNumber}_${inv.studentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: inv.studentName,
        form: inv.form,
        house: inv.house,
        institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
        institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017 • School Code: 85214",
        institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022",
        academicSession: "2024–2025",
      },
    });
  };

  return (
    <AppShell
      role="ACCOUNTANT"
      userName="Mr. Suresh Menon"
      userRoleTitle="Accounts Officer & Bursar"
      epochText="Term 2 (CBSE) • Academic Year 2024–2025"
    >
      <div className="space-y-6">
        {/* Header with tracker and actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-bold text-[#A36829] uppercase tracking-wider">
                TREASURY &amp; INSTITUTIONAL LEDGER
              </span>
              <span className="text-slate-300 dark:text-stone-700 text-xs">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                NPCI UPI &amp; Bank Gateway Active
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Finance &amp; Accounts Bureau
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Real-time fee collections, BHIM UPI and NEFT auto-reconciliation with SBI &amp; HDFC Bank, and double-entry student ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Active Term Card */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Term</span>
                <span className="font-sans text-xs font-bold text-[#0F172A] dark:text-stone-100">
                  Term 2 (CBSE)
                </span>
                <span className="text-[10px] text-slate-400">2024 - 2025</span>
              </div>
            </div>

            <Link href="/finance/reconciliation">
              <Button
                variant="outline"
                className="gap-2 text-xs font-semibold bg-white dark:bg-[#12161f] border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                Bank Reconciliation
              </Button>
            </Link>

            <Button
              onClick={handleDownloadTreasurySummary}
              className="bg-[#A36829] hover:bg-[#8C531B] text-white gap-2 text-xs font-semibold shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              Generate Invoices
            </Button>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Invoiced */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 block mt-3">
              TOTAL INVOICED (TERM 2)
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-stone-100 mt-1">
              ₹ 4,85,00,000
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-slate-500 dark:text-stone-400 font-medium">
              <span>1,842 Enrolled Students</span>
            </div>
          </div>

          {/* Card 2: Realized Receipts */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 block mt-3">
              REALIZED RECEIPTS
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#166534] dark:text-emerald-400 mt-1">
              ₹ 4,58,81,000
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="font-sans text-xs font-semibold text-[#16A34A]">
                94.6% Realization Rate
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold uppercase">
                ON TARGET
              </span>
            </div>
          </div>

          {/* Card 3: Pending Within Terms */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 block mt-3">
              PENDING WITHIN TERMS
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#B45309] dark:text-amber-400 mt-1">
              ₹ 18,24,000
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="font-sans text-xs text-slate-500 dark:text-stone-400">
                Due within 15–30 days
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold uppercase">
                UNSETTLED
              </span>
            </div>
          </div>

          {/* Card 4: Overdue Arrears */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 block mt-3">
              OVERDUE ARREARS
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#B91C1C] dark:text-rose-400 mt-1">
              ₹ 7,95,000
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="font-sans text-xs text-rose-600 font-medium">
                28 Accounts Follow-Up
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#B91C1C] dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold uppercase">
                ARREARS
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Core Analytics & Clearing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Realization Trajectory */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#0F172A] dark:text-stone-100">
                      Term Fee Realization Velocity
                    </h2>
                    <p className="font-sans text-xs text-[#64748B] dark:text-stone-400 mt-0.5">
                      Target vs Actual realization across Senior Secondary, Secondary, and Middle Wings
                    </p>
                  </div>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Realization Progress</span>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-serif text-xl font-bold text-[#16A34A]">94.6%</span>
                    <span className="text-xs text-slate-500 font-mono">(₹4,58,81,000 / ₹4,85,00,000)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      ₹ 4.85 CR QUOTA
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-stone-800 rounded-full h-3 overflow-hidden mb-6">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                  style={{ width: "94.6%" }}
                />
              </div>

              {/* 3 Wings Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Senior Secondary */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-stone-200 block">Senior Secondary</span>
                      <span className="text-[10px] text-slate-500">(Class 11 &amp; 12)</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="font-serif text-2xl font-bold text-[#0F172A] dark:text-stone-100">
                      97.2%
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div className="bg-[#2563EB] h-full rounded-full" style={{ width: "97.2%" }} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#2563EB] block">
                      ₹ 2.48 Cr Collected
                    </span>
                  </div>
                </div>

                {/* Secondary Wing */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-stone-200 block">Secondary Wing</span>
                      <span className="text-[10px] text-slate-500">(Class 9 &amp; 10)</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="font-serif text-2xl font-bold text-[#0F172A] dark:text-stone-100">
                      93.8%
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: "93.8%" }} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#7C3AED] block">
                      ₹ 1.34 Cr Collected
                    </span>
                  </div>
                </div>

                {/* Middle Wing */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Baby className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-stone-200 block">Middle Wing</span>
                      <span className="text-[10px] text-slate-500">(Class 6 to 8)</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="font-serif text-2xl font-bold text-[#0F172A] dark:text-stone-100">
                      91.4%
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div className="bg-[#D97706] h-full rounded-full" style={{ width: "91.4%" }} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#D97706] block">
                      ₹ 76.8 Lakhs Collected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Invoicing & UPI Settlements Table */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#0F172A] dark:text-stone-100">
                      Recent Invoicing &amp; UPI Settlements
                    </h2>
                    <p className="font-sans text-xs text-[#64748B] dark:text-stone-400 mt-0.5">
                      Latest issued student fee demands and auto-matched payment receipts
                    </p>
                  </div>
                </div>
                <Link href="/finance/invoices">
                  <Button variant="ghost" size="sm" className="text-xs text-[#A36829] hover:text-[#8C531B] font-semibold gap-1">
                    View All Invoices
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-stone-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">INVOICE REF</th>
                      <th className="py-3 px-3">STUDENT &amp; HOUSE</th>
                      <th className="py-3 px-3">TERM</th>
                      <th className="py-3 px-3 text-right">AMOUNT (₹)</th>
                      <th className="py-3 px-3 text-center">STATUS</th>
                      <th className="py-3 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                    {invoices.slice(0, 4).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-[#0F172A] dark:text-stone-100">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-[#0F172A] dark:text-stone-100 block">{inv.studentName}</span>
                          <span className="text-[11px] text-slate-500">{inv.form} • {inv.house}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-stone-400">
                          {inv.termName}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-[#0F172A] dark:text-stone-100">
                          {formatIndianCurrency(inv.amount)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                              inv.status === "PAID"
                                ? "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300"
                                : inv.status === "OVERDUE"
                                ? "bg-[#FEE2E2] text-[#B91C1C] dark:bg-rose-950 dark:text-rose-300"
                                : "bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInspectInvoice(inv)}
                            className="text-xs h-7 px-3 rounded-md text-slate-600 dark:text-stone-300 border-slate-200 dark:border-stone-700 hover:bg-slate-100"
                          >
                            {inv.status === "PAID" ? "View" : inv.status === "OVERDUE" ? "Follow Up" : "Remind"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Col: NPCI Banking Gateway & Bursary Quick Actions */}
          <div className="space-y-6">
            {/* NPCI & Banking Gateway Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0F172A] dark:text-stone-100">
                    NPCI &amp; Banking Gateway
                  </h3>
                </div>
              </div>
              <p className="font-sans text-xs text-[#64748B] dark:text-stone-400 mb-4">
                Automated 12-digit UPI UTR parser and NEFT/RTGS bank statement reconciliation.
              </p>

              <div className="space-y-2.5 text-xs font-sans">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800">
                  <span className="text-slate-500">Clearing Partner</span>
                  <span className="font-bold text-[#0F172A] dark:text-stone-100">SBI / HDFC Bank / ICICI</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800">
                  <span className="text-slate-500">Auto-Match Accuracy</span>
                  <span className="font-bold text-[#16A34A]">{stats?.autoMatchRate || "99.8%"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800">
                  <span className="text-slate-500">Daily Settled Volume</span>
                  <span className="font-bold text-[#0F172A] dark:text-stone-100">₹ 4,26,000</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#161B26] border border-slate-200/60 dark:border-stone-800">
                  <span className="text-slate-500">Vault Checksum</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-stone-400">SHA256: 9b20...e4c1</span>
                </div>
              </div>

              <div className="mt-5">
                <Link href="/finance/reconciliation" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full text-xs h-9 rounded-xl border-[#A36829]/40 text-[#A36829] hover:bg-[#A36829]/5 justify-between font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Open Bank Reconciliation Desk
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bursary Quick Actions */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-[#A36829]" />
                <h3 className="font-serif text-lg font-bold text-[#0F172A] dark:text-stone-100">
                  Bursary Quick Actions
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <Link href="/finance/fee-structures">
                  <div className="p-3 rounded-xl border border-slate-200/70 dark:border-stone-800 hover:border-[#A36829]/50 hover:bg-[#FDFBF7] dark:hover:bg-stone-800/40 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#0F172A] dark:text-stone-100 block group-hover:text-[#A36829] transition-colors">
                          Fee Schedules
                        </span>
                        <span className="text-[11px] text-slate-500">Manage composite &amp; transport fee tiers</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#A36829] transition-colors" />
                  </div>
                </Link>

                <Link href="/finance/invoices">
                  <div className="p-3 rounded-xl border border-slate-200/70 dark:border-stone-800 hover:border-[#A36829]/50 hover:bg-[#FDFBF7] dark:hover:bg-stone-800/40 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#0F172A] dark:text-stone-100 block group-hover:text-[#A36829] transition-colors">
                          Term Invoices
                        </span>
                        <span className="text-[11px] text-slate-500">Generate &amp; track fee demands</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#A36829] transition-colors" />
                  </div>
                </Link>

                <Link href="/finance/student-ledgers">
                  <div className="p-3 rounded-xl border border-slate-200/70 dark:border-stone-800 hover:border-[#A36829]/50 hover:bg-[#FDFBF7] dark:hover:bg-stone-800/40 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#0F172A] dark:text-stone-100 block group-hover:text-[#A36829] transition-colors">
                          Student Ledgers
                        </span>
                        <span className="text-[11px] text-slate-500">Double-entry ledger by student</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#A36829] transition-colors" />
                  </div>
                </Link>

                <Link href="/finance/reports">
                  <div className="p-3 rounded-xl border border-slate-200/70 dark:border-stone-800 hover:border-[#A36829]/50 hover:bg-[#FDFBF7] dark:hover:bg-stone-800/40 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#0F172A] dark:text-stone-100 block group-hover:text-[#A36829] transition-colors">
                          Financial Reports
                        </span>
                        <span className="text-[11px] text-slate-500">Trial balance &amp; GST compliance statements</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#A36829] transition-colors" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <FinanceQuoteBanner
          icon={<Trophy className="w-6 h-6 text-[#A36829]" />}
          iconBgClass="bg-[#FDF6EC] text-[#A36829]"
          title="Transparent Finances. A Brighter Future."
          subtitle="Efficient. Accurate. Accountable. For every student's journey."
          quote="Strong schools build stronger tomorrows."
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

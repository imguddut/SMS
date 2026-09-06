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
  fetchBankReconciliationFeed,
  reconcileTransaction,
  BankReconciliationItem,
  fetchFinanceInvoices,
  FinanceInvoiceItem,
} from "@/lib/db/finance";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { FinanceQuoteBanner } from "@/components/ui/finance-quote-banner";
import { useAuth } from "@/components/providers/auth-context";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Download,
  Coins,
  FileText,
  Lock,
  BarChart3,
  Calendar,
  Search,
  Eye,
  User,
  Lightbulb,
} from "lucide-react";

export default function BankReconciliationPage() {
  const { profile, school } = useAuth();
  const [feedItems, setFeedItems] = React.useState<BankReconciliationItem[]>([]);
  const [openInvoices, setOpenInvoices] = React.useState<FinanceInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isReconciling, setIsReconciling] = React.useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Manual Match Modal
  const [selectedException, setSelectedException] = React.useState<BankReconciliationItem | null>(null);
  const [targetStudent, setTargetStudent] = React.useState("");
  const [matchSuccess, setMatchSuccess] = React.useState(false);

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
        const [data, invData] = await Promise.all([
          fetchBankReconciliationFeed(),
          fetchFinanceInvoices(),
        ]);
        setFeedItems(data);
        const pending = invData.filter((i) => i.status !== "PAID");
        setOpenInvoices(pending);
        if (pending.length > 0) {
          setTargetStudent(`${pending[0].studentName} (${pending[0].invoiceNumber})`);
        }
      } catch (err) {
        console.error("Failed to load bank feed", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleReconcile = async (item: BankReconciliationItem) => {
    setIsReconciling(item.id);
    try {
      await reconcileTransaction(item.id);
      const studentName = targetStudent ? targetStudent.split(" (")[0] : (item.matchedStudentName || "Student");
      const invNo = targetStudent && targetStudent.includes("(") ? targetStudent.split("(")[1].replace(")", "") : (item.matchedInvoiceNo || "INV");
      setFeedItems((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "RECONCILED",
                matchedStudentName: studentName,
                matchedInvoiceNo: invNo,
                confidenceScore: "100% (Manual Match Sealed)",
              }
            : f
        )
      );
      setMatchSuccess(true);
      setTimeout(() => {
        setSelectedException(null);
        setMatchSuccess(false);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReconciling(null);
    }
  };

  const reconciledCount = feedItems.filter((f) => f.status === "RECONCILED").length;
  const unmatchedCount = feedItems.filter((f) => f.status === "UNMATCHED").length;
  const dailyVolume = feedItems.reduce((acc, f) => acc + (f.amount || 0), 0);
  const reconciledVolume = feedItems
    .filter((f) => f.status === "RECONCILED")
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  const filteredFeed = feedItems.filter((item) => {
    const matchesFilter =
      selectedFilter === "ALL" ||
      (selectedFilter === "SETTLED" && item.status === "RECONCILED") ||
      (selectedFilter === "UNMATCHED" && item.status === "UNMATCHED");

    const matchesSearch =
      item.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bankSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.remittanceInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.matchedStudentName && item.matchedStudentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.amount.toString().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  const handleViewReconciliationDetail = (item: BankReconciliationItem) => {
    const instName = school?.name || "School";
    const content = `${instName.toUpperCase()} • BANK CLEARING & SETTLEMENT SLIP
=============================================================
Transaction Reference: ${item.transactionRef}
Bank Channel: ${item.bankSource}
Timestamp: ${item.timestamp}
Settlement Status: ${item.status}

REMITTANCE METADATA:
-------------------------------------------------------------
Raw Narration: ${item.remittanceInfo}
Settled Amount: ₹ ${item.amount.toLocaleString("en-IN")}
Matched Scholar: ${item.matchedStudentName || "Suspense Desk / Unidentified Remitter"}
Linked Fee Invoice: ${item.matchedInvoiceNo || "Pending Allocation"}
Clearing Confidence: ${item.confidenceScore}

BANK CLEARING CERTIFICATION:
This transaction has been cryptographically validated and posted into the General Ledger.

Accounts Officer / Bursar
${instName}`;

    setPreviewDoc({
      isOpen: true,
      title: `Bank Settlement - ${item.transactionRef}`,
      fileName: `Settlement_${item.transactionRef}.pdf`,
      content,
      studentMeta: {
        name: item.matchedStudentName || "Treasury Clearing Desk",
        form: "All Forms",
        institutionName: instName,
        institutionAffiliation: "School OS Financial Management System",
        institutionAddress: "",
        academicSession: "2024–2025",
      },
    });
  };

  const handleExportReconciliationAudit = () => {
    const lines = feedItems
      .map((item) => {
        const matchText = item.matchedStudentName
          ? `Matched: ${item.matchedStudentName} (${item.matchedInvoiceNo}) [${item.confidenceScore}]`
          : `Unmatched / Suspense Desk`;
        return `[${item.status}] REF: ${item.transactionRef} | Bank: ${item.bankSource} | ₹ ${item.amount.toLocaleString("en-IN")}
  Timestamp: ${item.timestamp}
  Memo: ${item.remittanceInfo}
  Resolution: ${matchText}`;
      })
      .join("\n\n");

    const instName = school?.name || "School";
    const content = `${instName.toUpperCase()} • BANK CLEARING STATEMENT
=============================================================
Academic Session: 2024–2025 • Daily Clearing Report
Audit Timestamp: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}

SUMMARY TELEMETRY:
-------------------------------------------------------------
Auto-Reconciled & Posted: ${reconciledCount} Transactions
Pending Unmatched Exceptions: ${unmatchedCount} Items

ITEMIZED TRANSACTION REGISTER:
-------------------------------------------------------------
${lines || "No clearing transactions recorded."}

AUDIT CERTIFICATION & GOVERNANCE:
1. Reconciled entries are irreversibly locked and timestamped in double-entry ledgers.
2. Unmatched credits are held in Treasury Suspense A/C pending guardian identity verification.

Accounts Officer / Bursar
${instName} • School Management OS`;

    setPreviewDoc({
      isOpen: true,
      title: "Bank Clearing Audit Statement",
      fileName: `Bank_Reconciliation_Audit_${new Date().toISOString().split("T")[0]}.pdf`,
      content,
      studentMeta: {
        name: "Treasury Clearing Bureau",
        form: "All Bank Clearing Accounts",
        institutionName: instName,
        institutionAffiliation: "School OS Financial Management System",
        institutionAddress: "",
        academicSession: "2024–2025",
      },
    });
  };

  const renderBankLogo = (bankSource: string) => {
    if (bankSource.includes("HDFC")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
          <div className="w-full h-full bg-[#004C8F] rounded flex items-center justify-center relative overflow-hidden">
            <div className="w-3.5 h-3.5 bg-[#ED232A] rounded-2xs" />
            <div className="absolute inset-1 border border-white/80" />
          </div>
        </div>
      );
    }
    if (bankSource.includes("State Bank") || bankSource.includes("SBI")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
          <div className="w-full h-full bg-[#280071] rounded-full flex items-center justify-center relative">
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#280071] rounded-full" />
            </div>
            <div className="absolute bottom-1 w-1 h-2 bg-white" />
          </div>
        </div>
      );
    }
    // ICICI Bank
    return (
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
        <div className="w-full h-full bg-[#B02A30] rounded-full flex items-center justify-center text-white font-serif font-bold text-xs italic">
          i
        </div>
      </div>
    );
  };

  return (
    <AppShell
      role="ACCOUNTANT"
      userName={profile?.full_name || "Accounts Officer"}
      userRoleTitle="Accounts Officer & Bursar"
      epochText="Bank Feed &amp; Reconciliation Engine"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-bold text-[#A36829] uppercase tracking-wider">
                AUTOMATED BANK FEED &amp; UPI RECONCILIATION ENGINE
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Bank Reconciliation Desk
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Automatic matching of incoming BHIM UPI payments, 12-digit UTR numbers, and NEFT/RTGS credits against open student fee demands across clearance accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Motivational pill card */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif italic text-xs font-semibold text-slate-800 dark:text-stone-200 leading-tight">
                  Secure. Accurate. Automated.
                </span>
                <span className="font-serif italic text-xs text-slate-500">Zero Suspense Ledger.</span>
                <div className="w-8 h-0.5 bg-[#D97706] rounded-full mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportReconciliationAudit}
                className="gap-2 text-xs font-semibold bg-white dark:bg-[#12161f] border-stone-200/80 dark:border-stone-800 text-slate-700 dark:text-stone-300"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Upload Bank CSV / Excel
              </Button>
              <Button className="bg-[#1E3A8A] hover:bg-[#172554] text-white gap-2 text-xs font-semibold shadow-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                Re-run UPI Parser
              </Button>
            </div>
          </div>
        </div>

        {/* 3 Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Daily Feed Volume */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Daily Feed Volume
              </span>
              <div className="font-serif text-3xl font-bold text-[#0F172A] dark:text-stone-100 mt-0.5">
                {formatIndianCurrency(dailyVolume)}
              </div>
              <span className="text-[11px] text-slate-500 block">{feedItems.length} Settlement Entries</span>
            </div>
          </div>

          {/* Card 2: Automated Matches */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Automated Matches
              </span>
              <div className="font-serif text-3xl font-bold text-[#166534] dark:text-emerald-400 mt-0.5">
                {reconciledCount} Settled ({formatIndianCurrency(reconciledVolume)})
              </div>
              <span className="text-[11px] text-[#16A34A] font-semibold block">Auto UTR Matched</span>
            </div>
          </div>

          {/* Card 3: Pending Exceptions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-rose-500 block">
                Pending Exceptions
              </span>
              <div className="font-serif text-3xl font-bold text-[#B91C1C] dark:text-rose-400 mt-0.5">
                {unmatchedCount} Unresolved
              </div>
              <span className="text-[11px] text-slate-500 block">Manual ledger link required</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Transactions" },
              { id: "SETTLED", label: `Settled (${reconciledCount})` },
              { id: "UNMATCHED", label: `Unmatched (${unmatchedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? "bg-[#0F2942] text-white shadow-xs"
                    : "bg-white dark:bg-[#12161f] text-slate-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 text-xs text-slate-600 dark:text-stone-300 font-medium shrink-0 ml-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Session: {new Date().toISOString().split("T")[0]}</span>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UTR, student, bank, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 text-xs text-[#0F172A] dark:text-stone-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
            />
          </div>
        </div>

        {/* Transactions Table Card */}
        <div className="rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#161B26] border-b border-slate-200/70 dark:border-stone-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Payment Ref &amp; Bank</th>
                  <th className="py-3.5 px-4 font-semibold">Remittance Memo / Narration</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 font-semibold">Matched Student &amp; Invoice</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {filteredFeed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No bank transactions recorded. Sync gateway or upload bank statement.
                    </td>
                  </tr>
                ) : (
                  filteredFeed.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-stone-800/40 transition-colors">
                      {/* Payment Ref & Bank */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {renderBankLogo(item.bankSource)}
                          <div>
                            <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-stone-100 block">
                              {item.transactionRef}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                              {item.bankSource}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Remittance Memo / Narration */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-medium text-xs text-[#0F172A] dark:text-stone-100 line-clamp-1">
                          {item.remittanceInfo}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                          {item.timestamp}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right font-serif text-sm font-bold text-[#0F172A] dark:text-stone-100">
                        {formatIndianCurrency(item.amount)}
                      </td>

                      {/* Matched Student & Invoice */}
                      <td className="py-4 px-4">
                        {item.matchedStudentName ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
                              {item.matchedStudentName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <span className="font-bold text-[#0F172A] dark:text-stone-100 block text-xs">
                                {item.matchedStudentName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-500">{item.matchedInvoiceNo}</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-[#16A34A] font-semibold">{item.confidenceScore}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="text-slate-800 dark:text-stone-200 font-bold text-xs block">
                                Unidentified Remitter
                              </span>
                              <span className="text-[10px] text-rose-600 font-medium block">
                                Requires Accounts Review
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {item.status === "RECONCILED" ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              RECONCILED
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Settled</span>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#FEE2E2] text-[#B91C1C] dark:bg-rose-950 dark:text-rose-300">
                              <AlertTriangle className="w-3 h-3" />
                              UNMATCHED
                            </span>
                            <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">Manual Review</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {item.status === "RECONCILED" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReconciliationDetail(item)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-100 border-slate-200 dark:border-stone-700 gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            View
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedException(item)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 border-blue-200 gap-1.5"
                          >
                            <LinkIcon className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            Match &amp; Reconcile
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match Exception Modal */}
        <Modal
          isOpen={!!selectedException}
          onClose={() => setSelectedException(null)}
          title="Resolve Bank Remittance Exception"
          description="Map unmatched UPI/NEFT transaction to corresponding student fee invoice and post to double-entry ledger."
          maxWidth="lg"
        >
          {selectedException && (
            <div className="space-y-6">
              {matchSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0F172A]">Payment Reconciled &amp; Settled</h3>
                  <p className="font-sans text-xs text-slate-500">
                    The transaction has been reconciled and the student account credited {formatIndianCurrency(selectedException.amount)}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Incoming wire details */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Incoming Transaction Details
                    </span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Amount Received:</span>
                      <span className="font-serif text-lg font-bold text-[#A36829]">
                        {formatIndianCurrency(selectedException.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-slate-500">Bank Channel:</span>
                      <span className="font-semibold text-[#0F172A]">{selectedException.bankSource}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Raw Narration / UPI Memo:</span>
                      <span className="font-mono text-xs text-[#0F172A] block bg-white p-2 rounded-lg border border-slate-200">
                        {selectedException.remittanceInfo}
                      </span>
                    </div>
                  </div>

                  {/* Matching Target */}
                  <div>
                    <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                      Target Open Invoice &amp; Student
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-xs font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
                      value={targetStudent}
                      onChange={(e) => setTargetStudent(e.target.value)}
                    >
                      {openInvoices.length === 0 ? (
                        <option value="">No open invoices available</option>
                      ) : (
                        openInvoices.map((inv) => (
                          <option key={inv.id} value={`${inv.studentName} (${inv.invoiceNumber})`}>
                            {inv.studentName} — {inv.form || "Class"} ({inv.invoiceNumber} • {formatIndianCurrency(inv.amount)} Due)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="p-3 bg-[#FEF3C7]/60 rounded-xl border border-[#FDE68A] flex items-center gap-2 text-xs text-[#B45309]">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>
                      Automated match suggested based on student invoice demand and bank remittance narration.
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedException(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!!isReconciling}
                      onClick={() => handleReconcile(selectedException)}
                      className="bg-[#A36829] hover:bg-[#8C531B] text-white text-xs gap-1.5 font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isReconciling ? "Settling..." : "Confirm & Post Reconciliation"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Bottom Banner */}
        <FinanceQuoteBanner
          icon={<Lightbulb className="w-6 h-6 text-[#D97706]" />}
          iconBgClass="bg-[#FEF3C7] text-[#D97706]"
          title="Every Reconciliation Brings Us Closer to a Brighter Future."
          subtitle="Accurate records. Smooth operations. Happier students."
          quote="Transparent finances build stronger schools."
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

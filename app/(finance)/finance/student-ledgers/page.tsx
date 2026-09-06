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
  fetchStudentLedgers,
  postLedgerTransaction,
  StudentLedgerSummary,
  LedgerTransaction,
} from "@/lib/db/finance";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { FinanceQuoteBanner } from "@/components/ui/finance-quote-banner";
import { useAuth } from "@/components/providers/auth-context";
import {
  Calculator,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Receipt,
  Eye,
  BookOpen,
  ChevronRight,
  Coins,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";

export default function StudentLedgersPage() {
  const { school } = useAuth();
  const [ledgers, setLedgers] = React.useState<StudentLedgerSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: PDFStudentMetadata;
  } | null>(null);

  // Drilldown Modal
  const [selectedStudent, setSelectedStudent] = React.useState<StudentLedgerSummary | null>(null);

  // Post Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = React.useState(false);
  const [txSubmitting, setTxSubmitting] = React.useState(false);
  const [txSuccess, setTxSuccess] = React.useState(false);
  const [txData, setTxData] = React.useState({
    type: "CREDIT_PAYMENT" as "CREDIT_PAYMENT" | "DEBIT_FEE",
    description: "UPI Settlement (Ref: SBI-UPI-8392019482)",
    amount: 36250,
  });

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchStudentLedgers();
        setLedgers(data);
      } catch (err) {
        console.error("Failed to load ledgers", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalBilled = ledgers.reduce((acc, curr) => acc + curr.totalBilled, 0);
  const totalSettled = ledgers.reduce((acc, curr) => acc + curr.totalSettled, 0);
  const totalBalanceDue = ledgers.reduce((acc, curr) => acc + curr.balanceDue, 0);
  const overdueCount = ledgers.filter((l) => l.balanceDue > 0).length;
  const settledCount = ledgers.filter((l) => l.balanceDue === 0).length;

  const filteredLedgers = ledgers.filter((l) => {
    const parent = l.parentName || l.guardianName || "";
    const adm = l.admissionNumber || l.studentNumber || "";
    const matchesSearch =
      l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.form.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "SETTLED" && l.balanceDue === 0) ||
      (selectedStatus === "PENDING" && l.balanceDue > 0 && l.balanceDue < 30000) ||
      (selectedStatus === "OVERDUE" && l.balanceDue >= 30000);
    return matchesSearch && matchesStatus;
  });

  const handlePostTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setTxSubmitting(true);
    try {
      const refNo = `REF-MANUAL-${Date.now().toString().slice(-4)}`;
      const amt = Number(txData.amount);
      const newTx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        description: txData.description,
        type: txData.type,
        amount: amt,
        debit: txData.type === "DEBIT_FEE" ? amt : null,
        credit: txData.type === "CREDIT_PAYMENT" ? amt : null,
        runningBalance:
          txData.type === "CREDIT_PAYMENT"
            ? selectedStudent.balanceDue - amt
            : selectedStudent.balanceDue + amt,
        reference: refNo,
        referenceNo: refNo,
      };

      await postLedgerTransaction(selectedStudent.studentId, newTx);

      // Update state
      const updatedList = ledgers.map((l) => {
        if (l.studentId === selectedStudent.studentId) {
          const newBilled =
            txData.type === "DEBIT_FEE"
              ? l.totalBilled + Number(txData.amount)
              : l.totalBilled;
          const newSettled =
            txData.type === "CREDIT_PAYMENT"
              ? l.totalSettled + Number(txData.amount)
              : l.totalSettled;
          const newBalance = newBilled - newSettled;
          const updatedStudent = {
            ...l,
            totalBilled: newBilled,
            totalSettled: newSettled,
            balanceDue: newBalance,
            lastTransactionDate: newTx.date,
            transactions: [newTx, ...l.transactions],
          };
          setSelectedStudent(updatedStudent);
          return updatedStudent;
        }
        return l;
      });

      setLedgers(updatedList);
      setTxSuccess(true);
      setTimeout(() => {
        setIsTxModalOpen(false);
        setTxSuccess(false);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleExportSingleLedger = (student: StudentLedgerSummary) => {
    const txLines = (student.transactions || [])
      .map(
        (tx: LedgerTransaction) =>
          `[${tx.date}] ${tx.type === "CREDIT_PAYMENT" ? "CREDIT" : "DEBIT "} | Ref: ${tx.referenceNo || tx.reference} | Amount: ₹ ${(tx.amount || tx.debit || tx.credit || 0).toLocaleString("en-IN")} | Bal: ₹ ${tx.runningBalance.toLocaleString("en-IN")}\n  Memo: ${tx.description}`
      )
      .join("\n\n");

    const instName = school?.name || "School";
    const content = `${instName.toUpperCase()} • OFFICIAL STUDENT ACCOUNT LEDGER
=============================================================
Student Name: ${student.studentName}
Admission No: ${student.admissionNumber}
Class & Form: ${student.form} (${student.house} House)
Guardian / Debtor: ${student.parentName}
Academic Session: 2024–2025

FINANCIAL POSITION SUMMARY:
-------------------------------------------------------------
Total Billed Demand: ₹ ${student.totalBilled.toLocaleString("en-IN")}
Total Settled Credits: ₹ ${student.totalSettled.toLocaleString("en-IN")}
Net Balance Due: ₹ ${student.balanceDue.toLocaleString("en-IN")}
Account Status: ${student.balanceDue === 0 ? "BALANCED & CLEARED" : "OUTSTANDING ARREARS"}

CHRONOLOGICAL TRANSACTION TIMELINE:
-------------------------------------------------------------
${txLines}

Accounts Officer / Bursar
${instName} • Agragati OS`;

    setPreviewDoc({
      isOpen: true,
      title: `Student Ledger - ${student.studentName}`,
      fileName: `Ledger_${student.admissionNumber}_${student.studentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: student.studentName,
        form: student.form,
        house: student.house,
        institutionName: instName,
        institutionAffiliation: "School OS Financial Management System",
        institutionAddress: "",
        academicSession: "2024–2025",
      },
    });
  };

  const handleExportAllLedgers = () => {
    const lines = ledgers
      .map(
        (l) =>
          `• ${l.studentName} (${l.admissionNumber}, ${l.form}, ${l.house})\n  Guardian: ${l.parentName}\n  Billed: ₹ ${l.totalBilled.toLocaleString("en-IN")} | Settled: ₹ ${l.totalSettled.toLocaleString("en-IN")} | Due: ₹ ${l.balanceDue.toLocaleString("en-IN")}`
      )
      .join("\n\n");

    const instName = school?.name || "School";
    const content = `${instName.toUpperCase()} • CONSOLIDATED STUDENT LEDGERS REGISTER
=============================================================
Academic Session: 2024–2025 Fiscal Report
Total Tracked Scholars: ${ledgers.length}
Total Billed Demand: ₹ ${totalBilled.toLocaleString("en-IN")}
Total Settled Credits: ₹ ${totalSettled.toLocaleString("en-IN")}
Total Outstanding Arrears: ₹ ${totalBalanceDue.toLocaleString("en-IN")}

STUDENT-WISE LEDGER SUMMARY:
-------------------------------------------------------------
${lines}

Bursary & Accounts Division • ${instName}
Managed via Agragati School Management OS`;

    setPreviewDoc({
      isOpen: true,
      title: "Consolidated Student Ledgers Register",
      fileName: `Consolidated_Student_Ledgers_${new Date().toISOString().split("T")[0]}.pdf`,
      content,
      studentMeta: {
        name: "Consolidated Accounts Register",
        form: "All Forms & Sections",
        institutionName: instName,
        institutionAffiliation: "School OS Financial Management System",
        institutionAddress: "",
        academicSession: "2024–2025",
      },
    });
  };

  const getAvatarStyle = (index: number) => {
    const colors = [
      { bg: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]" },
      { bg: "bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]" },
      { bg: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]" },
      { bg: "bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]" },
    ];
    return colors[index % colors.length];
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
                DOUBLE-ENTRY ACCOUNTS
              </span>
              <span className="text-slate-300 dark:text-stone-700 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                {ledgers.length} Student Ledgers Tracked
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Student Fee Ledgers &amp; Accounts
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Audit granular debit fee demands, BHIM UPI/NEFT credits, merit scholarships, and real-time account balances per enrolled student.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Inspirational pill card */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif italic text-xs font-semibold text-slate-800 dark:text-stone-200 leading-tight">
                  Every student. Every account.
                </span>
                <span className="font-serif italic text-xs text-slate-500">A brighter tomorrow.</span>
                <div className="w-8 h-0.5 bg-[#D97706] rounded-full mt-1" />
              </div>
            </div>

            <Button
              onClick={handleExportAllLedgers}
              className="bg-[#1E3A8A] hover:bg-[#172554] text-white gap-2 text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export All Ledgers (CSV)
            </Button>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Billed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Billed (Fiscal YTD)
              </span>
              <div className="font-serif text-3xl font-bold text-[#0F172A] dark:text-stone-100 mt-0.5">
                {formatIndianCurrency(totalBilled || 510000)}
              </div>
              <span className="text-[11px] text-slate-500 block">For {ledgers.length} tracked students</span>
            </div>
          </div>

          {/* Card 2: Total Settled */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Settled (Credits)
              </span>
              <div className="font-serif text-3xl font-bold text-[#166534] dark:text-emerald-400 mt-0.5">
                {formatIndianCurrency(totalSettled || 450000)}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {totalBilled > 0 ? ((totalSettled / totalBilled) * 100).toFixed(1) : "88.2"}% collection rate
              </span>
            </div>
          </div>

          {/* Card 3: Net Outstanding Arrears */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Net Outstanding Arrears
              </span>
              <div className="font-serif text-3xl font-bold text-[#B91C1C] dark:text-rose-400 mt-0.5">
                {formatIndianCurrency(totalBalanceDue || 60000)}
              </div>
              <span className="text-[11px] text-rose-600 font-medium block">
                {overdueCount} students with pending dues
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, admission #, parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 text-xs text-[#0F172A] dark:text-stone-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: `All Accounts (${ledgers.length})` },
              { id: "SETTLED", label: `Settled (${settledCount})` },
              { id: "PENDING", label: `Pending (1)` },
              { id: "OVERDUE", label: `Overdue (${overdueCount})` },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedStatus === st.id
                    ? "bg-[#0F2942] text-white shadow-xs"
                    : "bg-white dark:bg-[#12161f] text-slate-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-slate-50"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledgers Table Card */}
        <div className="rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#161B26] border-b border-slate-200/70 dark:border-stone-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">STUDENT DETAILS</th>
                  <th className="py-3.5 px-4 font-semibold">PARENT / GUARDIAN</th>
                  <th className="py-3.5 px-4 font-semibold text-right">TOTAL BILLED</th>
                  <th className="py-3.5 px-4 font-semibold text-right">TOTAL SETTLED</th>
                  <th className="py-3.5 px-4 font-semibold text-right">BALANCE DUE</th>
                  <th className="py-3.5 px-4 font-semibold text-center">STATUS</th>
                  <th className="py-3.5 px-4 font-semibold">LAST TX DATE</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {filteredLedgers.map((student, index) => {
                  const avatar = getAvatarStyle(index);
                  const initials = student.studentName
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("");

                  return (
                    <tr
                      key={student.studentId}
                      className="hover:bg-slate-50/70 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${avatar.bg}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] dark:text-stone-100 block text-xs">
                              {student.studentName}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400 block">
                              {student.admissionNumber}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {student.form} • {student.house} House
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-stone-300">
                        {student.parentName}
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-slate-700 dark:text-stone-300">
                        {formatIndianCurrency(student.totalBilled)}
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-slate-700 dark:text-stone-300">
                        {formatIndianCurrency(student.totalSettled)}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-sm">
                        <span
                          className={
                            student.balanceDue === 0
                              ? "text-[#16A34A]"
                              : "text-[#DC2626]"
                          }
                        >
                          {formatIndianCurrency(student.balanceDue)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
                            student.balanceDue === 0
                              ? "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-[#FEE2E2] text-[#B91C1C] dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {student.balanceDue === 0 ? "BALANCED" : "OVERDUE"}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                        {student.lastTransactionDate}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-100 border-slate-200 dark:border-stone-700 gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                          Inspect Ledger
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspect Student Ledger Drilldown Modal */}
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent ? `Ledger: ${selectedStudent.studentName} (${selectedStudent.admissionNumber})` : "Student Ledger"}
          description="Granular chronological double-entry timeline for tuition demands, UPI credits, and merit scholarships."
          maxWidth="2xl"
        >
          {selectedStudent && (
            <div className="space-y-6">
              {/* Telemetry Strip */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Billed</span>
                  <span className="font-serif text-base font-bold text-[#0F172A]">
                    {formatIndianCurrency(selectedStudent.totalBilled)}
                  </span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Settled</span>
                  <span className="font-serif text-base font-bold text-[#16A34A]">
                    {formatIndianCurrency(selectedStudent.totalSettled)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Balance Due</span>
                  <span
                    className={`font-serif text-base font-bold ${
                      selectedStudent.balanceDue === 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                    }`}
                  >
                    {formatIndianCurrency(selectedStudent.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Transactions Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                    Transaction History
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportSingleLedger(selectedStudent)}
                      className="text-xs h-8 gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Statement (PDF)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsTxModalOpen(true)}
                      className="bg-[#A36829] hover:bg-[#8C531B] text-white text-xs h-8 gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Post Entry
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                  {(selectedStudent.transactions || []).map((tx: LedgerTransaction) => (
                    <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50/60">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            tx.type === "CREDIT_PAYMENT"
                              ? "bg-[#DCFCE7] text-[#16A34A]"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                          }`}
                        >
                          {tx.type === "CREDIT_PAYMENT" ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-xs text-[#0F172A]">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{tx.date}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="font-mono text-[10px] text-slate-400">{tx.referenceNo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-serif text-sm font-bold block ${
                            tx.type === "CREDIT_PAYMENT" ? "text-[#16A34A]" : "text-[#DC2626]"
                          }`}
                        >
                          {tx.type === "CREDIT_PAYMENT" ? "-" : "+"} {formatIndianCurrency(tx.amount || tx.debit || tx.credit || 0)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Bal: {formatIndianCurrency(tx.runningBalance)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Post Manual Transaction Modal */}
        <Modal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          title="Post Double-Entry Ledger Entry"
          description="Directly debit fee levy or credit offline cash/cheque receipt to student account."
          maxWidth="md"
        >
          {txSuccess ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Transaction Posted</h3>
              <p className="text-xs text-slate-500">The double-entry ledger has been updated.</p>
            </div>
          ) : (
            <form onSubmit={handlePostTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Type</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#A36829]"
                  value={txData.type}
                  onChange={(e) => setTxData({ ...txData, type: e.target.value as any })}
                >
                  <option value="CREDIT_PAYMENT">Credit (Offline / Cheque / Fee Waiver)</option>
                  <option value="DEBIT_FEE">Debit (Ad-hoc Fee / Exam Levy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Narration</label>
                <Input
                  required
                  placeholder="e.g. Offline Demand Draft Cleared (Ref: SBIN-84920)"
                  value={txData.description}
                  onChange={(e) => setTxData({ ...txData, description: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <Input
                  type="number"
                  required
                  value={txData.amount}
                  onChange={(e) => setTxData({ ...txData, amount: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTxModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={txSubmitting}
                  className="bg-[#A36829] hover:bg-[#8C531B] text-white text-xs font-semibold"
                >
                  {txSubmitting ? "Committing..." : "Commit Transaction"}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Bottom Banner */}
        <FinanceQuoteBanner
          icon={<BarChart3 className="w-6 h-6 text-[#A36829]" />}
          iconBgClass="bg-[#FDF6EC] text-[#A36829]"
          title="Transparent Finances. Stronger Futures."
          subtitle="Accurate records help build a better learning experience for every student."
          quote="Good financial management today, brighter opportunities tomorrow."
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

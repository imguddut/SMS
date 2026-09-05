"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  fetchEnrolledWards,
  fetchWardInvoices,
  payInvoice,
  ParentWardProfile,
  WardFeeInvoice,
} from "@/lib/db/parent";
import { formatIndianCurrency } from "@/lib/utils";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import {
  Receipt,
  Download,
  CreditCard,
  QrCode,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Eye,
  Clock,
  Sparkles,
  Phone,
  Mail,
  FileCheck,
  TrendingUp,
  Landmark,
  FileText,
  HelpCircle,
  Lock,
} from "lucide-react";

export default function ParentFeesPage() {
  const [wards, setWards] = React.useState<ParentWardProfile[]>([]);
  const [selectedWardId, setSelectedWardId] = React.useState<string>("ward-01");
  const [invoices, setInvoices] = React.useState<WardFeeInvoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  // QR Modal & Payment State
  const [selectedInvoice, setSelectedInvoice] = React.useState<WardFeeInvoice | null>(null);
  const [isPaying, setIsPaying] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [receiptRef, setReceiptRef] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      try {
        const wardsData = await fetchEnrolledWards();
        setWards(wardsData);
        const activeId = selectedWardId || (wardsData[0] ? wardsData[0].id : "ward-01");
        const invData = await fetchWardInvoices(activeId);
        setInvoices(invData);
      } catch (err) {
        console.error("Failed to load invoices", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedWardId]);

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleSettleInvoice = async (invoice: WardFeeInvoice) => {
    setIsPaying(true);
    try {
      const res = await payInvoice(invoice.id, "BHIM UPI QR (SBI e-Pay)");
      setReceiptRef(res.receiptRef);
      setPaymentSuccess(true);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoice.id
            ? {
                ...inv,
                status: "PAID",
                paidDate: new Date().toISOString().split("T")[0],
                paymentMethod: "BHIM UPI Instant Settlement",
              }
            : inv
        )
      );
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedInvoice(null);
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  const handleDownloadInvoiceReceipt = (invoice: WardFeeInvoice) => {
    const wardName = activeWard ? activeWard.name : "Aarav Sharma";
    const wardForm = activeWard ? activeWard.form : "Class 12-A";
    const wardRoll = activeWard ? activeWard.rollNumber : "ADM-2024-001";
    const wardHouse = activeWard ? activeWard.house : "Tagore House";

    const content = `AGRAGATI ACADEMY - OFFICIAL FEE RECEIPT
=============================================================
Receipt Ref: REC-${invoice.id.toUpperCase()}-${Date.now().toString().slice(-6)}
Student Name: ${wardName}
Roll Number: ${wardRoll} (${wardForm})
Invoice Code: ${invoice.invoiceNumber}
Description: ${invoice.description}
Billing Term: ${invoice.termName}
Amount Paid: ${formatIndianCurrency(invoice.amount)}
Payment Status: ${invoice.status}
Payment Mode: ${invoice.paymentMethod || "BHIM UPI / Net Banking Instant Settlement"}
Settlement Date: ${invoice.paidDate || new Date().toISOString().split("T")[0]}

ACCOUNTS OFFICE VERIFICATION:
Received with thanks on behalf of Agragati Academy Accounts Directorate.
Verification Hash: TAX-REC-2025-${invoice.id.toUpperCase()}-VERIFIED`;

    setPreviewDoc({
      isOpen: true,
      title: `Fee Payment Receipt • ${invoice.invoiceNumber}`,
      fileName: `Fee_Receipt_${invoice.invoiceNumber}.pdf`,
      content,
      studentMeta: {
        name: wardName,
        form: wardForm,
        rollNumber: wardRoll,
        house: wardHouse,
      },
    });
  };

  const handleDownloadFeeStructure = () => {
    const wardName = activeWard ? activeWard.name : "Aarav Sharma";
    const wardForm = activeWard ? activeWard.form : "Class 12-A";
    const wardRoll = activeWard ? activeWard.rollNumber : "ADM-2024-001";
    const wardHouse = activeWard ? activeWard.house : "Tagore House";

    const content = `AGRAGATI ACADEMY - SENIOR SECONDARY FEE SCHEDULE (2024-2025)
=============================================================
Class: Class 11 & Class 12 (CBSE Science & Artificial Intelligence Stream)

1. Term 1 Tuition & Composite Lab Fee: ₹ 48,500 (Due: 15 July 2024)
2. Term 2 Examination & Digital School OS Fee: ₹ 48,500 (Due: 15 January 2025)
3. Annual Composite Science Laboratory & ATL Innovation Club Fee: ₹ 14,200
4. Annual CBSE Pre-Board Examination Registration & APAAR Assessment Fee: ₹ 4,800

PAYMENT MODES ACCEPTED:
- Instant UPI: Google Pay, PhonePe, Paytm, BHIM (Zero Convenience Fee)
- NEFT / RTGS Net Banking to Agragati Educational Trust Account
- On-Campus Point of Sale (POS) Desk: Accounts Annex (Room 104)

Director of Finance • Agragati Academy`;

    setPreviewDoc({
      isOpen: true,
      title: "Senior Secondary Fee Structure (2024–2025)",
      fileName: "Agragati_Class12_Fee_Structure_2024_2025.pdf",
      content,
      studentMeta: {
        name: wardName,
        form: wardForm,
        rollNumber: wardRoll,
        house: wardHouse,
      },
    });
  };

  const totalPaidSum = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + i.amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <AppShell
      role="PARENT"
      userName="Mr. Rajesh Sharma"
      userRoleTitle={`Parent • ${activeWard ? activeWard.name : "Aarav Sharma"}`}
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board)"
    >
      <div className="space-y-6">
        {/* Top Brow & Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-bold text-[#8C6D27] dark:text-amber-400 uppercase tracking-widest">
                FEE ACCOUNT &amp; DUES
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="font-sans text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Student: {activeWard?.name} ({activeWard?.form})
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              School Fees &amp; Online Payment
            </h1>
            <p className="font-sans text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              View fee invoices, download payment receipts, and pay online securely using UPI (Google Pay, PhonePe, Paytm, BHIM) or Net Banking.
            </p>
          </div>

          {/* Child Switcher */}
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
            {wards.map((w) => {
              const isActive = w.id === selectedWardId;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWardId(w.id)}
                  className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#8C6D27] text-white shadow-xs"
                      : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  {w.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Outstanding Balance */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/40 text-[#F43F5E] flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                PENDING FEE BALANCE
              </span>
              <div className="font-serif text-3xl font-bold text-[#E11D48] mt-1">
                {formatIndianCurrency(pendingAmount > 0 ? pendingAmount : 36250)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300">
                  Payment Pending (Due Feb 05)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Settled (Fiscal YTD) */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                TOTAL FEES PAID (2024–2025)
              </span>
              <div className="font-serif text-3xl font-bold text-[#059669] mt-1">
                {formatIndianCurrency(totalPaidSum > 0 ? totalPaidSum : 108750)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300">
                  All Previous Dues Cleared
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Accepted Payment Modes */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/40 text-[#8B5CF6] flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                PAYMENT METHODS
              </span>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                UPI &amp; Net Banking
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-700 dark:text-stone-300">Google Pay</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-700 dark:text-stone-300">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-700 dark:text-stone-300">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-700 dark:text-stone-300">BHIM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Issued Fee Demands & Receipts Table */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 md:p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Fee Invoices &amp; Payment Receipts
              </h3>
            </div>
            <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              ACADEMIC YEAR 2024–2025
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                  <th className="py-3.5 px-5">INVOICE NO</th>
                  <th className="py-3.5 px-5">TERM &amp; PARTICULARS</th>
                  <th className="py-3.5 px-5 text-right">AMOUNT</th>
                  <th className="py-3.5 px-5">DUE DATE</th>
                  <th className="py-3.5 px-5 text-center">STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-stone-900 dark:text-stone-100">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-5 max-w-sm">
                      <div className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                        {inv.termName}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {inv.description}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                      {formatIndianCurrency(inv.amount)}
                    </td>
                    <td className="py-4 px-5 font-mono text-stone-600 dark:text-stone-400 text-xs">
                      {inv.dueDate}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === "PAID"
                            ? "bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300"
                            : "bg-[#FEF3C7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {inv.status === "PAID" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-semibold shadow-xs transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Online</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card: Quick UPI Payment (7 Cols) */}
          <div className="lg:col-span-7 bg-[#FFFDF7] dark:bg-[#151922] rounded-2xl border border-amber-200/80 dark:border-stone-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-amber-200/60 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      Pay via UPI QR Code
                    </h3>
                    <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                      Scan with Google Pay, PhonePe, Paytm, BHIM or any UPI app
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  Instant Update
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* QR Code Container */}
                <div className="sm:col-span-5 flex flex-col items-center">
                  <div className="p-3 bg-white dark:bg-white rounded-2xl border-2 border-stone-200 shadow-sm">
                    {/* SVG Vector QR Code */}
                    <div className="w-32 h-32 relative flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Corner Targets */}
                        <rect x="5" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                        <rect x="9" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                        <rect x="13" y="13" width="12" height="12" rx="1" fill="#0F172A" />

                        <rect x="67" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                        <rect x="71" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                        <rect x="75" y="13" width="12" height="12" rx="1" fill="#0F172A" />

                        <rect x="5" y="67" width="28" height="28" rx="4" fill="#0F172A" />
                        <rect x="9" y="71" width="20" height="20" rx="2" fill="#FFFFFF" />
                        <rect x="13" y="75" width="12" height="12" rx="1" fill="#0F172A" />

                        {/* Random Patterns */}
                        <rect x="38" y="10" width="8" height="8" fill="#0F172A" />
                        <rect x="50" y="10" width="8" height="8" fill="#0F172A" />
                        <rect x="38" y="24" width="6" height="6" fill="#0F172A" />
                        <rect x="48" y="22" width="10" height="8" fill="#0F172A" />

                        <rect x="10" y="38" width="8" height="8" fill="#0F172A" />
                        <rect x="22" y="44" width="8" height="8" fill="#0F172A" />
                        <rect x="10" y="52" width="6" height="6" fill="#0F172A" />

                        {/* Center Brand Badge */}
                        <rect x="36" y="36" width="28" height="28" rx="6" fill="#8C6D27" />
                        <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
                        <text x="50" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#8C6D27" fontFamily="sans-serif">₹</text>

                        {/* Bottom & Right Patterns */}
                        <rect x="38" y="70" width="8" height="8" fill="#0F172A" />
                        <rect x="50" y="68" width="10" height="10" fill="#0F172A" />
                        <rect x="70" y="40" width="8" height="8" fill="#0F172A" />
                        <rect x="82" y="48" width="8" height="8" fill="#0F172A" />
                        <rect x="70" y="70" width="10" height="10" fill="#0F172A" />
                        <rect x="84" y="80" width="8" height="8" fill="#0F172A" />
                      </svg>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-stone-700 dark:text-stone-300 mt-2">
                    dps.fees@hdfcbank
                  </span>
                </div>

                {/* Secure Payments Checklist */}
                <div className="sm:col-span-7 border-t sm:border-t-0 sm:border-l border-amber-200/60 dark:border-stone-800 pt-4 sm:pt-0 sm:pl-6 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#8C6D27]" />
                    <span>Safe &amp; Instant Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Fee Receipt Download</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto Payment Update in Portal</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Encrypted &amp; Secure (NPCI / RBI)</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Receipt sent instantly via SMS &amp; Email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Need Help? (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                    Accounts Helpdesk
                  </h3>
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                    For fee queries or challan assistance, contact:
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Building2 className="w-4 h-4 text-stone-400" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">School Accounts Office</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-900 dark:text-stone-100">+91 11 2617 8812</div>
                    <div className="text-[10px] text-stone-400">Mon – Sat, 8:00 AM – 5:30 PM</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="font-medium text-stone-800 dark:text-stone-200">accounts@kingscollege.edu.in</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileCheck className="w-4 h-4 text-[#8C6D27]" />
                <div>
                  <div className="font-bold text-stone-800 dark:text-stone-200">Fee Structure PDF</div>
                  <div className="text-[10px] text-stone-400">Download fee structure (2024–2025)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadFeeStructure}
                className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 flex items-center justify-center transition-colors"
                title="Download Fee Structure (PDF)"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Motivational Bottom Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFBF0] dark:bg-[#171d29] border border-amber-200/80 dark:border-amber-900/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Investing in Education. Building a Brighter Tomorrow.
              </h3>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Thank you for supporting {activeWard?.name.split(" ")[0] || "Aarav"}&apos;s schooling journey.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-serif italic text-xs md:text-sm text-stone-700 dark:text-stone-300">
              &ldquo;Education is the foundation for a brighter future.&rdquo;
            </p>
          </div>
        </div>

        {/* Receipt / Payment Modal */}
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={selectedInvoice?.status === "PAID" ? "Official Fee Receipt" : "Pay School Fees Online"}
          description={`Invoice #${selectedInvoice?.invoiceNumber} • ${selectedInvoice?.termName}`}
          maxWidth="lg"
        >
          {selectedInvoice && (
            <div className="space-y-4">
              {paymentSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    Payment Successful!
                  </h3>
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                    Payment Reference: <strong className="font-mono text-stone-900 dark:text-stone-100">{receiptRef}</strong>
                  </p>
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                    Your fee payment has been confirmed. Receipt has been emailed to you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Receipt Header */}
                  <div className="p-4 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 flex justify-between items-start">
                    <div>
                      <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 block">
                        Delhi Public School, R.K. Puram
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Sector XII, R.K. Puram, New Delhi – 110022
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedInvoice.status === "PAID"
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : "bg-[#FEF3C7] text-[#B45309]"
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>

                  {/* Student & Fee Summary */}
                  <div className="p-4 bg-white dark:bg-[#151922] rounded-xl border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div>
                        <span className="text-stone-400 text-[11px] block">Student Name:</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">{activeWard?.name}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[11px] block">Class &amp; Section:</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">{activeWard?.form}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-stone-600 dark:text-stone-400">{selectedInvoice.description}</span>
                      <span className="font-bold font-serif text-sm text-stone-900 dark:text-stone-100">
                        {formatIndianCurrency(selectedInvoice.amount)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                      <span className="font-bold text-stone-900 dark:text-stone-100">Total Amount:</span>
                      <span className="font-serif text-base font-bold text-[#8C6D27]">
                        {formatIndianCurrency(selectedInvoice.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoiceReceipt(selectedInvoice)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8C6D27]" />
                      <span>Download Receipt (PDF)</span>
                    </button>

                    {selectedInvoice.status !== "PAID" ? (
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={() => handleSettleInvoice(selectedInvoice)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isPaying ? "Processing Payment..." : `Pay ${formatIndianCurrency(selectedInvoice.amount)}`}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(null)}
                        className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>

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
    </AppShell>
  );
}

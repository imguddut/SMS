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
  fetchFinanceInvoices,
  createFinanceInvoice,
  FinanceInvoiceItem,
} from "@/lib/db/finance";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { FinanceQuoteBanner } from "@/components/ui/finance-quote-banner";
import { useAuth } from "@/components/providers/auth-context";
import {
  Receipt,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  FileSpreadsheet,
  Building2,
  CreditCard,
  Sparkles,
  GraduationCap,
  FileText,
  Users,
} from "lucide-react";

export default function InvoicesPage() {
  const { profile, school } = useAuth();
  const [invoices, setInvoices] = React.useState<FinanceInvoiceItem[]>([]);
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

  // Issue Demand Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    studentName: "",
    admissionNumber: "",
    form: "Class 12-A",
    house: "Tagore",
    termName: "Term 2 (Quarter 3)",
    parentName: "",
    amount: 36250,
    dueDate: "2025-01-31",
  });

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFinanceInvoices();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalInvoices = invoices.length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  const filteredInvoices = invoices.filter((inv) => {
    const parent = inv.parentName || inv.guardianName || "";
    const adm = inv.admissionNumber || "";
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "PAID" && inv.status === "PAID") ||
      (selectedStatus === "PENDING" && inv.status === "PENDING") ||
      (selectedStatus === "OVERDUE" && inv.status === "OVERDUE");
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newInv: FinanceInvoiceItem = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2025-00${invoices.length + 1}`,
        studentId: `stu-${Date.now()}`,
        studentName: formData.studentName,
        admissionNumber: formData.admissionNumber,
        form: formData.form,
        house: formData.house,
        guardianName: formData.parentName,
        parentName: formData.parentName,
        termName: formData.termName,
        amount: Number(formData.amount),
        currency: "INR",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate,
        paymentMethod: "BHIM UPI",
        status: "PENDING",
      };

      await createFinanceInvoice(newInv);
      setInvoices([newInv, ...invoices]);
      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setFormData({
          studentName: "",
          admissionNumber: "",
          form: "Class 12-A",
          house: "Tagore",
          termName: "Term 2 (Quarter 3)",
          parentName: "",
          amount: 36250,
          dueDate: "2025-01-31",
        });
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectInvoice = (inv: FinanceInvoiceItem) => {
    const admNo = inv.admissionNumber || "N/A";
    const parent = inv.parentName || inv.guardianName || "Guardian";
    const instName = school?.name || "School";
    const content = `${instName.toUpperCase()} • OFFICIAL FEE DEMAND INVOICE
=============================================================
Invoice Number: ${inv.invoiceNumber}
Issue Date: 2024-10-01
Due Date: ${inv.dueDate}
Status: ${inv.status}

STUDENT IDENTITY:
-------------------------------------------------------------
Student Name: ${inv.studentName}
Admission Number: ${admNo}
Class & Section: ${inv.form}
House Affiliation: ${inv.house}
Guardian / Debtor: ${parent}

FINANCIAL DEMAND BREAKDOWN:
-------------------------------------------------------------
Total Net Demand Payable: ₹ ${inv.amount.toLocaleString("en-IN")}

PAYMENT CHANNELS & SETTLEMENT:
• Direct Net Banking or UPI Transfer
• Receipt will be issued on confirmation

Accounts Officer / Bursar
${instName} • Agragati School Management OS`;

    setPreviewDoc({
      isOpen: true,
      title: `Invoice ${inv.invoiceNumber} - ${inv.studentName}`,
      fileName: `${inv.invoiceNumber}_${inv.studentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: inv.studentName,
        form: inv.form,
        house: inv.house,
        institutionName: instName,
        institutionAffiliation: "School OS Financial Management System",
        institutionAddress: "",
        academicSession: "2024–2025",
      },
    });
  };

  const getAvatarStyle = (index: number) => {
    const colors = [
      { bg: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]", label: "blue" },
      { bg: "bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]", label: "purple" },
      { bg: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]", label: "green" },
      { bg: "bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]", label: "pink" },
    ];
    return colors[index % colors.length];
  };

  return (
    <AppShell
      role="ACCOUNTANT"
      userName={profile?.full_name || "Accounts Officer"}
      userRoleTitle="Accounts Officer & Bursar"
      epochText="Term 2 (CBSE) • Academic Year 2024–2025"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-bold text-[#A36829] uppercase tracking-wider">
                RECEIVABLES &amp; FEE DEMANDS
              </span>
              <span className="text-slate-300 dark:text-stone-700 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">
                {invoices.length} Total Issued Invoices
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Term Invoices Register
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Audit and issue official Indian School Board fee demands with BHIM UPI QR codes, virtual accounts, and auto-receipt generation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#A36829] hover:bg-[#8C531B] text-white gap-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Generate Term Invoice
            </Button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Invoices */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Invoices
              </span>
              <div className="font-serif text-3xl font-bold text-[#0F172A] dark:text-stone-100 mt-0.5">
                {totalInvoices}
              </div>
              <span className="text-[11px] text-slate-500 block">Issued this term</span>
            </div>
          </div>

          {/* Card 2: Paid */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Paid
              </span>
              <div className="font-serif text-3xl font-bold text-[#166534] dark:text-emerald-400 mt-0.5">
                {paidCount}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0}% of invoices
              </span>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Pending
              </span>
              <div className="font-serif text-3xl font-bold text-[#B45309] dark:text-amber-400 mt-0.5">
                {pendingCount}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {totalInvoices > 0 ? Math.round((pendingCount / totalInvoices) * 100) : 0}% of invoices
              </span>
            </div>
          </div>

          {/* Card 4: Overdue */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Overdue
              </span>
              <div className="font-serif text-3xl font-bold text-[#B91C1C] dark:text-rose-400 mt-0.5">
                {overdueCount}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {totalInvoices > 0 ? Math.round((overdueCount / totalInvoices) * 100) : 0}% of invoices
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
              placeholder="Search by invoice #, student, guardian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-[#12161f] border border-stone-200/80 dark:border-stone-800 text-xs text-[#0F172A] dark:text-stone-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Invoices" },
              { id: "PAID", label: "Settled (Paid)" },
              { id: "PENDING", label: "Pending Settlement" },
              { id: "OVERDUE", label: "Overdue Arrears" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedStatus === st.id
                    ? "bg-[#A36829] text-white shadow-xs"
                    : "bg-white dark:bg-[#12161f] text-slate-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-slate-50"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table Card */}
        <div className="rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200/70 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#161B26] border-b border-slate-200/70 dark:border-stone-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">INVOICE REF</th>
                  <th className="py-3.5 px-4 font-semibold">STUDENT &amp; HOUSE</th>
                  <th className="py-3.5 px-4 font-semibold">GUARDIAN / DEBTOR</th>
                  <th className="py-3.5 px-4 font-semibold">TERM</th>
                  <th className="py-3.5 px-4 font-semibold text-right">AMOUNT (₹)</th>
                  <th className="py-3.5 px-4 font-semibold">DUE DATE</th>
                  <th className="py-3.5 px-4 font-semibold text-center">STATUS</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {filteredInvoices.map((inv, index) => {
                  const avatar = getAvatarStyle(index);
                  const initials = inv.studentName
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("");

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-[#0F172A] dark:text-stone-100">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${avatar.bg}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] dark:text-stone-100 block text-xs">
                              {inv.studentName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {inv.form} • {inv.house} House
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-stone-300">
                        {inv.parentName}
                      </td>

                      <td className="py-4 px-4 text-slate-600 dark:text-stone-400">
                        {inv.termName}
                      </td>

                      <td className="py-4 px-4 text-right font-serif text-sm font-bold text-[#0F172A] dark:text-stone-100">
                        {formatIndianCurrency(inv.amount)}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                        {inv.dueDate}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
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

                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInspectInvoice(inv)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-100 border-slate-200 dark:border-stone-700 gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Invoice Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue Student Fee Demand"
          description="Establish an authentic double-entry invoice demand against enrolled student account."
          maxWidth="lg"
        >
          {formSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Fee Demand Dispatched</h3>
              <p className="font-sans text-xs text-slate-500">
                Invoice registered and synced to parent portal and student ledger.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Admission Number
                  </label>
                  <Input
                    required
                    placeholder="e.g. ADM-2024-001"
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Class &amp; Section
                  </label>
                  <Input
                    required
                    placeholder="e.g. Class 12-A"
                    value={formData.form}
                    onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    House Affiliation
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-xs font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#A36829]"
                    value={formData.house}
                    onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                  >
                    <option value="Tagore">Tagore House</option>
                    <option value="Ashoka">Ashoka House</option>
                    <option value="Shivaji">Shivaji House</option>
                    <option value="Raman">Raman House</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Parent / Debtor Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Mr. Rajesh Sharma"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Invoice Demand Amount (₹)
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Academic Term
                  </label>
                  <Input
                    required
                    value={formData.termName}
                    onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-slate-700 mb-1">
                    Payment Due Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="text-xs font-mono"
                  />
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
                  {isSubmitting ? "Generating..." : "Issue Fee Demand"}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Bottom Banner */}
        <FinanceQuoteBanner
          icon={<GraduationCap className="w-6 h-6 text-[#A36829]" />}
          iconBgClass="bg-[#FDF6EC] text-[#A36829]"
          title="Timely Fee Management Builds Brighter Futures."
          subtitle="Collect. Reconcile. Support Education."
          quote="Transparent finances for a stronger tomorrow."
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

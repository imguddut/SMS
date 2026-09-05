"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  TrendingUp,
  CreditCard,
  Building2,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  FileText,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";
import {
  fetchPlatformBilling,
  PlatformBillingItem,
} from "@/lib/db/platform-admin";

export default function PlatformAdminBillingPage() {
  const [invoices, setInvoices] = React.useState<PlatformBillingItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = React.useState<PlatformBillingItem | null>(null);
  const [isExportingGst, setIsExportingGst] = React.useState(false);
  const [gstDownloaded, setGstDownloaded] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlatformBilling();
        setInvoices(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultInvoices: PlatformBillingItem[] = [
    {
      id: "inv-1",
      invoice_number: "GST-2025-001",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      plan_tier: "Institutional Enterprise Tier",
      billing_cycle: "ANNUAL",
      amount: 450000,
      currency: "INR",
      issue_date: "2025-01-01",
      payment_method: "Corporate NetBanking (HDFC Bank)",
      due_date: "2025-01-31",
      status: "PAID",
    },
    {
      id: "inv-2",
      invoice_number: "GST-2025-002",
      school_id: "s-2",
      school_name: "National Public School, Indiranagar",
      plan_tier: "Institutional Enterprise Tier",
      billing_cycle: "ANNUAL",
      amount: 450000,
      currency: "INR",
      issue_date: "2025-01-15",
      payment_method: "ICICI Bank",
      due_date: "2025-02-15",
      status: "PAID",
    },
    {
      id: "inv-3",
      invoice_number: "GST-2025-003",
      school_id: "s-3",
      school_name: "The Cathedral & John Connon School",
      plan_tier: "Pro Campus Plan",
      billing_cycle: "ANNUAL",
      amount: 250000,
      currency: "INR",
      issue_date: "2025-02-01",
      payment_method: "Corporate NetBanking",
      due_date: "2025-03-01",
      status: "PENDING",
    },
    {
      id: "inv-4",
      invoice_number: "GST-2024-098",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      plan_tier: "Smart Biometric & Bus Tracking Module Addon",
      billing_cycle: "ANNUAL",
      amount: 120000,
      currency: "INR",
      issue_date: "2024-11-10",
      payment_method: "Corporate NetBanking (SBI)",
      due_date: "2024-12-10",
      status: "PAID",
    },
  ];

  const invoiceList = invoices.length > 0 ? invoices : defaultInvoices;

  const handleDownloadGst = () => {
    setIsExportingGst(true);
    setTimeout(() => {
      setIsExportingGst(false);
      setGstDownloaded(true);
      setTimeout(() => setGstDownloaded(false), 3000);
    }, 1200);
  };

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                GST Compliant Billing
              </span>
              <span className="text-xs text-slate-500 font-medium">Auto UPI &amp; NetBanking reconciliation active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Billing &amp; Payments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              See your revenue, payments and school subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadGst}
              disabled={isExportingGst}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2 font-semibold shadow-xs text-xs"
            >
              {isExportingGst ? (
                <>Exporting GST Ledger...</>
              ) : gstDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Report Downloaded
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download GST Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1: Total Revenue */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 font-bold text-base">
                ₹
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ₹4.82 Cr
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% YoY growth
              </p>
            </div>
          </div>

          {/* 2: Collected This Period */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected This Period</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-emerald-600">
                ₹84,25,000
              </div>
              <p className="text-xs text-slate-500 mt-1">
                100% on-time settlement
              </p>
            </div>
          </div>

          {/* 3: Average Revenue per School */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Revenue per School</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ₹3,85,000
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Annual institutional contracts
              </p>
            </div>
          </div>

          {/* 4: Pending Payments */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Payments</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                Zero
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ₹0.00
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Zero defaulted tenancies
              </p>
            </div>
          </div>
        </div>

        {/* 3 Simple Subscription Plan Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Plan 1: Sovereign Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-500/60 dark:border-purple-500/40 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-xl">
                Most Popular
              </div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Sovereign Plan</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-purple-600">₹4,50,000</span>
                  <span className="text-xs text-slate-400 ml-1">/ year</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Full school management and advanced security
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full">
                  2 active schools
                </span>
                <span className="text-slate-400 font-medium">HSM Enclave included</span>
              </div>
            </div>

            {/* Plan 2: Enterprise Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Enterprise Plan</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-blue-600">₹2,50,000</span>
                  <span className="text-xs text-slate-400 ml-1">/ year</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  School management with standard features
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                  1 active school
                </span>
                <span className="text-slate-400 font-medium">Up to 2,000 students</span>
              </div>
            </div>

            {/* Plan 3: Foundation Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Foundation Plan</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">₹1,20,000</span>
                  <span className="text-xs text-slate-400 ml-1">/ year</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Basic school management
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  0 active schools
                </span>
                <span className="text-slate-400 font-medium">Essential modules</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                School subscription invoices and automated payment settlements
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {invoiceList.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">School</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {invoiceList.map((inv) => {
                  const isPaid = inv.status === "PAID";
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {inv.school_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inv.plan_tier}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                        {inv.due_date}
                      </td>
                      <td className="py-4 px-6">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
                            ✓ PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60">
                            ! PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 gap-1.5 h-8 px-3"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          View Invoice
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clean Invoice Details Modal */}
        {selectedInvoice && (
          <Modal
            isOpen={Boolean(selectedInvoice)}
            onClose={() => setSelectedInvoice(null)}
            title={`Invoice Details: ${selectedInvoice.invoice_number}`}
          >
            <div className="space-y-4 p-2 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedInvoice.school_name}</h4>
                  <span className="text-slate-500">{selectedInvoice.plan_tier}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedInvoice.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {selectedInvoice.status === "PAID" ? "✓ PAID" : "! PENDING"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[11px]">Due Date</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.due_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Method</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.payment_method || "Net Banking"}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Base Rate (Excl. GST):</span>
                  <span>₹{Math.round(selectedInvoice.amount / 1.18).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%):</span>
                  <span>₹{Math.round((selectedInvoice.amount - Math.round(selectedInvoice.amount / 1.18)) / 2).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9%):</span>
                  <span>₹{Math.round((selectedInvoice.amount - Math.round(selectedInvoice.amount / 1.18)) / 2).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-purple-600">₹{selectedInvoice.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    alert("Invoice receipt downloaded.");
                    setSelectedInvoice(null);
                  }}
                  className="bg-blue-600 text-white rounded-xl text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF Receipt
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

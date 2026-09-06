"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { SchoolCrest } from "@/components/ui/school-crest";
import { Modal } from "@/components/ui/modal";
import { formatIndianCurrency } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-context";
import {
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  Download,
  Building2,
  Crown,
  GraduationCap,
  Eye,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
} from "lucide-react";
import {
  fetchPlatformBilling,
  PlatformBillingItem,
} from "@/lib/db/platform-admin";

export default function PlatformAdminBillingPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = React.useState<PlatformBillingItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = React.useState<PlatformBillingItem | null>(null);
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

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalCollected = invoices.filter((inv) => inv.status === "PAID").reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalOverdue = invoices.filter((inv) => inv.status === "OVERDUE").reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const avgRevenue = invoices.length > 0 ? Math.round(totalRevenue / invoices.length) : 0;

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName={profile?.full_name || "Super Admin"}
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Central Administration • Cloud Network Active"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Platform Billing
              </span>
              <span className="text-xs text-slate-500 font-medium">
                › Subscriptions &amp; Invoicing
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Platform Billing &amp; Subscriptions
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Monitor school subscription plans, automated payment status, and invoices.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => alert("Downloading Billing Ledger (FY 2024-2025)...")}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Billing Report</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                Total Platform Revenue
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {formatIndianCurrency(totalRevenue)}
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                Active billing ledger
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                Average Revenue / School
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {formatIndianCurrency(avgRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Annual institutional contracts
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                Collected This Period
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {formatIndianCurrency(totalCollected)}
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                Settled receipts
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                Overdue Invoices
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {formatIndianCurrency(totalOverdue)}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Outstanding subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* 3 Tier Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Complete School Suite */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  2 Active Schools
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Complete School Suite
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹4,50,000</span>
                <span className="text-xs text-slate-500">/ yr</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Dedicated cryptographic partition, AI teacher copilot, multi-branch governance, unlimited student seats.
              </p>
            </div>
          </div>

          {/* Standard School Package */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  1 Active School
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Standard School Package
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹2,50,000</span>
                <span className="text-xs text-slate-500">/ yr</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Standard isolation, CBSE/ICSE marks entry, automated UPI fee reconciliation, up to 2,000 students.
              </p>
            </div>
          </div>

          {/* Essential Starter */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold">
                  0 Active Schools
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Essential Starter
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹1,20,000</span>
                <span className="text-xs text-slate-500">/ yr</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Essential SIS modules, basic ledger, single-campus administration, automated daily backup.
              </p>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              School Subscription Invoices
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Payment and billing history for all registered schools.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Institutional Node</th>
                  <th className="py-3.5 px-5">Plan &amp; Package</th>
                  <th className="py-3.5 px-5">Amount (₹)</th>
                  <th className="py-3.5 px-5">Due Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-sm font-medium">No subscription invoices recorded</p>
                      <p className="text-xs text-slate-400 mt-0.5">Platform invoices for active schools will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5 font-mono font-medium text-slate-800">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <SchoolCrest slug={inv.school_id} name={inv.school_name} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {inv.school_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {inv.payment_method}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {inv.plan_tier}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block">
                          {inv.billing_cycle} CYCLE
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {formatIndianCurrency(inv.amount)}
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>{inv.due_date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspect Invoice Modal */}
        {selectedInvoice && (
          <Modal
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            title={`Invoice Details • ${selectedInvoice.invoice_number}`}
          >
            <div className="space-y-4 py-2 font-sans text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedInvoice.school_name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{selectedInvoice.plan_tier}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg">₹{selectedInvoice.amount.toLocaleString("en-IN")}</p>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Billing Cycle</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.billing_cycle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Payment Channel</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.payment_method}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Due Date</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.due_date}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Statutory Tax Identification</span>
                  <span className="font-mono text-slate-800">GSTIN: 07AAACS1429B1Z0</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Institutional Sovereign Bottom Footer */}
        <PlatformAdminFooter />
      </div>
    </AppShell>
  );
}

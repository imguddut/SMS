"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { SchoolCrest } from "@/components/ui/school-crest";
import { Modal } from "@/components/ui/modal";
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
} from "lucide-react";
import {
  fetchPlatformBilling,
  PlatformBillingItem,
} from "@/lib/db/platform-admin";

export default function PlatformAdminBillingPage() {
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

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • India Central Cluster Online"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                Sovereign Treasury
              </span>
              <span className="text-xs text-slate-500 font-medium">
                › National Multi-School SaaS Billing Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Platform Billing &amp; Subscriptions
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Monitor institutional enterprise licenses, hardware enclave subscriptions, and automated Net Banking / UPI settlement fidelity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => alert("Downloading Annual GST Audit Ledger (FY 2024-2025)...")}
              className="h-10 px-4 rounded-xl bg-[#5839C2] hover:bg-[#4D30B0] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Annual GST Audit Ledger</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                Total Platform Run-Rate
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                ₹4.82 Cr
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                +14.2% YoY growth
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
                Average Revenue / Node (ARPU)
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                ₹3,85,000
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
                ₹84,25,000
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                100% on-time settlement
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
                Overdue Institutional Receivables
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                ₹0.00
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                Zero defaulted tenancies
              </p>
            </div>
          </div>
        </div>

        {/* 3 Tier Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Sovereign Fleet Tier */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                  2 Active Nodes
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Sovereign Fleet Tier
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹4,50,000</span>
                <span className="text-xs text-slate-500">/ yr</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Dedicated HSM cryptographic partition, AI teacher copilot, multi-branch fleet governance, unlimited student seats.
              </p>
            </div>
          </div>

          {/* Enterprise Campus */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  1 Active Node
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Enterprise Campus
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹2,50,000</span>
                <span className="text-xs text-slate-500">/ yr</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Standard tenant isolation, CBSE/ICSE marks entry, automated UPI fee reconciliation, up to 2,000 students.
              </p>
            </div>
          </div>

          {/* Foundation Academy */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  0 Active Nodes
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Foundation Academy
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
              Institutional Invoices &amp; Contract Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tenant platform contract billing history and automated settlements.
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
                {/* Row 1: DPS R.K. Puram */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-medium text-slate-800">
                    GST-2025-001
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="dps-rkpuram" name="Delhi Public School, R.K. Puram" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          Delhi Public School, R.K. Puram
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Corporate NetBanking (HDFC Bank)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-semibold text-slate-800 block text-xs">
                      Institutional Enterprise Tier
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block">
                      ANNUAL CYCLE
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">
                    ₹4,50,000
                  </td>
                  <td className="py-4 px-5 text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>2025-01-31</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice({
                          id: "1",
                          invoice_number: "GST-2025-001",
                          school_id: "a0eebc99",
                          school_name: "Delhi Public School, R.K. Puram",
                          plan_tier: "Institutional Enterprise Tier",
                          amount: 450000,
                          currency: "INR",
                          status: "PAID",
                          billing_cycle: "ANNUAL",
                          issue_date: "2025-01-01",
                          due_date: "2025-01-31",
                          payment_method: "Corporate NetBanking (HDFC Bank)",
                        })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>Inspect</span>
                      </button>
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2: NPS Indiranagar */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-medium text-slate-800">
                    GST-2025-002
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="nps-indiranagar" name="National Public School, Indiranagar" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          National Public School, Indiranagar
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (ICICI Bank)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-semibold text-slate-800 block text-xs">
                      Institutional Enterprise Tier
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block">
                      ANNUAL CYCLE
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">
                    ₹4,50,000
                  </td>
                  <td className="py-4 px-5 text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>2025-02-15</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice({
                          id: "2",
                          invoice_number: "GST-2025-002",
                          school_id: "b0eebc99",
                          school_name: "National Public School, Indiranagar",
                          plan_tier: "Institutional Enterprise Tier",
                          amount: 450000,
                          currency: "INR",
                          status: "PAID",
                          billing_cycle: "ANNUAL",
                          issue_date: "2025-01-15",
                          due_date: "2025-02-15",
                          payment_method: "Corporate NetBanking (ICICI Bank)",
                        })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>Inspect</span>
                      </button>
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 3: The Cathedral & John Connon School */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-medium text-slate-800">
                    GST-2025-003
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="cathedral-mumbai" name="The Cathedral & John Connon School" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          The Cathedral &amp; John Connon School
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-semibold text-slate-800 block text-xs">
                      Pro Campus
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block">
                      ANNUAL CYCLE
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">
                    ₹2,50,000
                  </td>
                  <td className="py-4 px-5 text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>2025-03-01</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Pending
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice({
                          id: "3",
                          invoice_number: "GST-2025-003",
                          school_id: "c0eebc99",
                          school_name: "The Cathedral & John Connon School",
                          plan_tier: "Pro Campus",
                          amount: 250000,
                          currency: "INR",
                          status: "PENDING",
                          billing_cycle: "ANNUAL",
                          issue_date: "2025-02-01",
                          due_date: "2025-03-01",
                          payment_method: "Corporate NetBanking (Axis Bank)",
                        })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>Inspect</span>
                      </button>
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 4: DPS Biometric Addon */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-medium text-slate-800">
                    GST-2024-098
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="dps-rkpuram" name="Delhi Public School, R.K. Puram" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          Delhi Public School, R.K. Puram
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Corporate NetBanking (SBI)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-semibold text-slate-800 block text-xs">
                      Smart Biometric &amp; Bus Tracking Module Addon
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block">
                      ANNUAL CYCLE
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">
                    ₹1,20,000
                  </td>
                  <td className="py-4 px-5 text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>2024-12-10</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice({
                          id: "4",
                          invoice_number: "GST-2024-098",
                          school_id: "a0eebc99",
                          school_name: "Delhi Public School, R.K. Puram",
                          plan_tier: "Smart Biometric & Bus Tracking Module Addon",
                          amount: 120000,
                          currency: "INR",
                          status: "PAID",
                          billing_cycle: "ANNUAL",
                          issue_date: "2024-11-10",
                          due_date: "2024-12-10",
                          payment_method: "Corporate NetBanking (SBI)",
                        })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>Inspect</span>
                      </button>
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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

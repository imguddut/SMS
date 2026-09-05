"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatIndianCurrency } from "@/lib/utils";
import {
  Receipt,
  TrendingUp,
  CreditCard,
  Building2,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Layers,
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
      userRoleTitle="Platform Lead &amp; Super Admin"
      epochText="Multi-Tenant Sovereign Root • India Central Cluster Online"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Sovereign Treasury
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                National Multi-School SaaS Billing Engine
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Platform Billing &amp; Subscriptions
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Monitor institutional enterprise licenses, hardware enclave subscriptions, and automated Net Banking / UPI settlement fidelity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="font-sans gap-2">
              <Download className="w-4 h-4 text-secondary" /> Export Annual GST Audit Ledger
            </Button>
          </div>
        </div>

        {/* Top Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Total Platform Run-Rate
              </span>
              <Receipt className="w-5 h-5 text-secondary" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-secondary">
                ₹4.82 Cr
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#3D5B42]" /> +14.2% YoY growth
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Average Revenue / Node (ARPU)
              </span>
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                ₹3,85,000
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                Annual institutional contracts
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Collected This Period
              </span>
              <CreditCard className="w-5 h-5 text-[#3D5B42]" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-[#3D5B42]">
                ₹84,25,000
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                100% on-time settlement
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Overdue Institutional Receivables
              </span>
              <span className="text-xs font-bold text-[#3D5B42] bg-[#3D5B42]/10 px-2 py-0.5 rounded">
                Zero
              </span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                ₹0.00
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                Zero defaulted tenancies
              </div>
            </div>
          </Card>
        </div>

        {/* Plan Tier Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 border-secondary/40 bg-gradient-to-b from-surface to-secondary-container/10">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="gold">Flagship Tier</Badge>
              <span className="font-sans text-xs font-bold text-secondary">2 Active Nodes</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-primary">
              Sovereign Fleet Tier
            </h3>
            <div className="font-sans text-2xl font-bold text-primary my-2">
              ₹4,50,000 <span className="text-xs font-normal text-on-surface-variant">/ yr</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Dedicated HSM cryptographic partition, AI teacher copilot, multi-branch fleet governance, unlimited student seats.
            </p>
          </Card>

          <Card className="p-6 border-border/80">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="navy">Enterprise</Badge>
              <span className="font-sans text-xs font-bold text-primary">1 Active Node</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-primary">
              Enterprise Campus
            </h3>
            <div className="font-sans text-2xl font-bold text-primary my-2">
              ₹2,50,000 <span className="text-xs font-normal text-on-surface-variant">/ yr</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Standard tenant isolation, CBSE/ICSE marks entry, automated UPI fee reconciliation, up to 2,000 students.
            </p>
          </Card>

          <Card className="p-6 border-border/80 opacity-80">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="neutral">Foundation</Badge>
              <span className="font-sans text-xs text-on-surface-variant">0 Active Nodes</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-primary">
              Foundation Academy
            </h3>
            <div className="font-sans text-2xl font-bold text-primary my-2">
              ₹1,20,000 <span className="text-xs font-normal text-on-surface-variant">/ yr</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Essential SIS modules, basic ledger, single-campus administration, automated daily backup.
            </p>
          </Card>
        </div>

        {/* Institutional Invoices Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                Institutional Invoices &amp; Contract Records
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Multi-tenant platform contract billing history and automated settlements.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Institutional Node</th>
                  <th className="py-3.5 px-6">Plan &amp; Package</th>
                  <th className="py-3.5 px-6">Amount (₹)</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-primary">
                      {inv.invoice_number}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-medium text-primary">{inv.school_name}</div>
                      <div className="text-xs text-on-surface-variant">{inv.payment_method}</div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <span className="font-medium text-primary">{inv.plan_tier}</span>
                      <div className="text-on-surface-variant">{inv.billing_cycle} CYCLE</div>
                    </td>

                    <td className="py-4 px-6 font-serif text-base font-semibold text-primary">
                      {formatIndianCurrency(inv.amount)}
                    </td>

                    <td className="py-4 px-6 font-sans text-xs text-on-surface-variant">
                      {inv.due_date}
                    </td>

                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "active"
                            : inv.status === "PENDING"
                            ? "pending"
                            : "critical"
                        }
                        dot
                      >
                        {inv.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-xs gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-secondary" /> Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Invoice Inspection Modal */}
        {selectedInvoice && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedInvoice(null)}
            title={`Tax Invoice — ${selectedInvoice.invoice_number}`}
            maxWidth="lg"
          >
            <div className="space-y-6 font-sans">
              <div className="flex justify-between items-start border-b border-border/60 pb-4">
                <div>
                  <div className="font-serif text-lg font-bold text-primary">
                    Agragati School OS • India
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Sovereign Cloud Partition • Mumbai Data Center (CERT-In Empanelled)
                  </div>
                </div>
                <Badge variant={selectedInvoice.status === "PAID" ? "active" : "pending"} dot>
                  {selectedInvoice.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-on-surface-variant">Billed Institution:</div>
                  <div className="font-semibold text-primary mt-0.5 text-sm">
                    {selectedInvoice.school_name}
                  </div>
                  <div className="text-on-surface-variant mt-0.5">
                    Payment: {selectedInvoice.payment_method}
                  </div>
                </div>

                <div>
                  <div className="text-on-surface-variant">Invoice Details:</div>
                  <div className="font-mono text-primary mt-0.5">
                    Issue Date: {selectedInvoice.issue_date}
                  </div>
                  <div className="font-mono text-primary">Due Date: {selectedInvoice.due_date}</div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-border/70 rounded-lg overflow-hidden text-xs">
                <div className="bg-surface-variant/40 px-4 py-2 font-bold uppercase text-[10px] text-on-surface-variant flex justify-between">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-primary">
                      {selectedInvoice.plan_tier} (Annual SaaS Platform License)
                    </span>
                    <span className="font-serif font-bold text-primary">
                      {formatIndianCurrency(selectedInvoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>DPDP Act 2023 Cryptographic Vault Module</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>CBSE / DigiLocker APAAR Gateway Connector</span>
                    <span>Included</span>
                  </div>
                </div>
                <div className="bg-surface-variant/20 px-4 py-3 border-t border-border/60 flex justify-between font-bold text-sm">
                  <span>Total Settled (incl. 18% GST)</span>
                  <span className="font-serif text-secondary text-base">
                    {formatIndianCurrency(selectedInvoice.amount)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download Tax Invoice (PDF)
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

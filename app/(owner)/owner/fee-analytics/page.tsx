"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowLeft,
  FileSpreadsheet,
  Building2,
  Clock,
  Send,
  Check,
} from "lucide-react";
import {
  fetchFeeAnalytics,
  FeeAnalyticsData,
} from "@/lib/db/owner";
import { formatIndianCurrency } from "@/lib/utils";

export default function OwnerFeeAnalyticsPage() {
  const [data, setData] = React.useState<FeeAnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sentReminders, setSentReminders] = React.useState<Record<string, boolean>>({});
  const [batchNoticeSent, setBatchNoticeSent] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetchFeeAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSendReminder = (id: string) => {
    setSentReminders((prev) => ({ ...prev, [id]: true }));
  };

  const handleBatchNotice = () => {
    setBatchNoticeSent(true);
    setTimeout(() => setBatchNoticeSent(false), 3000);
  };

  return (
    <AppShell
      role="OWNER"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board) Financial Epoch"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Sovereign Treasury Analytics
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Base Currency: INR (₹) • BHIM UPI &amp; Net Banking Direct Feeds Active
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Fee Realization &amp; Fiscal Analytics
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Consolidated term fee realization velocity, aging receivables distribution, automated BHIM UPI / Net Banking reconciliation channels, and high-value student ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchNotice}
              className="font-sans gap-2 text-secondary border-secondary/40"
            >
              {batchNoticeSent ? (
                <>
                  <Check className="w-4 h-4 text-secondary" /> Reminders Dispatched
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-secondary" /> Issue Batch Reminders
                </>
              )}
            </Button>
            <Button variant="primary" size="sm" className="font-sans gap-2">
              <Download className="w-4 h-4 text-secondary-container" />
              Export Fiscal Audit Sheet
            </Button>
          </div>
        </div>

        {/* Top Financial KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Total Tuition Billed
              </span>
              <CreditCard className="w-5 h-5 text-secondary" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                {data ? formatIndianCurrency(data.totalBilled) : "₹12,45,00,000"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                FY 2024–2025 across 3 CBSE terms
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Total Realized to Date
              </span>
              <span className="font-bold text-xs text-[#3D5B42] bg-[#3D5B42]/10 px-2 py-0.5 rounded">
                94.6% Realized
              </span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-[#3D5B42]">
                {data ? formatIndianCurrency(data.totalCollected) : "₹11,78,00,000"}
              </div>
              <div className="font-sans text-xs text-[#3D5B42] font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +4.8% vs FY 2023–2024
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Total Outstanding
              </span>
              <AlertTriangle className="w-5 h-5 text-[#C9A24B]" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-secondary">
                {data ? formatIndianCurrency(data.totalBilled - data.totalCollected) : "₹67,00,000"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                5.4% of total billing cohort
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Bank Auto-Reconciliation
              </span>
              <span className="font-bold text-xs text-[#3D5B42]">99.8%</span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                1,802 / 1,806
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                Matched via 12-digit UPI UTR &amp; Direct Bank Feeds
              </div>
            </div>
          </Card>
        </div>

        {/* Term-by-Term Fee Progress & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Term Performance */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h3 className="font-serif text-xl font-medium text-primary">
                Term Collection Velocity
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Fee realization comparison across individual academic terms.
              </p>
            </div>

            <div className="space-y-5 font-sans text-xs">
              {data?.termBreakdown.map((t) => (
                <div key={t.term} className="p-4 rounded-lg bg-surface-variant/30 border border-border/60 space-y-2">
                  <div className="flex justify-between items-center font-medium">
                    <span className="font-serif text-base text-primary font-semibold">{t.term}</span>
                    <span className="text-secondary font-bold text-sm">{t.rate} Settled</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Collected: <strong className="text-primary">{formatIndianCurrency(t.collected)}</strong></span>
                    <span>Billed: <strong className="text-primary">{formatIndianCurrency(t.billed)}</strong></span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: t.rate }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Channels Breakdown */}
          <Card className="p-6 space-y-5">
            <div className="pb-4 border-b border-border/60">
              <h3 className="font-serif text-lg font-medium text-primary">
                Settlement Channels
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                BHIM UPI QR vs Net Banking / Direct Challan distribution.
              </p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              {data?.paymentMethods.map((m) => (
                <div key={m.method} className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-primary">{m.method}</span>
                    <span className="font-bold text-secondary">{m.percentage}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>{formatIndianCurrency(m.amount)}</span>
                    <span>{m.count} Transactions</span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: m.percentage }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Aging Receivables Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data?.agingSummary.map((bracket) => (
            <Card key={bracket.bracket} className="p-4 border-border/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {bracket.bracket}
              </div>
              <div className="font-serif text-2xl font-medium text-primary mt-1">
                {formatIndianCurrency(bracket.amount)}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-0.5">
                {bracket.count} student ledgers
              </div>
            </Card>
          ))}
        </div>

        {/* High-Value Receivables & Overdue Ledgers Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                High-Value Receivables &amp; Overdue Ledger Escalations
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Accounts requiring chancellor-level review or bursary governance notice.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Scholar &amp; Form</th>
                  <th className="py-3.5 px-6">Parent / Guardian</th>
                  <th className="py-3.5 px-6">Outstanding Balance</th>
                  <th className="py-3.5 px-6">Aging Interval</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Escalation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data?.overdueLedgers.map((led) => {
                  const isSent = sentReminders[led.id];
                  return (
                    <tr key={led.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-primary font-serif text-base leading-tight">
                          {led.studentName}
                        </div>
                        <div className="text-xs text-on-surface-variant">{led.form}</div>
                      </td>

                      <td className="py-4 px-6 text-xs font-medium text-primary">
                        {led.parentName}
                      </td>

                      <td className="py-4 px-6 font-serif text-base font-semibold text-secondary">
                        {formatIndianCurrency(led.amount)}
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <span className="font-mono font-bold text-primary">{led.daysOverdue} Days</span> Overdue
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            led.status === "CRITICAL"
                              ? "critical"
                              : led.status === "REMINDER_SENT"
                              ? "pending"
                              : "neutral"
                          }
                          dot
                        >
                          {led.status.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant={isSent ? "outline" : "primary"}
                          size="sm"
                          onClick={() => handleSendReminder(led.id)}
                          className="text-xs gap-1.5"
                        >
                          {isSent ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#3D5B42]" /> Notice Sent
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Issue Notice
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

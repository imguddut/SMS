"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Users,
  Building2,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
  IndianRupee,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function OwnerOverview() {
  return (
    <AppShell role="OWNER">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-primary">
              School Overview
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1">
              Check the total students, fee collection status, staff numbers, and school profit.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/owner/insights">
              <Button variant="outline" className="gap-2 text-primary font-semibold">
                <BrainCircuit className="w-4 h-4 text-secondary" />
                AI Advice
              </Button>
            </Link>
            <Link href="/owner/fee-analytics">
              <Button variant="primary" className="gap-2">
                <IndianRupee className="w-4 h-4 text-secondary-container" />
                Fee Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-secondary flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
              </div>
              <Badge variant="gold" className="text-[9px] px-1.5 py-0">Up 4.2%</Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">3,250</div>
              <div className="text-[10px] text-on-surface-variant font-medium mt-1">
                <span className="text-secondary font-bold">98.2%</span> stayed from last year
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-[#3D5B42] flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <IndianRupee className="w-4 h-4 text-[#3D5B42]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Fees Collected</span>
              </div>
              <Badge variant="gold" className="text-[9px] px-1.5 py-0 border-[#3D5B42] text-[#3D5B42]">Target 95%</Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">94.6%</div>
              <div className="text-[10px] text-[#3D5B42] font-semibold mt-1">
                +₹18.4 Lakhs this week
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-[#D97706] flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <AlertCircle className="w-4 h-4 text-[#D97706]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Fees</span>
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">₹24,86,000</div>
              <div className="text-[10px] text-on-surface-variant font-medium mt-1">
                72 students (4.1%) have not paid
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-[#7C3AED] flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Users className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Staff & Teachers</span>
              </div>
              <Badge variant="gold" className="text-[9px] px-1.5 py-0 border-[#7C3AED] text-[#7C3AED]">Stable</Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">148</div>
              <div className="text-[10px] text-on-surface-variant font-medium mt-1">
                1 teacher for every 12 students
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fee Collection Progress */}
          <Card className="md:col-span-2 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  Fee Collection Progress
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  How much fee we have collected for each term (in ₹)
                </p>
              </div>
              <Link href="/owner/fee-analytics">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-[11px]">
                  <PieChart className="w-3.5 h-3.5 text-secondary" />
                  Detailed Report
                </Button>
              </Link>
            </div>

            <div className="space-y-5 font-sans text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-[#3D5B42] font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 1 (Apr–Jul) • Completed
                  </span>
                  <span className="text-on-surface-variant font-bold">₹4.42 Cr / ₹4.50 Cr (98.2%)</span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="bg-[#3D5B42] h-full rounded-full" style={{ width: "98.2%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-secondary font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 2 (Aug–Nov) • Ongoing
                  </span>
                  <span className="text-on-surface-variant font-bold">₹3.98 Cr / ₹4.15 Cr (95.9%)</span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: "95.9%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-[#D97706] font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 3 (Dec–Mar) • Upcoming
                  </span>
                  <span className="text-on-surface-variant font-bold">₹3.38 Cr / ₹3.80 Cr (88.9%)</span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="bg-[#D97706] h-full rounded-full" style={{ width: "88.9%" }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Total Billed
                </div>
                <div className="font-serif text-lg font-medium text-primary mt-0.5">
                  ₹12.45 Cr
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Collected to Date
                </div>
                <div className="font-serif text-lg font-medium text-secondary mt-0.5">
                  ₹11.78 Cr
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Online Payment Success
                </div>
                <div className="font-serif text-lg font-medium text-[#3D5B42] mt-0.5">
                  99.8%
                </div>
              </div>
            </div>
          </Card>

          {/* AI Planning & Advice */}
          <Card className="p-6 bg-gradient-to-b from-surface to-secondary-container/10 border-secondary/40 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center shadow-sm">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  AI Planning & Advice
                </h3>
                <span className="font-sans text-[11px] text-secondary font-medium">
                  Smart Suggestions for School
                </span>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 rounded-lg bg-surface border border-secondary/30 space-y-1">
                <div className="flex items-center justify-between font-bold text-primary">
                  <span>Send Reminders Early</span>
                  <Badge variant="gold">High Impact</Badge>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Sending fee reminders 14 days before due date will help collect <strong>₹21,00,000</strong> faster.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border/70 space-y-1">
                <div className="flex items-center justify-between font-bold text-primary">
                  <span>Hostel is Getting Full</span>
                  <Badge variant="pending">94.7% Full</Badge>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Tagore House only has 8 beds left for next year.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link href="/owner/insights">
                <Button variant="primary" size="sm" className="w-full text-xs gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-secondary-container" />
                  See 4 Smart Suggestions
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Operational Quick Nav Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/owner/staff" className="group">
            <Card className="p-5 hover:border-secondary/60 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary-container transition-colors mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-primary">
                  Staff Details
                </h4>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  148 senior teachers across 4 departments. See their salary and duties.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-secondary flex items-center gap-1 mt-4">
                View Teachers List <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/owner/growth" className="group">
            <Card className="p-5 hover:border-secondary/60 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary-container transition-colors mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-primary">
                  Admissions Progress
                </h4>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  480 parents have inquired for admission. Track new student applications.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-secondary flex items-center gap-1 mt-4">
                View Admissions List <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/owner/settings" className="group">
            <Card className="p-5 hover:border-secondary/60 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary-container transition-colors mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-primary">
                  School Settings
                </h4>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Manage academic year, fee types, and basic school information.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-secondary flex items-center gap-1 mt-4">
                Change Settings <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

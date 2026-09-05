"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  fetchAIBusinessInsights,
  AIInsightItem,
} from "@/lib/db/owner";
import {
  fetchPredictiveRiskScholars,
  fetchFleetInstitutionalBenchmarks,
  fetchCashFlowMonteCarlo,
  runExecutiveScenarioSimulation,
  FleetBenchmarkItem,
  CashFlowMonteCarloForecast,
  ScenarioSimulationParams,
  ScenarioSimulationResult,
} from "@/lib/db/analytics";
import { formatIndianCurrency, formatIndianLakhsCrores } from "@/lib/utils";
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Building2,
  Layers,
  Scale,
  DollarSign,
  ArrowUpRight,
  Check,
  Send,
  RefreshCw,
} from "lucide-react";

export default function OwnerInsightsPage() {
  const [insights, setInsights] = React.useState<AIInsightItem[]>([]);
  const [benchmarks, setBenchmarks] = React.useState<FleetBenchmarkItem[]>([]);
  const [monteCarlo, setMonteCarlo] = React.useState<CashFlowMonteCarloForecast[]>([]);
  const [executedItems, setExecutedItems] = React.useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = React.useState<"STUDIO" | "PROPOSALS" | "BENCHMARKS">("STUDIO");
  const [isLoading, setIsLoading] = React.useState(true);

  // Interactive Simulation Parameters
  const [params, setParams] = React.useState<ScenarioSimulationParams>({
    feeAdjustmentPercent: 5, // +5%
    boardingExpansionBeds: 40, // +40 beds
    facultySalaryIndex: 105, // 105% (+5% incentive)
    bursaryAllocationInr: 1000000, // ₹10 Lakhs
  });

  const [simResult, setSimResult] = React.useState<ScenarioSimulationResult>(() =>
    runExecutiveScenarioSimulation({
      feeAdjustmentPercent: 5,
      boardingExpansionBeds: 40,
      facultySalaryIndex: 105,
      bursaryAllocationInr: 1000000,
    })
  );

  // Commit Warrant Modal
  const [isWarrantModalOpen, setIsWarrantModalOpen] = React.useState(false);
  const [warrantSuccess, setWarrantSuccess] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const [insightsData, benchmarksData, mcData] = await Promise.all([
          fetchAIBusinessInsights(),
          fetchFleetInstitutionalBenchmarks(),
          fetchCashFlowMonteCarlo(),
        ]);
        setInsights(insightsData);
        setBenchmarks(benchmarksData);
        setMonteCarlo(mcData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleParamChange = (field: keyof ScenarioSimulationParams, value: number) => {
    const updated = { ...params, [field]: value };
    setParams(updated);
    setSimResult(runExecutiveScenarioSimulation(updated));
  };

  const handleExecute = (id: string) => {
    setExecutedItems((prev) => ({ ...prev, [id]: true }));
  };

  const handleCommitWarrant = () => {
    setWarrantSuccess(true);
    setTimeout(() => {
      setWarrantSuccess(false);
      setIsWarrantModalOpen(false);
    }, 1500);
  };

  return (
    <AppShell
      role="OWNER"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board) Financial Epoch"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-high/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-bold text-secondary uppercase tracking-widest">
                National Sovereign Neural Strategy
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3D5B42]">
                <span className="w-2 h-2 rounded-full bg-[#3D5B42] animate-pulse"></span>
                Inference Latency: 12ms (Mumbai Sovereign Enclave)
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Executive AI Advisory &amp; Simulation Studio
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Simulate CBSE fee tariff adjustments, hostel capacity expansion, Monte Carlo cash flow forecasting in ₹, and cross-fleet institutional benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsWarrantModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-surface gap-2 text-xs"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              Commit Strategic Warrant
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-container-high pb-3">
          {[
            { id: "STUDIO", label: "Interactive Simulation Studio" },
            { id: "PROPOSALS", label: "Strategic AI Proposals (4 Active)" },
            { id: "BENCHMARKS", label: "Cross-Fleet Benchmarks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-surface font-semibold shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container-high"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: INTERACTIVE SIMULATION STUDIO */}
        {activeTab === "STUDIO" && (
          <div className="space-y-6">
            {/* Live Model Telemetry Header */}
            <Card className="p-6 bg-gradient-to-r from-primary via-[#1a2744] to-primary text-white border-none shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary shadow-sm shrink-0">
                    <BrainCircuit className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium text-white">
                      Monte Carlo Neural Scenario Engine
                    </h3>
                    <p className="font-sans text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
                      Simulating elasticity across 3,250 scholars, 148 faculty, and Indian banking streams with real-time ARR and EBIT margin recalculation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6 text-xs font-sans text-white/90">
                  <div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold">
                      Projected ARR
                    </div>
                    <div className="font-serif text-2xl font-bold text-secondary mt-0.5">
                      {formatIndianLakhsCrores(simResult.projectedArr)}
                    </div>
                    <span className="text-[10px] text-[#3D5B42] font-semibold">
                      +{simResult.arrDeltaPercent}% vs Base
                    </span>
                  </div>
                  <div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider font-bold">
                      EBIT Margin
                    </div>
                    <div className="font-serif text-2xl font-bold text-white mt-0.5">
                      {simResult.ebitMargin}%
                    </div>
                    <span className="text-[10px] text-white/70">
                      Base: {simResult.baseEbitMargin}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Parameter Sliders vs Real-time Projections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 Cols: Sliders */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="p-6 space-y-5 border-secondary/30">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-secondary" />
                      <h4 className="font-serif text-lg font-medium text-primary">
                        Scenario Parameters
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setParams({
                          feeAdjustmentPercent: 0,
                          boardingExpansionBeds: 0,
                          facultySalaryIndex: 100,
                          bursaryAllocationInr: 500000,
                        })
                      }
                      className="text-xs text-secondary gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to Baseline
                    </Button>
                  </div>

                  {/* Slider 1: Fee Adjustment */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="font-medium text-primary">Tuition Tariff Adjustment</span>
                      <span className="font-bold text-secondary font-mono">
                        {params.feeAdjustmentPercent > 0 ? `+${params.feeAdjustmentPercent}%` : `${params.feeAdjustmentPercent}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="20"
                      step="1"
                      value={params.feeAdjustmentPercent}
                      onChange={(e) => handleParamChange("feeAdjustmentPercent", Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>-10% (Deflation)</span>
                      <span>0% (Baseline)</span>
                      <span>+20% (Premium)</span>
                    </div>
                  </div>

                  {/* Slider 2: Boarding Expansion */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="font-medium text-primary">Hostel &amp; Day-Boarding Seats</span>
                      <span className="font-bold text-secondary font-mono">
                        +{params.boardingExpansionBeds} Seats
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={params.boardingExpansionBeds}
                      onChange={(e) => handleParamChange("boardingExpansionBeds", Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>0 (Current 590)</span>
                      <span>+50 Seats</span>
                      <span>+100 (New Wing)</span>
                    </div>
                  </div>

                  {/* Slider 3: Faculty Salary Index */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="font-medium text-primary">Faculty Compensation Index (7th CPC+)</span>
                      <span className="font-bold text-secondary font-mono">
                        {params.facultySalaryIndex}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="90"
                      max="120"
                      step="5"
                      value={params.facultySalaryIndex}
                      onChange={(e) => handleParamChange("facultySalaryIndex", Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>90% (Standard)</span>
                      <span>100% (CBSE Grade)</span>
                      <span>120% (Elite PGT Merit)</span>
                    </div>
                  </div>

                  {/* Slider 4: Bursary Allocation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="font-medium text-primary">Discretionary Merit / RTE Scholarship Fund</span>
                      <span className="font-bold text-secondary font-mono">
                        {formatIndianCurrency(params.bursaryAllocationInr)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="200000"
                      max="5000000"
                      step="100000"
                      value={params.bursaryAllocationInr}
                      onChange={(e) => handleParamChange("bursaryAllocationInr", Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>₹2 Lakhs</span>
                      <span>₹25 Lakhs</span>
                      <span>₹50 Lakhs</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right 7 Cols: Recalculated Projections */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5 border-l-4 border-l-secondary bg-surface">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">
                      Retention Probability
                    </span>
                    <div className="font-serif text-3xl font-medium text-secondary mt-1">
                      {simResult.scholarRetentionRate}%
                    </div>
                    <p className="text-xs text-[#3D5B42] font-semibold mt-1">
                      {simResult.scholarRetentionRate >= 98 ? "Ultra-Low Attrition Risk" : "Moderate Attrition Risk"}
                    </p>
                  </Card>

                  <Card className="p-5 border-l-4 border-l-primary bg-surface">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">
                      Endowment Surplus Realization
                    </span>
                    <div className="font-serif text-3xl font-medium text-primary mt-1">
                      {formatIndianCurrency(simResult.endowmentRealizationInr)}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">Annual campus development reinvestment</p>
                  </Card>
                </div>

                {/* AI Executive Advisory Box */}
                <Card className="p-6 bg-surface-container-lowest/60 border border-secondary/30">
                  <div className="flex items-center gap-2 mb-2 text-secondary font-semibold text-xs uppercase tracking-wider font-sans">
                    <Sparkles className="w-4 h-4" />
                    AI Neural Strategy Synthesis
                  </div>
                  <p className="font-serif text-lg font-normal text-primary leading-relaxed">
                    {simResult.aiAdvisorySummary}
                  </p>

                  <div className="mt-4 pt-4 border-t border-surface-container-high/60 grid grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-on-surface-variant block">Total Enrolled Cohort:</span>
                      <strong className="text-primary font-mono">{simResult.newNetScholarsCapacity} Scholars</strong>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block">Expansion Break-Even:</span>
                      <strong className="text-secondary font-mono">
                        {simResult.breakEvenMonths > 0 ? `${simResult.breakEvenMonths} Months` : "Immediate"}
                      </strong>
                    </div>
                  </div>
                </Card>

                {/* Monte Carlo Realization Forecast Table */}
                <Card className="p-5">
                  <h4 className="font-serif text-base font-medium text-primary mb-3">
                    Stochastic Cash Flow Forecast (Monte Carlo 10,000 Iterations in ₹)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-sans">
                      <thead className="border-b border-surface-container-high text-[10px] uppercase text-on-surface-variant font-bold">
                        <tr>
                          <th className="py-2 text-left">Month</th>
                          <th className="py-2 text-right">Conservative (95% CI)</th>
                          <th className="py-2 text-right">Expected Mode</th>
                          <th className="py-2 text-right">Optimistic Upside</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-high/40">
                        {monteCarlo.map((mc, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-lowest/50">
                            <td className="py-2.5 font-medium text-primary">{mc.month}</td>
                            <td className="py-2.5 text-right font-mono text-on-surface-variant">
                              {formatIndianCurrency(mc.conservativePessimistic)}
                            </td>
                            <td className="py-2.5 text-right font-mono font-semibold text-primary">
                              {formatIndianCurrency(mc.expectedRealization)}
                            </td>
                            <td className="py-2.5 text-right font-mono text-secondary font-medium">
                              {formatIndianCurrency(mc.optimisticUpside)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STRATEGIC PROPOSALS */}
        {activeTab === "PROPOSALS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((ins) => {
              const isDone = executedItems[ins.id] || ins.status === "RESOLVED";

              return (
                <Card
                  key={ins.id}
                  className={`p-6 flex flex-col justify-between border transition-all ${
                    isDone
                      ? "border-[#3D5B42]/50 bg-[#3D5B42]/5"
                      : ins.impact === "HIGH"
                      ? "border-secondary/60 bg-surface shadow-sm hover:border-secondary"
                      : "border-border/80 bg-surface"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="navy">{ins.category}</Badge>
                        <Badge
                          variant={
                            ins.impact === "HIGH"
                              ? "gold"
                              : ins.impact === "STRATEGIC"
                              ? "active"
                              : "pending"
                          }
                        >
                          {ins.impact} Impact
                        </Badge>
                      </div>

                      {isDone ? (
                        <span className="text-xs font-sans font-bold text-[#3D5B42] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Executed
                        </span>
                      ) : (
                        <Badge variant="neutral">New Proposal</Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-medium text-primary">
                        {ins.title}
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant mt-2 leading-relaxed">
                        {ins.summary}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-surface-variant/40 border border-border/60 text-xs font-sans space-y-1">
                      <div className="font-semibold text-primary">Proposed Execution:</div>
                      <div className="text-on-surface-variant text-[11px]">{ins.suggestedAction}</div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-border/60 flex items-center justify-between">
                    <div className="font-sans text-xs font-bold text-secondary">
                      {ins.estimatedUpside}
                    </div>

                    <Button
                      variant={isDone ? "outline" : "primary"}
                      size="sm"
                      disabled={isDone}
                      onClick={() => handleExecute(ins.id)}
                      className="text-xs gap-1.5"
                    >
                      {isDone ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#3D5B42]" /> Applied
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-secondary-container" /> Execute Action
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 3: BENCHMARKS */}
        {activeTab === "BENCHMARKS" && (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-surface-container-lowest/60 border-b border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-secondary" />
                  <span className="font-serif text-base font-medium text-primary">
                    National Institutional Operating Benchmarks (Top Indian Schools)
                  </span>
                </div>
                <Badge variant="gold" className="text-[10px]">FY 2024–2025</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="bg-surface-container-lowest/80 border-b border-surface-container-high text-[11px] uppercase tracking-wider text-on-surface-variant">
                      <th className="py-3.5 px-4 font-semibold">Institution &amp; City</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Students</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Avg Annual Fee</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Realization</th>
                      <th className="py-3.5 px-4 font-semibold text-center">CBSE/Board Avg</th>
                      <th className="py-3.5 px-4 font-semibold text-right">EBIT Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40">
                    {benchmarks.map((b, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-primary block">{b.campusName}</span>
                          <span className="text-xs text-on-surface-variant">{b.location}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-primary">
                          {b.enrolledCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif text-xs text-primary">
                          {formatIndianCurrency(b.averageAnnualFee)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#3D5B42] text-xs">
                          {b.realizationRate}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-serif font-bold text-xs">
                            {b.ibAverageScore}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif text-sm font-bold text-primary">
                          {b.ebitMargin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Commit Strategic Warrant Modal */}
        <Modal
          isOpen={isWarrantModalOpen}
          onClose={() => setIsWarrantModalOpen(false)}
          title="Commit Strategic Scenario Warrant"
          description="Seal active simulation parameters to the School Governing Board &amp; Trustee Queue."
          maxWidth="lg"
        >
          {warrantSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#3D5B42]/10 text-[#3D5B42] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-primary">Warrant Sealed &amp; Dispatched</h3>
              <p className="font-sans text-xs text-on-surface-variant">
                Strategic Warrant <strong className="font-mono text-primary">WAR-2025-IND984</strong> has been committed to the Board of Trustees Queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-lowest rounded-lg border border-surface-container-high space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Projected ARR Impact:</span>
                  <strong className="text-secondary font-mono">{formatIndianLakhsCrores(simResult.projectedArr)} (+{simResult.arrDeltaPercent}%)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Operating EBIT Margin:</span>
                  <strong className="text-primary font-mono">{simResult.ebitMargin}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Hostel / Seat Expansion:</span>
                  <strong className="text-primary font-mono">+{params.boardingExpansionBeds} Seats (Net: {simResult.newNetScholarsCapacity} Scholars)</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWarrantModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCommitWarrant}
                  className="bg-primary hover:bg-primary-hover text-surface text-xs gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Sign &amp; Transmit Warrant
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}

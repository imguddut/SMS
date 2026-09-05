"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building2,
  Check,
  AlertTriangle,
  BrainCircuit,
  Sparkles,
  Zap,
  UserCheck,
} from "lucide-react";
import {
  fetchCampusReports,
  CampusReportItem,
} from "@/lib/db/school-admin";
import {
  fetchPredictiveRiskScholars,
  ScholarRiskFactor,
} from "@/lib/db/analytics";

export default function SchoolReportsPage() {
  const [reports, setReports] = React.useState<CampusReportItem[]>([]);
  const [riskScholars, setRiskScholars] = React.useState<ScholarRiskFactor[]>([]);
  const [downloadedIds, setDownloadedIds] = React.useState<Record<string, boolean>>({});
  const [interventionIds, setInterventionIds] = React.useState<Record<string, boolean>>({});
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [repData, riskData] = await Promise.all([
          fetchCampusReports(),
          fetchPredictiveRiskScholars(),
        ]);
        setReports(repData);
        setRiskScholars(riskData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDownload = (id: string) => {
    setDownloadedIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleTriggerIntervention = (id: string) => {
    setInterventionIds((prev) => ({ ...prev, [id]: true }));
  };

  const filteredReports = reports.filter(
    (r) => categoryFilter === "ALL" || r.category === categoryFilter
  );

  return (
    <AppShell
      role="PRINCIPAL"
      userName="Mme. Claire De La Tour"
      userRoleTitle="Head of School & Proviseur"
      epochText="Term 3 Cycle (Michaelmas) • Geneva Campus"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Institutional Audit Registry
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3D5B42] animate-pulse"></span>
                AI Predictive Early-Intervention Active
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Institutional Reports &amp; AI Risk Radar
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Proviseur compliance audits, regulatory gradebook matrices, and predictive scholar attrition early-warning radar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" className="font-sans gap-2">
              <Download className="w-4 h-4 text-secondary-container" />
              Download Full Audit Dossier (ZIP)
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto font-sans text-xs">
          {[
            { id: "ALL", label: "All Audit Reports" },
            { id: "RISK_RADAR", label: "Predictive Risk Radar (3 Flagged)" },
            { id: "ATTENDANCE", label: "Attendance & Roll-Call" },
            { id: "ACADEMIC", label: "Academic Gradebooks" },
            { id: "FINANCIAL", label: "Financial Ledgers" },
            { id: "SAFETY", label: "Boarding & Safety" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === tab.id
                  ? "bg-surface text-primary border-t-2 border-secondary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on filter */}
        {categoryFilter === "RISK_RADAR" ? (
          <div className="space-y-4">
            <Card className="p-5 bg-secondary/10 border border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-secondary" />
                <div>
                  <h3 className="font-serif text-base font-medium text-primary">
                    Predictive Scholar Attrition &amp; Intervention Model
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Multi-factor neural monitoring of attendance drops (below 95%), homework submission latency, and exam score volatility.
                  </p>
                </div>
              </div>
              <Badge variant="gold" className="text-xs">3 Active Cases</Badge>
            </Card>

            <div className="space-y-4">
              {riskScholars.map((scholar) => (
                <Card
                  key={scholar.id}
                  className="p-6 border-l-4 border-l-error border-surface-container-high hover:border-secondary/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="critical" className="text-[10px]">
                          Risk Score: {scholar.riskScore}/100
                        </Badge>
                        <Badge variant="navy" className="text-[10px]">
                          {scholar.riskCategory.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-on-surface-variant font-mono">
                          {scholar.studentNumber}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-medium text-primary">
                        {scholar.studentName}
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant">
                        {scholar.form} • {scholar.house} • Assigned Master: <strong>{scholar.assignedStaff}</strong>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans pt-2">
                        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-high">
                          <span className="text-on-surface-variant block text-[10px]">Attendance Variance</span>
                          <span className="font-semibold text-error">{scholar.attendanceDelta}</span>
                        </div>
                        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-high">
                          <span className="text-on-surface-variant block text-[10px]">Homework Latency</span>
                          <span className="font-semibold text-error">{scholar.homeworkLatencyAvg}</span>
                        </div>
                        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-high">
                          <span className="text-on-surface-variant block text-[10px]">Mock Exam Volatility</span>
                          <span className="font-semibold text-primary">{scholar.mockExamVariance}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-surface-container-lowest border border-secondary/30 text-xs font-sans mt-2">
                        <span className="font-bold text-secondary block mb-0.5">
                          Prescriptive AI Recommendation:
                        </span>
                        <span className="text-primary">{scholar.prescriptiveIntervention}</span>
                      </div>
                    </div>

                    <div className="shrink-0 self-end md:self-center">
                      <Button
                        variant={interventionIds[scholar.id] ? "outline" : "primary"}
                        size="sm"
                        disabled={interventionIds[scholar.id]}
                        onClick={() => handleTriggerIntervention(scholar.id)}
                        className="text-xs gap-1.5"
                      >
                        {interventionIds[scholar.id] ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5B42]" /> Intervention Dispatched
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-secondary-container" /> Assign Master Tutoring
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((rep) => (
              <Card
                key={rep.id}
                className="p-6 border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-secondary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-primary shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-medium text-primary">
                        {rep.title}
                      </h3>
                      <Badge variant="navy">{rep.category}</Badge>
                    </div>
                    <div className="text-xs font-sans text-on-surface-variant flex items-center gap-3 flex-wrap">
                      <span>Period: <strong className="text-primary">{rep.period}</strong></span>
                      <span>•</span>
                      <span>{rep.recordCount} Records Verified</span>
                      <span>•</span>
                      <span className="font-mono">{rep.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Button
                    variant={downloadedIds[rep.id] ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handleDownload(rep.id)}
                    className="text-xs gap-1.5"
                  >
                    {downloadedIds[rep.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3D5B42]" /> Export Complete
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> Download Report
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

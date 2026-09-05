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
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Principal & Head of School"
      epochText="Term 2 (CBSE Board) • Main Campus"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="navy" dot>
                School Reports &amp; Insights
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Student Support Alerts Active
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              School Reports &amp; Student Support
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Official school attendance, grade summaries, financial ledgers, and students needing academic support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" className="font-sans gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4" />
              Download All Reports (ZIP)
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto font-sans text-xs">
          {[
            { id: "ALL", label: "All Reports" },
            { id: "RISK_RADAR", label: "Students Needing Help (3)" },
            { id: "ATTENDANCE", label: "Attendance Reports" },
            { id: "ACADEMIC", label: "Report Cards & Grades" },
            { id: "FINANCIAL", label: "Fee & Finance Reports" },
            { id: "SAFETY", label: "Campus & Safety" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === tab.id
                  ? "bg-surface text-blue-400 border-t-2 border-blue-500 shadow-sm font-semibold"
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
            <Card className="p-5 bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="font-serif text-base font-medium text-primary">
                    Students Needing Academic or Attendance Support
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Automatic alerts when student attendance drops below 85% or marks decline.
                  </p>
                </div>
              </div>
              <Badge variant="navy" className="text-xs">3 Active Cases</Badge>
            </Card>

            <div className="space-y-4">
              {riskScholars.map((scholar) => (
                <Card
                  key={scholar.id}
                  className="p-6 border-l-4 border-l-rose-500 border-border/80 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="critical" className="text-[10px]">
                          Attention Score: {scholar.riskScore}/100
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
                        {scholar.form} • {scholar.house} • Assigned Teacher: <strong>{scholar.assignedStaff}</strong>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans pt-2">
                        <div className="p-2 rounded bg-surface-variant/40 border border-border/60">
                          <span className="text-on-surface-variant block text-[10px]">Attendance Change</span>
                          <span className="font-semibold text-rose-400">{scholar.attendanceDelta}</span>
                        </div>
                        <div className="p-2 rounded bg-surface-variant/40 border border-border/60">
                          <span className="text-on-surface-variant block text-[10px]">Pending Homework</span>
                          <span className="font-semibold text-rose-400">{scholar.homeworkLatencyAvg}</span>
                        </div>
                        <div className="p-2 rounded bg-surface-variant/40 border border-border/60">
                          <span className="text-on-surface-variant block text-[10px]">Test Marks Variance</span>
                          <span className="font-semibold text-primary">{scholar.mockExamVariance}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-surface-variant/40 border border-blue-500/30 text-xs font-sans mt-2">
                        <span className="font-bold text-blue-400 block mb-0.5">
                          Recommended Action:
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
                        className={`text-xs gap-1.5 ${!interventionIds[scholar.id] ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                      >
                        {interventionIds[scholar.id] ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Support Assigned
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" /> Assign Extra Help
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
                className="p-6 border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
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
                    className={`text-xs gap-1.5 ${!downloadedIds[rep.id] ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                  >
                    {downloadedIds[rep.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Downloaded
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

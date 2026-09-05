"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Building2,
  Globe,
  GraduationCap,
  Download,
  ArrowRight,
  CheckCircle2,
  Calendar,
  FileCheck,
} from "lucide-react";
import {
  fetchAdmissionsGrowth,
  AdmissionsPipelineStage,
  ApplicantRecord,
} from "@/lib/db/owner";

export default function OwnerGrowthAdmissionsPage() {
  const [pipeline, setPipeline] = React.useState<AdmissionsPipelineStage[]>([]);
  const [applicants, setApplicants] = React.useState<ApplicantRecord[]>([]);
  const [boarding, setBoarding] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchAdmissionsGrowth();
        setPipeline(data.pipeline);
        setApplicants(data.applicants);
        setBoarding(data.boardingCapacity);
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
      role="OWNER"
      userName="Julian Vance-Moreau, D.Phil"
      userRoleTitle="Chancellor & CFO"
      epochText="Academic Year 2024–2025 • Q3 Financial Epoch"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Institutional Admissions Pipeline
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Michaelmas 2025 Intake • 98 Matriculated
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Growth &amp; Admissions Pipeline
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Track global applicant conversion funnels, international boarding house capacity, entrance examination results, and matriculation targets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" className="font-sans gap-2">
              <Download className="w-4 h-4 text-secondary-container" />
              Export Admissions Report
            </Button>
          </div>
        </div>

        {/* Funnel Visualizer */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                Admissions Conversion Funnel
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Prospective student journey from initial inquiry to matriculation.
              </p>
            </div>
            <Badge variant="gold">Target: 100 Scholars</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-sans text-xs">
            {pipeline.map((stage, idx) => (
              <div
                key={stage.stage}
                className="p-4 rounded-lg bg-surface-variant/40 border border-border/60 flex flex-col justify-between h-36"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Stage {idx + 1}
                  </div>
                  <div className="font-serif text-2xl font-medium text-primary mt-1">
                    {stage.count}
                  </div>
                  <div className="font-semibold text-primary mt-0.5">{stage.stage}</div>
                </div>
                <div className="pt-2 border-t border-border/60 flex justify-between items-center">
                  <span className="text-on-surface-variant">Conversion:</span>
                  <span className="font-bold text-secondary">{stage.conversionRate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Boarding House Capacities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {boarding.map((house) => {
            const pct = Math.round((house.occupied / house.capacity) * 100);
            return (
              <Card key={house.houseName} className="p-5 border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-serif text-base font-medium text-primary">
                      {house.houseName}
                    </span>
                    <Badge variant={pct > 95 ? "pending" : "active"} dot>
                      {pct}% Full
                    </Badge>
                  </div>
                  <div className="font-sans text-xs text-on-surface-variant mt-1">
                    Master: <span className="font-medium text-primary">{house.houseMaster}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Occupancy:</span>
                    <span className="font-bold text-primary">
                      {house.occupied} / {house.capacity} Beds
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 95 ? "bg-secondary" : "bg-[#3D5B42]"}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Prospective Scholar Applicants Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                Current Intake Applicant Dossiers
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Candidates undergoing classical assessment and admissions committee review.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Applicant &amp; Origin</th>
                  <th className="py-3.5 px-6">Target Form &amp; Curriculum</th>
                  <th className="py-3.5 px-6">Bursary Request</th>
                  <th className="py-3.5 px-6">Application Date</th>
                  <th className="py-3.5 px-6">Admissions Stage</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-serif font-medium text-base text-primary leading-tight">
                        {app.name}
                      </div>
                      <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-secondary" /> {app.originCountry}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-primary">{app.targetForm}</div>
                      <div className="text-on-surface-variant">{app.curriculum}</div>
                    </td>

                    <td className="py-4 px-6">
                      {app.scholarshipRequested ? (
                        <Badge variant="gold">Bursary Applied</Badge>
                      ) : (
                        <span className="font-sans text-xs text-on-surface-variant">Full Fee</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                      {app.submissionDate}
                    </td>

                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          app.stage === "MATRICULATED"
                            ? "active"
                            : app.stage === "OFFER_EXTENDED"
                            ? "gold"
                            : "neutral"
                        }
                        dot
                      >
                        {app.stage.replace(/_/g, " ")}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

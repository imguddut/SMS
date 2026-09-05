"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  FileCheck,
  AlertCircle,
  FileText,
  Check,
} from "lucide-react";
import {
  fetchApprovalsQueue,
  updateApprovalStatus,
  ExecutiveApprovalWarrant,
} from "@/lib/db/school-admin";
import { useRealtimeEvent } from "@/components/providers/realtime-provider";

export default function SchoolApprovalsPage() {
  const [warrants, setWarrants] = React.useState<ExecutiveApprovalWarrant[]>([]);
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [signedWarrants, setSignedWarrants] = React.useState<
    Record<string, { status: "APPROVED" | "REJECTED"; signature: string }>
  >({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchApprovalsQueue();
        setWarrants(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useRealtimeEvent("approvals", "*", async () => {
    try {
      const data = await fetchApprovalsQueue();
      setWarrants(data);
    } catch (e) {
      console.error(e);
    }
  });

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    const res = await updateApprovalStatus(id, action);
    setSignedWarrants((prev) => ({
      ...prev,
      [id]: {
        status: action,
        signature: res.signatureHash || "SIG-DILITHIUM5-PROV-9942",
      },
    }));
  };

  const filteredWarrants = warrants.filter(
    (w) => typeFilter === "ALL" || w.type === typeFilter
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
                Proviseur Authorization Authority
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Zero-Knowledge Attested Cryptographic Signatures
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Executive Approvals &amp; Warrants Queue
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Adjudicate institutional bursary waivers, academic leaves, glaciology field expeditions, transcript publications, and faculty chair appointments.
            </p>
          </div>
        </div>

        {/* Warrant Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto font-sans text-xs">
          {[
            { id: "ALL", label: "All Warrants" },
            { id: "BURSARY_WAIVER", label: "Bursaries & Waivers" },
            { id: "LEAVE_REQUEST", label: "Faculty Leaves" },
            { id: "EXCURSION_AUTHORIZATION", label: "Excursions" },
            { id: "GRADEBOOK_PUBLICATION", label: "Gradebook Publication" },
            { id: "STAFF_APPOINTMENT", label: "Faculty Appointments" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                typeFilter === tab.id
                  ? "bg-surface text-primary border-t-2 border-secondary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Warrants List */}
        <div className="space-y-5">
          {filteredWarrants.map((war) => {
            const signed = signedWarrants[war.id];
            const currentStatus = signed ? signed.status : war.status;

            return (
              <Card
                key={war.id}
                className={`p-6 border transition-all ${
                  currentStatus === "APPROVED"
                    ? "border-[#3D5B42]/50 bg-[#3D5B42]/5"
                    : currentStatus === "REJECTED"
                    ? "border-[#752D20]/40 bg-[#752D20]/5"
                    : "border-border/80 bg-surface shadow-sm hover:border-secondary/40"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="navy">{war.type.replace(/_/g, " ")}</Badge>
                      <Badge
                        variant={
                          currentStatus === "APPROVED"
                            ? "active"
                            : currentStatus === "REJECTED"
                            ? "critical"
                            : "gold"
                        }
                        dot
                      >
                        {currentStatus}
                      </Badge>
                      <span className="font-mono text-xs text-on-surface-variant">
                        {war.dateRequested}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-medium text-primary">
                      {war.title}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-on-surface-variant pt-1">
                      <div>
                        Applicant: <strong className="text-primary">{war.applicant}</strong> ({war.applicantRole})
                      </div>
                      <div>
                        Department / House: <strong className="text-primary">{war.departmentOrHouse}</strong>
                      </div>
                      <div className="sm:col-span-2 font-mono text-secondary font-semibold">
                        Scope / Valuation: {war.amountOrScope}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60 text-xs font-sans">
                      <span className="font-semibold text-primary">Official Justification:</span>
                      <p className="text-on-surface-variant mt-0.5 leading-relaxed italic">
                        "{war.justification}"
                      </p>
                    </div>

                    {signed && (
                      <div className="p-2.5 rounded bg-surface border border-border/70 font-mono text-[11px] text-[#3D5B42] flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-secondary" />
                        Signed by Proviseur Mme. Claire De La Tour • Hash: {signed.signature}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                    {currentStatus === "PENDING" ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAction(war.id, "APPROVED")}
                          className="text-xs gap-1.5 bg-[#3D5B42] hover:bg-[#2e4732] text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Authorize Warrant
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(war.id, "REJECTED")}
                          className="text-xs gap-1.5 text-error border-error/30 hover:bg-error/10"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline Warrant
                        </Button>
                      </>
                    ) : (
                      <Badge variant={currentStatus === "APPROVED" ? "active" : "critical"}>
                        {currentStatus === "APPROVED" ? "Seal Affixed" : "Declined"}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

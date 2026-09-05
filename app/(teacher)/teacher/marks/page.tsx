"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  Save,
  CheckCircle2,
  Lock,
  Download,
  KeyRound,
  FileCheck2,
  Check,
  FileText,
  Printer,
} from "lucide-react";
import {
  fetchMarksEntryGrid,
  saveGradebookMarks,
  GradebookRow,
} from "@/lib/db/teacher";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";

export default function TeacherMarksPage() {
  const [rows, setRows] = React.useState<GradebookRow[]>([]);
  const [selectedClass, setSelectedClass] = React.useState("Class 12-A - Senior Secondary Pure Mathematics");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sealedHash, setSealedHash] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const data = await fetchMarksEntryGrid();
      setRows(data);
    }
    load();
  }, []);

  const calculateGrade = (totalPct: number): string => {
    if (totalPct >= 91) return "A1";
    if (totalPct >= 81) return "A2";
    if (totalPct >= 71) return "B1";
    if (totalPct >= 61) return "B2";
    if (totalPct >= 51) return "C1";
    if (totalPct >= 41) return "C2";
    if (totalPct >= 33) return "D";
    return "E (Needs Remedial)";
  };

  const handleScoreChange = (
    studentId: string,
    field: "paper1" | "paper2" | "internalAssessment" | "oralSeminar",
    val: number
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const updated = { ...r, [field]: val };
          // Total: Theory (Paper 1 /80) + Practical / Internal Assessment (/20) = 100
          const theory = Math.min(80, Math.max(0, updated.paper1));
          const internal = Math.min(20, Math.max(0, updated.internalAssessment));
          const weightedTotal = Math.min(100, Math.round((theory + internal) * 10) / 10);
          const predictedGrade = calculateGrade(weightedTotal);
          return {
            ...updated,
            paper1: theory,
            internalAssessment: internal,
            weightedTotal,
            predictedGrade,
          };
        }
        return r;
      })
    );
  };

  const handleSaveGradebook = async () => {
    setIsSubmitting(true);
    try {
      const res = await saveGradebookMarks({
        classId: selectedClass,
        rows,
      });
      setSealedHash(res.sealHash);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewContent = `DELHI PUBLIC SCHOOL, R.K. PURAM
OFFICIAL SEALED GRADEBOOK & SCHOLASTIC PERFORMANCE MATRIX
Academic Session: 2024–2025 • Term 2 (CBSE Senior Secondary)

COURSE & EVALUATION SPECIFICATIONS:
Course: ${selectedClass}
Subject: Mathematics (Code: 041) • CBSE Affiliation No: 2730017
Evaluator / Head of Department: Prof. Rajesh Verma (Senior PGT Mathematics)
Assessment Scale: Theory Examination (80 Marks) + Internal Assessment & Practical (20 Marks) = 100 Total Marks
Sealing Status: ${sealedHash ? `Sealed (${sealedHash})` : "Active Faculty Entry"}
Date of Ledger Seal: ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

SCHOLAR SCORECARD & GRADE MATRIX:
================================================================================
${rows
  .map(
    (r, idx) =>
      `${idx + 1}. SCHOLAR: ${r.studentName} (${r.studentNumber})
   House: ${r.house} • Standing: ${r.academicStanding.replace(/_/g, " ")}
   Theory Component (Max 80): ${r.paper1} Marks
   Internal Assessment / Practical (Max 20): ${r.internalAssessment} Marks
   Total Aggregate Score: ${r.weightedTotal} / 100 Marks (${r.weightedTotal}%)
   Awarded CBSE Letter Grade: Grade ${r.predictedGrade}`
  )
  .join("\n\n")}
================================================================================

CBSE GRADING SCALE BENCHMARK:
- A1: Top 1/8th of passed candidates (91% - 100%) [Outstanding Performance]
- A2: Next 1/8th of passed candidates (81% - 90%) [Excellent Performance]
- B1: Next 1/8th of passed candidates (71% - 80%) [Very Good Performance]
- B2: Next 1/8th of passed candidates (61% - 70%) [Good Performance]
- C1: Next 1/8th of passed candidates (51% - 60%) [Fair Performance]

OFFICIAL CERTIFICATION & SEAL:
I hereby certify that the scores recorded above represent verified answer scripts and laboratory records evaluated strictly according to CBSE Senior Secondary standards.

Digital Hash: ${sealedHash || "SEAL-GRADEBOOK-CBSE-DILITHIUM5-2025"}
Evaluator Signature: Prof. Rajesh Verma (Head of Mathematics Department)
Countersigned by: Dr. V. K. Malhotra (Principal & Headmaster, DPS R.K. Puram)`;

  return (
    <AppShell
      role="TEACHER"
      userName="Prof. Rajesh Verma"
      userRoleTitle="Senior PGT Mathematics & Head of Department"
      epochText="Daily Schedule • Academic Year 2024–25 (CBSE)"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Official Gradebook Matrix
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Term 2 (CBSE 2024–25) • Cryptographic Dilithium-5 Sealing
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Examination Marks Entry &amp; Gradebook
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Input assessment components, compute weighted aggregate percentages, assign CBSE letter grades (A1–E), and seal the official proviseur gradebook.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="font-sans text-xs gap-1.5 text-secondary border-secondary/40"
            >
              <FileText className="w-4 h-4 text-secondary" />
              Export Gradebook (PDF)
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || !!sealedHash}
              onClick={handleSaveGradebook}
              className="font-sans gap-2"
            >
              {sealedHash ? (
                <>
                  <Check className="w-4 h-4 text-secondary-container" /> Gradebook Sealed
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-secondary-container" />
                  {isSubmitting ? "Sealing..." : "Commit Sealed Gradebook"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pdf Preview Modal */}
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Official Gradebook Matrix"
          fileName="Official_Gradebook_Class12A_Mathematics.pdf"
          content={previewContent}
          studentMeta={{
            name: "Class 12-A Scholars",
            rollNumber: "Subject Code: Mathematics (041)",
            form: "Class 12-A Senior Secondary",
            house: "Department of Mathematics",
            institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
            institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017",
            institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022 • School Code: 85214",
            academicSession: "2024–2025",
          }}
        />

        {/* Sealed Hash Confirmation */}
        {sealedHash && (
          <div className="p-4 rounded-lg bg-[#3D5B42]/10 border border-[#3D5B42]/40 flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-2 text-[#3D5B42]">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                <strong>Official Gradebook Sealed:</strong> Cryptographic signatures recorded for all scholars. Hash: <span className="font-mono font-bold">{sealedHash}</span>
              </span>
            </div>
          </div>
        )}

        {/* Gradebook Matrix Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                {selectedClass}
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                CBSE Senior Secondary (041) • Theory Examination (80 Marks) + Internal Assessment (20 Marks) = 100 Marks
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Scholar Name</th>
                  <th className="py-3.5 px-4 text-center">Theory Paper (80)</th>
                  <th className="py-3.5 px-4 text-center">Internal Assessment (20)</th>
                  <th className="py-3.5 px-4 text-center">Total Score (100)</th>
                  <th className="py-3.5 px-6 text-right">Awarded CBSE Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-serif font-medium text-base text-primary leading-tight">
                        {row.studentName}
                      </div>
                      <div className="text-xs text-on-surface-variant font-mono">
                        {row.studentNumber} • {row.house}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={80}
                        value={row.paper1}
                        onChange={(e) =>
                          handleScoreChange(row.studentId, "paper1", Number(e.target.value))
                        }
                        className="w-20 h-8 text-center rounded border border-border bg-surface text-primary font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={row.internalAssessment}
                        onChange={(e) =>
                          handleScoreChange(row.studentId, "internalAssessment", Number(e.target.value))
                        }
                        className="w-20 h-8 text-center rounded border border-border bg-surface text-primary font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </td>

                    <td className="py-4 px-4 text-center font-serif text-lg font-bold text-primary">
                      {row.weightedTotal} / 100
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge
                          variant={
                            row.predictedGrade === "A1" || row.predictedGrade === 7
                              ? "gold"
                              : row.predictedGrade === "A2" || row.predictedGrade === 6
                              ? "active"
                              : "neutral"
                          }
                          size="md"
                        >
                          Grade {row.predictedGrade}
                        </Badge>
                      </div>
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

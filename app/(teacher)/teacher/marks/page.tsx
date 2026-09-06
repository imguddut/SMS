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
import { useAuth } from "@/components/providers/auth-context";

export default function TeacherMarksPage() {
  const { profile, profile, school } = useAuth();
  const [rows, setRows] = React.useState<GradebookRow[]>([]);
  const [selectedClass, setSelectedClass] = React.useState("Mathematics Class Gradebook");
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

  const teacherName = profile?.full_name || "Faculty Member";
  const teacherDesignation = profile?.role || "Faculty";
  const schoolDisplayName = school?.name || "School Portal";

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

  const previewContent = `${schoolDisplayName.toUpperCase()}
OFFICIAL SEALED GRADEBOOK & SCHOLASTIC PERFORMANCE MATRIX
Generated: ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

COURSE & EVALUATION SPECIFICATIONS:
Course: ${selectedClass}
Evaluator: ${teacherName} (${teacherDesignation})
Assessment Scale: Theory Examination (80 Marks) + Internal Assessment & Practical (20 Marks) = 100 Total Marks
Sealing Status: ${sealedHash ? `Sealed (${sealedHash})` : "Active Faculty Entry"}
Date of Ledger Seal: ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

SCHOLAR SCORECARD & GRADE MATRIX:
================================================================================
${rows.length > 0 ? rows
  .map(
    (r, idx) =>
      `${idx + 1}. SCHOLAR: ${r.studentName} (${r.studentNumber})
   House: ${r.house} • Standing: ${r.academicStanding.replace(/_/g, " ")}
   Theory Component (Max 80): ${r.paper1} Marks
   Internal Assessment / Practical (Max 20): ${r.internalAssessment} Marks
   Total Aggregate Score: ${r.weightedTotal} / 100 Marks (${r.weightedTotal}%)
   Awarded Grade: Grade ${r.predictedGrade}`
  )
  .join("\n\n") : "No scholar records available in gradebook."}
================================================================================

OFFICIAL CERTIFICATION & SEAL:
I hereby certify that the scores recorded above represent verified academic records evaluated strictly according to school standards.

Digital Hash: ${sealedHash || "SEAL-GRADEBOOK-ACTIVE"}
Evaluator Signature: ${teacherName}`;

  return (
    <AppShell
      role="TEACHER"
      schoolName={schoolDisplayName}
      campusName={school?.code || "MAIN CAMPUS"}
      userName={teacherName}
      userRoleTitle={teacherDesignation}
      epochText={new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="navy" dot>
                Class Marks &amp; Grades
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Official Gradebook Matrix
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Examination Marks Entry &amp; Grades
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Enter theory and internal assessment marks, auto-calculate total scores, and save official student grades.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="font-sans text-xs gap-1.5 text-primary border-border hover:bg-surface-variant"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              Export Gradebook (PDF)
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting || !!sealedHash}
              onClick={handleSaveGradebook}
              className="font-sans gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sealedHash ? (
                <>
                  <Check className="w-4 h-4" /> Grades Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save Grades"}
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
          fileName="Official_Gradebook_Matrix.pdf"
          content={previewContent}
          studentMeta={{
            name: "Enrolled Scholars",
            rollNumber: selectedClass,
            form: teacherDesignation,
            house: schoolDisplayName,
            institutionName: schoolDisplayName,
            institutionAffiliation: school?.code || "",
            institutionAddress: "",
            academicSession: new Date().getFullYear().toString(),
          }}
        />

        {/* Sealed Hash Confirmation */}
        {sealedHash && (
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                <strong>Grades Saved Successfully!</strong> All student scores and grades have been recorded. Ref: <span className="font-mono font-bold">{sealedHash}</span>
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
                Theory Examination (80 Marks) + Internal Assessment (20 Marks) = 100 Marks
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
                  <th className="py-3.5 px-6 text-right">Awarded Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant text-sm">
                      No scholars found in this gradebook.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
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
                        disabled={!!sealedHash}
                        value={row.paper1}
                        onChange={(e) =>
                          handleScoreChange(row.studentId, "paper1", Number(e.target.value))
                        }
                        className="w-20 h-8 text-center rounded border border-border bg-surface text-primary font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        disabled={!!sealedHash}
                        value={row.internalAssessment}
                        onChange={(e) =>
                          handleScoreChange(row.studentId, "internalAssessment", Number(e.target.value))
                        }
                        className="w-20 h-8 text-center rounded border border-border bg-surface text-primary font-bold font-mono text-sm focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60 disabled:cursor-not-allowed"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

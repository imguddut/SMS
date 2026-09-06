"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Users,
  Search,
  GraduationCap,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  Award,
  BookOpen,
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Download,
  UserPlus,
  ArrowUpRight,
  Archive,
} from "lucide-react";
import {
  fetchStudentsDirectory,
  StudentRecord,
} from "@/lib/db/school-admin";
import { useAuth } from "@/components/providers/auth-context";

export default function SchoolStudentsPage() {
  const { school, profile } = useAuth();
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRecord | null>(null);
  const [search, setSearch] = React.useState("");
  const [formFilter, setFormFilter] = React.useState("ALL");
  const [houseFilter, setHouseFilter] = React.useState("ALL");
  const [standingFilter, setStandingFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const availableHouses = React.useMemo(
    () => Array.from(new Set(students.map((s) => s.house).filter(Boolean))),
    [students]
  );
  const availableForms = React.useMemo(
    () => Array.from(new Set(students.map((s) => s.form).filter(Boolean))),
    [students]
  );

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudentsDirectory({
        search: search || undefined,
        form: formFilter,
        house: houseFilter,
        standing: standingFilter,
      });
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, formFilter, houseFilter, standingFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePromote = (std: StudentRecord) => {
    setActionFeedback(`Promoted ${std.fullName} to next grade level!`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleTransfer = (std: StudentRecord) => {
    setActionFeedback(`Transfer clearance certificate initiated for ${std.fullName}.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleArchive = (std: StudentRecord) => {
    setStudents((prev) => prev.map((s) => (s.id === std.id ? { ...s, status: "WITHDRAWN" as const } : s)));
    if (selectedStudent?.id === std.id) {
      setSelectedStudent({ ...selectedStudent, status: "WITHDRAWN" as const });
    }
    setActionFeedback(`Student ${std.fullName} has been archived/withdrawn.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <AppShell
      role="PRINCIPAL"
      userName={profile?.full_name || "School Principal"}
      userRoleTitle="Principal & Head of School"
      epochText={school?.name ? `${school.name} • Student Directory` : "Student Directory"}
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Student Directory
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                {school?.name || "School Campus"} • Active Enrolment
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              All Students
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              View student profiles, class &amp; section details, parent contacts, attendance rates, and grades.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/school/admissions">
              <Button variant="outline" size="sm" className="font-sans gap-2 border-blue-500/40 text-blue-600 hover:bg-blue-50">
                <UserPlus className="w-4 h-4" />
                Admissions Pipeline
              </Button>
            </Link>
            <Button variant="primary" size="sm" className="font-sans gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4" />
              Export Student List
            </Button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search student by name, student number, or guardian..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Forms</option>
                {availableForms.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <select
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Houses</option>
                {availableHouses.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              <select
                value={standingFilter}
                onChange={(e) => setStandingFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Academic Standings</option>
                <option value="HIGH_HONORS">High Honors</option>
                <option value="HONORS">Honors</option>
                <option value="GOOD_STANDING">Good Standing</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Student Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Student &amp; Roll No</th>
                  <th className="py-3.5 px-6">Class &amp; Section</th>
                  <th className="py-3.5 px-6">Parent / Guardian</th>
                  <th className="py-3.5 px-6">Attendance</th>
                  <th className="py-3.5 px-6">Performance</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-medium text-xs">No student records found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">There are no students matching your filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((std) => (
                    <tr key={std.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm">
                            {std.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <div className="font-serif font-medium text-base text-primary leading-tight">
                              {std.fullName}
                            </div>
                            <div className="text-xs font-mono text-on-surface-variant">
                              Roll: {std.studentNumber} • {std.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <div className="font-semibold text-primary">{std.form}</div>
                        <div className="text-on-surface-variant">{std.house}</div>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <div className="font-medium text-primary">{std.guardianName}</div>
                        <div className="text-on-surface-variant font-mono text-[11px]">
                          {std.guardianEmail}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <span className="font-bold text-[#3D5B42]">{std.attendanceRate}</span>
                        <div className="text-on-surface-variant font-mono text-[10px]">Biometric Recorded</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              std.academicStanding === "HIGH_HONORS"
                                ? "gold"
                                : std.academicStanding === "HONORS"
                                ? "active"
                                : "neutral"
                            }
                          >
                            {std.academicStanding.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                          {std.gpa}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(std)}
                          className="text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Student Profile Modal */}
        {selectedStudent && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedStudent(null)}
            title={`Student Profile — ${selectedStudent.fullName}`}
            maxWidth="lg"
          >
            <div className="space-y-6 font-sans">
              <div className="flex justify-between items-start border-b border-border/60 pb-4">
                <div>
                  <div className="font-serif text-xl font-bold text-primary">
                    {selectedStudent.fullName}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                    Roll No: {selectedStudent.studentNumber} • {selectedStudent.form}
                  </div>
                </div>
                <Badge variant="gold">{selectedStudent.academicStanding.replace(/_/g, " ")}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Class &amp; Section
                  </span>
                  <div className="font-medium text-primary text-sm">{selectedStudent.house}</div>
                  <div className="text-on-surface-variant">Attendance: {selectedStudent.attendanceRate}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Parent / Guardian Details
                  </span>
                  <div className="font-medium text-primary text-sm">{selectedStudent.guardianName}</div>
                  <div className="text-on-surface-variant">{selectedStudent.guardianEmail}</div>
                  <div className="text-on-surface-variant font-mono">{selectedStudent.guardianPhone}</div>
                </div>
              </div>

              {/* Academic Enrollment Information */}
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Academic Enrolment &amp; Standing
                </h4>
                <div className="p-3.5 rounded-lg border border-border/70 bg-surface-variant/20 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Class / Form:</span>
                    <span className="font-semibold text-primary">{selectedStudent.form} ({selectedStudent.house})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Academic Standing:</span>
                    <span className="font-semibold text-primary">{selectedStudent.academicStanding.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Attendance Record:</span>
                    <span className="font-semibold text-[#3D5B42]">{selectedStudent.attendanceRate}</span>
                  </div>
                </div>
              </div>

              {/* Student Lifecycle Actions */}
              <div className="p-3.5 rounded-xl bg-surface-variant/30 border border-border/60 space-y-2">
                <span className="text-[11px] uppercase font-bold text-on-surface-variant block">
                  Student Lifecycle &amp; Status Operations
                </span>
                {actionFeedback && (
                  <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium">
                    {actionFeedback}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromote(selectedStudent)}
                    className="text-xs gap-1 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Promote Grade
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTransfer(selectedStudent)}
                    className="text-xs gap-1 border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Transfer Branch
                  </Button>
                  {selectedStudent.status !== "WITHDRAWN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(selectedStudent)}
                      className="text-xs gap-1 border-red-500/40 text-red-400 hover:bg-red-500/10"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive / Withdraw
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="w-3.5 h-3.5" /> Download Report Card
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}

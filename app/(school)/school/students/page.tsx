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
} from "lucide-react";
import {
  fetchStudentsDirectory,
  StudentRecord,
} from "@/lib/db/school-admin";

export default function SchoolStudentsPage() {
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRecord | null>(null);
  const [search, setSearch] = React.useState("");
  const [formFilter, setFormFilter] = React.useState("ALL");
  const [houseFilter, setHouseFilter] = React.useState("ALL");
  const [standingFilter, setStandingFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

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

  return (
    <AppShell
      role="PRINCIPAL"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Principal & Head of School"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE)"
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
                All Active Students • Current Academic Year
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
                <option value="Form VI">Form VI (Grade 12)</option>
                <option value="Form V">Form V (Grade 11)</option>
                <option value="Form IV">Form IV (Grade 10)</option>
              </select>

              <select
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Boarding Houses</option>
                <option value="Beau Soleil">Beau Soleil House</option>
                <option value="Rosey Manor">Rosey Manor</option>
                <option value="Eagleton">Eagleton Alpine Lodge</option>
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
                {students.map((std) => (
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
                ))}
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

              {/* Enrolled Courses */}
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Enrolled Subjects &amp; Teachers
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg border border-border/70 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-primary">Class 12 - Advanced Mathematics</div>
                      <div className="text-on-surface-variant text-[11px]">Teacher: Prof. Rajesh Verma</div>
                    </div>
                    <span className="font-bold text-[#3D5B42]">Score: 98% (A1)</span>
                  </div>

                  <div className="p-3 rounded-lg border border-border/70 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-primary">Class 12 - Physics &amp; Mechanics</div>
                      <div className="text-on-surface-variant text-[11px]">Teacher: Dr. S. Raman</div>
                    </div>
                    <span className="font-bold text-[#3D5B42]">Score: 96% (A1)</span>
                  </div>
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

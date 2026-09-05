"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Users,
  Search,
  Download,
  Building2,
  Award,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  fetchStaffFacultyDirectory,
  FacultyMember,
  StaffDepartmentSummary,
} from "@/lib/db/owner";
import { formatIndianCurrency } from "@/lib/utils";

export default function OwnerStaffFacultyPage() {
  const [faculty, setFaculty] = React.useState<FacultyMember[]>([]);
  const [departments, setDepartments] = React.useState<StaffDepartmentSummary[]>([]);
  const [search, setSearch] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchStaffFacultyDirectory();
        setFaculty(data.faculty);
        setDepartments(data.departments);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      search === "" ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === "ALL" || f.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <AppShell
      role="OWNER"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board) Financial Epoch"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Faculty Governance
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                148 Senior PGT/TGT Teachers &amp; Chairs • 1:12.4 Faculty-to-Student Ratio
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Staff &amp; Faculty Governance
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              See all teachers, their subjects, classes they teach, and their joining dates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" className="font-sans gap-2">
              <Download className="w-4 h-4 text-secondary-container" />
              Download Staff List
            </Button>
          </div>
        </div>

        {/* Departmental Payroll & Ratio Allocation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <Card key={dept.name} className="p-5 border-border/80 flex flex-col justify-between h-48">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                  {dept.name}
                </div>
                <div className="font-serif text-2xl font-medium text-primary mt-1">
                  {dept.headCount} Teachers
                </div>
                <div className="font-sans text-xs text-secondary font-semibold mt-0.5">
                  {formatIndianCurrency(dept.salaryBudget)} / yr
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-between items-center text-xs font-sans text-on-surface-variant">
                <span>Student Ratio:</span>
                <span className="font-bold text-primary">{dept.studentRatio}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search faculty by name, academic title, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary w-full md:w-auto"
            >
              <option value="ALL">All Teachers</option>
              <option value="Languages & Humanities">Languages &amp; Humanities</option>
              <option value="Mathematics & Computer Science">Mathematics &amp; Computer Science</option>
              <option value="Natural Sciences & Laboratories">Natural Sciences &amp; Laboratories</option>
              <option value="Executive Leadership">Executive Leadership</option>
            </select>
          </div>
        </Card>

        {/* Faculty Roster Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                Senior Teachers &amp; Departmental Chairs
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Search for teachers by name or department.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Senior Master &amp; Qualifications</th>
                  <th className="py-3.5 px-6">Department &amp; Title</th>
                  <th className="py-3.5 px-6">Active Load</th>
                  <th className="py-3.5 px-6">Tenure</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredFaculty.map((fac) => (
                  <tr key={fac.id} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-serif font-medium text-base text-primary leading-tight">
                        {fac.name}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5 max-w-md">
                        {fac.qualifications}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-primary">{fac.title}</div>
                      <div className="text-on-surface-variant">{fac.department}</div>
                    </td>

                    <td className="py-4 px-6 text-xs font-sans">
                      <span className="font-bold text-primary">{fac.classesCount} Classes</span>
                      <div className="text-on-surface-variant">{fac.studentsCount} Students</div>
                    </td>

                    <td className="py-4 px-6 text-xs font-mono text-primary">
                      {fac.tenureYears} Years
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant={fac.status === "ACTIVE" ? "active" : "neutral"} dot>
                        {fac.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        View
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

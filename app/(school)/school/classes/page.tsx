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
  BookOpen,
  Users,
  Search,
  Building2,
  Calendar,
  Clock,
  PlusCircle,
  Download,
} from "lucide-react";
import {
  fetchClassesAndSections,
  ClassSectionInfo,
} from "@/lib/db/school-admin";

export default function SchoolClassesPage() {
  const [classes, setClasses] = React.useState<ClassSectionInfo[]>([]);
  const [search, setSearch] = React.useState("");
  const [gradeFilter, setGradeFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchClassesAndSections();
        setClasses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.className.toLowerCase().includes(search.toLowerCase()) ||
      c.formTutor.toLowerCase().includes(search.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = gradeFilter === "ALL" || c.gradeLevel.toString() === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <AppShell
      role="PRINCIPAL"
      userName="Mme. Claire De La Tour"
      userRoleTitle="Head of School & Proviseur"
      epochText="Term 3 Cycle (Michaelmas) • Geneva Campus"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Academic Roster Matrix
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                64 Active Sections • 22.4 Average Section Capacity
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Class &amp; Form Section Roster
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Supervise classical forms, form masters, lecture halls, curriculum tracks, and scholar seat allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" className="font-sans gap-2">
              <PlusCircle className="w-4 h-4 text-secondary-container" />
              Add Class Section
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search class by subject, form tutor, or hall..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary w-full md:w-auto"
            >
              <option value="ALL">All Grade Levels</option>
              <option value="12">Grade 12 (Form VI)</option>
              <option value="11">Grade 11 (Form V)</option>
              <option value="10">Grade 10 (Form IV)</option>
              <option value="9">Grade 9 (Form III)</option>
            </select>
          </div>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClasses.map((cls) => {
            const capacityPct = Math.round((cls.enrolledCount / cls.maxCapacity) * 100);

            return (
              <Card key={cls.id} className="p-6 border-border/80 flex flex-col justify-between space-y-4 hover:border-secondary/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-sans text-[11px] font-bold text-secondary uppercase tracking-wider">
                        {cls.form} • Grade {cls.gradeLevel}
                      </span>
                      <h3 className="font-serif text-xl font-medium text-primary mt-0.5">
                        {cls.className}
                      </h3>
                    </div>
                    <Badge variant="navy">{cls.curriculumTrack}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-sans text-on-surface-variant pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                        Form Tutor / Master
                      </span>
                      <div className="font-medium text-primary">{cls.formTutor}</div>
                      <div className="text-[11px] font-mono">{cls.formTutorEmail}</div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                        Hall &amp; Schedule
                      </span>
                      <div className="font-medium text-primary">{cls.roomNumber}</div>
                      <div className="text-[11px]">{cls.meetingSchedule}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-1.5 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Capacity Utilization:</span>
                    <span className="font-bold text-primary">
                      {cls.enrolledCount} / {cls.maxCapacity} Scholars ({capacityPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${capacityPct > 90 ? "bg-secondary" : "bg-[#3D5B42]"}`}
                      style={{ width: `${capacityPct}%` }}
                    ></div>
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

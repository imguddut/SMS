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

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newClass, setNewClass] = React.useState({
    className: "",
    gradeLevel: "10",
    form: "Class 10-C",
    formTutor: "",
    formTutorEmail: "",
    roomNumber: "",
    meetingSchedule: "Mon-Fri 09:00 - 15:30",
    curriculumTrack: "CBSE Standard",
    enrolledCount: 0,
    maxCapacity: 40,
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.className || !newClass.formTutor) return;
    const created: ClassSectionInfo = {
      id: `cls-${Date.now()}`,
      className: newClass.className,
      gradeLevel: parseInt(newClass.gradeLevel),
      form: newClass.form,
      formTutor: newClass.formTutor,
      formTutorEmail: newClass.formTutorEmail || `${newClass.formTutor.toLowerCase().replace(/\s+/g, ".")}@agragati.edu.in`,
      roomNumber: newClass.roomNumber || "Room 204",
      meetingSchedule: newClass.meetingSchedule,
      curriculumTrack: newClass.curriculumTrack,
      enrolledCount: Number(newClass.enrolledCount) || 0,
      maxCapacity: Number(newClass.maxCapacity) || 40,
    };
    setClasses([created, ...classes]);
    setShowAddModal(false);
    setNewClass({
      className: "",
      gradeLevel: "10",
      form: "Class 10-C",
      formTutor: "",
      formTutorEmail: "",
      roomNumber: "",
      meetingSchedule: "Mon-Fri 09:00 - 15:30",
      curriculumTrack: "CBSE Standard",
      enrolledCount: 0,
      maxCapacity: 40,
    });
  };

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
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Principal & Head of School"
      epochText="Term 2 (CBSE Board) • Main Campus"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="navy" dot>
                Classes &amp; Sections
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                {classes.length} Active Classes • 24 Students Average per Section
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Classes &amp; Class Sections
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              View and manage school classes, assigned class teachers, classrooms, schedules, and student enrollment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="font-sans gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              + Add New Class
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by class name, class teacher, or classroom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
            >
              <option value="ALL">All Grades</option>
              <option value="12">Class 12</option>
              <option value="11">Class 11</option>
              <option value="10">Class 10</option>
              <option value="9">Class 9</option>
            </select>
          </div>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClasses.map((cls) => {
            const capacityPct = Math.round((cls.enrolledCount / cls.maxCapacity) * 100);

            return (
              <Card key={cls.id} className="p-6 border-border/80 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-sans text-[11px] font-bold text-blue-400 uppercase tracking-wider">
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
                        Class Teacher
                      </span>
                      <div className="font-medium text-primary">{cls.formTutor}</div>
                      <div className="text-[11px] font-mono">{cls.formTutorEmail}</div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                        Classroom &amp; Timing
                      </span>
                      <div className="font-medium text-primary">{cls.roomNumber}</div>
                      <div className="text-[11px]">{cls.meetingSchedule}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-1.5 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Class Capacity:</span>
                    <span className="font-bold text-primary">
                      {cls.enrolledCount} / {cls.maxCapacity} Students ({capacityPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${capacityPct > 90 ? "bg-amber-400" : "bg-blue-600"}`}
                      style={{ width: `${capacityPct}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add Class Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#0B1528] border border-[#1E2E4A] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-serif text-xl font-medium text-primary">
                  + Add New Class Section
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-on-surface-variant hover:text-primary text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4 font-sans text-xs">
                <div className="space-y-1">
                  <label className="text-primary font-medium">Class / Subject Name</label>
                  <Input
                    required
                    placeholder="e.g. Mathematics - Advanced"
                    value={newClass.className}
                    onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-primary font-medium">Grade Level</label>
                    <select
                      value={newClass.gradeLevel}
                      onChange={(e) => setNewClass({ ...newClass, gradeLevel: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-primary font-medium">Section Name</label>
                    <Input
                      placeholder="e.g. Class 10-A"
                      value={newClass.form}
                      onChange={(e) => setNewClass({ ...newClass, form: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-primary font-medium">Class Teacher Name</label>
                    <Input
                      required
                      placeholder="e.g. Sunita Verma"
                      value={newClass.formTutor}
                      onChange={(e) => setNewClass({ ...newClass, formTutor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-primary font-medium">Room Number</label>
                    <Input
                      placeholder="e.g. Room 302"
                      value={newClass.roomNumber}
                      onChange={(e) => setNewClass({ ...newClass, roomNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-primary font-medium">Current Students</label>
                    <Input
                      type="number"
                      value={newClass.enrolledCount}
                      onChange={(e) => setNewClass({ ...newClass, enrolledCount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-primary font-medium">Max Capacity</label>
                    <Input
                      type="number"
                      value={newClass.maxCapacity}
                      onChange={(e) => setNewClass({ ...newClass, maxCapacity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save &amp; Create Class
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

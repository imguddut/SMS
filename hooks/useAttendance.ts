/**
 * AGRAGATI SCHOOL OS — useAttendance React Hook
 *
 * Provides reactive attendance data fetching and roll-call marking.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  getAttendanceBySection,
  getAttendanceByStudent,
  getAttendanceSummary,
  markAttendance,
  AttendanceEntry,
  AttendanceSummary,
  StudentAttendanceDay,
} from "@/lib/services/attendance-service";

export function useAttendance(options?: {
  sectionId?: string;
  studentId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { schoolId, userId } = useAuth();
  const currentSchoolId = schoolId || "11111111-1111-1111-1111-111111111111";

  const [entries, setEntries] = React.useState<AttendanceEntry[]>([]);
  const [studentDays, setStudentDays] = React.useState<StudentAttendanceDay[]>([]);
  const [summary, setSummary] = React.useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const sectionId = options?.sectionId;
      const studentId = options?.studentId;
      if (sectionId) {
        const res = await getAttendanceBySection(
          currentSchoolId,
          sectionId,
          options?.date || new Date().toISOString().split("T")[0]
        );
        setEntries(res.entries);
      } else if (studentId) {
        const start = options?.startDate || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
        const end = options?.endDate || new Date().toISOString().split("T")[0];
        const data = await getAttendanceByStudent(
          currentSchoolId,
          studentId,
          start,
          end
        );
        setStudentDays(data);
      } else {
        const sum = await getAttendanceSummary(currentSchoolId, options?.date);
        setSummary(sum);
      }
    } catch (err) {
      console.error("useAttendance error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId, options?.sectionId, options?.studentId, options?.date, options?.startDate, options?.endDate]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const submitRoster = React.useCallback(
    async (
      sectionId: string,
      roster: Array<{
        studentId: string;
        status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE";
        reason?: string;
      }>,
      date?: string
    ) => {
      const teacherId = userId || "c0000000-0000-0000-0000-000000000005";
      const targetDate = date || new Date().toISOString().split("T")[0];
      const res = await markAttendance(
        currentSchoolId,
        sectionId,
        targetDate,
        teacherId,
        roster
      );
      await loadData();
      return res;
    },
    [currentSchoolId, userId, loadData]
  );

  return {
    entries,
    studentDays,
    summary,
    isLoading,
    refresh: loadData,
    submitRoster,
  };
}

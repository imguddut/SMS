/**
 * AGRAGATI SCHOOL OS — useMarks React Hook
 *
 * Provides reactive gradebook entry, weighted totals, and student result cards.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  getMarksGrid,
  saveMarks,
  getStudentResults,
  Assessment,
  MarksGridRow,
  StudentResult,
} from "@/lib/services/gradebook-service";

export function useMarks(options?: {
  sectionId?: string;
  subjectId?: string;
  studentId?: string;
  termId?: string;
}) {
  const { schoolId } = useAuth();
  const currentSchoolId = schoolId || "";

  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [grid, setGrid] = React.useState<MarksGridRow[]>([]);
  const [results, setResults] = React.useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    if (!currentSchoolId) {
      setAssessments([]);
      setGrid([]);
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (options?.studentId) {
        const res = await getStudentResults(
          currentSchoolId,
          options.studentId,
          options.termId
        );
        setResults(res);
      } else if (options?.sectionId) {
        const subjectId = options.subjectId || "66666666-6666-6666-6666-666666666666";
        const termId = options.termId || "33333333-3333-3333-3333-333333333333";
        const res = await getMarksGrid(
          currentSchoolId,
          options.sectionId,
          subjectId,
          termId
        );
        setAssessments(res.assessments);
        setGrid(res.rows);
      }
    } catch (err) {
      console.error("useMarks load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId, options?.studentId, options?.sectionId, options?.subjectId, options?.termId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const updateMarks = React.useCallback(
    async (
      assessmentId: string,
      entries: Array<{
        studentId: string;
        rawScore: number;
        gradeLetter?: string;
        gpaPoints?: number;
        comment?: string;
      }>
    ) => {
      const res = await saveMarks(assessmentId, entries);
      await loadData();
      return res;
    },
    [loadData]
  );

  return {
    assessments,
    grid,
    results,
    isLoading,
    refresh: loadData,
    updateMarks,
  };
}

/**
 * AGRAGATI SCHOOL OS — useHomework React Hook
 *
 * Provides reactive homework assignments, student submission handling, and grading.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  getAssignments,
  createAssignment,
  getSubmissions,
  submitSolution,
  gradeSubmission,
  HomeworkAssignment,
  HomeworkSubmission,
} from "@/lib/services/homework-service";

export function useHomework(options?: {
  sectionId?: string;
  studentId?: string;
  assignmentId?: string;
}) {
  const { schoolId, userId } = useAuth();
  const currentSchoolId = schoolId || "11111111-1111-1111-1111-111111111111";

  const [assignments, setAssignments] = React.useState<HomeworkAssignment[]>([]);
  const [submissions, setSubmissions] = React.useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (options?.assignmentId) {
        const subs = await getSubmissions(currentSchoolId, options.assignmentId);
        setSubmissions(subs);
      } else {
        const hwList = await getAssignments(currentSchoolId, {
          sectionId: options?.sectionId,
          studentId: options?.studentId,
        });
        setAssignments(hwList);
      }
    } catch (err) {
      console.error("useHomework load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId, options?.assignmentId, options?.sectionId, options?.studentId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const addAssignment = React.useCallback(
    async (data: {
      sectionId: string;
      subjectId: string;
      title: string;
      briefMarkdown: string;
      dueDatetime: string;
      maxPoints: number;
      attachmentUrls?: string[];
    }) => {
      const teacherId = userId || "c0000000-0000-0000-0000-000000000005";
      const res = await createAssignment(currentSchoolId, {
        ...data,
        teacherId,
      });
      await loadData();
      return res;
    },
    [currentSchoolId, userId, loadData]
  );

  const sendSubmission = React.useCallback(
    async (
      homeworkId: string,
      data: {
        fileUrls?: string[];
        studentNotes?: string;
      },
      studentId?: string
    ) => {
      const actualStudentId =
        studentId || userId || "c0000000-0000-0000-0000-000000000008";
      const res = await submitSolution(homeworkId, actualStudentId, data);
      await loadData();
      return res;
    },
    [userId, loadData]
  );

  const submitGrade = React.useCallback(
    async (
      submissionId: string,
      score: number,
      feedback: string,
      status?: "GRADED" | "RESUBMIT_REQUESTED"
    ) => {
      const teacherId = userId || "c0000000-0000-0000-0000-000000000005";
      const res = await gradeSubmission(submissionId, teacherId, {
        score,
        feedback,
        status,
      });
      await loadData();
      return res;
    },
    [userId, loadData]
  );

  return {
    assignments,
    submissions,
    isLoading,
    refresh: loadData,
    addAssignment,
    sendSubmission,
    submitGrade,
  };
}

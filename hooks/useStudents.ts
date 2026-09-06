/**
 * AGRAGATI SCHOOL OS — useStudents React Hook
 *
 * Provides reactive student data access and mutations.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  archiveStudent,
  StudentRecord,
  CreateStudentPayload,
} from "@/lib/services/student-service";

export function useStudents(options?: { sectionId?: string; house?: string; autoFetch?: boolean }) {
  const { schoolId, userId } = useAuth();
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const currentSchoolId = schoolId || "";

  const loadStudents = React.useCallback(async (searchQuery?: string) => {
    if (!currentSchoolId) {
      setStudents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await listStudents(currentSchoolId, {
        search: searchQuery,
        sectionId: options?.sectionId,
        house: options?.house,
      });
      setStudents(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId, options?.sectionId, options?.house]);

  React.useEffect(() => {
    if (options?.autoFetch !== false) {
      loadStudents();
    }
  }, [loadStudents, options?.autoFetch]);

  const addStudent = React.useCallback(
    async (payload: CreateStudentPayload) => {
      const actorId = userId || "";
      if (!currentSchoolId) throw new Error("No active school session");
      const newStd = await createStudent(currentSchoolId, actorId, payload);
      setStudents((prev) => [newStd, ...prev]);
      return newStd;
    },
    [currentSchoolId, userId]
  );

  const editStudent = React.useCallback(
    async (studentId: string, payload: Partial<CreateStudentPayload>) => {
      const actorId = userId || "";
      if (!currentSchoolId) throw new Error("No active school session");
      await updateStudent(currentSchoolId, studentId, actorId, payload);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...payload } : s))
      );
    },
    [currentSchoolId, userId]
  );

  const removeStudent = React.useCallback(
    async (studentId: string, reason: string) => {
      const actorId = userId || "b0000000-0000-0000-0000-000000000004";
      await archiveStudent(currentSchoolId, studentId, actorId, reason);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    },
    [currentSchoolId, userId]
  );

  return {
    students,
    isLoading,
    error,
    refresh: loadStudents,
    addStudent,
    editStudent,
    removeStudent,
    getStudentById: (id: string) => getStudent(currentSchoolId, id),
  };
}

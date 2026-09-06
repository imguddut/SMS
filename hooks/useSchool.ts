/**
 * AGRAGATI SCHOOL OS — useSchool React Hook
 *
 * Provides reactive access to classes, sections, subjects, and timetable data.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  listClasses,
  listSections,
  listSubjects,
  SchoolClass,
  ClassSection,
  SchoolSubject,
} from "@/lib/services/academic-service";

export function useSchool() {
  const { schoolId } = useAuth();
  const currentSchoolId = schoolId || "";

  const [classes, setClasses] = React.useState<SchoolClass[]>([]);
  const [sections, setSections] = React.useState<ClassSection[]>([]);
  const [subjects, setSubjects] = React.useState<SchoolSubject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    if (!currentSchoolId) {
      setClasses([]);
      setSections([]);
      setSubjects([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [cls, sec, sub] = await Promise.all([
        listClasses(currentSchoolId),
        listSections(currentSchoolId),
        listSubjects(currentSchoolId),
      ]);
      setClasses(cls);
      setSections(sec);
      setSubjects(sub);
    } catch (err) {
      console.error("useSchool load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    classes,
    sections,
    subjects,
    isLoading,
    refresh: loadData,
  };
}

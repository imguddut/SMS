/**
 * AGRAGATI SCHOOL OS — useInvoices React Hook
 *
 * Provides reactive fee structures, student ledgers, and invoice management.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  getInvoices,
  createInvoice,
  getFeeStructures,
  getStudentLedger,
  Invoice,
  FeeStructure,
  StudentLedger,
} from "@/lib/services/finance-service";

export function useInvoices(options?: {
  studentId?: string;
  status?: string;
  guarantorId?: string;
}) {
  const { schoolId } = useAuth();
  const currentSchoolId = schoolId || "11111111-1111-1111-1111-111111111111";

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [feeStructures, setFeeStructures] = React.useState<FeeStructure[]>([]);
  const [ledger, setLedger] = React.useState<StudentLedger | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [invList, fsList] = await Promise.all([
        getInvoices(currentSchoolId, {
          studentId: options?.studentId,
          status: options?.status,
          guarantorId: options?.guarantorId,
        }),
        getFeeStructures(currentSchoolId),
      ]);
      setInvoices(invList);
      setFeeStructures(fsList);

      if (options?.studentId) {
        const led = await getStudentLedger(currentSchoolId, options.studentId);
        setLedger(led);
      }
    } catch (err) {
      console.error("useInvoices load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId, options?.studentId, options?.status, options?.guarantorId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const addInvoice = React.useCallback(
    async (data: {
      studentId: string;
      guarantorId?: string;
      termId?: string;
      dueDate: string;
      items: Array<{ description: string; quantity: number; unitPrice: number; discount?: number }>;
      notes?: string;
    }) => {
      const res = await createInvoice(currentSchoolId, data);
      await loadData();
      return res;
    },
    [currentSchoolId, loadData]
  );

  return {
    invoices,
    feeStructures,
    ledger,
    isLoading,
    refresh: loadData,
    addInvoice,
  };
}

/**
 * AGRAGATI SCHOOL OS — usePayments React Hook
 *
 * Provides reactive payment settlements and bank reconciliation management.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  recordPayment,
  getReconciliation,
  reconcileTransaction,
  BankTransaction,
} from "@/lib/services/finance-service";

export function usePayments() {
  const { schoolId } = useAuth();
  const currentSchoolId = schoolId || "11111111-1111-1111-1111-111111111111";

  const [bankTransactions, setBankTransactions] = React.useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const feed = await getReconciliation(currentSchoolId);
      setBankTransactions(feed);
    } catch (err) {
      console.error("usePayments load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchoolId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const makePayment = React.useCallback(
    async (
      invoiceId: string,
      data: {
        amount: number;
        paymentMethod: "BANK_TRANSFER" | "CARD" | "CASH" | "CHEQUE" | "DIRECT_DEBIT";
        transactionReference?: string;
        notes?: string;
      }
    ) => {
      const res = await recordPayment(currentSchoolId, invoiceId, data);
      await loadData();
      return res;
    },
    [currentSchoolId, loadData]
  );

  const matchTransaction = React.useCallback(
    async (bankTransactionId: string, paymentId?: string, notes?: string) => {
      const res = await reconcileTransaction(
        currentSchoolId,
        bankTransactionId,
        paymentId,
        notes
      );
      await loadData();
      return res;
    },
    [currentSchoolId, loadData]
  );

  return {
    bankTransactions,
    isLoading,
    refresh: loadData,
    makePayment,
    matchTransaction,
  };
}

import { createClient } from "@/lib/supabase/client";
import { sharedStore, SharedInvoice, SharedLedgerTransaction } from "@/lib/db/shared-store";
import { logAudit, AuditAction } from "@/lib/services/audit-service";

export interface FinanceDashboardStats {
  totalInvoiced: number;
  realizedReceipts: number;
  collectionRate: string;
  pendingWithinTerms: number;
  overdueArrears: number;
  currency: string;
  billableScholars: number;
  dailyReconciledAmount: number;
  autoMatchRate: string;
}

export interface FeeStructureItem {
  id: string;
  name: string;
  tierCategory: "SENIOR_BOARDING" | "JUNIOR_BOARDING" | "DAY_SCHOOL" | "SURCHARGE";
  formTarget: string;
  annualFee: number;
  termFee: number;
  currency: string;
  tuitionComponents: {
    name: string;
    amount: number;
  }[];
  activeScholarsCount: number;
}

export interface FinanceInvoiceItem {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  form: string;
  house: string;
  guardianName: string;
  parentName?: string;
  termName: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
}

export interface StudentLedgerItem {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  admissionNumber?: string;
  house: string;
  form: string;
  guardianName: string;
  parentName?: string;
  totalBilled: number;
  totalPaid: number;
  totalSettled?: number;
  balanceDue: number;
  currency: string;
  status: "BALANCED" | "CREDIT" | "OVERDUE";
  lastTransactionDate: string;
  transactions?: LedgerTransaction[];
}

export interface StudentLedgerSummary extends StudentLedgerItem {
  totalSettled: number;
  transactions: LedgerTransaction[];
}

export interface LedgerTransaction {
  id: string;
  date: string;
  type: "INVOICE_BILLED" | "SEPA_PAYMENT" | "DIRECT_DEBIT" | "BURSARY_CREDIT" | "SURCHARGE" | "CREDIT_PAYMENT" | "DEBIT_FEE";
  description: string;
  amount?: number;
  debit: number | null;
  credit: number | null;
  runningBalance: number;
  reference: string;
  referenceNo?: string;
}

export interface BankReconciliationItem {
  id: string;
  transactionRef: string;
  bankSource: string;
  remittanceInfo: string;
  amount: number;
  currency: string;
  timestamp: string;
  matchedStudentName: string | null;
  matchedInvoiceNo: string | null;
  status: "RECONCILED" | "UNMATCHED" | "FLAGGED";
  confidenceScore: string;
}

export interface FinanceReportItem {
  id: string;
  title: string;
  category: "STATEMENT" | "AUDIT" | "AGING" | "TAX";
  period: string;
  generatedDate: string;
  fileFormat: string;
  fileSize: string;
}



// ============================================================================
// FINANCE PORTAL SUPABASE CRUD OPERATIONS (WITH REACTIVE SHARED STORE)
// ============================================================================

// READ: Finance Dashboard Summary Stats
export async function fetchFinanceDashboardStats(schoolId?: string): Promise<FinanceDashboardStats> {
  const storeStats = sharedStore.getFinanceTreasuryStats();

  const supabase = createClient();
  try {
    const { data: invoices } = await supabase.from("invoices").select("total_amount, status");
    const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });

    if (invoices && invoices.length > 0) {
      const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
      const paidInvoices = invoices.filter((i) => i.status === "PAID");
      const realizedReceipts = paidInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
      const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
      const pendingWithinTerms = pendingInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
      const overdueInvoices = invoices.filter((i) => i.status === "OVERDUE");
      const overdueArrears = overdueInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
      const rate = totalInvoiced > 0 ? ((realizedReceipts / totalInvoiced) * 100).toFixed(1) : "0.0";

      return {
        totalInvoiced,
        realizedReceipts,
        collectionRate: `${rate}%`,
        pendingWithinTerms,
        overdueArrears,
        currency: "INR",
        billableScholars: studentCount || 0,
        dailyReconciledAmount: 0,
        autoMatchRate: `${rate}%`,
      };
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchFinanceDashboardStats:", err);
  }

  return {
    ...storeStats,
    billableScholars: 0,
    dailyReconciledAmount: 0,
    autoMatchRate: storeStats.collectionRate || "0.0%",
  };
}

// READ: Fee Structures Directory
export async function fetchFeeStructures(): Promise<FeeStructureItem[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("fee_structures")
      .select(`
        id,
        name,
        frequency,
        currency,
        fee_categories (
          name,
          default_amount
        )
      `);

    if (!error && data && data.length > 0) {
      const dbItems: FeeStructureItem[] = data.map((fs, idx) => {
        const categories = Array.isArray(fs.fee_categories) ? fs.fee_categories : [];
        const annualFee = categories.reduce((sum, c) => sum + (Number(c.default_amount) || 0), 0);
        return {
          id: fs.id,
          name: fs.name,
          tierCategory: idx === 0 || idx === 1 ? "SENIOR_BOARDING" : idx === 2 ? "JUNIOR_BOARDING" : "DAY_SCHOOL",
          formTarget: `Class ${12 - idx}`,
          annualFee,
          termFee: Math.round(annualFee / 4),
          currency: fs.currency || "INR",
          tuitionComponents: categories.map((c) => ({
            name: c.name,
            amount: Number(c.default_amount) || 0,
          })),
          activeScholarsCount: 0,
        };
      });

      return dbItems;
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchFeeStructures:", err);
  }

  return [];
}

// CREATE: Create Fee Structure
export async function createFeeStructure(payload: Partial<FeeStructureItem>): Promise<{ success: boolean; id: string }> {
  const newId = `fee-${Date.now()}`;
  const newItem: FeeStructureItem = {
    id: newId,
    name: payload.name || "Custom Fee Structure",
    tierCategory: payload.tierCategory || "DAY_SCHOOL",
    formTarget: payload.formTarget || "Class 10",
    annualFee: payload.annualFee || 75000,
    termFee: payload.termFee || Math.round((payload.annualFee || 75000) / 4),
    currency: payload.currency || "INR",
    tuitionComponents: payload.tuitionComponents || [{ name: "Core Tuition", amount: payload.annualFee || 75000 }],
    activeScholarsCount: 0,
  };

  const supabase = createClient();
  try {
    await supabase.from("fee_structures").insert({
      name: newItem.name,
      currency: newItem.currency,
      frequency: "TRI_TERM",
    });
  } catch (err) {
    console.warn("Supabase insert for createFeeStructure:", err);
  }

  return { success: true, id: newId };
}

// READ: Invoices with Search & Status Filtering
export async function fetchFinanceInvoices(filters?: { status?: string; search?: string }): Promise<FinanceInvoiceItem[]> {
  const storeInvoices = sharedStore.getInvoices();

  const supabase = createClient();
  try {
    let query = supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        student_id,
        issue_date,
        due_date,
        total_amount,
        status,
        notes,
        students:student_id (
          admission_number,
          house,
          users_profiles:profile_id (
            full_name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const dbInvoices: FinanceInvoiceItem[] = data.map((inv) => {
        const st = Array.isArray(inv.students) ? inv.students[0] : inv.students;
        const prof = Array.isArray(st?.users_profiles) ? st?.users_profiles[0] : st?.users_profiles;
        const matched = storeInvoices.find((si) => si.id === inv.id);
        const status = matched?.status || ((inv.status as any) || "PENDING");
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          studentId: inv.student_id,
          studentName: prof?.full_name || "",
          admissionNumber: st?.admission_number || "",
          form: "",
          house: st?.house || "",
          guardianName: "",
          parentName: "",
          termName: "",
          amount: Number(inv.total_amount) || 0,
          currency: "INR",
          issueDate: inv.issue_date,
          dueDate: inv.due_date,
          paymentMethod: status === "PAID" ? "BHIM UPI (Google Pay)" : "Net Banking / NEFT",
          status,
        };
      });

      const combined = [...storeInvoices.map(si => ({
        id: si.id,
        invoiceNumber: si.invoiceNumber,
        studentId: si.studentId,
        studentName: si.studentName,
        admissionNumber: si.admissionNumber,
        form: si.form,
        house: si.house,
        guardianName: si.guardianName,
        parentName: si.parentName,
        termName: si.termName,
        amount: si.amount,
        currency: si.currency,
        issueDate: si.issueDate,
        dueDate: si.dueDate,
        paymentMethod: si.paymentMethod,
        status: si.status,
      })), ...dbInvoices.filter(d => !storeInvoices.some(si => si.id === d.id))];

      if (!filters?.search) return combined;
      return combined.filter((i) =>
        i.invoiceNumber.toLowerCase().includes(filters.search!.toLowerCase()) ||
        i.studentName.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchFinanceInvoices:", err);
  }

  const allInvoices: FinanceInvoiceItem[] = storeInvoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    studentId: inv.studentId,
    studentName: inv.studentName,
    admissionNumber: inv.admissionNumber || "",
    form: inv.form,
    house: inv.house,
    guardianName: inv.guardianName,
    parentName: inv.parentName,
    termName: inv.termName,
    amount: inv.amount,
    currency: inv.currency,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    paymentMethod: inv.paymentMethod,
    status: inv.status,
  }));

  if (!filters) return allInvoices;

  return allInvoices.filter((inv) => {
    const matchesSearch =
      !filters.search ||
      inv.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
      inv.guardianName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || filters.status === "ALL" || inv.status === filters.status;
    return matchesSearch && matchesStatus;
  });
}

// CREATE: Generate & Dispatch New Invoice
export async function generateInvoice(payload: Partial<FinanceInvoiceItem>): Promise<{ success: boolean; id: string; invoiceNumber?: string }> {
  return createFinanceInvoice(payload);
}

export async function createFinanceInvoice(payload: Partial<FinanceInvoiceItem>): Promise<{ success: boolean; id: string; invoiceNumber?: string }> {
  const newId = `inv-${Date.now()}`;
  const invNumber = payload.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
  const newItem: SharedInvoice = {
    id: newId,
    invoiceNumber: invNumber,
    studentId: payload.studentId || "",
    studentName: payload.studentName || "",
    admissionNumber: payload.admissionNumber || "",
    form: payload.form || "",
    house: payload.house || "",
    guardianName: payload.guardianName || "",
    parentName: payload.parentName || "",
    termName: payload.termName || "",
    amount: payload.amount || 0,
    currency: payload.currency || "INR",
    issueDate: payload.issueDate || new Date().toISOString().split("T")[0],
    dueDate: payload.dueDate || "",
    paymentMethod: payload.paymentMethod || "Direct Debit / UPI",
    status: payload.status || "PENDING",
    description: "",
  };

  // Sync to shared reactive store (instantly visible in Parent portal fees and digest)
  sharedStore.createInvoice(newItem);

  const supabase = createClient();
  try {
    await supabase.from("invoices").insert({
      invoice_number: newItem.invoiceNumber,
      student_id: newItem.studentId,
      issue_date: newItem.issueDate,
      due_date: newItem.dueDate,
      total_amount: newItem.amount,
      balance_due: newItem.amount,
      status: newItem.status,
    });
  } catch (err) {
    console.warn("Supabase insert for createFinanceInvoice:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: AuditAction.INVOICE_CREATED,
    entityTable: "invoices",
    entityId: newId,
    newValues: { invoiceNumber: invNumber, amount: newItem.amount, studentId: newItem.studentId },
  });

  return { success: true, id: newId, invoiceNumber: invNumber };
}

// READ: Student Ledgers Summary
export async function fetchStudentLedgers(filters?: { search?: string; status?: string }): Promise<StudentLedgerSummary[]> {
  const supabase = createClient();
  try {
    let query = supabase
      .from("students")
      .select(`
        id,
        admission_number,
        house,
        users_profiles:profile_id (
          full_name
        ),
        invoices (
          id,
          total_amount,
          status,
          issue_date
        )
      `);

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const ledgers: StudentLedgerSummary[] = data.map((student) => {
        const prof = Array.isArray(student.users_profiles) ? student.users_profiles[0] : student.users_profiles;
        const invoices = Array.isArray(student.invoices) ? student.invoices : [];
        const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
        const totalPaid = invoices
          .filter((inv) => inv.status === "PAID")
          .reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
        const balanceDue = totalBilled - totalPaid;
        const sortedInvoices = [...invoices].sort((a, b) =>
          new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime()
        );

        // Merge shared-store transactions for this student
        const storeTxs = sharedStore.getStudentLedgerTransactions(student.id);

        let status: "BALANCED" | "CREDIT" | "OVERDUE" = "BALANCED";
        if (balanceDue > 0) status = "OVERDUE";
        else if (balanceDue < 0) status = "CREDIT";

        return {
          id: `led-${student.id}`,
          studentId: student.id,
          studentName: prof?.full_name || "",
          studentNumber: student.admission_number || "",
          admissionNumber: student.admission_number || "",
          house: student.house || "",
          form: "",
          guardianName: "",
          parentName: "",
          totalBilled,
          totalPaid,
          totalSettled: totalPaid,
          balanceDue,
          currency: "INR",
          status,
          lastTransactionDate: sortedInvoices[0]?.issue_date || storeTxs[0]?.date || "",
          transactions: storeTxs.map((t) => ({
            id: t.id,
            date: t.date,
            type: t.type,
            description: t.description,
            debit: t.debit,
            credit: t.credit,
            runningBalance: t.runningBalance,
            reference: t.reference,
            referenceNo: t.referenceNo,
            amount: t.amount,
          })),
        };
      });

      const filtered = !filters
        ? ledgers
        : ledgers.filter((l) => {
            const matchesSearch =
              !filters.search ||
              l.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
              l.studentNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
              l.guardianName.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = !filters.status || filters.status === "ALL" || l.status === filters.status;
            return matchesSearch && matchesStatus;
          });

      return filtered;
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentLedgers:", err);
  }

  return [];
}

// READ: Student Ledger Detail
export async function fetchStudentLedgerDetail(studentId: string): Promise<LedgerTransaction[]> {
  const txs = sharedStore.getStudentLedgerTransactions(studentId);
  return txs.map((t) => ({
    id: t.id,
    date: t.date,
    type: t.type,
    description: t.description,
    debit: t.debit,
    credit: t.credit,
    runningBalance: t.runningBalance,
    reference: t.reference,
    referenceNo: t.referenceNo,
    amount: t.amount,
  }));
}

// CREATE: Post Ledger Transaction
export async function postLedgerTransaction(
  studentIdOrPayload: string | { studentId: string; type?: any; amount?: number; category?: string; description?: string; reference?: string; date?: string },
  tx?: any
): Promise<{ success: boolean; id: string }> {
  const studentId = typeof studentIdOrPayload === "string" ? studentIdOrPayload : studentIdOrPayload.studentId;
  const transaction = typeof studentIdOrPayload === "string" ? tx : studentIdOrPayload;

  // Sync to shared reactive store
  const sharedTx: SharedLedgerTransaction = {
    id: transaction?.id || `tx-${Date.now()}`,
    date: transaction?.date || new Date().toISOString().split("T")[0],
    type: transaction?.type === "DEBIT" ? "DEBIT_FEE" : transaction?.type === "CREDIT" ? "CREDIT_PAYMENT" : transaction?.type || "CREDIT_PAYMENT",
    description: transaction?.description || "Fee adjustment transaction",
    debit: transaction?.type === "DEBIT" ? transaction.amount : transaction?.debit || null,
    credit: transaction?.type === "CREDIT" ? transaction.amount : transaction?.credit || null,
    runningBalance: 0,
    reference: transaction?.reference || `ADJ-${Date.now().toString().slice(-4)}`,
    referenceNo: transaction?.reference || `ADJ-${Date.now().toString().slice(-4)}`,
    amount: transaction?.amount || transaction?.credit || transaction?.debit || 0,
  };

  sharedStore.postLedgerTx(studentId, sharedTx);

  const supabase = createClient();
  try {
    if (sharedTx.credit) {
      await supabase.from("payments").insert({
        amount: sharedTx.credit,
        payment_method: "BANK_TRANSFER",
        transaction_reference: sharedTx.reference,
        status: "SETTLED",
      });
    }
  } catch (err) {
    console.warn("Supabase insert for postLedgerTransaction:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: "LEDGER_TRANSACTION_POSTED",
    entityTable: "payments",
    entityId: sharedTx.id,
    newValues: { studentId, amount: sharedTx.amount, type: sharedTx.type },
  });

  return { success: true, id: sharedTx.id };
}

// READ: Bank Reconciliation Feed
export async function fetchBankReconciliationFeed(): Promise<BankReconciliationItem[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("bank_transactions")
      .select("id, transaction_date, reference_text, debit_amount, credit_amount, is_reconciled")
      .order("transaction_date", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((tx) => ({
        id: tx.id,
        transactionRef: `UTR-${tx.id.slice(0, 8)}`,
        bankSource: "HDFC Bank (School Collection A/c)",
        remittanceInfo: tx.reference_text || "",
        amount: Number(tx.credit_amount) || Number(tx.debit_amount) || 0,
        currency: "INR",
        timestamp: tx.transaction_date,
        matchedStudentName: null,
        matchedInvoiceNo: null,
        status: tx.is_reconciled ? "RECONCILED" : "UNMATCHED",
        confidenceScore: tx.is_reconciled ? "100% (Exact Match)" : "Manual Review Required",
      }));
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchBankReconciliationFeed:", err);
  }

  return [];
}

// UPDATE: Reconcile Bank Transaction
export async function reconcileTransaction(
  idOrPayload: string | { transactionId: string; ledgerEntryId?: string; matchStatus?: string }
): Promise<{ success: boolean }> {
  const id = typeof idOrPayload === "string" ? idOrPayload : idOrPayload.transactionId;

  const supabase = createClient();
  try {
    await supabase.from("bank_transactions").update({ is_reconciled: true }).eq("id", id);
    await supabase.from("payment_reconciliations").insert({
      bank_transaction_id: id,
      reconciliation_status: "RECONCILED",
      notes: "Auto-reconciled via Finance Desk",
    });
  } catch (err) {
    console.warn("Supabase update for reconcileTransaction:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: AuditAction.RECONCILIATION_COMPLETED,
    entityTable: "bank_transactions",
    entityId: id,
    newValues: { transactionId: id, status: "RECONCILED" },
  });

  return { success: true };
}

// READ: Finance Reports
export async function fetchFinanceReports(): Promise<FinanceReportItem[]> {
  return [
    {
      id: "fr-01",
      title: "Quarterly Fee Realization & Collection Velocity Statement",
      category: "STATEMENT",
      period: "Term 2 (Oct – Dec 2024)",
      generatedDate: "Today, 05:00 IST",
      fileFormat: "PDF",
      fileSize: "2.8 MB",
    },
    {
      id: "fr-02",
      title: "Annual School Trial Balance & Bank Reconciliation Statement",
      category: "AUDIT",
      period: "FY 2024–2025 (Year-to-Date)",
      generatedDate: "Yesterday, 18:30 IST",
      fileFormat: "CSV",
      fileSize: "1.4 MB",
    },
    {
      id: "fr-03",
      title: "Student Fee Defaulters & Overdue Aging Register",
      category: "AGING",
      period: "As of Today",
      generatedDate: "Today, 08:00 IST",
      fileFormat: "PDF",
      fileSize: "1.2 MB",
    },
    {
      id: "fr-04",
      title: "RTE 25% Free Seat Reimbursement Government Filing Report",
      category: "TAX",
      period: "Academic Session 2024–2025",
      generatedDate: "3 days ago",
      fileFormat: "PDF",
      fileSize: "4.1 MB",
    },
  ];
}

// UPDATE: Settle Invoice Payment
export async function settleInvoicePayment(payload: {
  invoiceId: string;
  amount?: number;
  paymentMethod?: string;
  transactionReference?: string;
}): Promise<{ success: boolean; receiptNumber: string }> {
  const res = sharedStore.payInvoice(payload.invoiceId, payload.paymentMethod || "BHIM_UPI (Google Pay)");
  return {
    success: res.success,
    receiptNumber: res.receiptRef,
  };
}



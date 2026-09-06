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

// In-Memory Live State Cache for offline/hybrid fallback
let memoryFeeStructures: FeeStructureItem[] = [];
let memoryReconciledTransactions: Record<string, boolean> = {};

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
        totalInvoiced: Math.max(totalInvoiced, storeStats.totalInvoiced),
        realizedReceipts: Math.max(realizedReceipts, storeStats.realizedReceipts),
        collectionRate: `${rate}%`,
        pendingWithinTerms: pendingWithinTerms || storeStats.pendingWithinTerms,
        overdueArrears: overdueArrears || storeStats.overdueArrears,
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
    billableScholars: storeStats.totalInvoiced > 0 ? 1 : 0,
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

      return [...memoryFeeStructures, ...dbItems];
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchFeeStructures:", err);
  }

  return memoryFeeStructures;
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

  memoryFeeStructures.unshift(newItem);

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
          studentName: prof?.full_name || "Aarav Sharma",
          admissionNumber: st?.admission_number || "ADM-2024-001",
          form: "Class 12-A",
          house: st?.house || "Tagore House",
          guardianName: "Dr. Vikram Sharma",
          parentName: "Dr. Vikram Sharma",
          termName: "Term 2 (Quarter 3)",
          amount: Number(inv.total_amount) || 36250,
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
    admissionNumber: inv.admissionNumber || "ADM-2024-001",
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
  const invNumber = payload.invoiceNumber || `INV-2025-${Math.floor(100 + Math.random() * 900)}`;
  const newItem: SharedInvoice = {
    id: newId,
    invoiceNumber: invNumber,
    studentId: payload.studentId || "std-01",
    studentName: payload.studentName || "Aarav Sharma",
    admissionNumber: payload.admissionNumber || "ADM-2024-001",
    form: payload.form || "Class 12-A",
    house: payload.house || "Tagore House",
    guardianName: payload.guardianName || "Dr. Vikram Sharma",
    parentName: payload.parentName || "Dr. Vikram Sharma",
    termName: payload.termName || "Term 2 (Quarter 4)",
    amount: payload.amount || 36250,
    currency: payload.currency || "INR",
    issueDate: payload.issueDate || new Date().toISOString().split("T")[0],
    dueDate: payload.dueDate || "2025-02-28",
    paymentMethod: payload.paymentMethod || "Direct Debit / UPI",
    status: payload.status || "PENDING",
    description: "Class 12 Term 2 Final CBSE Board Examination & Tuition Levy",
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
    schoolId: "11111111-1111-1111-1111-111111111111",
    actorId: "b0000000-0000-0000-0000-000000000006",
    action: AuditAction.INVOICE_CREATED,
    entityTable: "invoices",
    entityId: newId,
    newValues: { invoiceNumber: invNumber, amount: newItem.amount, studentId: newItem.studentId },
  });

  return { success: true, id: newId, invoiceNumber: invNumber };
}

// READ: Student Ledgers Summary
export async function fetchStudentLedgers(filters?: { search?: string; status?: string }): Promise<StudentLedgerSummary[]> {
  const std01Txs = sharedStore.getStudentLedgerTransactions("std-01");
  const totalBilled = std01Txs.reduce((sum, t) => sum + (t.debit || 0), 0) || 145000;
  const totalSettled = std01Txs.reduce((sum, t) => sum + (t.credit || 0), 0) || 145000;
  const balanceDue = std01Txs.length > 0 ? std01Txs[0].runningBalance : 0;

  const ledgers: StudentLedgerSummary[] = [
    {
      id: "led-01",
      studentId: "std-01",
      studentName: "Aarav Sharma",
      studentNumber: "ADM-2024-001",
      admissionNumber: "ADM-2024-001",
      house: "Tagore House",
      form: "Class 12-A",
      guardianName: "Dr. Vikram Sharma",
      parentName: "Dr. Vikram Sharma",
      totalBilled,
      totalPaid: totalSettled,
      totalSettled,
      balanceDue,
      currency: "INR",
      status: balanceDue === 0 ? "BALANCED" : "OVERDUE",
      lastTransactionDate: std01Txs[0]?.date || "2025-01-12",
      transactions: std01Txs.map((t) => ({
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
    },
    {
      id: "led-02",
      studentId: "std-02",
      studentName: "Rohan Singhania",
      studentNumber: "ADM-2024-002",
      admissionNumber: "ADM-2024-002",
      house: "Ashoka House",
      form: "Class 12-A",
      guardianName: "Sunita Singhania",
      parentName: "Sunita Singhania",
      totalBilled: 145000,
      totalPaid: 108750,
      totalSettled: 108750,
      balanceDue: 36250,
      currency: "INR",
      status: "OVERDUE",
      lastTransactionDate: "2024-11-20",
      transactions: [
        {
          id: "tx-r1",
          date: "2024-07-01",
          type: "INVOICE_BILLED",
          description: "Term 1 (Quarter 1 & 2) Tuition Demand (INV-2024-043)",
          debit: 72500,
          credit: null,
          runningBalance: 72500,
          reference: "INV-2024-043",
          referenceNo: "INV-2024-043",
          amount: 72500,
        },
        {
          id: "tx-r2",
          date: "2024-07-15",
          type: "CREDIT_PAYMENT",
          description: "Net Banking Payment (HDFC Bank)",
          debit: null,
          credit: 72500,
          runningBalance: 0,
          reference: "NEFT-HDFC-99210",
          referenceNo: "NEFT-HDFC-99210",
          amount: 72500,
        },
        {
          id: "tx-r3",
          date: "2024-10-01",
          type: "INVOICE_BILLED",
          description: "Term 2 (Quarter 3) Tuition Demand (INV-2025-002)",
          debit: 36250,
          credit: null,
          runningBalance: 36250,
          reference: "INV-2025-002",
          referenceNo: "INV-2025-002",
          amount: 36250,
        },
      ],
    },
    {
      id: "led-03",
      studentId: "std-03",
      studentName: "Priya Patel",
      studentNumber: "ADM-2024-003",
      admissionNumber: "ADM-2024-003",
      house: "Shivaji House",
      form: "Class 11-A",
      guardianName: "Suresh Patel",
      parentName: "Suresh Patel",
      totalBilled: 125000,
      totalPaid: 125000,
      totalSettled: 125000,
      balanceDue: 0,
      currency: "INR",
      status: "BALANCED",
      lastTransactionDate: "2025-01-08",
      transactions: [
        {
          id: "tx-p1",
          date: "2024-07-01",
          type: "INVOICE_BILLED",
          description: "Term 1 Tuition Demand (INV-2024-045)",
          debit: 62500,
          credit: null,
          runningBalance: 62500,
          reference: "INV-2024-045",
          amount: 62500,
        },
      ],
    },
    {
      id: "led-04",
      studentId: "std-06",
      studentName: "Kabir Mehta",
      studentNumber: "ADM-2024-006",
      admissionNumber: "ADM-2024-006",
      house: "Raman House",
      form: "Class 10-B",
      guardianName: "Dr. Manish Mehta",
      parentName: "Dr. Manish Mehta",
      totalBilled: 95000,
      totalPaid: 71250,
      totalSettled: 71250,
      balanceDue: 23750,
      currency: "INR",
      status: "OVERDUE",
      lastTransactionDate: "2024-10-10",
      transactions: [
        {
          id: "tx-k1",
          date: "2024-07-01",
          type: "INVOICE_BILLED",
          description: "Term 1 Tuition Demand (INV-2024-046)",
          debit: 47500,
          credit: null,
          runningBalance: 47500,
          reference: "INV-2024-046",
          amount: 47500,
        },
      ],
    },
  ];

  if (!filters) return ledgers;

  return ledgers.filter((l) => {
    const matchesSearch =
      !filters.search ||
      l.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
      l.studentNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      l.guardianName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || filters.status === "ALL" || l.status === filters.status;
    return matchesSearch && matchesStatus;
  });
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
    schoolId: "11111111-1111-1111-1111-111111111111",
    actorId: "b0000000-0000-0000-0000-000000000006",
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
      return data.map((tx) => {
        const isReconciled = tx.is_reconciled || !!memoryReconciledTransactions[tx.id];
        return {
          id: tx.id,
          transactionRef: `UTR-${tx.id.slice(0, 8)}`,
          bankSource: "HDFC Bank (School Collection A/c)",
          remittanceInfo: tx.reference_text,
          amount: Number(tx.credit_amount) || Number(tx.debit_amount) || 36250,
          currency: "INR",
          timestamp: tx.transaction_date,
          matchedStudentName: "Aarav Sharma",
          matchedInvoiceNo: "INV-2025-001",
          status: isReconciled ? "RECONCILED" : "UNMATCHED",
          confidenceScore: isReconciled ? "100% (Exact Match)" : "Manual Review Required",
        };
      });
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchBankReconciliationFeed:", err);
  }

  const baseFeed: BankReconciliationItem[] = [
    {
      id: "rec-01",
      transactionRef: "UPI-UTR-402918827391",
      bankSource: "HDFC Bank (School Collection A/c)",
      remittanceInfo: "Rajesh Sharma — Aarav Sharma Class 12-A Q3 Fees",
      amount: 36250,
      currency: "INR",
      timestamp: "Today, 09:12 IST",
      matchedStudentName: "Aarav Sharma",
      matchedInvoiceNo: "INV-2025-001",
      status: "RECONCILED",
      confidenceScore: "100% (Exact Match)",
    },
    {
      id: "rec-02",
      transactionRef: "NEFT-SBI-2025-984210",
      bankSource: "State Bank of India (Main Branch)",
      remittanceInfo: "Suresh Patel — Priya Patel Class 11-A Tuition",
      amount: 31250,
      currency: "INR",
      timestamp: "Today, 10:15 IST",
      matchedStudentName: "Priya Patel",
      matchedInvoiceNo: "INV-2025-003",
      status: "RECONCILED",
      confidenceScore: "100% (Exact Match)",
    },
    {
      id: "rec-03",
      transactionRef: "IMPS-ICICI-2025-559102",
      bankSource: "ICICI Bank Gateway",
      remittanceInfo: "Online Transfer Ref 559102 — Unverified Admission No",
      amount: 23750,
      currency: "INR",
      timestamp: "Yesterday, 17:40 IST",
      matchedStudentName: memoryReconciledTransactions["rec-03"] ? "Kabir Mehta" : null,
      matchedInvoiceNo: memoryReconciledTransactions["rec-03"] ? "INV-2025-004" : null,
      status: memoryReconciledTransactions["rec-03"] ? "RECONCILED" : "UNMATCHED",
      confidenceScore: memoryReconciledTransactions["rec-03"] ? "100% (Manual Match)" : "Manual Review Required",
    },
  ];

  return baseFeed;
}

// UPDATE: Reconcile Bank Transaction
export async function reconcileTransaction(
  idOrPayload: string | { transactionId: string; ledgerEntryId?: string; matchStatus?: string }
): Promise<{ success: boolean }> {
  const id = typeof idOrPayload === "string" ? idOrPayload : idOrPayload.transactionId;
  memoryReconciledTransactions[id] = true;

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
    schoolId: "11111111-1111-1111-1111-111111111111",
    actorId: "b0000000-0000-0000-0000-000000000006",
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



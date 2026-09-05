"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Receipt,
  Phone,
  Mail,
  Coins,
  Check,
  X,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { sharedStore, SharedExpense, SharedVendor } from "@/lib/db/shared-store";
import { formatIndianCurrency } from "@/lib/utils";

export default function FinanceExpensesPage() {
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "VENDORS">("EXPENSES");
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [vendors, setVendors] = useState<SharedVendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<SharedExpense | null>(null);

  // New Expense Form
  const [expenseForm, setExpenseForm] = useState({
    vendorId: "",
    vendorName: "",
    category: "Lab Equipment",
    description: "",
    amount: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
  });

  // New Vendor Form
  const [vendorForm, setVendorForm] = useState({
    name: "",
    category: "Academic Books & Library",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    taxId: "",
    bankAccount: "",
  });

  const loadData = () => {
    setExpenses(sharedStore.getExpenses());
    setVendors(sharedStore.getVendors());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.vendorName || !expenseForm.description || !expenseForm.amount) {
      alert("Please fill in Vendor, Description, and Amount.");
      return;
    }

    const expNum = `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const created = sharedStore.createExpense({
      schoolId: "11111111-1111-1111-1111-111111111111",
      expenseNumber: expNum,
      vendorId: expenseForm.vendorId || undefined,
      vendorName: expenseForm.vendorName,
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      currency: "INR",
      invoiceDate: expenseForm.invoiceDate,
      dueDate: expenseForm.dueDate || undefined,
      status: "PENDING_APPROVAL",
    });

    // Also register in approvals queue for Principal
    sharedStore.addApproval({
      approvalType: "STAFF_APPOINTMENT",
      title: `${created.vendorName} Invoice (${expNum})`,
      applicant: "Chief Accounts Officer",
      applicantRole: "Accounts & Bursary",
      amountOrScope: `₹ ${parseFloat(expenseForm.amount).toLocaleString("en-IN")}`,
      justification: created.description,
      status: "PENDING",
      petitionerNotes: `Category: ${created.category} | Vendor: ${created.vendorName}`,
    });

    setExpenses(sharedStore.getExpenses());
    setShowExpenseModal(false);
    setExpenseForm({
      vendorId: "",
      vendorName: "",
      category: "Lab Equipment",
      description: "",
      amount: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
    });
    showToast(`Bill ${expNum} created and sent to Principal for approval.`);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.contactPerson || !vendorForm.phone) {
      alert("Please fill in Vendor Name, Contact Person, and Phone.");
      return;
    }

    const created = sharedStore.createVendor({
      schoolId: "11111111-1111-1111-1111-111111111111",
      name: vendorForm.name,
      category: vendorForm.category,
      contactPerson: vendorForm.contactPerson,
      phone: vendorForm.phone,
      email: vendorForm.email,
      address: vendorForm.address,
      taxId: vendorForm.taxId,
      bankAccount: vendorForm.bankAccount,
      isActive: true,
    });

    setVendors(sharedStore.getVendors());
    setShowVendorModal(false);
    setVendorForm({
      name: "",
      category: "Academic Books & Library",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      bankAccount: "",
    });
    showToast(`Vendor "${created.name}" registered successfully.`);
  };

  const handlePayExpense = (id: string) => {
    const paymentRef = `NEFT-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const updated = sharedStore.updateExpenseStatus(id, "PAID", undefined, paymentRef);
    if (updated) {
      setExpenses(sharedStore.getExpenses());
      if (selectedExpense?.id === id) {
        setSelectedExpense(updated);
      }
      showToast(`Bill marked as PAID via ${paymentRef}`);
    }
  };

  const totalAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const pendingApprovalAmount = expenses
    .filter((e) => e.status === "PENDING_APPROVAL")
    .reduce((acc, e) => acc + e.amount, 0);
  const approvedAmount = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((acc, e) => acc + e.amount, 0);
  const paidAmount = expenses
    .filter((e) => e.status === "PAID")
    .reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredVendors = vendors.filter((v) => {
    return (
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AppShell
      role="ACCOUNTANT"
      userName="Rameshwar Gupta"
      userRoleTitle="Chief Accounts Officer"
      epochText="Fiscal Year 2024–2025 • Q3 Operations"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#131F37] border border-blue-500/40 text-blue-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Treasury &amp; Procurement
              </span>
              <span className="text-xs text-slate-400">School Purchasing &amp; Vendor Payments</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Bills &amp; Vendor Expenses
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track school purchases, get Principal approval for high-value bills, and record bank payment payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "EXPENSES" ? (
              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                + Record New Bill
              </button>
            ) : (
              <button
                onClick={() => setShowVendorModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                + Add New Vendor
              </button>
            )}
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-400 block">Total Expenses Billed</span>
            <div className="text-2xl font-bold text-white mt-1">₹ {totalAmount.toLocaleString("en-IN")}</div>
            <span className="text-xs text-slate-500 mt-1 block">{expenses.length} invoices total</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-amber-400 block">Awaiting Principal Review</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              ₹ {pendingApprovalAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {expenses.filter((e) => e.status === "PENDING_APPROVAL").length} bills pending approval
            </span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-blue-400 block">Approved &amp; Ready to Pay</span>
            <div className="text-2xl font-bold text-blue-300 mt-1">₹ {approvedAmount.toLocaleString("en-IN")}</div>
            <span className="text-xs text-slate-500 mt-1 block">Sanctioned by Head of School</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-emerald-400 block">Settled &amp; Paid</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">₹ {paidAmount.toLocaleString("en-IN")}</div>
            <span className="text-xs text-slate-500 mt-1 block">Disbursed via bank transfer</span>
          </div>
        </div>

        {/* Navigation Tabs & Search Toolbar */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("EXPENSES")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "EXPENSES"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-[#131F37]"
              }`}
            >
              School Bills &amp; Purchases ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab("VENDORS")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "VENDORS"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-[#131F37]"
              }`}
            >
              Vendors &amp; Suppliers ({vendors.length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === "EXPENSES" ? "Search bills..." : "Search suppliers..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#131F37] border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {activeTab === "EXPENSES" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#131F37] border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Expenses List */}
        {activeTab === "EXPENSES" && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#131F37]/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Bill #</th>
                    <th className="py-3 px-4 font-semibold">Vendor / Supplier</th>
                    <th className="py-3 px-4 font-semibold">Category &amp; Description</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Approval / Settlement</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#131F37]/40 transition">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-400">
                          {exp.expenseNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white text-xs">
                          {exp.vendorName}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-white font-medium">{exp.category}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{exp.description}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white text-xs">
                          ₹ {exp.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          {exp.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid &amp; Settled
                            </span>
                          ) : exp.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              <Check className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : exp.status === "REJECTED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                              <XCircle className="w-3.5 h-3.5" /> Declined
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3.5 h-3.5" /> Needs Principal Approval
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                          {exp.paymentReference ? (
                            <span className="text-emerald-400">{exp.paymentReference}</span>
                          ) : exp.approvedBy ? (
                            <span>{exp.approvedBy}</span>
                          ) : (
                            <span className="text-slate-500">In review queue</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {exp.status === "APPROVED" ? (
                            <button
                              onClick={() => handlePayExpense(exp.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                            >
                              Record Payout
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedExpense(exp)}
                              className="px-3 py-1 bg-[#131F37] hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/60 transition"
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vendors List */}
        {activeTab === "VENDORS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredVendors.map((ven) => (
              <div key={ven.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                      {ven.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{ven.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active Vendor
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3">
                  <div>
                    <span className="text-slate-500 block">Contact Person</span>
                    <span className="font-medium text-white">{ven.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone</span>
                    <span className="font-mono">{ven.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email</span>
                    <span>{ven.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST / Tax ID</span>
                    <span className="font-mono">{ven.taxId || "Not Registered"}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Bank Account: {ven.bankAccount || "Direct NEFT / RTGS"}</span>
                  <button
                    onClick={() => {
                      setExpenseForm((prev) => ({
                        ...prev,
                        vendorId: ven.id,
                        vendorName: ven.name,
                      }));
                      setShowExpenseModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    + Add Bill for Vendor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Record New Bill */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-400" /> Record New School Bill
                </h2>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3.5 text-sm">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Vendor / Supplier *</label>
                  <select
                    value={expenseForm.vendorName}
                    onChange={(e) => {
                      const v = vendors.find((vend) => vend.name === e.target.value);
                      setExpenseForm({
                        ...expenseForm,
                        vendorName: e.target.value,
                        vendorId: v ? v.id : "",
                      });
                    }}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select an enrolled vendor...</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Category *</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Lab Equipment">Lab &amp; STEM Equipment</option>
                      <option value="Library & Texts">Library Books &amp; Study Materials</option>
                      <option value="Campus Facilities">Campus Facilities &amp; Hygiene</option>
                      <option value="Sports Equipment">Sports &amp; Athletics</option>
                      <option value="IT Infrastructure">Computers &amp; Smart Classes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Total Bill Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 75000"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description / Items Purchased *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="List invoice item details, quantity, and purpose..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bill Date</label>
                    <input
                      type="date"
                      value={expenseForm.invoiceDate}
                      onChange={(e) => setExpenseForm({ ...expenseForm, invoiceDate: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={expenseForm.dueDate}
                      onChange={(e) => setExpenseForm({ ...expenseForm, dueDate: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  💡 This bill will automatically appear in the Principal Governance Desk for financial approval.
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
                  >
                    Save &amp; Request Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Register New Vendor */}
        {showVendorModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" /> Register New Supplier
                </h2>
                <button
                  onClick={() => setShowVendorModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVendor} className="space-y-3.5 text-sm">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Company / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cambridge University Press India"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Category *</label>
                    <select
                      value={vendorForm.category}
                      onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Academic Books & Library">Academic Books &amp; Library</option>
                      <option value="Sports & Fitness">Sports &amp; Fitness</option>
                      <option value="Lab & Technology">Lab &amp; Technology</option>
                      <option value="Campus Facilities">Campus Facilities</option>
                      <option value="Uniforms & Stationery">Uniforms &amp; Stationery</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={vendorForm.contactPerson}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="orders@supplier.in"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">GST / Tax ID</label>
                    <input
                      type="text"
                      placeholder="07AAAAA0000A1Z5"
                      value={vendorForm.taxId}
                      onChange={(e) => setVendorForm({ ...vendorForm, taxId: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bank Account &amp; IFSC</label>
                    <input
                      type="text"
                      placeholder="HDFC0001234 / 502000..."
                      value={vendorForm.bankAccount}
                      onChange={(e) => setVendorForm({ ...vendorForm, bankAccount: e.target.value })}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Office Address</label>
                  <input
                    type="text"
                    placeholder="Building, street, city"
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowVendorModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
                  >
                    Save Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

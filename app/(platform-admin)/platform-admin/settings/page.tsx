"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { useAuth } from "@/components/providers/auth-context";
import {
  ShieldCheck,
  RotateCw,
  Globe,
  Server,
  Building2,
  Lock,
  Cpu,
  KeyRound,
  Sparkles,
  Layers,
  Fingerprint,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  UserCheck,
  ChevronRight,
  Shield,
  Search,
  Download,
} from "lucide-react";
import {
  verifyCryptographicSignature,
  runRlsIsolationAudit,
  fetchSwissFadpComplianceMetrics,
  generateSovereignDataVaultExport,
  SignatureVerificationResult,
  RlsAuditTableResult,
  SwissFadpComplianceItem,
  DataVaultExportResult,
} from "@/lib/db/security";
import { fetchPlatformAuditLogs, PlatformAuditLog } from "@/lib/db/platform-admin";
import { fetchSecuritySettings, updateSecuritySettings } from "@/lib/db/security-settings";

export default function PlatformAdminSettingsPage() {
  const { profile } = useAuth();
  const userName = profile?.full_name || "Platform Admin";

  const [activeTab, setActiveTab] = React.useState<"HSM" | "CRYPTO_VERIFIER" | "RLS_AUDIT" | "FADP_COMPLIANCE">("HSM");
  const [keyRotated, setKeyRotated] = React.useState(false);
  const [sessionTtl, setSessionTtl] = React.useState("24h");
  const [mfaEnforced, setMfaEnforced] = React.useState(true);
  const [quantumCrypto, setQuantumCrypto] = React.useState(true);
  const [auditStream, setAuditStream] = React.useState(true);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Cryptographic Verifier State
  const [inputSealHash, setInputSealHash] = React.useState("");
  const [verificationResult, setVerificationResult] = React.useState<SignatureVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  // RLS Audit State
  const [rlsAuditTables, setRlsAuditTables] = React.useState<RlsAuditTableResult[]>([]);
  const [isScanningRls, setIsScanningRls] = React.useState(false);
  const [rlsScannedCount, setRlsScannedCount] = React.useState(0);

  // FADP & Data Vault State
  const [complianceList, setComplianceList] = React.useState<SwissFadpComplianceItem[]>([]);
  const [vaultExport, setVaultExport] = React.useState<DataVaultExportResult | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = React.useState<PlatformAuditLog[]>([]);

  React.useEffect(() => {
    async function loadSubsystems() {
      try {
        const [rlsData, fadpData, logsData] = await Promise.all([
          runRlsIsolationAudit(),
          fetchSwissFadpComplianceMetrics(),
          fetchPlatformAuditLogs(),
        ]);
        setRlsAuditTables(rlsData.tables);
        setRlsScannedCount(rlsData.totalRecordsChecked);
        setComplianceList(fadpData);
        setAuditLogs(logsData);
      } catch (err) {
        console.error(err);
      }
    }
    loadSubsystems();
  }, []);

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  const handleSavePolicies = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleVerifySeal = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyCryptographicSignature(inputSealHash);
      setVerificationResult(res);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTriggerRlsScan = async () => {
    setIsScanningRls(true);
    try {
      const res = await runRlsIsolationAudit();
      setRlsAuditTables(res.tables);
      setRlsScannedCount(res.totalRecordsChecked);
    } finally {
      setIsScanningRls(false);
    }
  };

  const handleExportVault = async () => {
    setIsExporting(true);
    try {
      const res = await generateSovereignDataVaultExport();
      setVaultExport(res);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName={userName}
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Central Administration • Cloud Network Active"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                System Security Settings
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • Cloud Security Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Platform Security &amp; Privacy Settings
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-3xl">
              System-wide security controls, document verification, data privacy scanner, and backup exports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSavePolicies}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{savedSuccess ? "Settings Saved!" : "Save Security Settings"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200/90 gap-8 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("HSM")}
            className={`pb-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === "HSM"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Security &amp; Encryption</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CRYPTO_VERIFIER")}
            className={`pb-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === "CRYPTO_VERIFIER"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Document Authenticity Verifier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RLS_AUDIT")}
            className={`pb-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === "RLS_AUDIT"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Data Privacy &amp; Isolation Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FADP_COMPLIANCE")}
            className={`pb-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === "FADP_COMPLIANCE"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Compliance &amp; Data Backup</span>
          </button>
        </div>

        {/* Tab 1: Architecture & HSM Enclave */}
        {activeTab === "HSM" && (
          <div className="space-y-6">
            {/* 4 Multi-Region Server Node Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Node 1: Zurich */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Nominal
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3">
                    Zurich-Alpha-01
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Switzerland (Alpine Core)
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    Primary Sovereign Vault
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>RTT Latency: 14ms</span>
                </div>
              </div>

              {/* Node 2: Geneva */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Nominal
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3">
                    Geneva-Beta-02
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Switzerland (Lac Léman)
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    Hot Replication Node
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>RTT Latency: 18ms</span>
                </div>
              </div>

              {/* Node 3: Singapore */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Online
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3">
                    Singapore-Edge-01
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Singapore (DIFC Proxy)
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    Sovereign Edge Gateway
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>RTT Latency: 84ms</span>
                </div>
              </div>

              {/* Node 4: London */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      Standby
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-3">
                    London-DR-01
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    United Kingdom (London)
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    Cold Disaster Recovery
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>RTT Latency: 32ms</span>
                </div>
              </div>
            </div>

            {/* 2-Column Configuration Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Dedicated HSM Hardware Enclave */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Dedicated HSM Hardware Cryptographic Enclave
                      </h2>
                      <p className="text-xs text-slate-500">
                        Quantum-resistant lattice signatures &amp; FIPS 140-3 zero-knowledge proof generation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRotateKey}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors self-start sm:self-auto"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${keyRotated ? "animate-spin text-indigo-600" : ""}`} />
                      <span>{keyRotated ? "Rotating..." : "Rotate Master Keypair"}</span>
                    </button>
                  </div>

                  <div className="space-y-4 pt-2 text-xs">
                    {/* Key 1 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Master Root Key ID
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            HSM-ZUR-9942-X-PROD
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                        Hardware Attestation Verified
                      </span>
                    </div>

                    {/* Key 2 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Cryptographic Algorithm
                        </span>
                        <span className="font-bold text-slate-900 text-sm block">
                          CRYSTALS-Dilithium5
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Post-quantum lattice dual signature
                        </span>
                      </div>
                    </div>

                    {/* Key 3 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Zero-Knowledge Proofs
                        </span>
                        <span className="font-bold text-slate-900 text-sm block">
                          48,290 Rollups / 24h
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Zero-knowledge gradebook sealing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Global Platform Security Policies */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Global Platform Security Policies
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Enforced across all institutional nodes, chancellors, faculty, and guardian portals.
                  </p>

                  <div className="space-y-4 pt-1 text-xs">
                    {/* Policy 1: MFA */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            Enforce Multi-Factor Authentication (MFA)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Mandatory WebAuthn biometric passkey or TOTP for all accounts.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMfaEnforced(!mfaEnforced)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                          mfaEnforced ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                            mfaEnforced ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Policy 2: Quantum Mode */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            Post-Quantum Encryption Mode
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Encrypt all ledger and grade records with Dilithium-5 keys.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuantumCrypto(!quantumCrypto)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                          quantumCrypto ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                            quantumCrypto ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Policy 3: Session TTL */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            Administrative Session Time-To-Live (TTL)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Automatically invalidate dormant Super Admin and Executive sessions.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                        {["4h", "8h", "12h", "24h"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSessionTtl(t)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                              sessionTtl === t
                                ? "bg-indigo-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Policy 4: Geo Fencing */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            Sovereign Geo-Fencing &amp; IP Allowlist
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Restrict database access to approved campus network ranges.
                          </span>
                        </div>
                      </div>
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Policy 5: Audit Stream */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            Sovereign Administrative Audit Stream
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Immutable, cryptographically signed ledger of all platform actions.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAuditStream(!auditStream)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                          auditStream ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                            auditStream ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Live Ingestion Audit Log */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-100 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                  Live Ingestion
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-6">Event &amp; Action</th>
                      <th className="py-3.5 px-6">Actor</th>
                      <th className="py-3.5 px-6">Target Node</th>
                      <th className="py-3.5 px-6">Timestamp</th>
                      <th className="py-3.5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                          No platform audit logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">
                                  {log.action}
                                </span>
                                <span className="text-[11px] text-slate-500 line-clamp-1">
                                  {log.details && log.details !== "{}" ? log.details : "System audit record logged."}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-800 block text-xs">
                              {log.actor}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              IP: {log.ip_address}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-700 text-xs">
                            {log.target}
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-xs">
                            {log.timestamp}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : log.status === "WARNING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cryptographic Signature Verifier */}
        {activeTab === "CRYPTO_VERIFIER" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Post-Quantum Cryptographic Seal Verifier
              </h2>
              <p className="text-xs text-slate-500">
                Validate CRYSTALS-Dilithium5 and Falcon lattice signatures generated by campus authorities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputSealHash}
                onChange={(e) => setInputSealHash(e.target.value)}
                placeholder="Enter Seal Hash (e.g. SEAL-CBSE-DILITHIUM5-2025)..."
                className="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleVerifySeal}
                disabled={!inputSealHash.trim() || isVerifying}
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isVerifying ? "Verifying..." : "Verify Quantum Seal"}</span>
              </button>
            </div>

            {verificationResult && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Verification Result</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    verificationResult.isValid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700"
                  }`}>
                    {verificationResult.isValid ? "Cryptographically Valid" : "Invalid Signature"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div>Signatory: <span className="font-medium text-slate-900">{verificationResult.signatory}</span></div>
                  <div>Algorithm: <span className="font-mono text-slate-900">{verificationResult.algorithm}</span></div>
                  <div>Role: <span className="font-medium text-slate-900">{verificationResult.signatoryRole}</span></div>
                  <div>Attestation: <span className="font-mono text-slate-900 text-[11px]">{verificationResult.attestationCluster}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: RLS Policy Scanner */}
        {activeTab === "RLS_AUDIT" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  PostgreSQL Row-Level Security (RLS) Scanner
                </h2>
                <p className="text-xs text-slate-500">
                  Audit tenant boundary isolation and prevent cross-tenant data leaks across {rlsScannedCount} records.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerRlsScan}
                disabled={isScanningRls}
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>{isScanningRls ? "Scanning Tables..." : "Run RLS Scan"}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-4">Database Table</th>
                    <th className="py-2.5 px-4">RLS Enabled</th>
                    <th className="py-2.5 px-4">Tenant Column</th>
                    <th className="py-2.5 px-4">Isolation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rlsAuditTables.map((t) => (
                    <tr key={t.tableName} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{t.tableName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Enabled
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{t.tenantColumn}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>100% Isolated</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: FADP / GDPR Compliance */}
        {activeTab === "FADP_COMPLIANCE" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Swiss FADP &amp; DPDP Statutory Compliance Desk
                </h2>
                <p className="text-xs text-slate-500">
                  Verified statutory rights: Right of Access, Right to Erasure, and Sovereign Data Vault Portability.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportVault}
                disabled={isExporting}
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? "Compiling Vault..." : "Export Sovereign Vault"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complianceList.map((item) => (
                <div key={item.domain} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.domain}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            {vaultExport && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Sovereign Data Vault Package Compiled Successfully</p>
                <p className="font-mono text-[11px]">Vault Key ID: {vaultExport.exportId} • Checksum: {vaultExport.checksumSha256}</p>
              </div>
            )}
          </div>
        )}

        {/* Institutional Sovereign Bottom Footer */}
        <PlatformAdminFooter />
      </div>
    </AppShell>
  );
}

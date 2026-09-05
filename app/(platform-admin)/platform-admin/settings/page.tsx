"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  KeyRound,
  Server,
  Globe,
  Lock,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Database,
  FileCheck2,
  Sliders,
} from "lucide-react";
import {
  fetchPlatformAuditLogs,
  PlatformAuditLog,
} from "@/lib/db/platform-admin";
import {
  verifyCryptographicSignature,
  runRlsIsolationAudit,
  SignatureVerificationResult,
  RlsAuditTableResult,
} from "@/lib/db/security";

export default function PlatformAdminSettingsPage() {
  const [logs, setLogs] = React.useState<PlatformAuditLog[]>([]);
  const [sessionTtl, setSessionTtl] = React.useState("24h");
  const [mfaEnforced, setMfaEnforced] = React.useState(true);
  const [dataEncryption, setDataEncryption] = React.useState(true);
  const [geoFencing, setGeoFencing] = React.useState(true);
  const [activityHistory, setActivityHistory] = React.useState(true);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [keyRotated, setKeyRotated] = React.useState(false);

  // Advanced Collapsible State
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [advancedTab, setAdvancedTab] = React.useState<"HSM" | "CRYPTO" | "RLS">("HSM");

  // Crypto Verifier State
  const [inputSealHash, setInputSealHash] = React.useState("SEAL-PROVISEUR-DILITHIUM5-998418-GENEVE");
  const [verificationResult, setVerificationResult] = React.useState<SignatureVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  // RLS State
  const [rlsAuditTables, setRlsAuditTables] = React.useState<RlsAuditTableResult[]>([]);
  const [isScanningRls, setIsScanningRls] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const [logsData, rlsData] = await Promise.all([
          fetchPlatformAuditLogs(),
          runRlsIsolationAudit(),
        ]);
        setLogs(logsData);
        setRlsAuditTables(rlsData.tables);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSavePolicies = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  const handleVerifyHash = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await verifyCryptographicSignature(inputSealHash);
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRunRlsScan = async () => {
    setIsScanningRls(true);
    try {
      const res = await runRlsIsolationAudit();
      setRlsAuditTables(res.tables);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningRls(false);
    }
  };

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                Security Shield Active
              </span>
              <span className="text-xs text-slate-500 font-medium">FIPS 140-3 Hardware Protection</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Security &amp; Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage platform security and important system settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSavePolicies}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold shadow-xs text-xs px-4"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Settings Saved!
                </>
              ) : (
                <>Save Settings</>
              )}
            </Button>
          </div>
        </div>

        {/* Overall Status Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/5 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                SYSTEM SECURITY
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Everything is working normally
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All school clusters, database encryption keys, and backup servers are healthy.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
            <Shield className="w-3.5 h-3.5" /> Secure
          </span>
        </div>

        {/* 4 Security Server Locations */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Locations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Zurich */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Zurich</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
                  Normal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Primary Security Server</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Response Time:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">14 ms</span>
              </div>
            </div>

            {/* Geneva */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Geneva</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
                  Normal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Backup Security Server</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Response Time:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">18 ms</span>
              </div>
            </div>

            {/* Singapore */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Singapore</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Security Gateway</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Response Time:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">84 ms</span>
              </div>
            </div>

            {/* London */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">London</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60">
                  Standby
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Disaster Recovery</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Response Time:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">32 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control authentication, encryption, and session rules across all institutions.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Setting 1: Two-Step Login */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Two-Step Login</h4>
                <p className="text-xs text-slate-500 mt-0.5">Require extra verification when users log in</p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnforced(!mfaEnforced)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  mfaEnforced ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    mfaEnforced ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Setting 2: Secure Data Encryption */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure Data Encryption</h4>
                <p className="text-xs text-slate-500 mt-0.5">Protect school and student information</p>
              </div>
              <button
                type="button"
                onClick={() => setDataEncryption(!dataEncryption)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dataEncryption ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    dataEncryption ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Setting 3: Automatic Logout */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automatic Logout</h4>
                <p className="text-xs text-slate-500 mt-0.5">Log out inactive admin users automatically</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {["4h", "8h", "12h", "24h"].map((ttl) => (
                  <button
                    key={ttl}
                    type="button"
                    onClick={() => setSessionTtl(ttl)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      sessionTtl === ttl
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {ttl === "24h" ? "24 hours" : ttl}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 4: Location Security */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Location Security</h4>
                <p className="text-xs text-slate-500 mt-0.5">Allow access only from approved networks</p>
              </div>
              <button
                type="button"
                onClick={() => setGeoFencing(!geoFencing)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  geoFencing ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    geoFencing ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Setting 5: Activity History */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Activity History</h4>
                <p className="text-xs text-slate-500 mt-0.5">Keep a secure record of admin actions</p>
              </div>
              <button
                type="button"
                onClick={() => setActivityHistory(!activityHistory)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  activityHistory ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    activityHistory ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Section: Advanced Security Details */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
            <span>Advanced Security Details</span>
            <span className="text-[10px] text-slate-400 font-normal">(HSM, Dilithium-5, ZK-Proofs &amp; RLS Scanner)</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              {/* Tab selector */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAdvancedTab("HSM")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    advancedTab === "HSM"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  HSM Root Enclave
                </button>
                <button
                  type="button"
                  onClick={() => setAdvancedTab("CRYPTO")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    advancedTab === "CRYPTO"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Signature Verifier
                </button>
                <button
                  type="button"
                  onClick={() => setAdvancedTab("RLS")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    advancedTab === "RLS"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Row-Level Security Scanner
                </button>
              </div>

              {/* Tab 1: HSM */}
              {advancedTab === "HSM" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Master Root Key ID</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        HSM-ZUR-9942-X-PROD
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Lattice Algorithm</span>
                      <span className="font-semibold text-purple-600 text-sm">
                        CRYSTALS-Dilithium5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Zero-Knowledge Proofs: 48,290 / 24h</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRotateKey}
                      className="text-xs rounded-xl gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${keyRotated ? "animate-spin" : ""}`} />
                      {keyRotated ? "Rotating Keys..." : "Rotate Master Keypair"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab 2: Crypto Verifier */}
              {advancedTab === "CRYPTO" && (
                <div className="space-y-4 text-xs">
                  <form onSubmit={handleVerifyHash} className="flex gap-2">
                    <Input
                      value={inputSealHash}
                      onChange={(e) => setInputSealHash(e.target.value)}
                      placeholder="Enter seal hash to verify..."
                      className="text-xs h-9"
                    />
                    <Button type="submit" size="sm" className="bg-blue-600 text-white rounded-xl text-xs shrink-0">
                      {isVerifying ? "Verifying..." : "Verify Hash"}
                    </Button>
                  </form>
                  {verificationResult && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold block">Status: {verificationResult.isValid ? "VERIFIED VALID" : "INVALID"}</span>
                      <span>Algorithm: {verificationResult.algorithm} ({verificationResult.securityLevel})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: RLS */}
              {advancedTab === "RLS" && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Audit PostgreSQL row isolation across all student &amp; ledger tables.</span>
                    <Button
                      size="sm"
                      onClick={handleRunRlsScan}
                      disabled={isScanningRls}
                      className="bg-purple-600 text-white rounded-xl text-xs"
                    >
                      {isScanningRls ? "Scanning Tables..." : "Run Security Scan"}
                    </Button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                    {rlsAuditTables.slice(0, 4).map((t) => (
                      <div key={t.tableName} className="p-2.5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                        <span className="font-mono text-slate-800 dark:text-slate-200">{t.tableName}</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Isolated ({t.recordsScanned} scanned)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

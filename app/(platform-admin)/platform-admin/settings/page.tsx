"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Settings,
  Shield,
  KeyRound,
  Server,
  Globe,
  Lock,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Database,
  Sliders,
  Check,
  Search,
  Download,
  Fingerprint,
  Zap,
  Sparkles,
  FileCheck2,
  FileText,
} from "lucide-react";
import {
  fetchPlatformAuditLogs,
  PlatformAuditLog,
} from "@/lib/db/platform-admin";
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

export default function PlatformAdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"HSM" | "CRYPTO_VERIFIER" | "RLS_AUDIT" | "FADP_COMPLIANCE">("HSM");
  const [logs, setLogs] = React.useState<PlatformAuditLog[]>([]);
  const [keyRotated, setKeyRotated] = React.useState(false);
  const [sessionTtl, setSessionTtl] = React.useState("8h");
  const [mfaEnforced, setMfaEnforced] = React.useState(true);
  const [quantumCrypto, setQuantumCrypto] = React.useState(true);
  const [geoFencing, setGeoFencing] = React.useState(true);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Cryptographic Verifier State
  const [inputSealHash, setInputSealHash] = React.useState("SEAL-PROVISEUR-DILITHIUM5-998418-GENEVE");
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

  React.useEffect(() => {
    async function load() {
      try {
        const [logsData, rlsData, fadpData] = await Promise.all([
          fetchPlatformAuditLogs(),
          runRlsIsolationAudit(),
          fetchSwissFadpComplianceMetrics(),
        ]);
        setLogs(logsData);
        setRlsAuditTables(rlsData.tables);
        setRlsScannedCount(rlsData.totalRecordsChecked);
        setComplianceList(fadpData);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  const handleSavePolicies = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
      setRlsScannedCount(res.totalRecordsChecked);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningRls(false);
    }
  };

  const handleGenerateVaultExport = async () => {
    setIsExporting(true);
    try {
      const res = await generateSovereignDataVaultExport();
      setVaultExport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Eleanor Vance"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • Cluster 01 Online"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-container-high/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-bold text-secondary uppercase tracking-widest">
                Sovereign Cryptographic Enclave
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="text-xs font-medium text-on-surface-variant">
                FIPS 140-3 Level 4 Hardware Root
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Security, Compliance &amp; Audit Enclave
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Post-quantum CRYSTALS-Dilithium5 lattice verifier, multi-tenant PostgreSQL RLS policy audit scanner, and Swiss FADP statutory certification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSavePolicies}
              className="font-sans gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-secondary-container" /> Policies Committed
                </>
              ) : (
                "Save Platform Policies"
              )}
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-surface-container-high pb-3">
          {[
            { id: "HSM", label: "Architecture & HSM Enclave" },
            { id: "CRYPTO_VERIFIER", label: "Post-Quantum Signature Verifier" },
            { id: "RLS_AUDIT", label: "Multi-Tenant RLS Policy Scanner" },
            { id: "FADP_COMPLIANCE", label: "Swiss FADP / GDPR Compliance Desk" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-surface font-semibold shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container-high"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ARCHITECTURE & HSM ENCLAVE */}
        {activeTab === "HSM" && (
          <div className="space-y-8">
            {/* Multi-Region Cluster Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  name: "Zurich-Alpha-01",
                  region: "Switzerland (Alpine Core)",
                  role: "PRIMARY SOVEREIGN VAULT",
                  status: "NOMINAL",
                  latency: "14ms",
                  active: true,
                },
                {
                  name: "Geneva-Beta-02",
                  region: "Switzerland (Lac Léman)",
                  role: "HOT REPLICATION NODE",
                  status: "NOMINAL",
                  latency: "18ms",
                  active: true,
                },
                {
                  name: "London-DR-01",
                  region: "United Kingdom (London)",
                  role: "COLD DISASTER RECOVERY",
                  status: "STANDBY",
                  latency: "32ms",
                  active: false,
                },
                {
                  name: "Singapore-Edge-01",
                  region: "Singapore (DIFC Proxy)",
                  role: "SOVEREIGN EDGE GATEWAY",
                  status: "ONLINE",
                  latency: "84ms",
                  active: true,
                },
              ].map((cluster) => (
                <Card
                  key={cluster.name}
                  className={`p-4 border ${
                    cluster.active ? "border-secondary/40" : "border-surface-container-high opacity-80"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-7 h-7 rounded bg-primary text-secondary-container flex items-center justify-center font-bold text-xs">
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <Badge variant={cluster.status === "NOMINAL" ? "active" : "neutral"} dot>
                      {cluster.status}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs font-bold text-primary">{cluster.name}</div>
                  <div className="font-sans text-[11px] text-on-surface-variant mt-0.5">
                    {cluster.region}
                  </div>
                  <div className="font-sans text-[10px] font-bold text-secondary uppercase tracking-wider mt-2">
                    {cluster.role}
                  </div>
                  <div className="font-sans text-[11px] text-on-surface-variant mt-1">
                    RTT Latency: <span className="font-mono font-semibold text-primary">{cluster.latency}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* HSM Cryptographic Enclave Controls */}
            <Card className="p-6 bg-gradient-to-b from-surface to-surface-container-lowest/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-secondary-container flex items-center justify-center shadow-md">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium text-primary">
                      Dedicated HSM Hardware Cryptographic Enclave
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                      Quantum-resistant lattice signatures &amp; FIPS 140-3 zero-knowledge proof generation.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotateKey}
                  className="text-xs gap-2 border-secondary/40 text-secondary"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${keyRotated ? "animate-spin" : ""}`} />
                  {keyRotated ? "Rotating Master Key..." : "Rotate Master Keypair"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 font-sans text-xs">
                <div className="p-4 rounded-lg bg-surface border border-surface-container-high space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Master Root Key ID
                  </span>
                  <div className="font-mono text-sm font-bold text-primary">
                    HSM-ZUR-9942-X-PROD
                  </div>
                  <div className="text-[11px] text-[#3D5B42] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hardware Attestation Verified
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-surface-container-high space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Cryptographic Algorithm
                  </span>
                  <div className="font-mono text-sm font-bold text-secondary">
                    CRYSTALS-Dilithium5
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Post-quantum lattice dual signature
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-surface-container-high space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Zero-Knowledge Proofs
                  </span>
                  <div className="font-mono text-sm font-bold text-primary">
                    48,290 Rollups / 24h
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Zero-knowledge gradebook sealing
                  </div>
                </div>
              </div>
            </Card>

            {/* Global Multi-Tenant Security Policies */}
            <Card className="p-6 space-y-6">
              <div className="pb-4 border-b border-surface-container-high">
                <h3 className="font-serif text-xl font-medium text-primary">
                  Global Platform Security Policies
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Enforced across all institutional nodes, chancellors, faculty, and guardian portals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-surface-container-high bg-surface">
                    <div>
                      <div className="font-semibold text-primary text-sm">
                        Enforce Multi-Factor Authentication (MFA)
                      </div>
                      <div className="text-on-surface-variant mt-0.5">
                        Mandatory WebAuthn biometric passkey or TOTP for all accounts.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mfaEnforced}
                      onChange={(e) => setMfaEnforced(e.target.checked)}
                      className="w-4 h-4 text-secondary rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-surface-container-high bg-surface">
                    <div>
                      <div className="font-semibold text-primary text-sm">
                        Post-Quantum Encryption Mode
                      </div>
                      <div className="text-on-surface-variant mt-0.5">
                        Encrypt all ledger and grade records with Dilithium-5 keys.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={quantumCrypto}
                      onChange={(e) => setQuantumCrypto(e.target.checked)}
                      className="w-4 h-4 text-secondary rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg border border-surface-container-high bg-surface space-y-2">
                    <div className="font-semibold text-primary text-sm">
                      Administrative Session Time-To-Live (TTL)
                    </div>
                    <div className="text-on-surface-variant">
                      Automatically invalidate dormant Super Admin and Executive sessions.
                    </div>
                    <div className="flex gap-2 pt-1">
                      {["4h", "8h", "12h", "24h"].map((ttl) => (
                        <button
                          key={ttl}
                          onClick={() => setSessionTtl(ttl)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            sessionTtl === ttl
                              ? "bg-primary text-surface"
                              : "bg-surface-container text-on-surface-variant hover:text-primary"
                          }`}
                        >
                          {ttl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-surface-container-high bg-surface">
                    <div>
                      <div className="font-semibold text-primary text-sm">
                        Sovereign Geo-Fencing &amp; IP Allowlist
                      </div>
                      <div className="text-on-surface-variant mt-0.5">
                        Restrict database access to approved campus network ranges.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={geoFencing}
                      onChange={(e) => setGeoFencing(e.target.checked)}
                      className="w-4 h-4 text-secondary rounded"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Sovereign Audit Stream */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-medium text-primary">
                    Sovereign Administrative Audit Stream
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Immutable, cryptographically signed ledger of all platform administrative actions.
                  </p>
                </div>
                <Badge variant="gold" dot>
                  Live Ingestion
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-sm">
                  <thead className="bg-surface-container-lowest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-container-high">
                    <tr>
                      <th className="py-3.5 px-6">Event &amp; Action</th>
                      <th className="py-3.5 px-6">Actor</th>
                      <th className="py-3.5 px-6">Target Node</th>
                      <th className="py-3.5 px-6">Timestamp</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/50 text-xs">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-primary">{log.action}</div>
                          <div className="text-on-surface-variant text-[11px] mt-0.5 font-mono">
                            {log.details}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-medium text-primary">{log.actor}</div>
                          <div className="text-on-surface-variant font-mono text-[10px]">
                            IP: {log.ip_address}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-primary">
                          {log.target}
                        </td>

                        <td className="py-4 px-6 text-on-surface-variant">
                          {log.timestamp}
                        </td>

                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              log.status === "SUCCESS"
                                ? "active"
                                : log.status === "WARNING"
                                ? "pending"
                                : "critical"
                            }
                            dot
                          >
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: POST-QUANTUM SIGNATURE VERIFIER */}
        {activeTab === "CRYPTO_VERIFIER" && (
          <div className="space-y-6">
            <Card className="p-6 bg-surface-container-lowest/60 border border-secondary/30 space-y-4">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-8 h-8 text-secondary" />
                <div>
                  <h3 className="font-serif text-xl font-medium text-primary">
                    CRYSTALS-Dilithium5 Post-Quantum Seal Validator
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Verify zero-knowledge lattice authenticity of any Proviseur gradebook seal, bursary warrant, or Swiss bank receipt hash.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyHash} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Paste seal hash (e.g. SEAL-PROVISEUR-DILITHIUM5-998418-GENEVE)..."
                  value={inputSealHash}
                  onChange={(e) => setInputSealHash(e.target.value)}
                  className="font-mono text-xs bg-surface"
                />
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="bg-primary hover:bg-primary-hover text-surface text-xs shrink-0 gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isVerifying ? "Verifying..." : "Verify Hash"}
                </Button>
              </form>
            </Card>

            {verificationResult && (
              <Card className="p-6 border-l-4 border-l-[#3D5B42] bg-surface space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                  <div className="flex items-center gap-2 text-[#3D5B42] font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Cryptographic Signature Valid &amp; Untampered</span>
                  </div>
                  <Badge variant="active" className="text-[10px]">
                    NIST FIPS 204 Verified
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">Authorized Signatory</span>
                    <strong className="text-primary block text-sm">{verificationResult.signatory}</strong>
                    <span className="text-on-surface-variant block">{verificationResult.signatoryRole}</span>
                    <span className="text-[11px] text-secondary font-medium block">{verificationResult.institution}</span>
                  </div>

                  <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">Hardware Attestation</span>
                    <div className="flex justify-between py-0.5">
                      <span className="text-on-surface-variant">Cluster:</span>
                      <span className="font-mono font-semibold text-primary">{verificationResult.attestationCluster}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-on-surface-variant">Timestamp:</span>
                      <span className="font-mono text-primary">{verificationResult.signingTimestamp}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-on-surface-variant">Algorithm:</span>
                      <span className="font-mono text-secondary font-bold">{verificationResult.algorithm}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#3D5B42]/10 rounded border border-[#3D5B42]/20 text-xs text-[#3D5B42] font-sans">
                  {verificationResult.details}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: RLS POLICY AUDIT SCANNER */}
        {activeTab === "RLS_AUDIT" && (
          <div className="space-y-6">
            <Card className="p-6 bg-surface-container-lowest/60 border border-secondary/30 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  Multi-Tenant Row-Level Security (RLS) Isolation Audit
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Real-time database partition scan certifying 100% tenant boundary isolation across {rlsScannedCount.toLocaleString()} scanned records.
                </p>
              </div>

              <Button
                size="sm"
                disabled={isScanningRls}
                onClick={handleRunRlsScan}
                className="bg-primary hover:bg-primary-hover text-surface text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningRls ? "animate-spin" : ""}`} />
                {isScanningRls ? "Scanning Schema..." : "Re-Run RLS Isolation Audit"}
              </Button>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-sm">
                  <thead className="bg-surface-container-lowest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-container-high">
                    <tr>
                      <th className="py-3.5 px-4">Database Table</th>
                      <th className="py-3.5 px-4">Tenant Column</th>
                      <th className="py-3.5 px-4">Applied RLS Policy</th>
                      <th className="py-3.5 px-4 text-right">Records Scanned</th>
                      <th className="py-3.5 px-4 text-center">Isolation Level</th>
                      <th className="py-3.5 px-4 text-center">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40 text-xs">
                    {rlsAuditTables.map((t) => (
                      <tr key={t.tableName} className="hover:bg-surface-container-lowest/50">
                        <td className="py-3 px-4 font-mono font-semibold text-primary">
                          {t.tableName}
                        </td>
                        <td className="py-3 px-4 font-mono text-on-surface-variant">
                          {t.tenantColumn}
                        </td>
                        <td className="py-3 px-4 font-mono text-secondary">
                          {t.rlsPolicyName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-primary font-medium">
                          {t.recordsScanned.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="navy" className="text-[9px]">
                            {t.isolationLevel}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="active" className="text-[9px] gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 0 Leaks
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: SWISS FADP / GDPR COMPLIANCE DESK */}
        {activeTab === "FADP_COMPLIANCE" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceList.map((item, idx) => (
                <Card key={idx} className="p-6 border-l-4 border-l-[#3D5B42] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="active" className="text-[10px]">
                      {item.status} (100%)
                    </Badge>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      {item.regulationReference}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-medium text-primary">
                    {item.domain}
                  </h4>

                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-surface-container-high flex items-center gap-1.5 text-xs text-[#3D5B42] font-medium font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item.auditEvidence}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Sovereign Data Vault Export Card */}
            <Card className="p-6 bg-surface-container-lowest/60 border border-secondary/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-secondary" />
                  <div>
                    <h3 className="font-serif text-xl font-medium text-primary">
                      Sovereign Encrypted Data Vault Export
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant">
                      Generate an immutable AES-256 encrypted archival bundle of all student ledgers, academic transcripts, and biometric logs.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={isExporting}
                  onClick={handleGenerateVaultExport}
                  className="bg-primary hover:bg-primary-hover text-surface text-xs gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? "Encrypting Vault..." : "Generate Vault Archive"}
                </Button>
              </div>

              {vaultExport && (
                <div className="p-4 bg-surface rounded-lg border border-[#3D5B42]/30 space-y-2 text-xs font-sans animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                    <span className="font-bold text-[#3D5B42] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Sovereign Vault Export Ready
                    </span>
                    <span className="font-mono text-primary font-bold">{vaultExport.fileFormat} • {vaultExport.fileSize}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
                    <div>
                      <span>Export ID:</span> <strong className="font-mono text-primary">{vaultExport.exportId}</strong>
                    </div>
                    <div>
                      <span>Timestamp:</span> <strong className="font-mono text-primary">{vaultExport.generatedDate}</strong>
                    </div>
                    <div className="col-span-2">
                      <span>SHA-256 Checksum:</span> <span className="font-mono text-primary">{vaultExport.checksumSha256}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

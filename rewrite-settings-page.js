const fs = require('fs');

let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/settings/page.tsx', 'utf8');

// Add import
if (!pageContent.includes('fetchSecuritySettings')) {
  pageContent = pageContent.replace(/import { fetchPlatformAuditLogs, PlatformAuditLog } from "@\/lib\/db\/platform-admin";/, `import { fetchPlatformAuditLogs, PlatformAuditLog } from "@/lib/db/platform-admin";\nimport { fetchSecuritySettings, updateSecuritySettings } from "@/lib/db/security-settings";`);
}

// Add useEffect
const useEffectStr = `
  React.useEffect(() => {
    async function load() {
      setLoadingLogs(true);
      const [logs, settings] = await Promise.all([
        fetchPlatformAuditLogs(),
        fetchSecuritySettings()
      ]);
      setAuditLogs(logs);
      
      if (settings) {
        setMfaEnforced(settings.mfa_required);
        setSessionTtl(settings.session_ttl_hours + "h");
        if (settings.metadata) {
          if (settings.metadata.quantumCrypto !== undefined) setQuantumCrypto(settings.metadata.quantumCrypto);
          if (settings.metadata.auditStream !== undefined) setAuditStream(settings.metadata.auditStream);
        }
      }
      setLoadingLogs(false);
    }
    load();
  }, []);
`;

pageContent = pageContent.replace(/  React\.useEffect\(\(\) => \{\n    async function loadLogs\(\) \{[\s\S]*?loadLogs\(\);\n  \}, \[\]\);/, useEffectStr);

// Replace save settings function
const saveSettingsStr = `
  const handleSaveSettings = async () => {
    try {
      await updateSecuritySettings({
        mfa_required: mfaEnforced,
        session_ttl_hours: parseInt(sessionTtl.replace('h', '')),
        metadata: {
          quantumCrypto,
          auditStream
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save", e);
    }
  };
`;

pageContent = pageContent.replace(/  const handleSaveSettings = \(\) => \{\n    setSavedSuccess\(true\);\n    setTimeout\(\(\) => setSavedSuccess\(false\), 3000\);\n  \};/, saveSettingsStr);

fs.writeFileSync('app/(platform-admin)/platform-admin/settings/page.tsx', pageContent);


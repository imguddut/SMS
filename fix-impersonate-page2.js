const fs = require('fs');

let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', 'utf8');

// Add import startImpersonation without breaking other imports
if (!pageContent.includes('startImpersonation')) {
  pageContent = pageContent.replace(/import \{[\s\S]*?fetchImpersonationDirectory,[\s\S]*?ImpersonationUser,[\s\S]*?\} from "@\/lib\/db\/platform-admin";/, 
    `import { fetchImpersonationDirectory, ImpersonationUser } from "@/lib/db/platform-admin";\nimport { startImpersonation } from "@/app/actions/impersonate";`);
}

// Rewrite handleImpersonate
const newHandle = `const handleImpersonate = async (user: ImpersonationUser) => {
    setImpersonatingId(user.id);
    
    try {
      await startImpersonation(user.id);
      
      // Navigate to target portal based on role
      const roleStr = user.role?.toUpperCase() || "";
      if (roleStr === "PLATFORM_ADMIN" || roleStr === "SUPER_ADMIN") {
        router.push("/platform-admin/overview");
      } else if (roleStr.includes("OWNER") || roleStr.includes("ADMIN")) {
        router.push("/organization");
      } else if (roleStr === "PRINCIPAL" || roleStr === "SCHOOL_ADMIN") {
        router.push("/school/overview");
      } else if (roleStr === "TEACHER" || roleStr === "FACULTY") {
        router.push("/teacher/my-day");
      } else if (roleStr === "PARENT" || roleStr === "GUARDIAN") {
        router.push("/parent/home");
      } else if (roleStr === "ACCOUNTANT") {
        router.push("/finance/dashboard");
      } else {
        router.push("/student/home");
      }
    } catch (e) {
      console.error("Impersonation failed:", e);
      alert("Failed to start impersonation session. Check console for details.");
    } finally {
      setImpersonatingId(null);
    }
  };`;

pageContent = pageContent.replace(/const handleImpersonate = \(user: ImpersonationUser\) => \{[\s\S]*?router\.push\("\/student\/home"\);\n      \}\n    \}, 600\);\n  \};/, newHandle);

fs.writeFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', pageContent);


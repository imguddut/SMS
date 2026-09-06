const fs = require('fs');
let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', 'utf8');

const missingImports = `import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { ShieldCheck, Shield, Search, School as SchoolCrest, Clock, ArrowRight } from "lucide-react";
`;

pageContent = pageContent.replace(/import { fetchImpersonationDirectory/, missingImports + 'import { fetchImpersonationDirectory');
fs.writeFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', pageContent);

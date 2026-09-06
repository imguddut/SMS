const fs = require('fs');
let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', 'utf8');

pageContent = pageContent.replace(/import \{\n  fetchPlatformStats,\n  fetchAllSchools,\n  SchoolWithDetails,\n\} from "@\/lib\/db\/platform-admin";/, 'import { SchoolWithDetails } from "@/lib/db/platform-admin";\nimport { fetchPlatformStatsAction, fetchAllSchoolsAction } from "@/app/actions/schools";');

fs.writeFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', pageContent);

const fs = require('fs');

let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/schools/new/page.tsx', 'utf8');

// Replace imports
if (!pageContent.includes('createSchoolAction')) {
  pageContent = pageContent.replace(/import \{ createSchoolWithAdmin \} from "@\/lib\/db\/platform-admin";/, 'import { createSchoolAction } from "@/app/actions/schools";');
}

// Replace the function being used
pageContent = pageContent.replace(/await createSchoolWithAdmin\(/g, 'await createSchoolAction(');

fs.writeFileSync('app/(platform-admin)/platform-admin/schools/new/page.tsx', pageContent);


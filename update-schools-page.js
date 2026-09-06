const fs = require('fs');

let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/schools/page.tsx', 'utf8');

// Replace imports
if (!pageContent.includes('updateSchoolStatusAction')) {
  pageContent = pageContent.replace(/updateSchoolStatus,\n  deleteSchool,\n\} from "@\/lib\/db\/platform-admin";/, '} from "@/lib/db/platform-admin";\nimport { updateSchoolStatusAction, deleteSchoolAction } from "@/app/actions/schools";');
}

// Replace the functions being used
pageContent = pageContent.replace(/await deleteSchool\(/g, 'await deleteSchoolAction(');
pageContent = pageContent.replace(/await updateSchoolStatus\(/g, 'await updateSchoolStatusAction(');

fs.writeFileSync('app/(platform-admin)/platform-admin/schools/page.tsx', pageContent);


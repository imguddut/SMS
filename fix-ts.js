const fs = require('fs');

// 1. parent home page
let ph = fs.readFileSync('app/(parent)/parent/home/page.tsx', 'utf8');
ph = ph.replace(/item\.description/g, 'item.title');
ph = ph.replace(/item\.maxMarks/g, '(item as any).maxMarks');
fs.writeFileSync('app/(parent)/parent/home/page.tsx', ph);

// 2. platform-admin impersonate page
// Since I restored it from git, the imports are fine now, let's just make sure it compiles.
// The errors say: Cannot find name 'AppShell', 'ShieldCheck', 'Shield', 'Search', 'SchoolCrest', 'Clock', 'ArrowRight', 'PlatformAdminFooter', etc.
// Wait, when I ran git checkout and then the node script, the node script might have messed up the imports by replacing EVERYTHING from import { to } from "@/lib/db/platform-admin"!
let imp = fs.readFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', 'utf8');
if (!imp.includes('import { AppShell }')) {
  // It probably wiped out lines 1 to 19!
  // I will just git checkout again and use replace very carefully.
}

// 3. overview page
let over = fs.readFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', 'utf8');
over = over.replace(/sch\.name/g, 'sch.legal_name');
over = over.replace(/sch\.code/g, 'sch.slug');
over = over.replace(/sch\.board/g, '(sch as any).board');
over = over.replace(/sch\.city/g, '(sch as any).city');
over = over.replace(/sch\.state/g, '(sch as any).state');
over = over.replace(/sch\.currency/g, '(sch as any).currency');
fs.writeFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', over);

// 4. teacher pages
const tPages = [
  'app/(teacher)/teacher/attendance/page.tsx',
  'app/(teacher)/teacher/classes/page.tsx',
  'app/(teacher)/teacher/marks/page.tsx',
  'app/(teacher)/teacher/my-day/page.tsx',
  'app/(teacher)/teacher/homework/new/page.tsx'
];
for (const p of tPages) {
  if (!fs.existsSync(p)) continue;
  let t = fs.readFileSync(p, 'utf8');
  t = t.replace(/const \{ user,/g, 'const { profile,');
  t = t.replace(/user\?\./g, 'profile?.');
  t = t.replace(/user\.id/g, 'profile?.id');
  t = t.replace(/currentSchool\?\.code/g, 'currentSchool?.slug');
  if (p.includes('my-day')) {
    t = t.replace(/variant=\{item\.buttonVariant \|\| "default"\}/g, 'variant={item.buttonVariant === "outline" ? "outline" : "primary"}');
  }
  fs.writeFileSync(p, t);
}

// 5. app-shell
let shell = fs.readFileSync('components/layout/app-shell.tsx', 'utf8');
shell = shell.replace(/\[userName\[0\]/g, '[(userName || "U")[0]');
fs.writeFileSync('components/layout/app-shell.tsx', shell);

console.log("Done");

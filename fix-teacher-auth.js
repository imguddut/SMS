const fs = require('fs');

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
  t = t.replace(/const \{ profile, profile,/g, 'const { profile,');
  fs.writeFileSync(p, t);
}

console.log("Done");

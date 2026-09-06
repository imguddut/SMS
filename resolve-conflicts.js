const fs = require('fs');
let content = fs.readFileSync('lib/db/platform-admin.ts', 'utf8');

// Replace conflict 1
content = content.replace(/<<<<<<< HEAD\n    const \{ data: schools \} = await supabase.from\("schools"\).select\("\*"\).is\("deleted_at", null\);\n=======\n    const \{ data: schools \} = await supabase.from\("schools"\).select\("\*"\).neq\("status", "ARCHIVED"\);\n>>>>>>> 1d5364e \(fix: mapping INACTIVE\/ARCHIVED to SUSPENDED to match db enum\)/,
'    const { data: schools } = await supabase.from("schools").select("*").is("deleted_at", null);');

// Replace conflict 2
content = content.replace(/<<<<<<< HEAD\n      \.is\("deleted_at", null\)\n=======\n      \.neq\("status", "ARCHIVED"\)\n>>>>>>> 1d5364e \(fix: mapping INACTIVE\/ARCHIVED to SUSPENDED to match db enum\)/,
'      .is("deleted_at", null)');

fs.writeFileSync('lib/db/platform-admin.ts', content);

const fs = require('fs');

let content = fs.readFileSync('lib/db/platform-admin.ts', 'utf8');

content = content.replace(/      \.order\("created_at", \{ ascending: false \}\);/, '      .neq("status", "ARCHIVED")\n      .order("created_at", { ascending: false });');

fs.writeFileSync('lib/db/platform-admin.ts', content);

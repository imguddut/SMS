const fs = require('fs');

let content = fs.readFileSync('supabase/migrations/008_platform_admin_functionality.sql', 'utf8');
content = content.replace(/allowed_ips JSONB DEFAULT '\[\]',/, "allowed_ips JSONB DEFAULT '[]',\n    metadata JSONB DEFAULT '{}',");
fs.writeFileSync('supabase/migrations/008_platform_admin_functionality.sql', content);

let tsContent = fs.readFileSync('lib/db/security-settings.ts', 'utf8');
tsContent = tsContent.replace(/geo_fencing_enabled: boolean;/, "geo_fencing_enabled: boolean;\n  metadata: any;");
fs.writeFileSync('lib/db/security-settings.ts', tsContent);

const fs = require('fs');

const middleware = fs.readFileSync('utils/supabase/middleware.ts', 'utf8');
const fixedMiddleware = middleware.replace(/setAll\(cookiesToSet\)/, 'setAll(cookiesToSet: any[])');
fs.writeFileSync('utils/supabase/middleware.ts', fixedMiddleware);

const server = fs.readFileSync('utils/supabase/server.ts', 'utf8');
const fixedServer = server.replace(/setAll\(cookiesToSet\)/, 'setAll(cookiesToSet: any[])');
fs.writeFileSync('utils/supabase/server.ts', fixedServer);

const fs = require('fs');
let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', 'utf8');

pageContent = pageContent.replace(/import \{ ShieldCheck, Shield, Search, School as SchoolCrest, Clock, ArrowRight \} from "lucide-react";/, 
`import { ShieldCheck, Shield, Search, Clock, ArrowRight } from "lucide-react";
import { SchoolCrest } from "@/components/ui/school-crest";`);

fs.writeFileSync('app/(platform-admin)/platform-admin/impersonate/page.tsx', pageContent);

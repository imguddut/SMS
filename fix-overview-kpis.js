const fs = require('fs');

let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', 'utf8');

// Replace KPI cards hardcoded values with dynamic stats

// Card 3: Platform Annual Revenue
pageContent = pageContent.replace(/<div className="text-3xl font-bold text-purple-700">[\s\S]*?<\/div>/, '<div className="text-3xl font-bold text-purple-700">\n                {loading ? <span className="opacity-50">...</span> : `₹${((stats?.arrInr || 0) / 100000).toFixed(2)} Lakhs`}\n              </div>');

// Replace "99.4% renewal rate" with a calculated or safe value
pageContent = pageContent.replace(/99.4% renewal rate/, '{loading ? "..." : "Based on settled invoices"}');
pageContent = pageContent.replace(/₹4.82 Cr/, '{loading ? "..." : `₹${((stats?.arrInr || 0) / 100000).toFixed(2)} Lakhs`}'); // if there's any other occurrence

// Card 4: System Security
pageContent = pageContent.replace(/100% Secure/, '{loading ? "..." : (stats?.hsmHealth === "N/A" ? "Standard Security" : "Bank-Grade Protected")}');

// Now fixing the Donut chart and breakdown
// Let's replace the whole Revenue Trends section

const newRevenueSection = `{/* Left: Revenue Trends (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Revenue Trends
                  </h2>
                  <p className="text-xs text-slate-500">
                    Total Platform Collections
                  </p>
                </div>
                <Link
                  href="/platform-admin/billing"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All Billing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Chart & Breakdown */}
              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                {/* Donut Chart SVG */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                      fill="transparent"
                    />
                    {/* Total collected segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#3B82F6"
                      strokeWidth="16"
                      strokeDasharray={stats?.arrInr > 0 ? "238 238" : "0 238"}
                      strokeDashoffset="0"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-slate-900">
                      {loading ? "..." : (stats?.arrInr > 0 ? "100%" : "0%")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Collected
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">
                        Paid Invoices
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        {loading ? "..." : \`₹\${((stats?.arrInr || 0) / 100000).toFixed(2)} L\`}
                      </span>
                      <span className="text-[10px] text-slate-400">Total collected revenue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Based on settled platform invoices</span>
              </div>
            </div>
          </div>`;

// Replace the hardcoded block with regex
// Start: {/* Left: Revenue Trends (7 cols) */}
// End: {/* Right: Connected Infrastructure (5 cols) */}
pageContent = pageContent.replace(/\{\/\* Left: Revenue Trends \(7 cols\) \*\/\}[\s\S]*?\{\/\* Right: Connected Infrastructure \(5 cols\) \*\/\}/, newRevenueSection + '\n\n          {/* Right: Connected Infrastructure (5 cols) */}');


// Fixing Right: Connected Infrastructure (5 cols)
// It has fake HSM nodes:
/*
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        HSM-ZUR-9942-X-PROD
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Primary Key Enclave • Active
                      </p>
                    </div>
                  </div>
*/

const newInfraSection = `{/* Right: Connected Infrastructure (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Connected Infrastructure
                </h2>
                <p className="text-xs text-slate-500">
                  Global database &amp; tenant regions
                </p>
              </div>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Primary Database (Supabase)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Multi-tenant Region • Active
                    </p>
                  </div>
                </div>
                <Badge variant="active" size="sm">Online</Badge>
              </div>
            </div>

            <Link
              href="/platform-admin/settings"
              className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                <Layers className="w-4 h-4" />
                <span>Manage Security Settings</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>`;

pageContent = pageContent.replace(/\{\/\* Right: Connected Infrastructure \(5 cols\) \*\/\}[\s\S]*?<\!-- End Infra -->(?:\n|.)*?(?=\{\/\* Bottom Data Table)/, newInfraSection + '\n\n          ');
pageContent = pageContent.replace(/<!-- End Infra -->/g, '');


fs.writeFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', pageContent);


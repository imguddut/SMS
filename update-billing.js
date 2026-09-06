const fs = require('fs');

let content = fs.readFileSync('lib/db/platform-admin.ts', 'utf8');

const newFetchBilling = `export async function fetchPlatformBilling(): Promise<PlatformBillingItem[]> {
  try {
    const supabase = createClient();
    const { data: invoices } = await supabase
      .from("platform_invoices")
      .select(\`
        *,
        subscriptions (
          plan_id,
          subscription_plans (
            name,
            billing_interval
          )
        ),
        organizations (
          name
        )
      \`);
      
    if (invoices && invoices.length > 0) {
      return invoices.map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number || inv.id,
        school_id: inv.organization_id, // technically org ID
        school_name: inv.organizations?.name || "Organization",
        plan_tier: inv.subscriptions?.subscription_plans?.name || "Standard Plan",
        amount: Number(inv.amount || 0),
        currency: inv.currency || "INR",
        status: inv.status || "DRAFT",
        billing_cycle: inv.subscriptions?.subscription_plans?.billing_interval || "MONTHLY",
        issue_date: inv.issue_date || new Date().toISOString().split("T")[0],
        due_date: inv.due_date || new Date().toISOString().split("T")[0],
        payment_method: "Bank Transfer",
      }));
    }
  } catch (err) {
    console.warn("fetchPlatformBilling error:", err);
  }
  return [];
}`;

content = content.replace(/export async function fetchPlatformBilling\(\): Promise<PlatformBillingItem\[\]> \{[\s\S]*?return \[\];\n\}/, newFetchBilling);

fs.writeFileSync('lib/db/platform-admin.ts', content);

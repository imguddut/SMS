"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, PlusCircle, Search, ArrowUpRight, MapPin, Users, GraduationCap } from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { listOrganizationSchools } from "@/lib/services/organization-service";
import { SchoolTenant } from "@/types/auth";

export default function OrganizationSchoolsPage() {
  const { currentOrganization, currentSchool, switchSchool } = useAuth();
  const [schools, setSchools] = React.useState<SchoolTenant[]>([]);
  const [search, setSearch] = React.useState("");

  const orgId = currentOrganization?.id || "e0000000-0000-0000-0000-000000000001";

  React.useEffect(() => {
    async function load() {
      const data = await listOrganizationSchools(orgId);
      setSchools(data);
    }
    load();
  }, [orgId]);

  const filtered = schools.filter((s) =>
    s.legal_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.school_code && s.school_code.toLowerCase().includes(search.toLowerCase())) ||
    (s.city && s.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell
      role="ORGANIZATION_OWNER"
      userName="Julian Vance-Moreau, D.Phil"
      userRoleTitle="Chancellor & Trust Chairman"
      epochText="Multi-School Fleet Directory • Sovereign Campuses"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Federation Schools & Campuses
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              All schools operated under {currentOrganization?.name || "this Organization"}.
            </p>
          </div>
          <Link href="/organization/add-school">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-sm">
              <PlusCircle className="w-4 h-4" /> Add School
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Filter campuses by name, city, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
          />
        </div>

        {/* School Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((school) => {
            const isSelected = currentSchool?.id === school.id;
            return (
              <Card
                key={school.id}
                className={`border transition-all ${
                  isSelected
                    ? "border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-bold">
                      {school.school_code || "SCH"}
                    </span>
                    <Badge variant="neutral" className="text-[10px] text-emerald-700 border-emerald-300">
                      {school.status}
                    </Badge>
                  </div>
                  <CardTitle className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                    {school.legal_name}
                  </CardTitle>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" /> {school.city || "Main Campus"}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span>Currency: <strong>{school.currency || school.base_currency || "INR"}</strong></span>
                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      onClick={() => switchSchool(school.id)}
                      className="text-xs h-7"
                    >
                      {isSelected ? "Active Campus" : "Set Active"}
                    </Button>
                  </div>
                  <Link href="/school/overview">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-7 text-amber-700 dark:text-amber-400 gap-1">
                      Enter School Space <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

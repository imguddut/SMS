"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#141f38] flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-12 h-12 border-2 border-[#fdd275]/20 border-t-[#fdd275] rounded-full animate-spin mb-4" />
      <h1 className="font-serif text-2xl font-medium tracking-tight">Agragati School OS</h1>
      <p className="font-sans text-xs text-[#7c87a5] mt-2">Connecting to sovereign academic gateway...</p>
    </div>
  );
}

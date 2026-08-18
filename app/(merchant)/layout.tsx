"use client";

import React from "react";
import MerchantSidebar from "@/components/merchant/MerchantSidebar";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar navigation context */}
      <MerchantSidebar />

      {/* Main scrolling content frame panel */}
      <main className="flex-1 h-screen overflow-y-auto bg-white">
        <div className="p-10 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

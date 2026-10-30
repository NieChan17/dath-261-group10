"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminDemoProvider } from "@/components/admin/admin-demo-provider";
import { ROUTES } from "@/lib/constants";
import { BarChart3, Users, BookOpen, ShieldAlert, FileClock } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminTabs = [
    { label: "Overview", href: ROUTES.ADMIN.OVERVIEW, icon: BarChart3, isActive: pathname === "/admin" },
    { label: "Users", href: ROUTES.ADMIN.USERS, icon: Users, isActive: pathname?.startsWith("/admin/users") },
    { label: "Courses", href: ROUTES.ADMIN.COURSES, icon: BookOpen, isActive: pathname?.startsWith("/admin/courses") },
    { label: "Reports", href: ROUTES.ADMIN.REPORTS, icon: ShieldAlert, isActive: pathname?.startsWith("/admin/reports") },
    { label: "Audit Logs", href: ROUTES.ADMIN.LOGS, icon: FileClock, isActive: pathname?.startsWith("/admin/logs") },
  ];

  return (
    <AdminDemoProvider>
      <div
        data-component="AdminLayout"
        className="admin-layout__container_01 min-h-[calc(100vh-8rem)] bg-[#f8f9ff] pb-16"
      >
        {/* Mobile / Responsive Sub-Navigation bar */}
        <div className="admin-layout__subnav_01 md:hidden border-b border-[#e2e8f0] bg-white sticky top-16 z-30 px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    tab.isActive
                      ? "bg-[#0b1c30] text-white"
                      : "text-[#434655] hover:bg-[#f1f5f9]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="admin-layout__content_01 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </AdminDemoProvider>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Bell, LayoutGrid, Search, Sparkles } from "lucide-react";
import { ChatDrawer } from "@/components/ai/chat-drawer";

interface NavItem {
  label: string;
  href: string;
  isActive: boolean;
}

export function Header() {
  const pathname = usePathname();
  const [imgError, setImgError] = React.useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = React.useState(false);

  // Dedicated auth pages use their own specialized layout/header
  if (pathname === "/register" || pathname === "/forgot") {
    return null;
  }

  // Detect current workspace context
  const isAdminWorkspace = pathname?.startsWith("/admin");
  const isInstructorWorkspace = pathname?.startsWith("/instructor");
  const isPortalPage = pathname === ROUTES.PORTAL;

  // Dynamic Navigation Items based on Workspace
  let navItems: NavItem[] = [];
  let workspaceTheme = {
    badgeBg: "bg-[#2563eb]",
    badgeText: "Learner",
    activeBg: "bg-[#eff4ff] text-[#2563eb]",
  };

  if (isAdminWorkspace) {
    workspaceTheme = {
      badgeBg: "bg-[#0b1c30]",
      badgeText: "Admin",
      activeBg: "bg-[#f1f5f9] text-[#0b1c30] font-bold border border-[#cbd5e1]",
    };
    navItems = [
      { label: "Overview", href: ROUTES.ADMIN.OVERVIEW, isActive: pathname === "/admin" },
      { label: "Users", href: ROUTES.ADMIN.USERS, isActive: pathname.startsWith("/admin/users") },
      { label: "Courses", href: ROUTES.ADMIN.COURSES, isActive: pathname.startsWith("/admin/courses") },
      { label: "Reports", href: ROUTES.ADMIN.REPORTS, isActive: pathname.startsWith("/admin/reports") },
      { label: "Audit Logs", href: ROUTES.ADMIN.LOGS, isActive: pathname.startsWith("/admin/logs") },
    ];
  } else if (isInstructorWorkspace) {
    workspaceTheme = {
      badgeBg: "bg-[#006a61]",
      badgeText: "Instructor",
      activeBg: "bg-[#e6f7f5] text-[#006a61] font-bold border border-[#99ded7]",
    };
    navItems = [
      { label: "Dashboard", href: ROUTES.INSTRUCTOR.OVERVIEW, isActive: pathname === "/instructor" },
      {
        label: "My Courses",
        href: ROUTES.INSTRUCTOR.COURSES,
        isActive: pathname === "/instructor/courses" || (pathname.startsWith("/instructor/courses/") && pathname !== "/instructor/courses/create"),
      },
      { label: "Submissions", href: ROUTES.INSTRUCTOR.SUBMISSIONS, isActive: pathname.startsWith("/instructor/submissions") },
      { label: "+ Create Course", href: ROUTES.INSTRUCTOR.CREATE_COURSE, isActive: pathname === "/instructor/courses/create" },
    ];
  } else if (!isPortalPage) {
    // Default Learner Workspace
    navItems = [
      { label: "Home", href: ROUTES.HOME, isActive: pathname === "/" },
      { label: "Catalog", href: ROUTES.COURSES, isActive: pathname === "/courses" || pathname?.startsWith("/courses/") },
      { label: "My Learning", href: "/my-learning", isActive: pathname?.startsWith("/my-learning") },
      { label: "Assignments", href: ROUTES.ASSIGNMENTS, isActive: pathname?.startsWith("/assignments") },
      { label: "Analytics", href: ROUTES.ANALYTICS, isActive: pathname?.startsWith("/analytics") },
    ];
  }

  return (
    <>
      <header
        data-component="Header"
        className="header__container_01 sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-[#ffffff]/95 backdrop-blur-md select-none"
      >
        <div className="header__content_01 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand & Dynamic Navigation Tabs */}
          <div className="header__left_01 flex items-center gap-3 sm:gap-4 lg:gap-6 shrink-0">
            {/* Logo as Clickable Link Button */}
            <Link
              href={
                isAdminWorkspace
                  ? ROUTES.ADMIN.OVERVIEW
                  : isInstructorWorkspace
                  ? ROUTES.INSTRUCTOR.OVERVIEW
                  : ROUTES.HOME
              }
              className="header__logo-btn_01 group inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-lg cursor-pointer shrink-0"
            >
              <div
                className={`header__logo-icon_01 h-7 w-7 rounded-full ${
                  isAdminWorkspace
                    ? "bg-[#0b1c30]"
                    : isInstructorWorkspace
                    ? "bg-[#006a61]"
                    : "bg-[#2563eb]"
                } flex items-center justify-center text-white font-display font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0`}
              >
                E
              </div>
              <span className="header__logo-text_01 font-display font-bold text-lg text-[#0b1c30] tracking-tight group-hover:text-[#2563eb] transition-colors whitespace-nowrap">
                EduPulse
              </span>
            </Link>

            {/* Workspace Context Badge */}
            {(isAdminWorkspace || isInstructorWorkspace) && (
              <span
                className={`header__workspace-badge_01 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white ${workspaceTheme.badgeBg} shadow-2xs`}
              >
                {workspaceTheme.badgeText}
              </span>
            )}

            {/* Navigation Links with Active State */}
            <nav className="header__nav_01 hidden md:flex items-center gap-1 text-sm font-medium shrink-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header__nav-link_01 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    item.isActive
                      ? workspaceTheme.activeBg
                      : "text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Portal Switcher, Search, Notifications, AI Assistant & Avatar */}
          <div className="header__right_01 flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Universal Portal Switcher Button */}
            <Link
              href={ROUTES.PORTAL}
              data-testid="header-portal-switcher"
              className={`header__portal-btn_01 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                isPortalPage
                  ? "bg-[#2563eb] text-white border-[#2563eb] shadow-xs"
                  : "bg-[#f8f9ff] text-[#434655] border-[#e2e8f0] hover:text-[#0b1c30] hover:bg-[#eff4ff] hover:border-[#bfdbfe]"
              }`}
              title="Chuyển Cổng / Switch Portal"
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Portals</span>
            </Link>

            {/* Search Input (Hidden on Admin and Portal pages to keep layout clean) */}
            {!isAdminWorkspace && !isPortalPage && (
              <div className="header__search_01 relative hidden lg:flex items-center shrink min-w-0">
                <Search className="header__search-icon_01 absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737686] pointer-events-none shrink-0" />
                <input
                  type="text"
                  placeholder="Search courses, skills..."
                  className="header__search-input_01 h-9.5 w-36 md:w-44 lg:w-52 xl:w-60 rounded-full border border-[#e2e8f0] bg-[#f8f9ff] pl-10 pr-11 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all shrink"
                />
                <kbd className="header__search-kbd_01 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none rounded border border-[#c3c6d7] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#737686] shadow-2xs shrink-0">
                  ⌘K
                </kbd>
              </div>
            )}

            {/* Notification Bell Button */}
            <button
              type="button"
              className="header__bell-btn_01 relative flex h-9 w-9 shrink-0 items-center justify-center text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-full transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="header__bell-badge_01 absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-[10px] font-bold text-white shadow-xs">
                3
              </span>
            </button>

            {/* AI Assistant Icon Button (Learner & Instructor workspaces) */}
            {!isAdminWorkspace && (
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen((prev) => !prev)}
                className="header__ai-btn_01 relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#004d44] hover:bg-[#003d36] text-white shadow-xs transition-all cursor-pointer active:scale-95"
                title="AI Assistant"
                aria-label="AI Assistant"
              >
                <Sparkles className="h-4.5 w-4.5" />
              </button>
            )}

            {/* Quick Auth Links: Sign In & Register */}
            <div className="header__auth-links_01 hidden sm:flex items-center gap-1.5 border-l border-[#e2e8f0] pl-2.5 shrink-0">
              {pathname !== ROUTES.LOGIN && (
                <Link
                  href={ROUTES.LOGIN}
                  className="header__signin-link_01 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors"
                >
                  Sign In
                </Link>
              )}
              <Link
                href={ROUTES.REGISTER}
                className="header__register-btn_01 px-3.5 py-1.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-xs transition-all active:scale-95"
              >
                Register
              </Link>
            </div>

            {/* User Profile Avatar Button */}
            <Link href={ROUTES.PROFILE} className="shrink-0">
              <button
                type="button"
                className="header__avatar-btn_01 relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#e2e8f0] hover:ring-[#2563eb] transition-all bg-[#eff4ff] flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                title="View Profile"
              >
                {!imgError ? (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Elena Rostova"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="font-display font-bold text-xs text-[#2563eb]">
                    ER
                  </span>
                )}
                <span className="header__avatar-dot_01 absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#006a61] ring-2 ring-white" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out AI Sidebar Chat Drawer */}
      <ChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        courseTitle="EduPulse AI Assistant"
        currentLessonTitle="General Learning & Systems Support"
      />
    </>
  );
}

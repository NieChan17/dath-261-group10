"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Bell, Search, ChevronLeft } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [imgError, setImgError] = React.useState(false);

  const navItems = [
    { label: "Catalog", href: ROUTES.HOME },
    { label: "My Learning", href: "/my-learning" },
    { label: "Community Forum", href: ROUTES.DISCUSSIONS },
    { label: "Analytics", href: ROUTES.ANALYTICS },
  ];

  return (
    <header
      data-component="Header"
      className="header__container_01 sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-[#ffffff]/95 backdrop-blur-md select-none"
    >
      <div className="header__content_01 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Dynamic Navigation Tabs */}
        <div className="header__left_01 flex items-center gap-6 lg:gap-8">
          {/* Logo as Clickable Link Button */}
          <Link
            href={ROUTES.HOME}
            className="header__logo-btn_01 group inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-lg cursor-pointer"
          >
            <div className="header__logo-icon_01 h-7 w-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-display font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="header__logo-text_01 font-display font-bold text-lg text-[#0b1c30] tracking-tight group-hover:text-[#2563eb] transition-colors">
              EduPulse
            </span>
          </Link>

          {/* Navigation Links with Active State */}
          <nav className="header__nav_01 hidden md:flex items-center gap-1.5 text-sm font-medium">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname === "/courses"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header__nav-link_01 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#eff4ff] text-[#2563eb]"
                      : "text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Notification, AI Assistant & Avatar Button */}
        <div className="header__right_01 flex items-center gap-3 sm:gap-4">
          {/* Search Input with properly spaced icon and ⌘K */}
          <div className="header__search_01 relative hidden sm:flex items-center">
            <Search className="header__search-icon_01 absolute left-3.5 h-4 w-4 text-[#737686] pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, skills, references..."
              className="header__search-input_01 h-9.5 w-64 lg:w-76 rounded-full border border-[#e2e8f0] bg-[#f8f9ff] pl-10 pr-11 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
            />
            <kbd className="header__search-kbd_01 absolute right-3 pointer-events-none select-none rounded border border-[#c3c6d7] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#737686] shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Notification Bell Button */}
          <button
            type="button"
            className="header__bell-btn_01 relative flex h-9 w-9 items-center justify-center text-[#434655] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="header__bell-badge_01 absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-[10px] font-bold text-white shadow-xs">
              3
            </span>
          </button>

          {/* AI Assistant Button */}
          <button
            type="button"
            className="header__ai-btn_01 hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#004d44] hover:bg-[#003d36] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>AI Assistant</span>
          </button>

          {/* User Profile Avatar Button */}
          <Link href={ROUTES.PROFILE}>
            <button
              type="button"
              className="header__avatar-btn_01 relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#e2e8f0] hover:ring-[#2563eb] transition-all bg-[#eff4ff] flex items-center justify-center cursor-pointer active:scale-95"
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
  );
}

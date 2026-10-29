"use client";

import * as React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  Shield,
  AtSign,
  Clock,
  ArrowRight,
  Building2,
  Info,
  ArrowLeft,
  User,
  Check,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div
      data-component="ForgotPasswordPage"
      className="forgot__container_01 min-h-screen flex flex-col justify-between bg-[#f8f9ff] text-[#0b1c30] select-none"
    >
      {/* 1. Header */}
      <header className="forgot__header_01 w-full border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="forgot__header-inner_01 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={ROUTES.HOME}
            className="forgot__logo-btn_01 inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-lg cursor-pointer"
          >
            <div className="forgot__logo-icon_01 h-7 w-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-display font-bold text-sm shadow-sm">
              E
            </div>
            <span className="forgot__logo-text_01 font-display font-bold text-lg text-[#0b1c30] tracking-tight">
              EduPulse
            </span>
          </Link>

          <div className="forgot__header-nav_01 flex items-center gap-6 text-xs font-semibold">
            <Link
              href={ROUTES.COURSES}
              className="forgot__nav-link_01 text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Back to Courses
            </Link>
            <a
              href="#help"
              className="forgot__nav-link_02 text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Help Center
            </a>
            <div className="forgot__avatar-pill_01 h-8 w-8 rounded-full bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#2563eb]">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Centered Card Container */}
      <main className="forgot__main_01 flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="forgot__card_01 w-full max-w-lg rounded-[15px] border border-[#e2e8f0] bg-white p-7 sm:p-10 shadow-sm space-y-6">
          {/* Top Shield Icon */}
          <div className="forgot__icon-wrapper_01 flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#2563eb] shadow-2xs">
              <Shield className="h-7 w-7 stroke-[2.2]" />
            </div>
          </div>

          {/* Heading */}
          <div className="forgot__heading_01 text-center space-y-2">
            <h1 className="forgot__title_01 font-display text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              Reset your password
            </h1>
            <p className="forgot__description_01 text-xs sm:text-sm text-[#434655] leading-relaxed max-w-sm mx-auto">
              Enter your verified account email address and we will dispatch a secure single-use recovery link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="forgot__form_01 space-y-4 pt-2">
            <div className="forgot__field_01 space-y-1.5">
              <label className="block text-xs font-bold text-[#0b1c30]">
                Institutional or Workspace Email
              </label>
              <div className="relative">
                <AtSign className="forgot__input-icon_01 absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737686] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu or name@company.com"
                  className="w-full h-11 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] pl-10 pr-3.5 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#737686] pt-1">
                <Clock className="h-3.5 w-3.5 text-[#737686] shrink-0" />
                <span>Instructions and single-use code expire in 15 minutes.</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="forgot__submit-btn_01 w-full h-11 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <span>Send Recovery Instructions</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {isSubmitted && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in-0">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Recovery instructions sent to <strong>{email}</strong>. Check your inbox and spam folder.
                </span>
              </div>
            )}

            {/* Secondary Action: SSO */}
            <div className="pt-1">
              <button
                type="button"
                className="forgot__sso-btn_01 w-full h-10.5 rounded-lg border border-[#dce9ff] bg-[#eff4ff] hover:bg-[#dbeafe] text-[#2563eb] font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Building2 className="h-4 w-4" />
                <span>Try institutional SSO login instead</span>
              </button>
            </div>
          </form>

          {/* SSO Identity Notice Box */}
          <div className="forgot__sso-box_01 rounded-xl border border-[#bbf7d0] bg-[#f0fdfa]/90 p-4 flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-[#006a61]/10 flex items-center justify-center text-[#006a61] shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-[#006a61]" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-[#0b1c30]">SSO Identity Notice</h4>
              <p className="text-[#434655] leading-relaxed text-[11px]">
                Accounts authenticated via GitHub or Google Workspace SSO can sign in directly without a password.
              </p>
            </div>
          </div>

          {/* Back to Sign In Link */}
          <div className="forgot__back-link-wrapper_01 pt-2 text-center">
            <Link
              href={ROUTES.LOGIN}
              className="forgot__back-link_01 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      {/* 3. Global Minimal Footer */}
      <footer className="forgot__footer_01 w-full border-t border-[#e2e8f0] bg-white py-6">
        <div className="forgot__footer-inner_01 mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-[#737686]">
          <p>© 2025 EduPulse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-[#0b1c30] transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-[#0b1c30] transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-[#0b1c30] transition-colors">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

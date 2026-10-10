import * as React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      data-component="Footer"
      className="footer__container_01 border-t border-[#e2e8f0] bg-white py-6 text-xs text-[#737686] select-none"
    >
      <div className="footer__content_01 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Links */}
        <div className="footer__links_01 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href={ROUTES.HOME}
            className="font-display font-bold text-sm text-[#0b1c30] hover:text-[#2563eb] transition-colors"
          >
            EduPulse
          </Link>
          <span className="hidden md:inline text-slate-300">•</span>
          <a href="#" className="hover:text-[#0b1c30] transition-colors">
            Academic &amp; Algorithmic Foundations
          </a>
          <a href="#" className="hover:text-[#0b1c30] transition-colors">
            Syllabus Grounding
          </a>
          <a href="#" className="hover:text-[#0b1c30] transition-colors">
            RAG Benchmarks
          </a>
          <a href="#" className="hover:text-[#0b1c30] transition-colors">
            Privacy &amp; Verification
          </a>
          <a href="#" className="hover:text-[#0b1c30] transition-colors">
            Institutional Support
          </a>
        </div>

        {/* Copyright */}
        <div className="footer__copy_01 text-[11px] text-[#737686]">
          &copy; 2024 EduPulse Platform. Verified Algorithmic Intelligence.
        </div>
      </div>
    </footer>
  );
}

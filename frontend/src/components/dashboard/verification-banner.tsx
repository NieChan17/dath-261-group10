"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

export function VerificationBanner() {
  return (
    <div
      data-component="VerificationBanner"
      className="verification-banner__container_01 flex flex-col md:flex-row items-center justify-between gap-4 rounded-[15px] border border-[#dce9ff] bg-[#eff4ff] p-5 sm:p-6 shadow-sm"
    >
      {/* Left: Shield Icon & Ground Truth Text */}
      <div className="verification-banner__left_01 flex items-center gap-4">
        <div className="verification-banner__icon-box_01 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#dce9ff] text-[#006a61] shadow-xs">
          <ShieldCheck className="h-6 w-6 text-[#006a61]" />
        </div>
        <div className="verification-banner__text_01 space-y-0.5">
          <h4 className="verification-banner__heading_01 font-display text-sm font-bold text-[#0b1c30]">
            Every syllabus step is verified with algorithmic ground truth
          </h4>
          <p className="verification-banner__desc_01 text-xs text-[#434655]">
            Courses are linked directly with peer-reviewed arXiv papers, code repositories, and runtime execution sandboxes.
          </p>
        </div>
      </div>

      {/* Right: Dual CTA Buttons */}
      <div className="verification-banner__actions_01 flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="verification-banner__explore-btn_01 rounded-lg border border-[#c3c6d7] bg-white px-4 py-2 text-xs font-bold text-[#0b1c30] shadow-xs hover:bg-[#f8f9ff] transition-all"
        >
          Explore Citation Engine
        </button>
        <button
          type="button"
          className="verification-banner__request-btn_01 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] transition-all"
        >
          Request New Syllabus
        </button>
      </div>
    </div>
  );
}

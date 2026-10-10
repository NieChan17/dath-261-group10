"use client";

import * as React from "react";
import { Zap, ExternalLink, Code2 } from "lucide-react";

export function QuickCheck() {
  const [selectedOption, setSelectedOption] = React.useState<number>(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const options = [
    "Eliminates sequence gradient vanishing",
    "Inner product depends strictly on (m - n)",
    "Adds static learnable absolute embeddings",
  ];

  return (
    <div data-component="QuickCheck" className="quick-check__container_01 space-y-6 select-none">
      {/* Quiz Card */}
      <div className="rounded-[15px] border border-[#dce9ff] bg-[#eff4ff]/60 p-5 space-y-4 shadow-xs">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb]/10 px-2.5 py-1 text-xs font-bold text-[#2563eb]">
            <Zap className="h-3.5 w-3.5 fill-[#2563eb]" />
            Quick Check
          </span>
          <span className="text-xs font-mono font-medium text-[#737686]">
            Q 1 of 3
          </span>
        </div>

        {/* Question Text */}
        <h4 className="font-display text-sm font-bold text-[#0b1c30] leading-snug">
          Why does RoPE mathematically preserve relative positional distance decay?
        </h4>

        {/* Radio Option Buttons */}
        <div className="space-y-2">
          {options.map((opt, idx) => {
            const isChecked = selectedOption === idx;
            return (
              <label
                key={opt}
                onClick={() => setSelectedOption(idx)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-xs transition-all cursor-pointer ${
                  isChecked
                    ? "border-[#2563eb] bg-white text-[#0b1c30] font-semibold shadow-xs ring-1 ring-[#2563eb]"
                    : "border-[#dce9ff] bg-white/70 text-[#434655] hover:bg-white"
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isChecked
                      ? "border-[#2563eb] bg-[#2563eb]"
                      : "border-[#c3c6d7] bg-white"
                  }`}
                >
                  {isChecked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={() => setIsSubmitted(true)}
          className="w-full rounded-lg bg-[#2563eb] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] transition-all active:scale-[0.99]"
        >
          {isSubmitted ? "Answer Verified ✓" : "Submit Answer"}
        </button>
      </div>

      {/* Literature & Code Reference Links */}
      <div className="space-y-3 pt-2">
        <h5 className="text-xs font-bold text-[#0b1c30]">Literature &amp; Code:</h5>
        
        <div className="space-y-2 text-xs">
          {/* Paper Link */}
          <a
            href="https://arxiv.org/abs/2104.09864"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white p-2.5 text-[#0b1c30] hover:border-[#2563eb] hover:text-[#2563eb] transition-all shadow-2xs group"
          >
            <span className="truncate pr-2 font-medium">
              RoFormer: Enhanced Transformer (Su et al.)
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[#737686] group-hover:text-[#2563eb] shrink-0" />
          </a>

          {/* Repo Link */}
          <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white p-2.5 text-[#0b1c30] hover:border-[#2563eb] transition-all shadow-2xs">
            <span className="truncate pr-2 font-mono text-[11px] text-[#434655]">
              edupulse/rope-lab (PyTorch 2.4)
            </span>
            <Code2 className="h-3.5 w-3.5 text-[#737686] shrink-0" />
          </div>
        </div>

        {/* Keyword Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[11px]">
          <span className="rounded bg-[#eff4ff] px-2.5 py-1 text-[#2563eb] border border-[#dce9ff]">
            Complex Numbers
          </span>
          <span className="rounded bg-[#eff4ff] px-2.5 py-1 text-[#2563eb] border border-[#dce9ff]">
            SO(2) Rotations
          </span>
          <span className="rounded bg-[#eff4ff] px-2.5 py-1 text-[#2563eb] border border-[#dce9ff]">
            LLaMA 3
          </span>
        </div>
      </div>
    </div>
  );
}

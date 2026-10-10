"use client";

import * as React from "react";
import { CheckCircle2, Lock, Play } from "lucide-react";

export function SyllabusSidebar() {
  return (
    <aside
      data-component="SyllabusSidebar"
      className="syllabus-sidebar__container_01 w-full lg:w-[310px] shrink-0 rounded-[15px] border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-5 select-none"
    >
      {/* Header Info */}
      <div className="syllabus-sidebar__header_01 space-y-2 border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[#2563eb] uppercase tracking-wider">
            MODULE 3 OF 5
          </span>
          <span className="text-[#006a61]">68% completed</span>
        </div>
        <h3 className="font-display text-base font-bold text-[#0b1c30] leading-snug">
          Deep Learning &amp; Transformers
        </h3>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-[#e2e8f0] overflow-hidden">
          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#2563eb] to-[#006a61]" />
        </div>
      </div>

      {/* Modules List */}
      <div className="syllabus-sidebar__modules_01 space-y-3 text-xs">
        {/* Module 1 (Completed) */}
        <div className="flex items-center justify-between p-2.5 rounded-lg text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#006a61] fill-[#86f2e4]/30 shrink-0" />
            <span className="font-semibold">1. Foundations of Attention</span>
          </div>
          <span className="text-[#737686] text-[11px] font-mono">3/3</span>
        </div>

        {/* Module 2 (Completed) */}
        <div className="flex items-center justify-between p-2.5 rounded-lg text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#006a61] fill-[#86f2e4]/30 shrink-0" />
            <span className="font-semibold">2. Query-Key-Value Math</span>
          </div>
          <span className="text-[#737686] text-[11px] font-mono">4/4</span>
        </div>

        {/* Module 3 (Active Expanded) */}
        <div className="rounded-xl border border-[#dce9ff] bg-[#eff4ff]/80 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0b1c30]">
              3. MHA &amp; Rotary Embeddings
            </span>
            <span className="rounded-md bg-[#2563eb]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#2563eb]">
              3/5
            </span>
          </div>

          {/* Sub-lessons */}
          <div className="space-y-1.5 pl-1">
            {/* 3.1 */}
            <div className="flex items-center justify-between py-1 text-[11px] text-[#434655]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006a61]" />
                <span>3.1 Scaled Dot Product</span>
              </div>
              <span className="text-[#737686]">12m</span>
            </div>

            {/* 3.2 */}
            <div className="flex items-center justify-between py-1 text-[11px] text-[#434655]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006a61]" />
                <span>3.2 Multi-Head Projection</span>
              </div>
              <span className="text-[#737686]">18m</span>
            </div>

            {/* 3.3 */}
            <div className="flex items-center justify-between py-1 text-[11px] text-[#434655]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006a61]" />
                <span>3.3 Positional Encodings</span>
              </div>
              <span className="text-[#737686]">24m</span>
            </div>

            {/* 3.4 (Current Active Lesson) */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2 text-[11px] font-bold text-[#2563eb] shadow-xs border border-[#dce9ff]">
              <div className="flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-[#2563eb] text-[#2563eb]" />
                <span>3.4 RoPE Deep Dive</span>
              </div>
              <span className="rounded bg-[#eff4ff] px-1.5 py-0.5 text-[10px]">
                28m
              </span>
            </div>

            {/* 3.5 */}
            <div className="flex items-center justify-between py-1 text-[11px] text-[#737686]">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#737686]" />
                <span>3.5 KV Cache Optimization</span>
              </div>
              <span>22m</span>
            </div>
          </div>
        </div>

        {/* Module 4 (Locked) */}
        <div className="flex items-center justify-between p-2.5 rounded-lg text-[#737686] hover:bg-[#f8f9ff] transition-colors cursor-not-allowed">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#737686] shrink-0" />
            <span>4. FlashAttention &amp; IO</span>
          </div>
          <span className="text-[11px] font-mono">0/4</span>
        </div>

        {/* Module 5 (Locked) */}
        <div className="flex items-center justify-between p-2.5 rounded-lg text-[#737686] hover:bg-[#f8f9ff] transition-colors cursor-not-allowed">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#737686] shrink-0" />
            <span>5. Grounded Fine-Tuning</span>
          </div>
          <span className="text-[11px] font-mono">0/5</span>
        </div>
      </div>
    </aside>
  );
}

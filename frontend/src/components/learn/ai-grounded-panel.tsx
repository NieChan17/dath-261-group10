"use client";

import * as React from "react";
import {
  ChevronLeft,
  Trash2,
  SlidersHorizontal,
  X,
  BookOpen,
  Lightbulb,
  FileText,
  Play,
  Code2,
  Paperclip,
  Mic,
  Send,
} from "lucide-react";

interface AiGroundedPanelProps {
  onClose: () => void;
}

export function AiGroundedPanel({ onClose }: AiGroundedPanelProps) {
  const [input, setInput] = React.useState("");

  const suggestedInquiries = [
    "Explain Slide 12 RoPE math",
    "Why not use ALiBi instead?",
    "Generate PyTorch implementation",
  ];

  return (
    <div
      data-component="AiGroundedPanel"
      className="ai-grounded-panel__container_01 flex flex-col justify-between rounded-[15px] border border-[#e2e8f0] bg-white p-5 shadow-sm select-none"
    >
      <div className="space-y-4">
        {/* 1. Header with Controls */}
        <div className="ai-grounded-panel__header_01 flex items-center justify-between border-b border-[#e2e8f0] pb-3.5">
          <div className="flex items-center gap-2.5">
            {/* Back Arrow Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eff4ff] text-[#006a61] hover:bg-[#dce9ff] transition-colors cursor-pointer"
              title="Return to Syllabus Mode"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00a896] animate-pulse" />
                <h3 className="font-display text-sm font-bold text-[#0b1c30]">
                  AI Grounded Tutor
                </h3>
              </div>
              <p className="text-[10px] text-[#737686]">
                Active RAG Grounding Engine
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 text-[#737686]">
            <button
              type="button"
              className="p-1.5 hover:text-[#ba1a1a] hover:bg-[#f8f9ff] rounded-md transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-md transition-colors"
              title="Settings & Model Parameters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-md transition-colors cursor-pointer"
              title="Close Tutor Panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Context Scope Pill Box */}
        <div className="ai-grounded-panel__context_01 flex items-center gap-2 rounded-lg border border-[#dce9ff] bg-[#eff4ff] px-3.5 py-2 text-xs font-semibold text-[#2563eb]">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#2563eb]" />
          <span className="truncate">
            Context: Lesson 3.4 • RoPE Architecture &amp; Slides 1-18
          </span>
        </div>

        {/* 3. Suggested Inquiries */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#434655]">
            <Lightbulb className="h-3.5 w-3.5 text-[#006a61]" />
            <span>Suggested Inquiries for Slide 12:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedInquiries.map((inq) => (
              <button
                key={inq}
                type="button"
                onClick={() => setInput(inq)}
                className="rounded-full border border-[#dce9ff] bg-[#f8f9ff] px-3 py-1 text-[11px] font-medium text-[#0b1c30] hover:border-[#2563eb] hover:bg-[#eff4ff] hover:text-[#2563eb] transition-all shadow-2xs cursor-pointer"
              >
                {inq}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Chat Messages Stream */}
        <div className="space-y-3.5 pt-2">
          {/* User Message */}
          <div className="space-y-1">
            <div className="rounded-[15px] bg-[#2563eb] p-4 text-xs leading-relaxed text-white shadow-xs font-medium">
              Can you explain why Rotary Embeddings allow the attention score to depend only on the relative distance <code className="rounded bg-white/20 px-1 py-0.5 font-mono text-[11px] font-bold text-white">(m - n)</code>, and show the 2D rotation matrix?
            </div>
            <span className="block text-right text-[10px] text-[#737686] pr-1">
              10:42 AM • Grounding Requested
            </span>
          </div>

          {/* AI Response Bubble */}
          <div className="rounded-[15px] border-l-4 border-l-[#006a61] border border-[#e2e8f0] bg-white p-4 text-xs leading-relaxed text-[#0b1c30] shadow-xs space-y-2.5">
            {/* Badges in AI Message */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004d44] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                <FileText className="h-3 w-3 text-[#86f2e4]" />
                Ref: Slide 12 - Attention Mechanism &amp; Lemma 1
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eff4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#2563eb] border border-[#dce9ff]">
                <Play className="h-2.5 w-2.5 fill-[#2563eb]" />
                Video @ 14:15
              </span>
            </div>

            <p className="text-[#434655]">
              According to <strong>Lesson 3.4 Slide 12</strong>, RoPE encodes absolute position with a rotation matrix and naturally incorporates relative position information through inner product multiplication between query and key vectors.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Bottom Search Status & Input Section */}
      <div className="space-y-2.5 pt-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#006a61]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00a896]" />
          <span>Searching strictly within: Deep Learning ... k=5 retrieved</span>
        </div>

        {/* Input Box Card */}
        <div className="rounded-[15px] border border-[#dce9ff] bg-[#eff4ff]/70 p-3 space-y-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question strictly about this lesson..."
            className="w-full bg-transparent text-xs text-[#0b1c30] placeholder:text-[#737686] focus:outline-none"
          />

          <div className="flex items-center justify-between pt-1 border-t border-[#dce9ff]/60 text-[#737686]">
            <div className="flex items-center gap-2.5">
              <button type="button" className="hover:text-[#0b1c30] transition-colors" title="Insert Code Block">
                <Code2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="hover:text-[#0b1c30] transition-colors" title="Attach Document">
                <Paperclip className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="hover:text-[#0b1c30] transition-colors" title="Voice Input">
                <Mic className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#737686] uppercase tracking-wider">
                Grounded RAG v2
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-xs hover:bg-[#1d4ed8] transition-all cursor-pointer active:scale-95"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <p className="text-[10px] text-[#737686] text-center leading-tight">
          Responses are bound to instructor course notes. Hallucinations are actively intercepted.
        </p>
      </div>
    </div>
  );
}

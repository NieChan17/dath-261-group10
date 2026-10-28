"use client";

import * as React from "react";
import { SyllabusSidebar } from "@/components/learn/syllabus-sidebar";
import { LecturePlayer } from "@/components/learn/lecture-player";
import { QuickCheck } from "@/components/learn/quick-check";
import { GroundedPlayer } from "@/components/learn/grounded-player";
import { AiGroundedPanel } from "@/components/learn/ai-grounded-panel";
import {
  GraduationCap,
  Download,
  Sparkles,
  Check,
  BookOpen,
  HelpCircle,
  FileText,
  Copy,
  CheckCheck,
} from "lucide-react";

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "quiz" | "notes">("overview");
  const [isCopied, setIsCopied] = React.useState(false);
  // State toggling between Syllabus Layout and AI Grounded Workstation Layout
  const [isAiGroundedMode, setIsAiGroundedMode] = React.useState(false);

  const pythonCode = `x_rot = torch.view_as_complex(x.reshape(*x.shape[:-1], -1, 2))\nreturn torch.view_as_real(x_rot).flatten(3)`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      data-component="MyLearningPage"
      className="my-learning__container_01 min-h-[calc(100vh-8rem)] bg-[#f8f9ff] pb-16"
    >
      <div className="my-learning__content_01 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {isAiGroundedMode ? (
          /* =========================================================================
             LAYOUT 2: AI Grounded Workstation (khi nhấp "Ask AI Tutor")
             Khung bài giảng đồng bộ Slide 12 bên trái + Panel AI Grounded Tutor bên phải
             ========================================================================= */
          <div className="my-learning__ai-workstation_01 flex flex-col lg:flex-row gap-6 items-start transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-1">
            {/* Left Column (~62%): Grounded Lecture & Theoretical Proofs */}
            <main className="flex-1 w-full lg:w-[62%] space-y-6 transition-all duration-500">
              <GroundedPlayer />
            </main>

            {/* Right Column (~38%): Docked AI Grounded Tutor Panel with Smooth Slide-in from Right */}
            <aside className="w-full lg:w-[38%] lg:max-w-[440px] shrink-0 sticky top-20 transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-right-4">
              <AiGroundedPanel onClose={() => setIsAiGroundedMode(false)} />
            </aside>
          </div>
        ) : (
          /* =========================================================================
             LAYOUT 1: Standard Syllabus Learning Workstation
             Sidebar danh mục bên trái + Video Player & Notes bên phải
             ========================================================================= */
          <div className="my-learning__standard-layout_01 flex flex-col lg:flex-row gap-6 items-start transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-1">
            {/* Left Column: Course Syllabus Sidebar with Smooth Slide-in from Left */}
            <div className="transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-left-4 w-full lg:w-auto">
              <SyllabusSidebar />
            </div>

            {/* Right Column: Main Learning Canvas */}
            <main className="my-learning__main-canvas_01 flex-1 w-full space-y-6 transition-all duration-500">
              {/* 1. Top Breadcrumbs & Action Toolbar */}
              <div className="my-learning__toolbar_01 flex flex-wrap items-center justify-between gap-4 rounded-[15px] border border-[#e2e8f0] bg-white px-5 py-3.5 shadow-2xs">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[#434655]">
                  <GraduationCap className="h-4 w-4 text-[#2563eb]" />
                  <span className="font-semibold text-[#0b1c30]">Module 3</span>
                  <span>/</span>
                  <span className="text-[#737686]">
                    Lesson 3.4: Rotary Positional Embeddings
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5">
                  {/* Resources */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1c30] hover:bg-[#f8f9ff] transition-all"
                  >
                    <Download className="h-3.5 w-3.5 text-[#737686]" />
                    <span>Resources</span>
                  </button>

                  {/* Ask AI Tutor Button (Kích hoạt chuyển sang AI Grounded Layout) */}
                  <button
                    type="button"
                    onClick={() => setIsAiGroundedMode(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#86f2e4] bg-[#eff4ff] px-3.5 py-1.5 text-xs font-bold text-[#006a61] hover:bg-[#dce9ff] transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#006a61]" />
                    <span>Ask AI Tutor</span>
                  </button>

                  {/* Mark Complete */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] transition-all"
                  >
                    <span>Mark Complete</span>
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. Interactive Lecture Video Player */}
              <LecturePlayer />

              {/* 3. Bottom Tabs Header */}
              <div className="my-learning__tabs-header_01 flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-[#eff4ff] text-[#2563eb]"
                      : "text-[#434655] hover:text-[#0b1c30] hover:bg-white"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("quiz")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "quiz"
                      ? "bg-[#eff4ff] text-[#2563eb]"
                      : "text-[#434655] hover:text-[#0b1c30] hover:bg-white"
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Quiz</span>
                  <span className="rounded bg-[#86f2e4]/40 px-1.5 py-0.2 text-[10px] text-[#004f47]">
                    3
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "notes"
                      ? "bg-[#eff4ff] text-[#2563eb]"
                      : "text-[#434655] hover:text-[#0b1c30] hover:bg-white"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Notes</span>
                </button>
              </div>

              {/* 4. Tab Content: Two Columns (Notes & Key Takeaways + Quick Check) */}
              <div className="my-learning__tab-body_01 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Left Column (2 Cols Span): Geometric Foundations & Code Block */}
                <div className="lg:col-span-2 space-y-5 rounded-[15px] border border-[#e2e8f0] bg-white p-6 shadow-xs">
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-bold text-[#0b1c30]">
                      Geometric Foundations of RoPE
                    </h3>
                    <p className="text-xs text-[#434655] leading-relaxed">
                      Rotary Positional Embeddings incorporate relative token positions by
                      applying orthogonal rotations to Query and Key vectors in 2D block-diagonal spaces.
                    </p>
                  </div>

                  {/* Key Takeaways Box */}
                  <div className="rounded-xl border border-[#dce9ff] bg-[#eff4ff]/60 p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0b1c30]">
                      <Check className="h-4 w-4 text-[#006a61]" />
                      <span>Key Takeaways</span>
                    </div>
                    <ul className="space-y-2 text-xs text-[#434655] pl-6 list-disc">
                      <li>
                        Rotates paired dimensions using 2D rotation matrix multiplication{" "}
                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#2563eb] border border-[#dce9ff]">
                          R(&theta;, m)
                        </code>
                        .
                      </li>
                      <li>
                        Guarantees query-key dot product depends solely on token distance{" "}
                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#2563eb] border border-[#dce9ff]">
                          (m - n)
                        </code>
                        .
                      </li>
                      <li>
                        Efficient complex tensor multiplication bypasses full matrix operations.
                      </li>
                    </ul>
                  </div>

                  {/* Python Execution Code Snippet */}
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-inner">
                    {/* Code File Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 bg-[#0b1c30] px-4 py-2 text-[11px] text-slate-400">
                      <span className="font-mono text-teal-400">rope_kernel.py</span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <CheckCheck className="h-3 w-3 text-teal-400" />
                            <span className="text-teal-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Code Pre Block */}
                    <pre className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
                      <code>
                        <span className="text-blue-400">x_rot</span> = torch.
                        <span className="text-teal-300">view_as_complex</span>(x.reshape(*x.shape[:-
                        <span className="text-amber-400">1</span>], -
                        <span className="text-amber-400">1</span>,{" "}
                        <span className="text-amber-400">2</span>)){"\n"}
                        <span className="text-pink-400">return</span> torch.
                        <span className="text-teal-300">view_as_real</span>(x_rot).flatten(
                        <span className="text-amber-400">3</span>)
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Right Column (1 Col Span): Quick Check & Literature */}
                <div className="lg:col-span-1 rounded-[15px] border border-[#e2e8f0] bg-white p-5 shadow-xs">
                  <QuickCheck />
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

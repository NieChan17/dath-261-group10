"use client";

import * as React from "react";
import { SyllabusSidebar } from "@/components/learn/syllabus-sidebar";
import { LecturePlayer } from "@/components/learn/lecture-player";
import { QuickCheck } from "@/components/learn/quick-check";
import { GroundedPlayer } from "@/components/learn/grounded-player";
import { AiGroundedPanel } from "@/components/learn/ai-grounded-panel";
import { LessonDiscussionForum } from "@/components/discussion/lesson-discussion-forum";
import { updateLessonProgress } from "@/lib/api/enrollments";
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
  MessageSquare,
  FolderDown,
} from "lucide-react";

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "quiz" | "notes" | "discussion" | "resources">("discussion");
  const [isCopied, setIsCopied] = React.useState(false);
  // State toggling between Syllabus Layout and AI Grounded Workstation Layout
  const [isAiGroundedMode, setIsAiGroundedMode] = React.useState(false);

  // Lesson completion state (connected with enrollments API)
  const [completedLessons, setCompletedLessons] = React.useState<string[]>(["3.1", "3.2", "3.3"]);
  const isLessonCompleted = completedLessons.includes("3.4");

  const handleToggleComplete = async () => {
    const nextCompleted = isLessonCompleted
      ? completedLessons.filter((id) => id !== "3.4")
      : [...completedLessons, "3.4"];
    setCompletedLessons(nextCompleted);

    // Call backend API if enrolled
    try {
      await updateLessonProgress("demo-enrollment-id", "lesson-3.4-rope", {
        isCompleted: !isLessonCompleted,
        lastPositionSeconds: 1680,
      });
    } catch {
      // Graceful local state persistence for offline/development mode
    }
  };

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
              <SyllabusSidebar
                completedLessonIds={completedLessons}
                activeLessonId="3.4"
              />
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

                  {/* Mark Complete (Interactive State synced with Backend Progress API) */}
                  <button
                    type="button"
                    onClick={handleToggleComplete}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs ${
                      isLessonCompleted
                        ? "border border-[#86f2e4] bg-[#f0fdfa] text-[#006a61] hover:bg-[#ccfbf1]"
                        : "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                    }`}
                  >
                    {isLessonCompleted ? (
                      <>
                        <CheckCheck className="h-3.5 w-3.5 text-[#006a61]" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <span>Mark Complete</span>
                        <Check className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Interactive Lecture Video Player */}
              <LecturePlayer />

              {/* 3. Bottom Tabs Header */}
              <div className="my-learning__tabs-header_01 flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
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
                    onClick={() => setActiveTab("notes")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "notes"
                        ? "bg-[#eff4ff] text-[#2563eb]"
                        : "text-[#434655] hover:text-[#0b1c30] hover:bg-white"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Notes</span>
                    <span className="rounded bg-[#86f2e4]/40 px-1.5 py-0.2 text-[10px] text-[#004f47]">
                      3
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("discussion")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "discussion"
                        ? "bg-[#2563eb] text-white shadow-xs"
                        : "text-[#434655] hover:text-[#0b1c30] hover:bg-white"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Discussion Forum</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        activeTab === "discussion" ? "bg-white/20 text-white" : "bg-blue-100 text-[#2563eb]"
                      }`}
                    >
                      28
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("resources")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "resources"
                        ? "bg-[#eff4ff] text-[#2563eb]"
                        : "text-[#434655] hover:text-[#0b1c30] hover:bg-white"
                    }`}
                  >
                    <FolderDown className="h-3.5 w-3.5" />
                    <span>Resources</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-700">
                      6
                    </span>
                  </button>
                </div>

                {/* Right Presence Indicator */}
                <div className="flex items-center gap-1.5 text-xs text-[#434655] font-medium pr-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>14 Online in this lesson</span>
                </div>
              </div>

              {/* 4. Tab Body */}
              {activeTab === "discussion" ? (
                <LessonDiscussionForum />
              ) : activeTab === "resources" ? (
                <div className="rounded-[15px] border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-4">
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">
                    Verified Lesson Resources &amp; Research Citations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <a
                      href="https://arxiv.org/abs/2104.09864"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff4ff]/40 transition-all text-xs"
                    >
                      <span className="font-semibold text-[#0b1c30]">RoFormer Paper (Su et al. 2021)</span>
                      <span className="text-[#2563eb]">PDF &rarr;</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff4ff]/40 transition-all text-xs"
                    >
                      <span className="font-semibold text-[#0b1c30]">Module 3 Lecture Slides Deck</span>
                      <span className="text-[#2563eb]">Keynote (Slide 12) &rarr;</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff4ff]/40 transition-all text-xs"
                    >
                      <span className="font-semibold text-[#0b1c30]">Custom Triton RoPE Kernel Implementation</span>
                      <span className="text-[#2563eb]">GitHub &rarr;</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff4ff]/40 transition-all text-xs"
                    >
                      <span className="font-semibold text-[#0b1c30]">Interactive 2D Rotation Matrix Playground</span>
                      <span className="text-[#2563eb]">Colab &rarr;</span>
                    </a>
                  </div>
                </div>
              ) : (
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
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

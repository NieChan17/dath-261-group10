"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Terminal,
  Clock,
  HardDrive,
  AlertTriangle,
  Code2,
  FileCode,
  Sparkles,
} from "lucide-react";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";

const INITIAL_TRITON_CODE = `import triton
import triton.language as tl
import torch

# FlashAttention-2 Forward Tiling Kernel
@triton.jit
def _fwd_kernel(
    Q, K, V, sm_scale,
    L, Out,
    stride_qz, stride_qh, stride_qm, stride_qk,
    stride_kz, stride_kh, stride_kn, stride_kk,
    stride_vz, stride_vh, stride_vn, stride_vk,
    Z, H, N_CTX,
    BLOCK_M: tl.constexpr, BLOCK_DMODEL: tl.constexpr,
    BLOCK_N: tl.constexpr
):
    # Block index assignments along sequence tiles
    start_m = tl.program_id(0)
    offs_m = start_m * BLOCK_M + tl.arange(0, BLOCK_M)
    offs_n = tl.arange(0, BLOCK_N)
    offs_d = tl.arange(0, BLOCK_DMODEL)

    # Initialize running max (m_i) and running denominator (l_i)
    m_i = tl.zeros([BLOCK_M], dtype=tl.float32) - float("inf")
    l_i = tl.zeros([BLOCK_M], dtype=tl.float32)
    acc = tl.zeros([BLOCK_M, BLOCK_DMODEL], dtype=tl.float32)

    # Step 1: Pre-load Q tile into register/SRAM cache
    q = tl.load(Q + offs_m[:, None] * stride_qm + offs_d[None, :] * stride_qk)

    # Loop over K, V blocks and execute online softmax update
    for start_n in range(0, (start_m + 1) * BLOCK_M, BLOCK_N):
        k = tl.load(K + (start_n + offs_n[:, None]) * stride_kn + offs_d[None, :] * stride_kk)
        qk = tl.zeros([BLOCK_M, BLOCK_N], dtype=tl.float32)
        qk += tl.dot(q, tl.trans(k)) * sm_scale

        # Boundary masking logic applied here
        pass
`;

interface TestCaseItem {
  id: number;
  name: string;
  shortName: string;
  passed: boolean;
  seqLen: string;
  inputDescription: string;
  details: {
    expected: string;
    received: string;
    delta?: string;
    errorMsg?: string;
    timeMs: number;
  };
}

const TEST_CASES: TestCaseItem[] = [
  {
    id: 1,
    name: "Case 1: Standard Tile [B=2, H=4, N=512]",
    shortName: "Case 1: Standard",
    passed: true,
    seqLen: "seq_len=512",
    inputDescription: "B=2, H=4, N=512, D=64 on CUDA (FP16 precision)",
    details: {
      expected: "[0.4512, 0.1894, -0.9128, 0.3341, ...]",
      received: "[0.4512, 0.1894, -0.9128, 0.3341, ...]",
      delta: "0.0001 < atol (1.000e-03)",
      timeMs: 12.4,
    },
  },
  {
    id: 2,
    name: "Case 2: 2048 Context Length",
    shortName: "Case 2: 2048 Len",
    passed: true,
    seqLen: "seq_len=2048",
    inputDescription: "B=1, H=8, N=2048, D=128 multi-tile pipeline",
    details: {
      expected: "[1.1042, -0.0521, 0.8841, -0.2190, ...]",
      received: "[1.1042, -0.0521, 0.8841, -0.2190, ...]",
      delta: "0.0002 < atol (1.000e-03)",
      timeMs: 28.1,
    },
  },
  {
    id: 3,
    name: "Case 3: Causal Masking (seq_len=768)",
    shortName: "Case 3: Causal Mask",
    passed: false,
    seqLen: "seq_len=768",
    inputDescription: "B=2, H=8, N=768, D=64 causal lower-triangular mask",
    details: {
      errorMsg: "Tolerance delta mismatch at boundary tile edge [row=512, col=512].",
      expected: "[ 0.4512,  0.1894, -0.9128,  0.7201, ... ]",
      received: "[ 0.4512,  0.1894, -0.8994,  0.7201, ... ]",
      delta: "0.0126 > atol (1.000e-03)",
      timeMs: 42.8,
    },
  },
  {
    id: 4,
    name: "Case 4: Stress Memory Alignment",
    shortName: "Case 4: Stress Align",
    passed: true,
    seqLen: "BLOCK_M=128",
    inputDescription: "Odd sequence length boundary padding alignment test",
    details: {
      expected: "[-0.3129, 0.9912, 0.0412, -0.6651, ...]",
      received: "[-0.3129, 0.9912, 0.0412, -0.6651, ...]",
      delta: "0.0004 < atol (1.000e-03)",
      timeMs: 19.6,
    },
  },
];

export default function AssignmentDetailPage() {
  const [code, setCode] = React.useState(INITIAL_TRITON_CODE);
  const [selectedCaseId, setSelectedCaseId] = React.useState<number>(3); // Default Case 3
  const [bottomTab, setBottomTab] = React.useState<"testcases" | "stdout">("testcases");
  const [leftTab, setLeftTab] = React.useState<"description" | "submissions">("description");
  const [isRunning, setIsRunning] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);

  // Resizing state
  const [leftWidthPercent, setLeftWidthPercent] = React.useState<number>(40);
  const [editorHeightPercent, setEditorHeightPercent] = React.useState<number>(55);
  const [isDraggingH, setIsDraggingH] = React.useState(false);
  const [isDraggingV, setIsDraggingV] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const rightColRef = React.useRef<HTMLDivElement>(null);

  // Drag handler for Horizontal Splitter (Width between Left Column & Right Column)
  const handleStartDragH = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingH(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      if (newWidth >= 20 && newWidth <= 70) {
        setLeftWidthPercent(Math.round(newWidth));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingH(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drag handler for Vertical Splitter (Height between Editor & Testcases)
  const handleStartDragV = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingV(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!rightColRef.current) return;
      const rect = rightColRef.current.getBoundingClientRect();
      const newHeight = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      if (newHeight >= 25 && newHeight <= 75) {
        setEditorHeightPercent(Math.round(newHeight));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingV(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Active selected testcase
  const activeCase = TEST_CASES.find((c) => c.id === selectedCaseId) || TEST_CASES[0];

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 600);
  };

  const handleCopyExample = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmitSolution = () => {
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 3000);
  };

  return (
    <div className="sandbox__page-wrapper_01 min-h-[calc(100vh-4rem)] bg-[#f8f9ff] py-5 px-4 sm:px-6 lg:px-8">
      <div
        data-component="CodeSandboxPage"
        className="sandbox__container_01 mx-auto max-w-7xl flex flex-col h-[calc(100vh-6.5rem)] bg-white text-[#0b1c30] rounded-[16px] border border-[#e2e8f0] shadow-xs overflow-hidden select-none"
      >
      {/* =========================================================================
          1. Light Mode Top Bar (Breadcrumbs & Constraints)
          ========================================================================= */}
      <header className="sandbox__top-bar_01 flex h-12 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-5 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/assignments"
            className="flex items-center gap-1.5 font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Assignments</span>
          </Link>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0b1c30]">Problem 4.2</span>
            <span className="text-[#434655]">FlashAttention Tiling Kernel</span>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            Hard
          </span>
          <span className="rounded-md bg-[#eff4ff] px-2 py-0.5 text-[10px] font-bold text-[#2563eb] border border-[#dce9ff]">
            GPU Systems
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#737686] pl-1">
            <Clock className="h-3 w-3" />
            <span>2.0s</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#737686]">
            <HardDrive className="h-3 w-3" />
            <span>128 MB</span>
          </span>
        </div>
      </header>

      {/* =========================================================================
          2. Two-Column Split Layout (Resizable Left Width & Right Height)
          ========================================================================= */}
      <div
        ref={containerRef}
        className={`sandbox__canvas_01 flex flex-1 flex-col lg:flex-row overflow-hidden ${
          isDraggingH || isDraggingV ? "select-none" : ""
        }`}
      >
        {/* ==================== LEFT COLUMN: PROBLEM DESCRIPTION (Resizable Width) ==================== */}
        <section
          aria-label="Problem Description"
          style={{ width: `${leftWidthPercent}%` }}
          className="sandbox__pane-desc_01 w-full flex flex-col bg-white overflow-hidden shrink-0"
        >
          {/* Header Tabs */}
          <div className="flex h-11 shrink-0 items-center border-b border-[#e2e8f0] bg-[#f8f9ff] px-5 gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLeftTab("description")}
              className={`h-full border-b-2 transition-colors cursor-pointer ${
                leftTab === "description"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#737686] hover:text-[#0b1c30]"
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("submissions")}
              className={`h-full border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                leftTab === "submissions"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#737686] hover:text-[#0b1c30]"
              }`}
            >
              <span>Submissions</span>
              <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700">
                4
              </span>
            </button>
          </div>

          {/* Pane Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#434655] leading-relaxed">
            {leftTab === "description" ? (
              <>
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold text-[#0b1c30]">
                    Problem 4.2: FlashAttention Tiling Kernel
                  </h2>
                  <p className="text-xs text-[#737686]">
                    Fused GPU forward attention tiling with online softmax scaling
                  </p>
                </div>

                <p>
                  Standard multi-head attention materializes an full{" "}
                  <code className="rounded bg-[#eff4ff] px-1.5 py-0.5 font-mono text-[#2563eb] border border-[#dce9ff]">
                    N &times; N
                  </code>{" "}
                  attention matrix in high-bandwidth GPU memory (HBM), creating an{" "}
                  <span className="font-semibold text-rose-600 font-mono">O(N^2)</span> memory bottleneck.
                </p>

                <p>
                  In this problem, implement a high-throughput fused forward attention kernel using{" "}
                  <span className="font-semibold text-[#0b1c30]">Triton</span>. Your kernel must perform block tiling
                  across SRAM (Shared Memory), maintaining rolling online softmax scalars to drop memory I/O
                  footprint from <span className="font-mono text-rose-600 font-bold">O(N^2)</span> down to{" "}
                  <span className="font-mono text-emerald-600 font-bold">O(N)</span>.
                </p>

                {/* Formula Box in Light Mode */}
                <div className="rounded-xl border border-[#dce9ff] bg-[#eff4ff]/70 p-4 space-y-2 font-mono text-[11px] text-[#0b1c30]">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#2563eb] uppercase tracking-wider">
                    <span>&Sigma; Online Softmax Rescaling</span>
                    <span className="text-[#737686] font-sans font-semibold">Dao et al. Eq. 3</span>
                  </div>
                  <div className="space-y-1 text-[#0b1c30] font-medium">
                    <p>m_new = max(m_old, rowmax(S_block))</p>
                    <p>P_tilde = exp(S_block - m_new)</p>
                    <p>l_new = exp(m_old - m_new) * l_old + rowsum(P_tilde)</p>
                    <p>O_new = diag(exp(m_old - m_new)) * O_old + P_tilde * V_block</p>
                  </div>
                </div>

                {/* Verification Example Code Box in Light Mode */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#737686]">
                    <span className="font-semibold text-[#0b1c30]">
                      Example: Power-of-Two Tile [B=2, H=8, N=512, D=64]
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyExample}
                      className="flex items-center gap-1 hover:text-[#2563eb] transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className={isCopied ? "text-emerald-600 font-semibold" : ""}>
                        {isCopied ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </div>
                  <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3.5 font-mono text-[11px] text-[#0b1c30] space-y-1 overflow-x-auto shadow-2xs">
                    <p className="text-[#737686]"># Input Tensor Allocations (FP16)</p>
                    <p>Q = torch.randn((2, 8, 512, 64), device=&apos;cuda&apos;)</p>
                    <p>K = torch.randn((2, 8, 512, 64), device=&apos;cuda&apos;)</p>
                    <p>V = torch.randn((2, 8, 512, 64), device=&apos;cuda&apos;)</p>
                    <p className="text-[#2563eb] pt-1"># Verification Assertion</p>
                    <p className="text-emerald-700 font-bold">
                      assert torch.allclose(out_triton, out_ref, atol=1e-3)
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* Submissions History Tab in Light Mode */
              <div className="space-y-3">
                <h3 className="font-bold text-[#0b1c30] text-xs uppercase tracking-wider">
                  Submission History
                </h3>
                <div className="space-y-2.5">
                  {[
                    { id: "sub-4", time: "10 mins ago", score: "75% (3/4)", status: "Failed (Case 3)", delta: "42.8ms" },
                    { id: "sub-3", time: "25 mins ago", score: "50% (2/4)", status: "Failed (Case 3, 4)", delta: "45.1ms" },
                    { id: "sub-2", time: "1 hour ago", score: "25% (1/4)", status: "Compilation Error", delta: "--" },
                    { id: "sub-1", time: "2 hours ago", score: "0% (0/4)", status: "Syntax Error", delta: "--" },
                  ].map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#0b1c30] font-bold">{sub.score}</span>
                        <span className="text-[#737686] text-[11px]">{sub.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-600 font-semibold">{sub.status}</span>
                        <span className="text-[#006a61] font-mono">{sub.delta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Draggable Vertical Splitter Bar (Adjust Width) */}
        <div
          onMouseDown={handleStartDragH}
          className={`hidden lg:flex w-1.5 hover:w-2 shrink-0 bg-[#e2e8f0] hover:bg-[#2563eb] cursor-col-resize transition-all select-none relative group z-10 items-center justify-center ${
            isDraggingH ? "bg-[#2563eb] w-2" : ""
          }`}
          title="Drag to resize pane width"
        >
          <div className="h-8 w-1 rounded-full bg-slate-300 group-hover:bg-white transition-colors" />
        </div>

        {/* ==================== RIGHT COLUMN: CODE EDITOR ON TOP + TESTCASES ON BOTTOM ==================== */}
        <section
          ref={rightColRef}
          aria-label="Code Editor and Testcases"
          style={{ width: `${100 - leftWidthPercent}%` }}
          className="sandbox__pane-right_01 flex-1 flex flex-col bg-white overflow-hidden shrink-0"
        >
          {/* ==================== TOP SUB-PANE: MONACO EDITOR (Resizable Height) ==================== */}
          <div
            style={{ height: `${editorHeightPercent}%` }}
            className={`flex flex-col overflow-hidden shrink-0 ${
              isDraggingH || isDraggingV ? "pointer-events-none" : ""
            }`}
          >
            {/* Editor Tab Bar */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-[#f8f9ff] px-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#2563eb]" />
                <span className="font-mono text-[#0b1c30]">kernel.py</span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-[#737686] font-normal">Python (Triton 2.1)</span>
              </div>

              <button
                type="button"
                onClick={() => setCode(INITIAL_TRITON_CODE)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#737686] hover:text-[#2563eb] transition-colors cursor-pointer"
                title="Reset initial code template"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Monaco Editor in Light Theme ("vs") */}
            <div className="flex-1 w-full overflow-hidden">
              <CodeEditor
                language="python"
                initialCode={code}
                theme="vs"
                hideHeader={true}
                onChange={(val) => setCode(val || "")}
              />
            </div>

            {/* Editor Status Bar */}
            <div className="flex h-7 shrink-0 items-center justify-between border-t border-[#e2e8f0] bg-[#f8f9ff] px-4 text-[11px] text-[#737686] font-mono">
              <span>UTF-8</span>
              <div className="flex items-center gap-3">
                <span>Ln 18, Col 24</span>
                <span className="text-emerald-600 font-semibold">&bull; 0 Errors</span>
              </div>
            </div>
          </div>

          {/* Draggable Horizontal Splitter Bar (Adjust Height) */}
          <div
            onMouseDown={handleStartDragV}
            className={`h-1.5 hover:h-2 shrink-0 bg-[#e2e8f0] hover:bg-[#2563eb] cursor-row-resize transition-all select-none relative group z-10 flex items-center justify-center ${
              isDraggingV ? "bg-[#2563eb] h-2" : ""
            }`}
            title="Drag to resize editor height"
          >
            <div className="w-8 h-1 rounded-full bg-slate-300 group-hover:bg-white transition-colors" />
          </div>

          {/* ==================== BOTTOM SUB-PANE: TEST CASES & CONSOLE (Remaining Height) ==================== */}
          <div
            style={{ height: `${100 - editorHeightPercent}%` }}
            className="flex flex-col bg-white overflow-hidden shrink-0"
          >
            {/* Testcase Tabs Header */}
            <div className="flex h-10 shrink-0 items-center border-b border-[#e2e8f0] bg-[#f8f9ff] px-4 gap-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBottomTab("testcases")}
                className={`h-full border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  bottomTab === "testcases"
                    ? "border-[#2563eb] text-[#2563eb]"
                    : "border-transparent text-[#737686] hover:text-[#0b1c30]"
                }`}
              >
                <span>Testcases</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700">
                  4
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBottomTab("stdout")}
                className={`h-full border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  bottomTab === "stdout"
                    ? "border-[#2563eb] text-[#2563eb]"
                    : "border-transparent text-[#737686] hover:text-[#0b1c30]"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Stdout Console</span>
              </button>
            </div>

            {/* Testcase Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {bottomTab === "testcases" ? (
                <>
                  {/* Suite Execution Bar & Summary */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-xs text-[#0b1c30]">Suite Execution</span>
                      <span className="font-mono text-xs font-bold text-[#0b1c30]">
                        3 / 4 Passed (75%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full sm:w-48 overflow-hidden rounded-full bg-slate-200 flex shrink-0">
                      <div className="h-full bg-emerald-500 w-[75%]" />
                      <div className="h-full bg-rose-500 w-[25%]" />
                    </div>
                  </div>

                  {/* 4 Interactive Test Case Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEST_CASES.map((tc) => {
                      const isSelected = selectedCaseId === tc.id;
                      return (
                        <button
                          key={tc.id}
                          type="button"
                          onClick={() => setSelectedCaseId(tc.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? tc.passed
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs"
                                : "border-rose-500 bg-rose-50 text-rose-900 font-bold shadow-2xs"
                              : tc.passed
                              ? "border-[#e2e8f0] bg-white text-[#434655] hover:border-slate-300"
                              : "border-rose-200 bg-white text-rose-700 hover:border-rose-300"
                          }`}
                        >
                          <span className="truncate pr-1 text-[11px]">{tc.shortName}</span>
                          {tc.passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Test Case Detail Card (Diff Viewer) */}
                  <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {activeCase.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        )}
                        <span className="font-bold text-[#0b1c30]">
                          {activeCase.passed ? `${activeCase.name} — Passed` : `Assertion Error in ${activeCase.name}`}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#737686] rounded bg-white border border-[#e2e8f0] px-2 py-0.5 font-semibold">
                        {activeCase.seqLen}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#737686]">
                      <span className="font-semibold text-[#434655]">Input Spec:</span> {activeCase.inputDescription}
                    </p>

                    {/* Diff Viewer in Light Mode */}
                    {!activeCase.passed ? (
                      <div className="space-y-1.5 rounded-lg border border-rose-200 bg-rose-50/60 p-3 font-mono text-[11px]">
                        <p className="text-rose-800 font-bold leading-relaxed">
                          {activeCase.details.errorMsg}
                        </p>
                        <div className="space-y-0.5 pt-1">
                          <p className="text-emerald-700 font-semibold">
                            - Expected: {activeCase.details.expected}
                          </p>
                          <p className="text-rose-700 font-semibold">
                            + Received: {activeCase.details.received}
                          </p>
                        </div>
                        <p className="text-amber-800 pt-1 font-bold">
                          Delta: {activeCase.details.delta}
                        </p>
                      </div>
                    ) : (
                      /* Verified Box in Light Mode */
                      <div className="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 font-mono text-[11px]">
                        <p className="text-emerald-800 font-bold">
                          All tensor output assertions matched ground-truth.
                        </p>
                        <p className="text-[#434655]">
                          Result: {activeCase.details.received}
                        </p>
                        <p className="text-[#006a61] font-semibold">
                          Tolerance: {activeCase.details.delta} ({activeCase.details.timeMs}ms)
                        </p>
                      </div>
                    )}

                    {/* Execution Metrics in Light Mode */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-[#e2e8f0] text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#737686]">Latency:</span>
                        <span className="font-mono font-bold text-[#0b1c30]">42.8 ms</span>
                        <span className="text-emerald-600 font-semibold">(-14% vs ref)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#737686]">Peak Memory:</span>
                        <span className="font-mono font-bold text-[#0b1c30]">48.2 MB</span>
                        <span className="text-[#737686]">(limit 128 MB)</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Stdout Console Tab in Light Mode */
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-4 font-mono text-xs space-y-1.5 text-[#0b1c30] shadow-inner">
                  <span className="text-[#737686]">[CUDA Context Initialized: NVIDIA A100-SXM4-40GB]</span>
                  <p className="text-[#2563eb]">&gt;&gt;&gt; Compiling Triton kernel with BLOCK_M=128, BLOCK_N=64...</p>
                  <p>&gt;&gt;&gt; Running Case 1: Standard Tile ... [PASS in 12.4ms]</p>
                  <p>&gt;&gt;&gt; Running Case 2: 2048 Context Length ... [PASS in 28.1ms]</p>
                  <p className="text-rose-600 font-bold">&gt;&gt;&gt; Running Case 3: Causal Masking ... [FAIL: Delta 0.0126 &gt; atol 1e-3]</p>
                  <p>&gt;&gt;&gt; Running Case 4: Stress Memory Alignment ... [PASS in 19.6ms]</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          3. Light Mode Bottom Action Bar
          ========================================================================= */}
      <footer className="sandbox__bottom-bar_01 flex h-12 shrink-0 items-center justify-between border-t border-[#e2e8f0] bg-white px-5 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>1 failed assertion (Case 3)</span>
          </span>

          {submissionSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold animate-in fade-in-0 duration-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Solution submitted successfully!</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRunTests}
            disabled={isRunning}
            className="h-8 px-4 rounded-lg border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#f8f9ff] text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
          >
            <Play className={`h-3 w-3 ${isRunning ? "animate-spin text-[#2563eb]" : "fill-current"}`} />
            <span>{isRunning ? "Running Suite..." : "Run Tests"}</span>
            <span className="text-[10px] text-[#737686] font-mono hidden sm:inline">Ctrl+&apos;</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmitSolution}
            className="h-8 px-4 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Send className="h-3 w-3" />
            <span>Submit Solution</span>
            <span className="text-[10px] text-blue-200 font-mono hidden sm:inline">Ctrl+Enter</span>
          </Button>
        </div>
      </footer>
      </div>
    </div>
  );
}

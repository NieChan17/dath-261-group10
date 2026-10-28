"use client";

import * as React from "react";
import {
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  ShieldCheck,
  Download,
  Check,
  Tv,
  Cast,
  Layout,
} from "lucide-react";

export function GroundedPlayer() {
  const [activeTab, setActiveTab] = React.useState("transcripts");

  return (
    <div data-component="GroundedPlayer" className="grounded-player__container_01 space-y-5 select-none">
      {/* 1. Top Breadcrumbs & Telemetry Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] text-[#737686] flex items-center gap-1.5 font-medium">
            <span>Advanced Transformer Foundations</span>
            <span>&gt;</span>
            <span>Module 3: Positional Geometry</span>
            <span>&gt;</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0b1c30]">
            Lesson 3.4: Rotary Positional Embeddings (RoPE)
          </h1>
        </div>

        {/* Telemetry Status */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#86f2e4]/30 px-3 py-1 text-xs font-bold text-[#006a61] border border-teal-500/30">
            <span className="h-2 w-2 rounded-full bg-[#00a896] animate-pulse" />
            Telemetry Synchronized
          </span>
          <span className="rounded-md bg-[#e2e8f0] px-2 py-1 text-xs font-mono text-[#434655]">
            ID: #DL-8821
          </span>
        </div>
      </div>

      {/* 2. Slide 12 Verified Replay Video Player */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-[15px] border border-slate-800 bg-[#071322] p-5 sm:p-6 text-white shadow-md min-h-[360px]">
        {/* Top Video Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded bg-black/50 px-2.5 py-1 text-[11px] text-slate-200 border border-slate-700">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              LIVE RECORDING REPLAY
            </span>
            <span className="text-slate-400 text-[11px]">
              • 1080p60 Verified Stream
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button type="button" className="p-1 hover:text-white transition-colors" title="Layout View">
              <Layout className="h-4 w-4" />
            </button>
            <button type="button" className="p-1 hover:text-white transition-colors" title="Cast Video">
              <Cast className="h-4 w-4" />
            </button>
            <button type="button" className="p-1 hover:text-white transition-colors" title="Screen PiP">
              <Tv className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center Slide 12 Presentation Canvas */}
        <div className="my-auto py-4 text-center space-y-2.5 z-10">
          <div className="rounded bg-teal-950/80 px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-teal-400 border border-teal-500/30 inline-block uppercase">
            SLIDE 12: LEMMA 1 ROTATION MECHANICS
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
            Inner Product Relative Invariance
          </h2>

          {/* Mathematical Proof Box */}
          <div className="inline-block rounded-lg bg-[#0b1c30]/90 px-6 py-2.5 border border-slate-700 font-mono text-xs sm:text-sm text-slate-200 shadow-inner">
            (R_&theta;,m q, R_&theta;,n k) = q<sup>T</sup> (R_&theta;,m)<sup>T</sup> R_&theta;,n k = q<sup>T</sup> R_&theta;,(n-m) k
          </div>

          <p className="text-[11px] text-slate-400">
            Prof. V. Ramanathan • Stanford Algorithmic Series
          </p>
        </div>

        {/* Bottom Control Bar */}
        <div className="space-y-2 pt-2 z-10">
          {/* Timeline with Slide 12 Synced Handle */}
          <div className="relative flex items-center">
            <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden cursor-pointer">
              <div className="h-full w-[47%] rounded-full bg-[#2563eb]" />
            </div>
            <div className="absolute left-[47%] -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#00a896] shadow-md ring-2 ring-white cursor-pointer" />
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-3">
              <button type="button" className="p-1 hover:text-white transition-colors">
                <Pause className="h-4 w-4 fill-white text-white" />
              </button>
              <button type="button" className="p-1 hover:text-white transition-colors" title="Rewind 10s">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="p-1 hover:text-white transition-colors" title="Forward 10s">
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px]">14:15 / 30:24</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded bg-[#004d44] px-2.5 py-1 text-[11px] font-bold text-[#86f2e4] border border-teal-500/30 shadow-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Slide 12 Synced</span>
              </button>
              <button type="button" className="p-1 text-slate-400 hover:text-white transition-colors">
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lesson Unit Header & CTAs */}
      <div className="rounded-[15px] border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded bg-[#eff4ff] px-2 py-0.5 font-mono font-bold text-[#2563eb] border border-[#dce9ff]">
                UNIT 3.4
              </span>
              <span className="text-[#737686]">Estimated: 45 Mins</span>
              <span className="inline-flex items-center gap-1 text-[#006a61] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00a896]" />
                Verified Algorithmic Corpus
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#0b1c30]">
              Rotary Positional Embeddings: Theoretical Proofs &amp; Vector Dynamics
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-[#737686]" />
              <span>Notebook .ipynb</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] transition-all"
            >
              <span>Mark Lesson Complete</span>
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-6 border-b border-[#e2e8f0] pt-2 text-xs font-semibold text-[#434655]">
          <button
            type="button"
            onClick={() => setActiveTab("transcripts")}
            className={`pb-2.5 transition-colors ${
              activeTab === "transcripts"
                ? "border-b-2 border-[#2563eb] text-[#2563eb]"
                : "hover:text-[#0b1c30]"
            }`}
          >
            Lecture Transcripts &amp; Proofs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tensor")}
            className={`pb-2.5 transition-colors ${
              activeTab === "tensor"
                ? "border-b-2 border-[#2563eb] text-[#2563eb]"
                : "hover:text-[#0b1c30]"
            }`}
          >
            Interactive Tensor Visualizer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appendix")}
            className={`pb-2.5 transition-colors ${
              activeTab === "appendix"
                ? "border-b-2 border-[#2563eb] text-[#2563eb]"
                : "hover:text-[#0b1c30]"
            }`}
          >
            Mathematical Appendix (Lemma 1-4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qa")}
            className={`pb-2.5 transition-colors ${
              activeTab === "qa"
                ? "border-b-2 border-[#2563eb] text-[#2563eb]"
                : "hover:text-[#0b1c30]"
            }`}
          >
            Discussion &amp; Peer Q&amp;A (42)
          </button>
        </div>

        {/* Proof Content Description */}
        <div className="text-xs text-[#434655] leading-relaxed space-y-3 pt-1">
          <p>
            Unlike traditional sinusoidal or learned absolute position embeddings which simply sum the positional vector with token embeddings <code className="rounded bg-[#eff4ff] px-1.5 py-0.5 font-mono text-[11px] text-[#2563eb]">x_m + p_m</code>, Rotary Positional Embedding (RoPE) leverages a multiplicative complex rotation to seamlessly encode relative distances between query and key vectors.
          </p>
          <p>
            By designing the inner product satisfying <code className="rounded bg-[#eff4ff] px-1.5 py-0.5 font-mono text-[11px] text-[#2563eb]">(f_q(x_m, m), f_k(x_n, n)) = g(x_m, x_n, m - n)</code>, self-attention naturally decays over relative sequence distance without parameter inflation.
          </p>
        </div>
      </div>
    </div>
  );
}

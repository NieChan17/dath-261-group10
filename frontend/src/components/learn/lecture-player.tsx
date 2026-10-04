"use client";

import * as React from "react";
import { Pause, Play, Maximize, Volume2, Sparkles } from "lucide-react";

export function LecturePlayer() {
  const [isPlaying, setIsPlaying] = React.useState(true);

  return (
    <div
      data-component="LecturePlayer"
      className="lecture-player__container_01 relative flex flex-col justify-between overflow-hidden rounded-[15px] border border-slate-800 bg-[#071322] p-5 sm:p-6 text-white shadow-md select-none min-h-[380px]"
    >
      {/* Background Blueprint Grid Lines */}
      <div className="lecture-player__grid-bg_01 pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Bar Badges & Instructor */}
      <div className="lecture-player__top_01 relative z-10 flex items-center justify-between">
        {/* Quality & Live Badges */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-slate-300 border border-slate-700">
            HD 1080p
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004d44] px-2.5 py-0.5 text-[10px] font-bold text-[#86f2e4] border border-teal-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00a896] animate-pulse" />
            Live Math
          </span>
        </div>

        {/* Instructor Pill */}
        <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-2.5 py-1 border border-slate-700/80 backdrop-blur-xs">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Dr. Elena Rostova"
            className="h-5 w-5 rounded-full object-cover ring-1 ring-teal-400"
          />
          <span className="text-xs font-semibold text-slate-200">
            Dr. Elena Rostova
          </span>
        </div>
      </div>

      {/* Center Math Lecture Canvas */}
      <div className="lecture-player__center_01 relative z-10 my-auto py-6 text-center space-y-3">
        <div className="inline-block rounded-full bg-[#2563eb]/20 px-3 py-1 border border-[#2563eb]/40 text-[11px] font-mono font-semibold text-blue-300">
          Theorem 4.2: Orthogonal Rotation
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Rotary Position Embedding (RoPE)
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Preserving relative token distance through paired 2D subspace rotation.
        </p>

        {/* LaTeX Math Formula Box */}
        <div className="mt-4 inline-block rounded-lg bg-[#0b1c30]/90 px-6 py-3 border border-teal-500/30 shadow-inner font-mono text-sm sm:text-base text-teal-300">
          <span className="text-pink-400">R_&#123;&theta;,m&#125;^d</span> = diag(
          <span className="text-blue-300">R_&#123;&theta;1,m&#125;</span>, ...,{" "}
          <span className="text-teal-400">R_&#123;&theta;d/2,m&#125;</span>)
        </div>
      </div>

      {/* Bottom Video Controls Bar */}
      <div className="lecture-player__controls_01 relative z-10 space-y-2 pt-2">
        {/* Timeline Scrubber */}
        <div className="relative flex items-center">
          <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden cursor-pointer">
            <div className="h-full w-[50%] rounded-full bg-[#2563eb]" />
          </div>
          {/* Scrubber thumb */}
          <div className="absolute left-[50%] -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md ring-2 ring-[#2563eb] cursor-pointer" />
        </div>

        {/* Action Controls & Timers */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
          {/* Play/Pause & Timers */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] text-white hover:bg-blue-600 transition-all active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-white" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
              )}
            </button>
            <span className="font-mono text-[11px]">14:22 / 28:40</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-blue-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
              Ch 3: Formula Proof
            </span>
          </div>

          {/* Player Options (Speed, CC, Fullscreen) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              1.25x
            </button>
            <button
              type="button"
              className="rounded bg-[#006a61] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs"
            >
              CC
            </button>
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

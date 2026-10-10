"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface HeroBannerProps {
  courseId?: string;
  courseTitle?: string;
  moduleSubtitle?: string;
  currentLesson?: number;
  totalLessons?: number;
  progressPercent?: number;
}

export function HeroBanner({
  courseId = "deep-learning-transformers",
  courseTitle = "Deep Learning & Transformer Architectures",
  moduleSubtitle = "Module 3: Multi-Head Attention Mechanisms & Rotary Embeddings",
  currentLesson = 4,
  totalLessons = 12,
  progressPercent = 68,
}: HeroBannerProps) {
  return (
    <div
      data-component="HeroBanner"
      className="hero-banner__container_01 relative w-full overflow-hidden rounded-[15px] bg-[#1d58db] bg-gradient-to-r from-[#1751d0] via-[#215ee5] to-[#2563eb] p-6 sm:p-8 text-white shadow-md"
    >
      {/* Background Decorative Ambient */}
      <div className="hero-banner__glow_01 pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="hero-banner__content_01 relative z-10 flex flex-col justify-between gap-6">
        {/* Top Header Row */}
        <div className="hero-banner__top_01 flex flex-wrap items-center justify-between gap-4">
          {/* Status Pills */}
          <div className="hero-banner__status-group_01 flex items-center gap-3">
            <span className="hero-banner__badge_01 inline-flex items-center gap-1.5 rounded-full bg-[#86f2e4] px-3 py-1 text-xs font-bold text-[#004f47]">
              <span className="h-2 w-2 rounded-full bg-[#00a896]" />
              In Progress
            </span>
            <span className="hero-banner__lesson-counter_01 text-xs font-medium text-blue-100">
              Lesson {currentLesson} of {totalLessons} ({progressPercent}%)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="hero-banner__actions_01 flex items-center gap-3">
            <Link href="/my-learning">
              <button
                type="button"
                className="hero-banner__resume-btn_01 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#1d58db] shadow-sm hover:bg-blue-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Resume Lesson</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <button
              type="button"
              className="hero-banner__notes-btn_01 inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-all"
            >
              <Bookmark className="h-4 w-4" />
              <span>Notes</span>
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="hero-banner__body_01 space-y-1.5 max-w-3xl">
          <h2 className="hero-banner__title_01 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {courseTitle}
          </h2>
          <p className="hero-banner__subtitle_01 text-sm sm:text-base font-medium text-blue-100">
            {moduleSubtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hero-banner__progress-wrapper_01 pt-2">
          <div className="hero-banner__progress-track_01 h-1.5 w-full max-w-md rounded-full bg-white/25 overflow-hidden">
            <div
              className="hero-banner__progress-bar_01 h-full rounded-full bg-[#86f2e4] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

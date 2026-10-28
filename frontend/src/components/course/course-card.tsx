"use client";

import * as React from "react";
import Link from "next/link";
import { Star, ArrowRight, PlayCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export interface CourseCardData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  lessonsCount: number;
  rating: number;
  category: string;
  isEnrolled?: boolean;
  thumbnailSvgType?: "rag" | "distributed" | "agents" | "k8s" | "vector" | "rust";
}

interface CourseCardProps {
  course: CourseCardData;
}

export function CourseCard({ course }: CourseCardProps) {
  // Render technical architectural diagram thumbnail based on course type
  const renderThumbnail = () => {
    switch (course.thumbnailSvgType) {
      case "rag":
        return (
          <div className="course-card__thumb-canvas_01 relative h-40 w-full overflow-hidden rounded-lg bg-[#0b1c30] p-3 flex flex-col justify-between border border-slate-800">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span className="text-teal-400">RAG Pipeline</span>
              <span>Vector Space</span>
            </div>
            <div className="flex items-center justify-around my-auto">
              <div className="h-10 w-12 rounded border border-blue-500/40 bg-blue-900/30 flex items-center justify-center text-[9px] text-blue-300 font-mono text-center">
                Query<br/>Embed
              </div>
              <div className="h-0.5 w-6 bg-gradient-to-r from-blue-500 to-teal-400" />
              <div className="h-12 w-16 rounded border border-teal-400/50 bg-teal-900/30 flex items-center justify-center text-[9px] text-teal-300 font-mono text-center shadow-lg shadow-teal-500/10">
                HNSW<br/>Search
              </div>
              <div className="h-0.5 w-6 bg-gradient-to-r from-teal-400 to-blue-500" />
              <div className="h-10 w-12 rounded border border-blue-500/40 bg-blue-900/30 flex items-center justify-center text-[9px] text-blue-300 font-mono text-center">
                LLM<br/>Context
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>cos_sim &gt; 0.86</span>
              <span className="text-teal-400">Grounded Citation</span>
            </div>
          </div>
        );
      case "distributed":
        return (
          <div className="course-card__thumb-canvas_02 relative h-40 w-full overflow-hidden rounded-lg bg-[#f0f5ff] p-3 flex flex-col justify-between border border-[#dce9ff]">
            <div className="flex justify-between items-center text-[10px] text-[#434655] font-mono">
              <span className="text-[#2563eb] font-semibold">Raft Consensus</span>
              <span>Event Log</span>
            </div>
            <div className="grid grid-cols-3 gap-2 my-auto">
              <div className="rounded border border-[#2563eb]/40 bg-white p-1 text-center text-[8px] text-[#0b1c30] shadow-sm">
                Node A (Leader)
              </div>
              <div className="rounded border border-slate-300 bg-white p-1 text-center text-[8px] text-[#434655] shadow-sm">
                Node B (Follower)
              </div>
              <div className="rounded border border-slate-300 bg-white p-1 text-center text-[8px] text-[#434655] shadow-sm">
                Node C (Follower)
              </div>
            </div>
            <div className="flex justify-center items-center text-[9px] text-[#2563eb] font-mono">
              <span>Distributed Log Stream ➔ High Throughput</span>
            </div>
          </div>
        );
      case "agents":
        return (
          <div className="course-card__thumb-canvas_03 relative h-40 w-full overflow-hidden rounded-lg bg-[#f8f9ff] p-3 flex flex-col justify-between border border-[#e2e8f0]">
            <div className="flex justify-between items-center text-[10px] text-[#434655] font-mono">
              <span className="text-emerald-700 font-semibold">Multi-Agent Swarm</span>
              <span>Tool Invocation</span>
            </div>
            <div className="flex items-center justify-center gap-3 my-auto">
              <div className="h-10 w-10 rounded-full border border-teal-500 bg-teal-50 flex items-center justify-center text-[8px] text-teal-800 font-bold">
                Planner
              </div>
              <div className="h-0.5 w-4 bg-teal-400" />
              <div className="h-12 w-12 rounded-full border border-blue-500 bg-blue-50 flex items-center justify-center text-[8px] text-blue-800 font-bold shadow-sm">
                Coordinator
              </div>
              <div className="h-0.5 w-4 bg-teal-400" />
              <div className="h-10 w-10 rounded-full border border-teal-500 bg-teal-50 flex items-center justify-center text-[8px] text-teal-800 font-bold">
                Executor
              </div>
            </div>
            <div className="text-center text-[9px] text-[#434655] font-mono">
              Autonomous Shared Memory & State Graph
            </div>
          </div>
        );
      case "k8s":
        return (
          <div className="course-card__thumb-canvas_04 relative h-40 w-full overflow-hidden rounded-lg bg-[#f0f5ff] p-3 flex flex-col justify-between border border-[#dce9ff]">
            <div className="flex justify-between items-center text-[10px] text-[#434655] font-mono">
              <span className="text-[#2563eb] font-semibold">eBPF Kernel Mesh</span>
              <span>Cilium CNI</span>
            </div>
            <div className="space-y-1.5 my-auto">
              <div className="h-5 rounded bg-white border border-[#2563eb]/30 flex items-center px-2 text-[8px] text-[#2563eb] justify-between">
                <span>Pod A (Namespace prod)</span>
                <span className="text-emerald-600 font-bold">0ms drop</span>
              </div>
              <div className="h-5 rounded bg-white border border-slate-300 flex items-center px-2 text-[8px] text-slate-600 justify-between">
                <span>Kernel eBPF Filter Program</span>
                <span className="text-blue-600">Active</span>
              </div>
            </div>
            <div className="text-center text-[9px] text-[#434655] font-mono">
              Zero-overhead Network Telemetry
            </div>
          </div>
        );
      case "vector":
        return (
          <div className="course-card__thumb-canvas_05 relative h-40 w-full overflow-hidden rounded-lg bg-[#0b1c30] p-3 flex flex-col justify-between border border-slate-800">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span className="text-teal-400">High-D Vector Space</span>
              <span>UMAP Projection</span>
            </div>
            <div className="relative flex items-center justify-center my-auto">
              <div className="h-16 w-16 rounded-full border border-teal-500/40 animate-pulse flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-teal-400/20 border border-teal-300 flex items-center justify-center text-[8px] text-teal-300 font-mono">
                  1536d
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>Sparse-Dense Hybrid</span>
              <span className="text-teal-400">Cosine Metric</span>
            </div>
          </div>
        );
      case "rust":
      default:
        return (
          <div className="course-card__thumb-canvas_06 relative h-40 w-full overflow-hidden rounded-lg bg-[#f8f9ff] p-3 flex flex-col justify-between border border-[#e2e8f0]">
            <div className="flex justify-between items-center text-[10px] text-[#434655] font-mono">
              <span className="text-amber-800 font-semibold">Rust Memory Safety</span>
              <span>Borrow Checker</span>
            </div>
            <div className="flex items-center justify-around my-auto">
              <div className="p-1.5 rounded border border-amber-600/40 bg-amber-50 text-[8px] text-amber-900 font-mono">
                &mut T [Exclusive]
              </div>
              <span className="text-xs text-slate-400">➔</span>
              <div className="p-1.5 rounded border border-blue-600/40 bg-blue-50 text-[8px] text-blue-900 font-mono">
                Zero-Cost Async
              </div>
            </div>
            <div className="text-center text-[9px] text-[#434655] font-mono">
              Lock-Free Concurrency & SIMD Intrinsics
            </div>
          </div>
        );
    }
  };

  return (
    <div
      data-component="CourseCard"
      className="course-card__container_01 flex flex-col justify-between rounded-[15px] border border-[#e2e8f0] bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#cbdbf5] transition-all"
    >
      <div className="space-y-3">
        {/* Schematic Diagram Thumbnail */}
        {renderThumbnail()}

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="course-card__title_01 font-display text-base font-bold text-[#0b1c30] line-clamp-1 hover:text-[#2563eb] transition-colors">
            <Link href={ROUTES.LEARN(course.id)}>{course.title}</Link>
          </h3>
          <p className="course-card__desc_01 text-xs text-[#434655] line-clamp-1">
            {course.description}
          </p>
        </div>

        {/* Instructor & Lesson Stats */}
        <div className="course-card__meta_01 flex items-center justify-between text-xs text-[#737686] pt-1">
          <span className="course-card__instructor_01 font-medium text-[#0b1c30]">
            {course.instructor}
          </span>
          <div className="course-card__stats_01 flex items-center gap-1.5">
            <span>{course.lessonsCount} lessons</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 text-[#0b1c30] font-semibold">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="course-card__action-wrapper_01 pt-4">
        {course.isEnrolled ? (
          <Link href="/my-learning" className="w-full">
            <button
              type="button"
              className="course-card__resume-btn_01 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors cursor-pointer"
            >
              <span>Resume</span>
              <PlayCircle className="h-3.5 w-3.5" />
            </button>
          </Link>
        ) : (
          <button
            type="button"
            className="course-card__enroll-btn_01 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#eff4ff] py-2.5 text-xs font-bold text-[#2563eb] hover:bg-[#dbeafe] transition-colors cursor-pointer"
          >
            <span>Enroll</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

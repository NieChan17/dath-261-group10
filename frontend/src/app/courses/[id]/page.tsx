"use client";

import * as React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  BookOpen,
  Star,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight,
} from "lucide-react";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const courseId = params.id || "advanced-llm-rag";

  const courseData = {
    id: courseId,
    title: "Advanced LLM Engineering & RAG",
    subtitle: "Architect production-grade retrieval augmented generation systems with grounded citations and vector benchmarks.",
    category: "AI & Machine Learning",
    instructor: "Dr. Elena Rostova",
    instructorRole: "Principal Research Scientist at Stanford AI Lab",
    instructorBio: "Specializing in vector space indexing, state-space models, and verifiable citation systems for generative AI architectures.",
    rating: 4.9,
    reviewsCount: 384,
    studentsCount: 3420,
    durationHours: 14,
    level: "Advanced",
    lastUpdated: "October 2026",
    objectives: [
      "Derive and implement Scaled Dot-Product Attention and Rotary Position Embeddings (RoPE) from first principles.",
      "Construct hybrid sparse-dense retrieval pipelines combining BM25 and HNSW vector indexing.",
      "Design zero-hallucination citation engines with paragraph and lemma-level grounding verification.",
      "Profile and optimize memory footprints of KV cache and FlashAttention kernels in production clusters.",
      "Deploy reproducible RAG microservices orchestrating pgvector with FastEmbed and streaming responses.",
    ],
    chapters: [
      {
        title: "Module 1: Foundations of Attention Mechanisms",
        lessonsCount: 3,
        duration: "1h 15m",
        lessons: [
          { title: "1.1 Self-Attention Mathematical Formulation", duration: "25m" },
          { title: "1.2 Query, Key, and Value Tensor Projections", duration: "20m" },
          { title: "1.3 Multi-Head Stacking & Linear Complexity Bottlenecks", duration: "30m" },
        ],
      },
      {
        title: "Module 2: Positional Encodings & RoPE",
        lessonsCount: 4,
        duration: "2h 10m",
        lessons: [
          { title: "2.1 Absolute vs Relative Position Encodings", duration: "25m" },
          { title: "2.2 Complex Space 2D Rotation Foundations", duration: "35m" },
          { title: "2.3 Rotary Embedding Kernel Implementation in PyTorch", duration: "40m" },
          { title: "2.4 Context Window Extrapolation & NTK-Aware Scaling", duration: "30m" },
        ],
      },
      {
        title: "Module 3: Hybrid Retrieval & Vector Topologies",
        lessonsCount: 5,
        duration: "2h 45m",
        lessons: [
          { title: "3.1 Vector Indexing Tradeoffs: Flat, IVF, and HNSW", duration: "35m" },
          { title: "3.2 Reciprocal Rank Fusion (RRF) for Hybrid BM25 + Vector", duration: "30m" },
          { title: "3.3 Chunking Strategies & Boundary-Aware Splitting", duration: "25m" },
          { title: "3.4 Semantic Deduplication & Re-ranking Models", duration: "35m" },
          { title: "3.5 Telemetry & Query Audit Logging", duration: "40m" },
        ],
      },
    ],
  };

  return (
    <div
      data-component="CourseDetailPage"
      className="course-detail__container_01 min-h-[calc(100vh-8rem)] bg-[#f8f9ff] pb-16 select-none"
    >
      {/* 1. Top Breadcrumbs Header */}
      <div className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-[#737686]">
          <Link href={ROUTES.HOME} className="hover:text-[#0b1c30] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.COURSES} className="hover:text-[#0b1c30] transition-colors">
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-[#0b1c30] truncate">{courseData.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (~65%): Main Content */}
          <div className="course-detail__left-col_01 lg:col-span-8 space-y-8">
            {/* Header Hero */}
            <div className="space-y-4 rounded-[15px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#2563eb]">
                  {courseData.category}
                </span>
                <span className="rounded-full bg-[#f0fdfa] px-3 py-1 text-xs font-bold text-[#006a61]">
                  {courseData.level}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1c30] tracking-tight leading-tight">
                {courseData.title}
              </h1>
              <p className="text-sm sm:text-base text-[#434655] leading-relaxed">
                {courseData.subtitle}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#737686] pt-2 border-t border-[#e2e8f0]">
                <div className="flex items-center gap-1.5 text-[#0b1c30] font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{courseData.rating}</span>
                  <span className="text-[#737686] font-normal">({courseData.reviewsCount} reviews)</span>
                </div>
                <span>•</span>
                <span>{courseData.studentsCount.toLocaleString()} learners enrolled</span>
                <span>•</span>
                <span>Created by <strong className="text-[#0b1c30]">{courseData.instructor}</strong></span>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="rounded-[15px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#2563eb]" />
                <span>What you will master</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {courseData.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#434655] leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-[#006a61] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus Chapters */}
            <div className="rounded-[15px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#0b1c30] flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#2563eb]" />
                  <span>Course Syllabus</span>
                </h2>
                <span className="text-xs text-[#737686] font-mono">
                  {courseData.chapters.length} modules • 12 lessons
                </span>
              </div>

              <div className="space-y-4">
                {courseData.chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#0b1c30]">
                        {chapter.title}
                      </h3>
                      <span className="text-[11px] text-[#737686] font-mono">
                        {chapter.duration}
                      </span>
                    </div>
                    <div className="space-y-2 pl-2">
                      {chapter.lessons.map((lesson, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-center justify-between py-1 text-xs text-[#434655] border-b border-[#e2e8f0]/60 last:border-none"
                        >
                          <div className="flex items-center gap-2">
                            <PlayCircle className="h-3.5 w-3.5 text-[#2563eb]" />
                            <span>{lesson.title}</span>
                          </div>
                          <span className="text-[11px] text-[#737686]">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Bio Card */}
            <div className="rounded-[15px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0b1c30]">Your Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-[#eff4ff] ring-2 ring-[#2563eb]/20 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt={courseData.instructor}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <h3 className="font-bold text-sm text-[#0b1c30]">{courseData.instructor}</h3>
                  <p className="text-[#2563eb] font-semibold">{courseData.instructorRole}</p>
                  <p className="text-[#434655] leading-relaxed pt-1">{courseData.instructorBio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (~35%): Sticky Action Card */}
          <div className="course-detail__right-col_01 lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-[15px] border border-[#e2e8f0] bg-white p-6 shadow-sm space-y-6">
              {/* Thumbnail Diagram */}
              <div className="h-40 rounded-xl bg-[#0b1c30] p-4 flex flex-col justify-between border border-slate-800 text-white">
                <div className="flex justify-between text-[10px] text-teal-400 font-mono">
                  <span>RAG Workstation</span>
                  <span>RoPE Kernel</span>
                </div>
                <div className="my-auto text-center space-y-1">
                  <span className="inline-block px-3 py-1 rounded bg-[#2563eb]/20 border border-[#2563eb]/50 text-xs font-mono text-blue-300">
                    q^T R_theta k
                  </span>
                  <p className="text-[10px] text-slate-400">Verifiable Academic Lineage</p>
                </div>
                <div className="text-right text-[10px] text-teal-300 font-mono">
                  Slide 12 Lemma 1 Synced
                </div>
              </div>

              {/* Price & Primary CTA */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-[#0b1c30] font-display">Free</span>
                  <span className="text-xs text-[#006a61] font-bold bg-[#f0fdfa] px-2 py-0.5 rounded">
                    Institutional Sponsored
                  </span>
                </div>

                <Link href="/my-learning" className="block w-full">
                  <button
                    type="button"
                    className="w-full h-11 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <span>Go to Learning Workstation</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              {/* What is included */}
              <div className="space-y-3 border-t border-[#e2e8f0] pt-4 text-xs text-[#434655]">
                <h4 className="font-bold text-[#0b1c30]">This track includes:</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#2563eb]" />
                    <span>14 hours of on-demand lectures &amp; slides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#006a61]" />
                    <span>Grounded AI Tutor with citation telemetry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#2563eb]" />
                    <span>Interactive QuickChecks &amp; code assignments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#006a61]" />
                    <span>Certificate of Academic Mastery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

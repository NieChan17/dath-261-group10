"use client";

import * as React from "react";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { CourseCard, type CourseCardData } from "@/components/course/course-card";
import { ChevronDown, GitFork } from "lucide-react";

const INITIAL_COURSES: CourseCardData[] = [
  {
    id: "advanced-llm-rag",
    title: "Advanced LLM Engineering & RAG",
    description: "End-to-end vector embeddings, retrieval chunking, and grounded synthesis pipelines.",
    instructor: "Dr. Elena Rostova",
    lessonsCount: 18,
    rating: 4.9,
    category: "AI & Machine Learning",
    isEnrolled: true,
    thumbnailSvgType: "rag",
  },
  {
    id: "distributed-systems",
    title: "Distributed Systems & Event Streams",
    description: "Build fault-tolerant Raft consensus and high-throughput transactional event brokers.",
    instructor: "Marcus Vance",
    lessonsCount: 24,
    rating: 4.8,
    category: "Systems & Architecture",
    isEnrolled: false,
    thumbnailSvgType: "distributed",
  },
  {
    id: "autonomous-multi-agent",
    title: "Autonomous Multi-Agent Systems",
    description: "Coordinating agent teams, memory, tool invocation, and hierarchical state graphs.",
    instructor: "Sarah Chen",
    lessonsCount: 12,
    rating: 4.9,
    category: "AI & Machine Learning",
    isEnrolled: false,
    thumbnailSvgType: "agents",
  },
  {
    id: "production-k8s-ebpf",
    title: "Production Kubernetes & eBPF",
    description: "Kernel observability, Cilium networking, and cloud multi-cluster mesh governance.",
    instructor: "Alex Rivera",
    lessonsCount: 16,
    rating: 4.7,
    category: "Cloud & DevOps",
    isEnrolled: false,
    thumbnailSvgType: "k8s",
  },
  {
    id: "vector-databases",
    title: "Vector Databases & Similarity Search",
    description: "HNSW indexing, sparse-dense hybrid retrieval, and hardware-accelerated quantizations.",
    instructor: "David K.",
    lessonsCount: 10,
    rating: 4.8,
    category: "AI & Machine Learning",
    isEnrolled: false,
    thumbnailSvgType: "vector",
  },
  {
    id: "modern-rust-systems",
    title: "Modern Rust for Systems Computing",
    description: "Ownership, lock-free concurrency, and WebAssembly runtime integration.",
    instructor: "Linus K.",
    lessonsCount: 28,
    rating: 4.9,
    category: "Systems & Architecture",
    isEnrolled: false,
    thumbnailSvgType: "rust",
  },
];

const CATEGORIES = [
  "All",
  "AI & Machine Learning",
  "Systems & Architecture",
  "Cloud & DevOps",
];

export default function LearnerDashboardPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredCourses = React.useMemo(() => {
    if (selectedCategory === "All") return INITIAL_COURSES;
    return INITIAL_COURSES.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div
      data-component="LearnerDashboard"
      className="learner-dashboard__container_01 min-h-screen bg-[#f8f9ff] pb-16"
    >
      <div className="learner-dashboard__content_01 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* 1. Hero Active In-Progress Banner */}
        <HeroBanner
          courseId="deep-learning-transformers"
          courseTitle="Deep Learning & Transformer Architectures"
          moduleSubtitle="Module 3: Multi-Head Attention Mechanisms & Rotary Embeddings"
          currentLesson={4}
          totalLessons={12}
          progressPercent={68}
        />

        {/* 2. Filter & Sort Bar */}
        <div className="learner-dashboard__filter-bar_01 flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Category Filter Pills */}
          <div className="learner-dashboard__category-pills_01 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#004ac6] text-white shadow-sm"
                      : "bg-white text-[#434655] border border-[#e2e8f0] hover:border-[#cbdbf5] hover:text-[#0b1c30]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="learner-dashboard__sort-wrapper_01">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0b1c30] shadow-2xs hover:bg-[#f8f9ff] transition-all"
            >
              <span>Sort: Most Popular</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#737686]" />
            </button>
          </div>
        </div>

        {/* 3. Section Title & Syllabus Tree Link */}
        <div className="learner-dashboard__section-header_01 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e2e8f0]/60 pb-3">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl font-bold text-[#0b1c30] tracking-tight">
              Specialized Engineering Curricula
            </h2>
            <span className="text-xs text-[#737686]">
              {filteredCourses.length} matching verified tracks
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:text-[#1d4ed8] hover:underline transition-all"
          >
            <span>View Syllabus Tree</span>
            <GitFork className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 4. Course Cards Grid (3 Columns) */}
        <div className="learner-dashboard__course-grid_01 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* 5. Bottom Ground Truth Verification Banner */}
        <div className="pt-4">
          <VerificationBanner />
        </div>
      </div>
    </div>
  );
}

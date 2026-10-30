"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { CourseCard, type CourseCardData } from "@/components/course/course-card";
import { ChevronDown, GitFork, Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";

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
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);

  // Auto-route on app entry: If no role selected, redirect to /portal
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("edupulse_role");
      if (!savedRole) {
        router.replace(ROUTES.PORTAL);
        return;
      }
      if (savedRole === "instructor") {
        router.replace(ROUTES.INSTRUCTOR.OVERVIEW);
        return;
      }
      if (savedRole === "admin") {
        router.replace(ROUTES.ADMIN.OVERVIEW);
        return;
      }
      setIsAuthChecking(false);
    }
  }, [router]);

  const filteredCourses = React.useMemo(() => {
    if (selectedCategory === "All") return INITIAL_COURSES;
    return INITIAL_COURSES.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  if (isAuthChecking) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#f8f9ff]">
        <div className="flex items-center gap-2 text-xs text-[#737686]">
          <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" />
          <span>Navigating to EduPulse portal...</span>
        </div>
      </div>
    );
  }

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
          {/* Categories Pill List */}
          <div className="learner-dashboard__categories_01 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`learner-dashboard__category-btn_01 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#2563eb] text-white shadow-xs font-bold"
                    : "bg-white text-[#434655] border border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#0b1c30]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown Button */}
          <div className="learner-dashboard__sort_01 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737686]">
              Sort By:
            </span>
            <button
              type="button"
              className="learner-dashboard__sort-btn_01 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-xs font-semibold text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors cursor-pointer"
            >
              <span>Most Relevant</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#737686]" />
            </button>
          </div>
        </div>

        {/* 3. Course Card Grid */}
        <div className="learner-dashboard__grid_01 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* 4. Verified Academic Certification Banner */}
        <VerificationBanner />
      </div>
    </div>
  );
}

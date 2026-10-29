"use client";

import * as React from "react";
import { CourseCard, type CourseCardData } from "@/components/course/course-card";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";

const CATALOG_COURSES: (CourseCardData & { level: "Beginner" | "Intermediate" | "Advanced" })[] = [
  {
    id: "advanced-llm-rag",
    title: "Advanced LLM Engineering & RAG",
    description: "End-to-end vector embeddings, retrieval chunking, and grounded synthesis pipelines.",
    instructor: "Dr. Elena Rostova",
    lessonsCount: 18,
    rating: 4.9,
    category: "AI & Machine Learning",
    level: "Advanced",
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
    level: "Intermediate",
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
    level: "Advanced",
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
    level: "Intermediate",
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
    level: "Beginner",
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
    level: "Intermediate",
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

const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedLevel, setSelectedLevel] = React.useState("All Levels");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredCourses = React.useMemo(() => {
    return CATALOG_COURSES.filter((course) => {
      const matchCategory =
        selectedCategory === "All" || course.category === selectedCategory;
      const matchLevel =
        selectedLevel === "All Levels" || course.level === selectedLevel;
      const matchQuery =
        !searchQuery.trim() ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchLevel && matchQuery;
    });
  }, [selectedCategory, selectedLevel, searchQuery]);

  return (
    <div
      data-component="CoursesCatalogPage"
      className="courses-catalog__container_01 min-h-[calc(100vh-8rem)] bg-[#f8f9ff] pb-16"
    >
      <div className="courses-catalog__content_01 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 1. Header Banner */}
        <div className="courses-catalog__header_01 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563eb] uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Academic &amp; Systems Catalog</span>
          </div>
          <h1 className="courses-catalog__title_01 font-display text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Verified Engineering Curricula
          </h1>
          <p className="courses-catalog__desc_01 text-sm text-[#434655] max-w-2xl leading-relaxed">
            Explore rigorous courses across transformers, distributed consensus, eBPF
            networking, and high-performance systems computing.
          </p>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="courses-catalog__filter-bar_01 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-[15px] bg-white border border-[#e2e8f0] shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737686] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, topic, instructor..."
              className="w-full h-10.5 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] pl-10 pr-4 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
            />
          </div>

          {/* Level Dropdown & Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#737686]" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="h-10.5 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] px-3 text-xs font-semibold text-[#0b1c30] focus:border-[#2563eb] focus:outline-none cursor-pointer"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[#737686] whitespace-nowrap pl-2 border-l border-[#e2e8f0]">
              Showing <strong className="text-[#0b1c30]">{filteredCourses.length}</strong> courses
            </span>
          </div>
        </div>

        {/* 3. Category Pills */}
        <div className="courses-catalog__categories_01 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`courses-catalog__pill_01 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-xs"
                    : "border border-[#e2e8f0] bg-white text-[#434655] hover:border-[#cbdbf5] hover:text-[#0b1c30]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 4. Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="courses-catalog__grid_01 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="courses-catalog__empty_01 rounded-[15px] border border-dashed border-[#cbdbf5] bg-white p-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#2563eb]">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#0b1c30]">
              No matching courses found
            </h3>
            <p className="text-xs text-[#737686] max-w-sm mx-auto">
              Try adjusting your keyword search or changing the selected category and level filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedLevel("All Levels");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

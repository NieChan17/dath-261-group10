"use client";

import * as React from "react";
import Link from "next/link";
import {
  Code2,
  CheckCircle2,
  Clock,
  HardDrive,
  ArrowRight,
  Sparkles,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignmentItem {
  id: string;
  number: string;
  title: string;
  description: string;
  category: "GPU Systems" | "Transformers & RAG" | "Distributed Systems" | "Algorithms";
  difficulty: "Easy" | "Medium" | "Hard";
  language: string;
  timeLimit: string;
  memoryLimit: string;
  status: "Solved" | "In Progress" | "Not Started";
  passRate: string;
}

const ASSIGNMENTS_DATA: AssignmentItem[] = [
  {
    id: "asg-1",
    number: "Problem 4.2",
    title: "FlashAttention Tiling Kernel",
    description: "Implement high-throughput fused forward attention tiling across SRAM memory to bypass O(N^2) HBM bottlenecks.",
    category: "GPU Systems",
    difficulty: "Hard",
    language: "Python (Triton 2.1)",
    timeLimit: "2.0s",
    memoryLimit: "128 MB",
    status: "In Progress",
    passRate: "75% (3/4)",
  },
  {
    id: "asg-2",
    number: "Problem 3.4",
    title: "Rotary Positional Embedding (RoPE) Kernel",
    description: "Pair adjacent dimension elements and vectorize orthogonal 2D rotation transformations for relative positional decay.",
    category: "Transformers & RAG",
    difficulty: "Medium",
    language: "PyTorch & CUDA",
    timeLimit: "1.5s",
    memoryLimit: "64 MB",
    status: "Solved",
    passRate: "100% (5/5)",
  },
  {
    id: "asg-3",
    number: "Problem 2.1",
    title: "Raft Distributed Log Consensus Engine",
    description: "Construct leader election timers, log replication RPCs, and state machine commit loops under network partitions.",
    category: "Distributed Systems",
    difficulty: "Hard",
    language: "Rust / C++17",
    timeLimit: "3.0s",
    memoryLimit: "256 MB",
    status: "Not Started",
    passRate: "0% (0/6)",
  },
  {
    id: "asg-4",
    number: "Problem 1.3",
    title: "Balanced Array Partition & Subset Sum",
    description: "Dynamic programming and bitmask state reductions to determine exact equal-sum subsets under strict constraints.",
    category: "Algorithms",
    difficulty: "Easy",
    language: "Python 3.11",
    timeLimit: "1.0s",
    memoryLimit: "32 MB",
    status: "Solved",
    passRate: "100% (4/4)",
  },
];

export default function AssignmentsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredAssignments = React.useMemo(() => {
    return ASSIGNMENTS_DATA.filter((item) => {
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div
      data-component="AssignmentsPage"
      className="assignments__container_01 min-h-[calc(100vh-4rem)] bg-[#f8f9ff] pb-16"
    >
      <div className="assignments__content_01 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="assignments__header_01 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563eb] uppercase tracking-wider">
              <Code2 className="h-4 w-4" />
              <span>Interactive Code Sandbox &amp; Labs</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              Assignments &amp; Algorithmic Challenges
            </h1>
            <p className="text-xs text-[#737686] max-w-2xl leading-relaxed">
              Real-time interactive code sandboxes with automated test suite telemetry, GPU kernel benchmarking, and instant grading feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#2563eb] border border-[#dce9ff]">
              {ASSIGNMENTS_DATA.length} Coding Labs
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-[15px] bg-white border border-[#e2e8f0] shadow-2xs">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737686] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem title, kernel type, or concepts..."
              className="w-full h-9 pl-9.5 pr-4 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] text-xs text-[#0b1c30] placeholder:text-[#737686] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "GPU Systems", "Transformers & RAG", "Distributed Systems", "Algorithms"].map(
              (cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#2563eb] text-white shadow-2xs"
                        : "bg-white text-[#434655] hover:bg-[#eff4ff] border border-[#e2e8f0]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Assignments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((asg) => {
            const isHard = asg.difficulty === "Hard";
            const isMedium = asg.difficulty === "Medium";
            const isSolved = asg.status === "Solved";
            const isInProgress = asg.status === "In Progress";

            return (
              <div
                key={asg.id}
                className="group relative flex flex-col justify-between rounded-[16px] border border-[#e2e8f0] bg-white p-6 shadow-xs hover:shadow-md hover:border-[#2563eb]/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563eb]">
                        {asg.number}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isHard
                            ? "bg-amber-100 text-amber-800"
                            : isMedium
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {asg.difficulty}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {asg.category}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isSolved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isInProgress
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isSolved && <CheckCircle2 className="h-3 w-3" />}
                      <span>{asg.status}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-bold text-[#0b1c30] group-hover:text-[#2563eb] transition-colors">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-[#737686] leading-relaxed line-clamp-2">
                      {asg.description}
                    </p>
                  </div>

                  {/* Specs & Constraints */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#434655] pt-1">
                    <span className="font-mono text-[#006a61] bg-[#eff4ff] px-2 py-0.5 rounded">
                      {asg.language}
                    </span>
                    <span className="flex items-center gap-1 text-[#737686]">
                      <Clock className="h-3 w-3" />
                      <span>{asg.timeLimit}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#737686]">
                      <HardDrive className="h-3 w-3" />
                      <span>{asg.memoryLimit}</span>
                    </span>
                    <span className="ml-auto font-semibold text-[#0b1c30]">
                      Score: {asg.passRate}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-5 mt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                  <span className="text-[11px] text-[#737686]">
                    Automated Test Suite (4 Testcases)
                  </span>
                  <Link href={`/assignments/${asg.id}`}>
                    <Button
                      size="sm"
                      className="h-8 px-4 text-xs font-bold rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-1.5 shadow-2xs group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Open Sandbox</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

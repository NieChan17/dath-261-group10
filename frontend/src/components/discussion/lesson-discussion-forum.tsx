"use client";

import * as React from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Flag,
  Send,
  Paperclip,
  Clock,
  Code2,
  Bold,
  Italic,
  Link2,
  List,
  Quote,
  MoreHorizontal,
  ArrowUp,
  Reply,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportModal } from "@/components/discussion/report-modal";

interface DiscussionReply {
  id: string;
  author: string;
  role: "Student" | "Lead Instructor" | "Teaching Assistant" | "Author";
  avatar: string;
  timestamp: string;
  content: string;
  formulaBox?: {
    title: string;
    body: string;
    caption: string;
  };
  upvotes: number;
  hasUpvoted?: boolean;
  citationBadge?: string;
  isResolvedBadge?: boolean;
}

interface DiscussionThread {
  id: string;
  author: string;
  role: "Student" | "Lead Instructor" | "Teaching Assistant" | "Author";
  avatar: string;
  timestamp: string;
  contextBadge: string;
  statusBadge?: string;
  title: string;
  content: string;
  codeSnippet?: {
    filename: string;
    tag: string;
    code: string;
  };
  upvotes: number;
  hasUpvoted?: boolean;
  replies: DiscussionReply[];
}

const INITIAL_THREADS: DiscussionThread[] = [
  {
    id: "thread-1",
    author: "Marcus Vance",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    timestamp: "3 hours ago",
    contextBadge: "Slide 12 • 14:22 • Rotary Invariance Proof",
    title: "Does RoPE scale linearly when extending context length to 32k tokens without frequency interpolation?",
    content:
      "At 14:22, Dr. Rostova demonstrates that the relative angle shift satisfies (R_{θ,m} q, R_{θ,n} k) = g(q, k, m - n). However, when naively extending past the pre-trained context window (e.g. from 4k to 32k tokens), the dot product values for high relative positions $(m - n)$ begin to experience catastrophic perplexity degradation.\n\nIs NTK-aware frequency scaling mathematically required to preserve the rotational resolution of the high-frequency dimensions, or is simple linear position interpolation sufficient for zero-shot attention transfer?",
    upvotes: 19,
    replies: [
      {
        id: "rep-1-1",
        author: "Dr. Elena Rostova",
        role: "Lead Instructor",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        timestamp: "2 hours ago",
        citationBadge: "Grounded in Su et al. (2021)",
        content:
          "Excellent question, Marcus. Linear position interpolation (m' = m / s) stretches the wavelengths equally across all channels. While this prevents out-of-distribution positional distances, it disastrously degrades the high-frequency components that encode close-range syntactic tokens.",
        formulaBox: {
          title: "NTK-Aware RoPE Scaling Relation:",
          body: "θ'_d = b^(-2d/D) * α^((d - D/2) / (D/2)) where α > 1",
          caption: "High frequencies remain intact; only low frequency base angles undergo dilation.",
        },
        upvotes: 34,
      },
      {
        id: "rep-1-2",
        author: "David K.",
        role: "Student",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        timestamp: "45 mins ago",
        content:
          "Thank you Dr. Rostova! That explains why NTK-aware scaling is required for extrapolation. When I tried pure linear interpolation on Llama-7B, the needle-in-a-haystack retrieval dropped to 14% past 8k tokens.",
        upvotes: 5,
      },
      {
        id: "rep-1-3",
        author: "Marcus Vance",
        role: "Author",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        timestamp: "20 mins ago",
        isResolvedBadge: true,
        content:
          "Makes total sense now! High frequencies preserve local bigrams, low frequencies establish global positioning. Marking this thread as resolved.",
        upvotes: 3,
      },
    ],
  },
  {
    id: "thread-2",
    author: "Sarah Chen",
    role: "Teaching Assistant",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    timestamp: "1 day ago",
    contextBadge: "Kernel Repo • Line 88 • PyTorch Triton Implementation",
    title: "PyTorch implementation discrepancy in chunked rotary embedding kernel",
    content:
      "When vectorizing the 2D planar rotation matrix pairs, remember that Hugging Face transformers implementations pair adjacent elements (x[0], x[1]), whereas the original RoFormer paper groups elements across split halves (x[0], x[d/2]):",
    codeSnippet: {
      filename: "apply_rotary_pos_emb.py",
      tag: "PyTorch 2.3+ Triton",
      code: `def rotate_half(x):
    # Discrepancy guard: Split dimension in half vs stride 2
    x1 = x[..., : x.shape[-1] // 2]
    x2 = x[..., x.shape[-1] // 2 :]
    return torch.cat((-x2, x1), dim=-1)

def apply_rope(q, k, cos, sin):
    q_embed = (q * cos) + (rotate_half(q) * sin)
    k_embed = (k * cos) + (rotate_half(k) * sin)
    return q_embed, k_embed`,
    },
    upvotes: 14,
    replies: [
      {
        id: "rep-2-1",
        author: "Alex Rivera",
        role: "Student",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        timestamp: "18 hours ago",
        content:
          "This saved me 4 hours of debugging! I was loading HuggingFace weights into a custom Triton kernel with alternating index slices and my attention matrices were completely jumbled.",
        upvotes: 8,
      },
    ],
  },
  {
    id: "thread-3",
    author: "Priya Nair",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    timestamp: "2 days ago",
    contextBadge: "⏱ 22:40 • KV Cache Footprint",
    statusBadge: "Open Discussion",
    title: "Can RoPE transformed K-vectors be stored directly in KV cache or do we re-apply rotation at each decoding step?",
    content:
      "Since RoPE operates directly on each token's absolute position index $m$, can we safely cache the already-rotated $K_m$ tensors in VRAM, or does the relative distance logic require storing raw unrotated activations?",
    upvotes: 7,
    replies: [],
  },
];

export function LessonDiscussionForum() {
  const [threads, setThreads] = React.useState<DiscussionThread[]>(INITIAL_THREADS);
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<"Newest" | "Most Upvoted" | "Instructor Answered" | "My Questions">("Newest");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  // New Question Form state
  const [questionTitle, setQuestionTitle] = React.useState("");
  const [questionContent, setQuestionContent] = React.useState("");
  const [hasPlayheadAnchor, setHasPlayheadAnchor] = React.useState(true);

  // Active reply box state: threadId -> boolean
  const [replyBoxThreadId, setReplyBoxThreadId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");

  // Report Modal state
  const [reportModalData, setReportModalData] = React.useState<{
    isOpen: boolean;
    itemTitle: string;
    authorName: string;
  }>({
    isOpen: false,
    itemTitle: "",
    authorName: "",
  });

  // Handle Thread Upvote
  const handleToggleThreadUpvote = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const hasUpvoted = !t.hasUpvoted;
          return {
            ...t,
            hasUpvoted,
            upvotes: hasUpvoted ? t.upvotes + 1 : t.upvotes - 1,
          };
        }
        return t;
      })
    );
  };

  // Handle Reply Upvote
  const handleToggleReplyUpvote = (threadId: string, replyId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            replies: t.replies.map((r) => {
              if (r.id === replyId) {
                const hasUpvoted = !r.hasUpvoted;
                return {
                  ...r,
                  hasUpvoted,
                  upvotes: hasUpvoted ? r.upvotes + 1 : r.upvotes - 1,
                };
              }
              return r;
            }),
          };
        }
        return t;
      })
    );
  };

  // Handle Post New Question
  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionContent.trim()) return;

    const newThread: DiscussionThread = {
      id: `thread-${Date.now()}`,
      author: "You (Learner)",
      role: "Student",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      timestamp: "Just now",
      contextBadge: hasPlayheadAnchor ? "Slide 12 • 14:22 • (Current Playhead)" : "General Lesson Question",
      statusBadge: "Open Discussion",
      title: questionTitle.trim(),
      content: questionContent.trim(),
      upvotes: 1,
      hasUpvoted: true,
      replies: [],
    };

    setThreads((prev) => [newThread, ...prev]);
    setQuestionTitle("");
    setQuestionContent("");
    setIsComposerOpen(false);
  };

  // Handle Post Reply
  const handlePostReply = (threadId: string) => {
    if (!replyContent.trim()) return;

    const newReply: DiscussionReply = {
      id: `rep-${Date.now()}`,
      author: "You (Learner)",
      role: "Student",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      timestamp: "Just now",
      content: replyContent.trim(),
      upvotes: 0,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            replies: [...t.replies, newReply],
          };
        }
        return t;
      })
    );

    setReplyContent("");
    setReplyBoxThreadId(null);
  };

  // Open Report Modal
  const handleOpenReport = (itemTitle: string, authorName: string) => {
    setReportModalData({
      isOpen: true,
      itemTitle,
      authorName,
    });
  };

  // Filter threads
  const filteredThreads = React.useMemo(() => {
    return threads.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeFilter === "Instructor Answered") {
        return t.replies.some((r) => r.role === "Lead Instructor" || r.role === "Teaching Assistant");
      }
      if (activeFilter === "My Questions") {
        return t.author.includes("You");
      }
      return true;
    }).sort((a, b) => {
      if (activeFilter === "Most Upvoted") {
        return b.upvotes - a.upvotes;
      }
      return 0; // default chronological
    });
  }, [threads, searchQuery, activeFilter]);

  return (
    <div data-component="LessonDiscussionForum" className="lesson-discussion__container_01 space-y-6 pt-2">
      {/* =========================================================================
          1. Collapsible Question Composer Box (Mockup Image 2)
          ========================================================================= */}
      <div className="rounded-[16px] border border-[#dce9ff] bg-white shadow-xs overflow-hidden transition-all">
        {/* Banner Header with Toggle */}
        <div
          onClick={() => setIsComposerOpen((prev) => !prev)}
          className="flex items-center justify-between p-4 sm:p-5 bg-[#f0f6ff]/70 hover:bg-[#e8f1ff] transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-xs">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm sm:text-base font-bold text-[#0b1c30]">
                Ask a question or start a discussion on Lesson 3.4
              </h4>
              <p className="text-xs text-[#737686]">
                Directly grounded in RoPE 2D unitary matrices, inner products, and extrapolation.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border-[#2563eb] text-[#2563eb] font-bold text-xs bg-white hover:bg-[#eff4ff]"
          >
            <span>Ask Question</span>
            {isComposerOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Expandable Composer Form */}
        {isComposerOpen && (
          <form onSubmit={handlePostQuestion} className="p-4 sm:p-6 space-y-4 border-t border-[#dce9ff] bg-white animate-in fade-in-0 duration-200">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider block">
                Question Title
              </label>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="e.g., Why do rotary position embeddings preserve inner product invariance under relative shifts?"
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] px-4 py-2.5 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Markdown / LaTeX Formatting Bar */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2">
                <div className="flex items-center gap-1 text-[#434655]">
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Bold">
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Italic">
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Code Snippet">
                    <Code2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-slate-300">|</span>
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Formula (LaTeX)">
                    <span className="font-serif font-bold text-xs">Σ</span>
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Insert Link">
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Bullet List">
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-[#f8f9ff] hover:text-[#0b1c30]" title="Quote">
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#737686]">Markdown &amp; LaTeX supported</span>
                  <button type="button" className="text-[11px] font-semibold text-[#2563eb] hover:underline">
                    Preview
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder="Detail your question or provide reproduction code. For math notation use $y = R_{\Theta, m} x$. Feel free to cite slides or benchmark results..."
                rows={4}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-4 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] leading-relaxed"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-[#737686]">Attach contextual anchor:</span>
                {hasPlayheadAnchor && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-2.5 py-1 text-[11px] font-semibold text-[#2563eb] border border-[#dce9ff]">
                    <Clock className="h-3 w-3" />
                    <span>@ 14:22 (Current Playhead)</span>
                    <button
                      type="button"
                      onClick={() => setHasPlayheadAnchor(false)}
                      className="hover:text-red-600 ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-[#434655] hover:bg-[#f8f9ff]"
                >
                  <Paperclip className="h-3 w-3" />
                  <span>Attach Code (.py, .cu)</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposerOpen(false)}
                  className="h-9 px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!questionTitle.trim() || !questionContent.trim()}
                  className="h-9 px-5 text-xs font-bold rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-1.5 shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post Question</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* =========================================================================
          2. Search, Filter Pills & Summary Metrics (Mockup Image 2)
          ========================================================================= */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737686] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, discussions, or code snippets in this lesson... (⌘F)"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:ring-2 focus:ring-[#2563eb] shadow-2xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#737686] mr-1 hidden sm:inline">Filter: All</span>
            {(["Newest", "Most Upvoted", "Instructor Answered", "My Questions"] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#2563eb] text-white shadow-xs"
                      : "bg-white text-[#434655] hover:bg-[#f8f9ff] border border-[#e2e8f0]"
                  }`}
                >
                  {filter === "Instructor Answered" && (
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-emerald-600"}`} />
                  )}
                  <span>{filter}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Header Metrics Line */}
        <div className="flex items-center justify-between text-xs text-[#737686] border-b border-[#e2e8f0] pb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0b1c30]">{filteredThreads.length} Discussions</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              4 Instructor Verified
            </span>
            <span>&bull;</span>
            <span>Resolved rate: 89%</span>
          </div>
          <div>Showing: Page 1 of 4</div>
        </div>
      </div>

      {/* =========================================================================
          3. Discussion Threads Stream (Mockup Image 2 & 3)
          ========================================================================= */}
      <div className="space-y-6">
        {filteredThreads.map((thread) => {
          return (
            <article
              key={thread.id}
              className="rounded-[16px] border border-[#e2e8f0] bg-white p-5 sm:p-6 shadow-xs space-y-4 transition-all"
            >
              {/* Thread Author Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={thread.avatar}
                    alt={thread.author}
                    className="h-10 w-10 rounded-full object-cover border border-[#e2e8f0]"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-sm font-bold text-[#0b1c30]">
                        {thread.author}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          thread.role === "Lead Instructor"
                            ? "bg-emerald-100 text-emerald-800"
                            : thread.role === "Teaching Assistant"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-[#eff4ff] text-[#2563eb]"
                        }`}
                      >
                        {thread.role}
                      </span>
                      <span className="text-[11px] text-[#737686]">{thread.timestamp}</span>
                    </div>

                    {/* Context Badge */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-[#2563eb]">
                      <span className="rounded-full bg-[#eff4ff] px-2 py-0.5 border border-[#dce9ff]">
                        {thread.contextBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badges / Actions */}
                <div className="flex items-center gap-2">
                  {thread.statusBadge && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {thread.statusBadge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenReport(thread.title, thread.author)}
                    className="p-1 rounded text-[#737686] hover:text-[#0b1c30] hover:bg-[#f8f9ff]"
                    title="Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Thread Title */}
              <h3 className="font-display text-base font-bold text-[#0b1c30] leading-snug">
                {thread.title}
              </h3>

              {/* Thread Content */}
              <div className="text-xs text-[#434655] leading-relaxed whitespace-pre-line space-y-3">
                <p>{thread.content}</p>

                {/* Optional Embedded Code Snippet (e.g. Triton/PyTorch kernel) */}
                {thread.codeSnippet && (
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-inner mt-2">
                    <div className="flex items-center justify-between border-b border-slate-800 bg-[#0b1c30] px-4 py-2 text-[11px] text-slate-400">
                      <span className="font-mono text-teal-400">{thread.codeSnippet.filename}</span>
                      <span className="text-[10px] font-mono text-slate-400">{thread.codeSnippet.tag}</span>
                    </div>
                    <pre className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
                      <code>{thread.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Thread Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f0f2f5] text-xs">
                <div className="flex items-center gap-2">
                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleThreadUpvote(thread.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      thread.hasUpvoted
                        ? "border-[#2563eb] bg-[#eff4ff] text-[#2563eb]"
                        : "border-[#e2e8f0] bg-white text-[#434655] hover:bg-[#f8f9ff]"
                    }`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>{thread.upvotes}</span>
                  </button>

                  {/* Replies Count / Toggle Reply Box */}
                  <button
                    type="button"
                    onClick={() =>
                      setReplyBoxThreadId(replyBoxThreadId === thread.id ? null : thread.id)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white font-semibold text-[#434655] hover:bg-[#f8f9ff] transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{thread.replies.length} Replies</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[#737686]">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-[#0b1c30] transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-[#0b1c30] transition-colors"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Bookmark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReport(thread.title, thread.author)}
                    className="inline-flex items-center gap-1 hover:text-[#ba1a1a] transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              {/* =========================================================================
                  Nested Replies Container (Mockup Image 2 & 3)
                  ========================================================================= */}
              {thread.replies.length > 0 && (
                <div className="space-y-3 pt-3 pl-3 sm:pl-6 border-l-2 border-[#e2e8f0]">
                  {thread.replies.map((reply) => {
                    const isInstructor = reply.role === "Lead Instructor";
                    return (
                      <div
                        key={reply.id}
                        className={`rounded-xl p-4 space-y-3 ${
                          isInstructor
                            ? "border border-emerald-200 bg-emerald-50/30 border-l-4 border-l-emerald-600 shadow-2xs"
                            : "border border-[#e2e8f0] bg-[#f8f9ff]"
                        }`}
                      >
                        {/* Reply Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={reply.avatar}
                              alt={reply.author}
                              className="h-7 w-7 rounded-full object-cover border border-[#e2e8f0]"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-xs font-bold text-[#0b1c30]">
                                  {reply.author}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                    isInstructor
                                      ? "bg-emerald-600 text-white"
                                      : reply.role === "Author"
                                      ? "bg-[#2563eb] text-white"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {reply.role}
                                </span>
                                <span className="text-[10px] text-[#737686]">{reply.timestamp}</span>
                              </div>
                            </div>
                          </div>

                          {/* Verification or Resolved Badge */}
                          <div className="flex items-center gap-2">
                            {reply.citationBadge && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                {reply.citationBadge}
                              </span>
                            )}
                            {reply.isResolvedBadge && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <Check className="h-3 w-3" />
                                <span>Resolved</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reply Content */}
                        <p className="text-xs text-[#434655] leading-relaxed whitespace-pre-line">
                          {reply.content}
                        </p>

                        {/* Optional Formula / Citation Box */}
                        {reply.formulaBox && (
                          <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-1.5 font-mono text-xs">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                              {reply.formulaBox.title}
                            </span>
                            <div className="rounded bg-emerald-50/60 p-2 text-emerald-900 font-semibold text-[11px] border border-emerald-100">
                              {reply.formulaBox.body}
                            </div>
                            <span className="text-[10px] text-[#737686] font-sans block">
                              {reply.formulaBox.caption}
                            </span>
                          </div>
                        )}

                        {/* Reply Footer */}
                        <div className="flex items-center justify-between text-[11px] text-[#737686] pt-1">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleReplyUpvote(thread.id, reply.id)}
                              className={`inline-flex items-center gap-1 hover:text-[#2563eb] font-semibold ${
                                reply.hasUpvoted ? "text-[#2563eb]" : ""
                              }`}
                            >
                              <ArrowUp className="h-3 w-3" />
                              <span>{reply.upvotes} Upvotes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyBoxThreadId(thread.id)}
                              className="inline-flex items-center gap-1 hover:text-[#0b1c30]"
                            >
                              <Reply className="h-3 w-3" />
                              <span>Reply</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenReport(`Reply to ${thread.title}`, reply.author)}
                            className="hover:text-[#ba1a1a]"
                          >
                            Report
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Reply Input Box */}
              {replyBoxThreadId === thread.id && (
                <div className="pt-2 pl-3 sm:pl-6 space-y-2">
                  <div className="flex items-start gap-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${thread.author}...`}
                      rows={2}
                      className="flex-1 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handlePostReply(thread.id)}
                        disabled={!replyContent.trim()}
                        className="h-8 px-3 text-xs font-bold rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                      >
                        Reply
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyBoxThreadId(null);
                          setReplyContent("");
                        }}
                        className="h-7 px-2 text-[11px]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* =========================================================================
          4. Pagination Bar (Mockup Image 3)
          ========================================================================= */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0] text-xs">
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold rounded-lg" disabled>
          &larr; Previous
        </Button>
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb] text-white font-bold text-xs shadow-xs">
            1
          </span>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#434655] hover:bg-white border border-transparent hover:border-slate-200">
            2
          </button>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#434655] hover:bg-white border border-transparent hover:border-slate-200">
            3
          </button>
          <span className="px-1 text-[#737686]">&hellip;</span>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#434655] hover:bg-white border border-transparent hover:border-slate-200">
            4
          </button>
        </div>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold rounded-lg">
          Next &rarr;
        </Button>
      </div>

      {/* =========================================================================
          5. Report Content Modal
          ========================================================================= */}
      <ReportModal
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData((prev) => ({ ...prev, isOpen: false }))}
        itemTitle={reportModalData.itemTitle}
        authorName={reportModalData.authorName}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitationChip } from "@/components/ai/citation";
import type { ChatMessage } from "@/types/ai";
import { Sparkles, X, Send, Bot, User, BookOpen, Lightbulb } from "lucide-react";

interface ChatDrawerProps {
  courseTitle?: string;
  currentLessonTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDrawer({
  courseTitle = "Deep Learning & Transformers",
  currentLessonTitle = "Lesson 3.4: Rotary Positional Embeddings",
  isOpen,
  onClose,
}: ChatDrawerProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      content:
        "Hello! I am your AI Teaching Assistant, grounded in the syllabus of Deep Learning & Transformers and verified academic papers.\n\nHow can I help clarify the mathematical derivation or PyTorch implementation of Rotary Position Embedding (RoPE)?",
      timestamp: "Just now",
      citations: [
        {
          id: "cit-1",
          sourceTitle: "Su et al. (2021) arXiv:2104.09864",
          pageNumber: 4,
          snippet: "RoPE encodes relative position via complex tensor orthogonal rotation matrix.",
        },
        {
          id: "cit-2",
          sourceTitle: "Lecture 3.4 Video",
          timestampSeconds: 862,
          snippet: "Timestamp 14:22: Proof that <R_m q, R_n k> = g(q, k, m - n).",
        },
      ],
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickPrompts = [
    "📐 Explain 2D rotation matrix R(θ, m)",
    "⚖️ Why does RoPE preserve (m - n) distance?",
    "⚡ How does LLaMA 3 optimize RoPE?",
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: promptText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate grounded RAG assistant synthesis
    setTimeout(() => {
      let aiResponseContent = "";
      if (promptText.includes("(m - n)")) {
        aiResponseContent =
          "According to Section 3.2 of the RoFormer paper, multiplying vectors $q$ and $k$ rotated by $R_m$ and $R_n$ results in an inner product that factors directly as $\\text{Re}[\\langle q, k \\rangle e^{i(m-n)\\theta}]$. Hence, attention weights depend strictly on the relative offset $(m - n)$ rather than absolute positions.";
      } else if (promptText.includes("LLaMA")) {
        aiResponseContent =
          "LLaMA 3 utilizes an expanded RoPE base frequency $(\\theta = 500,000)$ combined with YaRN interpolation to scale the effective context window to 128k tokens without fine-tuning overhead.";
      } else {
        aiResponseContent =
          "RoPE pairs adjacent dimensions in the embedding vector and applies a 2D rotation matrix: $$R_{\\theta, m} = \\begin{pmatrix} \\cos(m\\theta) & -\\sin(m\\theta) \\\\ \\sin(m\\theta) & \\cos(m\\theta) \\end{pmatrix}$$ This preserves vector norm while encoding sequence position directly into the geometry.";
      }

      const aiReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        content: aiResponseContent,
        timestamp: "Just now",
        citations: [
          {
            id: `cit-${Date.now()}`,
            sourceTitle: "Theorem 4.2 Formula Proof",
            pageNumber: 5,
            snippet: "Relative positional decay property verification.",
          },
        ],
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(input);
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 2. Slide-out Drawer Panel */}
      <aside
        data-component="ChatDrawer"
        className={`fixed top-0 right-0 z-50 flex h-full w-full sm:w-[420px] md:w-[460px] flex-col border-l border-[#e2e8f0] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#f8f9ff] p-4 select-none">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#006a61] text-white shadow-xs">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <h3 className="font-display text-sm font-bold text-[#0b1c30]">
                AI Teaching Assistant
              </h3>
              <span className="rounded-full bg-[#86f2e4]/40 px-2 py-0.5 text-[9px] font-bold text-[#004f47]">
                RAG Grounded
              </span>
            </div>
            <p className="text-[11px] text-[#737686] truncate max-w-[320px]">
              {currentLessonTitle}
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            title="Close Assistant (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? "items-start" : "items-end flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAi
                      ? "bg-[#006a61] text-white shadow-xs"
                      : "bg-[#2563eb] text-white"
                  }`}
                >
                  {isAi ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className="max-w-[85%] space-y-1.5">
                  <div
                    className={`rounded-[14px] p-3.5 text-xs leading-relaxed ${
                      isAi
                        ? "bg-[#f8f9ff] text-[#0b1c30] border-l-3 border-l-[#006a61] border border-[#e2e8f0] shadow-2xs"
                        : "bg-[#2563eb] text-white shadow-xs font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 space-y-1 pt-2 border-t border-[#dce9ff]">
                        <span className="text-[10px] font-bold text-[#006a61] uppercase tracking-wider block">
                          Verified Citations:
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {msg.citations.map((cit) => (
                            <CitationChip key={cit.id} citation={cit} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-[#737686] block px-1 ${
                      isAi ? "text-left" : "text-right"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#006a61] font-medium p-2 bg-[#eff4ff] rounded-lg w-fit">
              <span className="h-2 w-2 rounded-full bg-[#006a61] animate-ping" />
              <span>Synthesizing grounded answer from course materials...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="border-t border-[#e2e8f0] bg-[#f8f9ff] px-4 py-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#737686] uppercase tracking-wider">
            <Lightbulb className="h-3 w-3 text-[#2563eb]" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendPrompt(prompt)}
                className="rounded-md border border-[#dce9ff] bg-white px-2.5 py-1 text-[11px] font-medium text-[#0b1c30] hover:border-[#2563eb] hover:text-[#2563eb] transition-all shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          className="border-t border-[#e2e8f0] bg-white p-3.5 flex items-center gap-2 shadow-inner"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Tutor about this lesson..."
            className="flex-1 text-xs h-10 rounded-lg bg-[#f8f9ff] border-[#e2e8f0] focus:bg-white"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="h-10 px-4 bg-[#006a61] hover:bg-[#004f47] text-white font-bold rounded-lg shrink-0 gap-1.5 shadow-xs"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </aside>
    </>
  );
}

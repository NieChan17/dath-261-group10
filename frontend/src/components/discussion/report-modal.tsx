"use client";

import * as React from "react";
import { X, Flag, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  authorName?: string;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam, advertising, or self-promotional content" },
  { id: "harassment", label: "Harassment, hate speech, or offensive language" },
  { id: "plagiarism", label: "Academic dishonesty or copyright violation" },
  { id: "misinformation", label: "Incorrect, harmful, or misleading technical information" },
  { id: "offtopic", label: "Off-topic or completely irrelevant to this lesson" },
  { id: "other", label: "Other issue (specify below)" },
];

export function ReportModal({
  isOpen,
  onClose,
  itemTitle = "Discussion Thread",
  authorName = "Author",
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = React.useState("spam");
  const [additionalNotes, setAdditionalNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending report payload to moderation service
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setAdditionalNotes("");
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div
      data-component="ReportModal"
      className="report-modal__overlay_01 fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200 select-none"
    >
      <div
        className="report-modal__container_01 relative w-full max-w-lg rounded-[16px] border border-[#e2e8f0] bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="report-modal__close-btn_01 absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {isSubmitted ? (
          <div className="report-modal__success_01 py-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#0b1c30]">
              Report Submitted
            </h3>
            <p className="text-xs text-[#737686] max-w-xs mx-auto">
              Thank you for keeping our academic community safe. Our course moderation team will inspect this item.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-modal__form_01 space-y-5">
            {/* Header */}
            <div className="report-modal__header_01 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#ba1a1a]">
                <Flag className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-[#0b1c30]">
                  Report Inappropriate Content
                </h3>
                <p className="text-xs text-[#737686] leading-relaxed">
                  Flagging content by <span className="font-semibold text-[#0b1c30]">{authorName}</span>: &quot;
                  <span className="italic truncate max-w-[260px] inline-block align-bottom">{itemTitle}</span>&quot;
                </p>
              </div>
            </div>

            {/* Reason Radio Group */}
            <div className="report-modal__reasons_01 space-y-2">
              <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider block">
                Select Reason for Report
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? "border-[#2563eb] bg-[#eff4ff]/60 font-semibold text-[#0b1c30] shadow-2xs"
                        : "border-[#e2e8f0] bg-white text-[#434655] hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => setSelectedReason(reason.id)}
                      className="h-4 w-4 text-[#2563eb] focus:ring-[#2563eb] border-slate-300 cursor-pointer"
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="report-modal__notes_01 space-y-1.5">
              <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider block">
                Additional Context (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Provide specific details or timestamps to help instructors review..."
                rows={3}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] p-3 text-xs text-[#0b1c30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Actions */}
            <div className="report-modal__actions_01 flex items-center justify-end gap-3 pt-2 border-t border-[#e2e8f0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-bold rounded-lg bg-[#ba1a1a] hover:bg-[#961313] text-white shadow-xs"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

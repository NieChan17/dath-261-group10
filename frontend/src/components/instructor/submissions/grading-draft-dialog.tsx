"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatGradeScore } from "@/lib/instructor-grading";

interface GradingDraftDialogProps {
  mode: "review" | "reset";
  studentName: string;
  assessmentTitle: string;
  maxScore: number;
  score?: number;
  feedback?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function GradingDraftDialog({
  mode, studentName, assessmentTitle, maxScore, score, feedback, onCancel, onConfirm,
}: GradingDraftDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isReview = mode === "review";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal();
    if (isReview) {
      titleRef.current?.focus({ preventScroll: true });
      if (dialog) dialog.scrollTop = 0;
    } else {
      cancelRef.current?.focus();
    }
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [isReview]);

  return (
    <dialog
      ref={dialogRef}
      data-component="GradingDraftDialog"
      aria-labelledby="grading-draft-dialog-title"
      aria-describedby="grading-draft-dialog-description"
      onCancel={(event) => { event.preventDefault(); onCancel(); }}
      className="grading-draft-dialog__container_01 max-h-[80vh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-[15px] border border-border bg-card p-6 text-card-foreground shadow-lg backdrop:bg-black/50"
    >
      <h2 ref={titleRef} tabIndex={isReview ? -1 : undefined} id="grading-draft-dialog-title" className="grading-draft-dialog__title_01 font-display text-xl font-bold focus:outline-none">
        {isReview ? "Review grade draft" : "Reset grading draft?"}
      </h2>
      <p className="grading-draft-dialog__student_01 mt-3 break-words text-sm font-semibold">{studentName}</p>
      <p className="grading-draft-dialog__assessment_01 mt-1 break-words text-sm text-muted-foreground">{assessmentTitle}</p>
      <p id="grading-draft-dialog-description" className="grading-draft-dialog__description_01 mt-4 text-sm leading-relaxed text-muted-foreground">
        {isReview
          ? "Confirming keeps a temporary local grading draft in this submissions workspace. It is lost on a full reload or when leaving the workspace. Nothing is sent to students or saved to a server."
          : "Discard this temporary score and feedback and return to the sample recorded values. This draft cannot be recovered after resetting."}
      </p>
      {isReview && (
        <dl className="grading-draft-dialog__preview_01 mt-5 space-y-4 rounded-lg border border-border p-4">
          <div className="grading-draft-dialog__score_01">
            <dt className="grading-draft-dialog__label_01 text-sm font-semibold">Draft score</dt>
            <dd className="grading-draft-dialog__score-value_01 mt-1 text-xl font-bold">{score !== undefined ? `${formatGradeScore(score)} / ${formatGradeScore(maxScore)}` : "No score provided"}</dd>
          </div>
          <div className="grading-draft-dialog__feedback_01">
            <dt className="grading-draft-dialog__label_02 text-sm font-semibold">Draft feedback</dt>
            <dd className="grading-draft-dialog__feedback-value_01 mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{feedback?.trim() ? feedback : "No feedback entered."}</dd>
          </div>
        </dl>
      )}
      <div className="grading-draft-dialog__actions_01 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} type="button" variant="outline" onClick={onCancel}>{isReview ? "Keep editing" : "Keep draft"}</Button>
        <Button type="button" variant={isReview ? "default" : "destructive"} onClick={onConfirm}>{isReview ? "Confirm local draft" : "Discard draft"}</Button>
      </div>
    </dialog>
  );
}

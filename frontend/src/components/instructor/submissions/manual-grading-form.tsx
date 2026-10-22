"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatGradeScore, validateGrade } from "@/lib/instructor-grading";
import { createGradingDraft, type ManualGradingSubmission } from "@/lib/instructor-grading-draft";
import { GradingDraftDialog } from "./grading-draft-dialog";
import { useSubmissionDrafts } from "./submission-draft-provider";

type DraftDialog =
  | { mode: "review"; score: number; rawScore: string; feedback: string }
  | { mode: "reset" };

export function ManualGradingForm({ submission }: { submission: ManualGradingSubmission }) {
  const { drafts, updateDraft, confirmDraft, resetDraft } = useSubmissionDrafts();
  const storedDraft = drafts[submission.id];
  const draft = storedDraft ?? createGradingDraft(submission);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [dialog, setDialog] = useState<DraftDialog | null>(null);
  const scoreRef = useRef<HTMLInputElement>(null);
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const maxScore = submission.assessment.maxScore;

  useEffect(() => { setIsHydrated(true); }, []);

  function checkScore(value: string): boolean {
    const result = validateGrade(value, maxScore);
    setError(result.valid ? null : result.error);
    return result.valid;
  }

  function reviewGrade() {
    if (!isHydrated) return;
    const result = validateGrade(draft.score, maxScore);
    if (!result.valid) {
      setError(result.error);
      scoreRef.current?.focus();
      return;
    }
    setError(null);
    setDialog({ mode: "review", score: result.score, rawScore: draft.score, feedback: draft.feedback });
  }

  function closeDialog(focusReset = false) {
    setDialog(null);
    requestAnimationFrame(() => (focusReset ? resetButtonRef : reviewButtonRef).current?.focus());
  }

  function confirmDialog() {
    if (dialog?.mode === "review") {
      confirmDraft(submission, { score: dialog.rawScore, feedback: dialog.feedback });
    } else if (dialog?.mode === "reset") {
      resetDraft(submission.id);
      setError(null);
    }
    closeDialog();
  }

  return (
    <Card data-component="ManualGradingForm" className="manual-grading__container_01 min-w-0 rounded-[15px]">
      <CardHeader className="manual-grading__header_01 space-y-2">
        <h2 id="manual-grading-title" className="manual-grading__title_01 font-display text-lg font-bold">Local grading draft</h2>
        <p className="manual-grading__description_01 text-sm leading-relaxed text-muted-foreground">
          Prepare a temporary score and feedback. Drafts stay within this submissions workspace and are lost on a full reload or when you leave it.
        </p>
      </CardHeader>
      <CardContent className="manual-grading__content_01 space-y-4">
        <p role="status" className="manual-grading__status_01 rounded-lg border border-border bg-muted p-3 text-sm">
          {!isHydrated ? "Grading requires JavaScript. Controls become available after this page finishes loading." : storedDraft
            ? draft.reviewed ? "Confirmed locally. This draft is still temporary and has not been sent or saved to a server." : "Draft changes need review. The sample recorded grade is unchanged."
            : "The fields start with the sample recorded values. Changes create a temporary local draft."}
        </p>
        <div role="form" aria-labelledby="manual-grading-title" className="manual-grading__form_01">
          <fieldset
            disabled={!isHydrated}
            className="manual-grading__fields_01 min-w-0 space-y-5"
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.target === scoreRef.current) {
                event.preventDefault();
                reviewGrade();
              }
            }}
          >
            <div className="manual-grading__score-field_01 space-y-2">
              <label htmlFor="grading-score" className="manual-grading__label_01 block text-sm font-semibold">Grade (points)</label>
              <Input
                ref={scoreRef}
                id="grading-score"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={draft.score}
                aria-invalid={Boolean(error)}
                aria-describedby={`grading-score-help${error ? " grading-score-error" : ""}`}
                onChange={(event) => {
                  updateDraft(submission, { score: event.target.value });
                  if (error) checkScore(event.target.value);
                }}
              />
              <p id="grading-score-help" className="manual-grading__score-help_01 text-xs text-muted-foreground">0–{formatGradeScore(maxScore)} points; decimals allowed.</p>
              {error && <p id="grading-score-error" role="alert" className="manual-grading__error_01 text-sm font-medium text-red-700 dark:rounded-md dark:bg-red-950 dark:px-2 dark:py-1 dark:text-red-300">{error}</p>}
            </div>
            <div className="manual-grading__feedback-field_01 space-y-2">
              <label htmlFor="grading-feedback" className="manual-grading__label_02 block text-sm font-semibold">Instructor feedback</label>
              <textarea
                id="grading-feedback"
                rows={5}
                value={draft.feedback}
                aria-describedby="grading-feedback-help"
                onChange={(event) => updateDraft(submission, { feedback: event.target.value })}
                className="manual-grading__textarea_01 block w-full min-w-0 resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p id="grading-feedback-help" className="manual-grading__feedback-help_01 text-xs text-muted-foreground">Optional comments for this draft. Nothing is sent to the student.</p>
            </div>
            <div className="manual-grading__actions_01 flex flex-wrap gap-3">
              <Button ref={reviewButtonRef} type="button" disabled={!isHydrated} onClick={reviewGrade}>Review Grade</Button>
              <Button ref={resetButtonRef} type="button" variant="outline" disabled={!isHydrated || !storedDraft} onClick={() => setDialog({ mode: "reset" })}>Reset Draft</Button>
            </div>
          </fieldset>
        </div>
      </CardContent>
      {dialog && (
        <GradingDraftDialog
          mode={dialog.mode}
          studentName={submission.student.fullName}
          assessmentTitle={submission.assessment.title}
          maxScore={maxScore}
          score={dialog.mode === "review" ? dialog.score : undefined}
          feedback={dialog.mode === "review" ? dialog.feedback : undefined}
          onCancel={() => closeDialog(dialog.mode === "reset")}
          onConfirm={confirmDialog}
        />
      )}
    </Card>
  );
}

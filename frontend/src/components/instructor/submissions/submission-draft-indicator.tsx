"use client";

import { Badge } from "@/components/ui/badge";
import { useSubmissionDrafts } from "./submission-draft-provider";

export function SubmissionDraftIndicator({ submissionId }: { submissionId: string }) {
  const { drafts } = useSubmissionDrafts();
  const draft = drafts[submissionId];
  if (!draft) return null;
  return (
    <div data-component="SubmissionDraftIndicator" className="submission-draft__indicator_01 flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="submission-draft__badge_01 border-primary/30 text-primary">Local grading draft</Badge>
      <span className="submission-draft__state_01 text-xs text-muted-foreground">{draft.reviewed ? "Reviewed locally" : "Needs review"}</span>
    </div>
  );
}

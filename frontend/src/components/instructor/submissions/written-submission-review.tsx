import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatFileSize } from "@/lib/instructor-material";
import type { WrittenSubmission } from "@/types/submission";

export function WrittenSubmissionReview({ submission }: { submission: WrittenSubmission }) {
  return (
    <Card data-component="WrittenSubmissionReview" className="written-submission-review__container_01 min-w-0 rounded-[15px]">
      <CardHeader className="written-submission-review__header_01">
        <h2 className="written-submission-review__title_01 font-display text-lg font-bold">Written response</h2>
      </CardHeader>
      <CardContent className="written-submission-review__content_01 space-y-6">
        <p className="written-submission-review__answer_01 whitespace-pre-wrap break-words text-sm leading-relaxed">
          {submission.writtenAnswer.trim() ? submission.writtenAnswer : submission.attachments.length ? "No inline response was submitted. Review the attached file below." : "No written response was submitted."}
        </p>
        <section aria-labelledby="written-attachments-title" className="written-submission-review__attachments_01 border-t border-border pt-5">
          <h3 id="written-attachments-title" className="written-submission-review__attachments-title_01 text-sm font-semibold">Attachments ({submission.attachments.length})</h3>
          {submission.attachments.length ? (
            <ul className="written-submission-review__attachment-list_01 mt-3 space-y-3">
              {submission.attachments.map((attachment) => (
                <li key={attachment.id} className="written-submission-review__attachment_01 flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="written-submission-review__file-info_01 min-w-0">
                    <p className="written-submission-review__file-name_01 break-all text-sm font-medium">{attachment.fileName}</p>
                    <p className="written-submission-review__file-meta_01 mt-1 break-all text-xs text-muted-foreground">{formatFileSize(attachment.sizeBytes)} · {attachment.mimeType}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="written-submission-review__file-link_01 shrink-0 gap-2">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${attachment.fileName} in a new tab`}>
                      Open attachment <ExternalLink aria-hidden="true" className="written-submission-review__external-icon_01 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          ) : <p className="written-submission-review__no-attachments_01 mt-2 text-sm text-muted-foreground">No files were attached.</p>}
        </section>
      </CardContent>
    </Card>
  );
}

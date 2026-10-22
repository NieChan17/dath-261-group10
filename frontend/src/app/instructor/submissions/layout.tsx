import type { ReactNode } from "react";
import { SubmissionDraftProvider } from "@/components/instructor/submissions/submission-draft-provider";

export default function SubmissionsLayout({ children }: { children: ReactNode }) {
  return <SubmissionDraftProvider>{children}</SubmissionDraftProvider>;
}

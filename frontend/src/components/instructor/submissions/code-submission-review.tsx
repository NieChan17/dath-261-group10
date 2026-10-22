"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { InstructorCodeSubmission } from "@/types/submission";

type ReadOnlyEditorComponent = typeof import("@/components/editor/code-editor").CodeEditor;

export function CodeSubmissionReview({ submission }: { submission: InstructorCodeSubmission }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [ReadOnlyEditor, setReadOnlyEditor] = useState<ReadOnlyEditorComponent | null>(null);
  const [editorFailed, setEditorFailed] = useState(false);
  const { code, language, testResults } = submission.codeSubmission;

  useEffect(() => {
    if (!editorOpen || ReadOnlyEditor || editorFailed) return;
    let active = true;
    async function prepareEditor() {
      try {
        const [editorModule, { loader }] = await Promise.all([
          import("@/components/editor/code-editor"), import("@monaco-editor/react"),
        ]);
        // This promise reports script/engine failures without changing shared settings.
        await loader.init();
        if (active) setReadOnlyEditor(() => editorModule.CodeEditor);
      } catch {
        if (active) setEditorFailed(true);
      }
    }
    void prepareEditor();
    return () => { active = false; };
  }, [editorOpen, ReadOnlyEditor, editorFailed]);
  return (
    <Card data-component="CodeSubmissionReview" className="code-submission-review__container_01 min-w-0 rounded-[15px]">
      <CardHeader className="code-submission-review__header_01 space-y-2">
        <h2 className="code-submission-review__title_01 font-display text-lg font-bold">Submitted code</h2>
        <p className="code-submission-review__language_01 text-sm text-muted-foreground">Language: <span className="code-submission-review__language-value_01 font-mono">{language}</span></p>
      </CardHeader>
      <CardContent className="code-submission-review__content_01 min-w-0 space-y-5">
        <pre role="region" tabIndex={0} aria-label="Submitted source code" className="code-submission-review__source_01 max-w-full overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"><code>{code || "No source code was submitted."}</code></pre>
        <div className="code-submission-review__editor-toggle_01 space-y-3">
          <Button type="button" variant="outline" aria-expanded={editorOpen} aria-controls="submission-read-only-editor" onClick={() => setEditorOpen((open) => !open)} className="code-submission-review__toggle-button_01">
            {editorOpen ? "Close code editor" : "Open read-only code editor"}
          </Button>
          <div id="submission-read-only-editor" hidden={!editorOpen} className="code-submission-review__editor_01 h-[400px] min-w-0">
            {editorOpen && (ReadOnlyEditor ? <ReadOnlyEditor initialCode={code} language={language} readOnly /> : (
              <p role="status" className="code-submission-review__editor-loading_01 p-4 text-sm text-muted-foreground">
                {editorFailed ? "The code editor could not be loaded. Review the submitted source code above." : "Preparing the optional editor. You can review the submitted source code above while it loads."}
              </p>
            ))}
          </div>
        </div>
        <section aria-labelledby="code-test-results-title" className="code-submission-review__test-results_01 border-t border-border pt-5">
          <h3 id="code-test-results-title" className="code-submission-review__results-title_01 text-sm font-semibold">Recorded test results</h3>
          <p className="code-submission-review__results-notice_01 mt-2 text-xs leading-relaxed text-muted-foreground">These are sample results saved with the submission. Reviewing this page does not run the code.</p>
          {testResults ? (
            <div className="code-submission-review__results_01 mt-3 space-y-3">
              <p className="code-submission-review__test-status_01 text-sm font-medium">{testResults.passed ? "Sample tests passed" : "Sample tests failed"} · {testResults.runtimeMs} ms</p>
              <pre role="region" tabIndex={0} aria-label="Recorded test output" className="code-submission-review__output_01 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{testResults.output}</pre>
            </div>
          ) : <p className="code-submission-review__no-results_01 mt-3 text-sm text-muted-foreground">No test result was recorded for this submission.</p>}
        </section>
      </CardContent>
    </Card>
  );
}

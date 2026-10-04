"use client";

import * as React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  initialCode = "// Write your code solution here\nconsole.log('Hello EduPulse!');",
  language = "javascript",
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const handleEditorMount: OnMount = (editor) => {
    editor.focus();
  };

  return (
    <div
      data-component="CodeEditor"
      className="code-editor__container_01 h-full w-full overflow-hidden rounded-lg border border-border bg-[#0f172a]"
    >
      <div className="code-editor__toolbar_01 flex h-10 items-center justify-between border-b border-slate-800 bg-[#0b1c30] px-4 text-xs text-slate-400">
        <span className="code-editor__lang_01 font-mono uppercase text-teal-400 font-semibold">
          {language}
        </span>
        <span className="code-editor__status_01">Monaco Engine</span>
      </div>
      <div className="code-editor__viewport_01 h-[calc(100%-2.5rem)] w-full">
        <Editor
          height="100%"
          language={language}
          value={initialCode}
          theme="vs-dark"
          onChange={onChange}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  theme?: "vs-dark" | "light" | "vs";
  hideHeader?: boolean;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  initialCode = "// Write your code solution here\nconsole.log('Hello EduPulse!');",
  language = "javascript",
  theme = "vs",
  hideHeader = false,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const handleEditorMount: OnMount = (editor) => {
    editor.focus();
  };

  const isDark = theme === "vs-dark";

  return (
    <div
      data-component="CodeEditor"
      className={`code-editor__container_01 h-full w-full overflow-hidden ${
        isDark
          ? "border border-slate-800 bg-[#0f172a]"
          : "border border-[#e2e8f0] bg-white"
      }`}
    >
      {!hideHeader && (
        <div
          className={`code-editor__toolbar_01 flex h-9 items-center justify-between border-b px-4 text-xs ${
            isDark
              ? "border-slate-800 bg-[#0b1c30] text-slate-400"
              : "border-[#e2e8f0] bg-[#f8f9ff] text-[#434655]"
          }`}
        >
          <span className="code-editor__lang_01 font-mono uppercase font-semibold text-[#2563eb]">
            {language}
          </span>
          <span className="code-editor__status_01 text-[11px] text-[#737686]">Monaco Engine</span>
        </div>
      )}
      <div className={`code-editor__viewport_01 ${hideHeader ? "h-full" : "h-[calc(100%-2.25rem)]"} w-full`}>
        <Editor
          height="100%"
          language={language}
          value={initialCode}
          theme={theme === "light" ? "vs" : theme}
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

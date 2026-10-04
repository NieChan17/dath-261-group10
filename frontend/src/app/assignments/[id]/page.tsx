"use client";

import * as React from "react";
import { CodeEditor } from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AssignmentDetailPage() {
  const [code, setCode] = React.useState(
    "function solve(input) {\n  // Implement your algorithm here\n  return input;\n}"
  );

  return (
    <div
      data-component="AssignmentPage"
      className="assignment__container_01 flex h-[calc(100vh-4rem)] flex-col md:flex-row overflow-hidden"
    >
      {/* Problem Description Pane */}
      <div className="assignment__desc-pane_01 w-full md:w-1/2 p-6 border-r border-border overflow-y-auto space-y-4">
        <div className="flex items-center gap-2">
          <Badge>Assignment 1</Badge>
          <span className="text-xs text-muted-foreground">Deadline: 23:59 Sunday</span>
        </div>
        <h1 className="text-2xl font-bold font-display">
          Array Partition & Balanced Subsets
        </h1>
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            Given an array of integers, determine if it can be partitioned into two subsets with equal sums.
          </p>
          <h4 className="font-semibold text-foreground text-xs uppercase">Requirements:</h4>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li>Time Complexity: O(N * Sum)</li>
            <li>Space Complexity: O(Sum)</li>
          </ul>
        </div>
      </div>

      {/* Monaco Code Editor Pane */}
      <div className="assignment__editor-pane_01 flex-1 flex flex-col p-4 bg-surface-low gap-3">
        <div className="flex-1">
          <CodeEditor
            language="javascript"
            initialCode={code}
            onChange={(val) => setCode(val || "")}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm">
            Run Tests
          </Button>
          <Button size="sm">
            Submit Solution
          </Button>
        </div>
      </div>
    </div>
  );
}

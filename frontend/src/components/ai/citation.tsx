import * as React from "react";
import type { Citation } from "@/types/ai";

interface CitationChipProps {
  citation: Citation;
  onClick?: () => void;
}

export function CitationChip({ citation, onClick }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-component="CitationChip"
      className="citation__chip_01 inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-md bg-surface-low border border-border text-foreground text-xs font-mono hover:border-primary hover:text-primary transition-colors"
      title={citation.snippet}
    >
      <span className="citation__icon_01 text-secondary font-bold">#</span>
      <span className="citation__title_01 truncate max-w-[140px]">
        {citation.sourceTitle}
      </span>
      {citation.pageNumber && (
        <span className="citation__page_01 text-muted-foreground">
          p.{citation.pageNumber}
        </span>
      )}
    </button>
  );
}

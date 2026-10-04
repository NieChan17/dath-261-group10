import * as React from "react";
import Link from "next/link";
import { CourseCard } from "@/components/course/course-card";

export default function CoursesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-display text-[#0b1c30]">Course Catalog</h1>
        <p className="text-sm text-muted-foreground">
          Explore all verified engineering tracks, system architectures, and AI modules.
        </p>
      </div>
    </div>
  );
}

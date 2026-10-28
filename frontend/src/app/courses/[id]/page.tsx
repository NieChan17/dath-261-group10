import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-display text-[#0b1c30]">Course Overview</h1>
        <p className="text-sm text-muted-foreground">Course ID: {params.id}</p>
      </div>
      <div>
        <Link href={ROUTES.LEARN(params.id)}>
          <Button>Go to Learning Workstation →</Button>
        </Link>
      </div>
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function CourseLearnPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold font-display text-[#0b1c30]">
        Course Learning Workspace
      </h1>
      <p className="text-sm text-muted-foreground">
        Workspace for course &quot;{params.id}&quot; is reserved. Detailed mockup will be implemented in upcoming updates.
      </p>
      <div className="pt-4">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    </div>
  );
}

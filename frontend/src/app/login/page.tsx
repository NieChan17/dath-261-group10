import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div data-component="LoginPage" className="login__container_01 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="login__card_01 w-full max-w-md shadow-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="login__title_01 text-2xl font-display">Sign In</CardTitle>
          <CardDescription className="login__desc_01">
            Access your courses, assignments, and AI tutor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input type="email" placeholder="student@hcmut.edu.vn" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Link href={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <Input type="password" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full">Sign In</Button>
          <p className="text-xs text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.REGISTER} className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

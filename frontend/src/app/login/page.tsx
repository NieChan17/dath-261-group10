"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { loginUser } from "@/lib/api/auth";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await loginUser(email, password);
      setSuccess("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push(ROUTES.HOME);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-component="LoginPage"
      className="login__container_01 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-[#f8f9ff]"
    >
      <Card className="login__card_01 w-full max-w-md shadow-md rounded-[15px] border-[#e2e8f0] bg-white">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="login__title_01 text-2xl font-display font-bold text-[#0b1c30]">
            Sign In
          </CardTitle>
          <CardDescription className="login__desc_01 text-xs text-[#737686]">
            Access your courses, assignments, and AI tutor
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="login__error-box_01 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="login__success-box_01 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@edupulse.hcmut.edu.vn"
                className="h-10 text-xs bg-[#f8f9ff] focus:bg-white border-[#e2e8f0]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">
                  Password
                </label>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-[#2563eb] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-xs bg-[#f8f9ff] focus:bg-white border-[#e2e8f0]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
            <p className="text-xs text-center text-[#737686]">
              Don&apos;t have an account?{" "}
              <Link
                href={ROUTES.REGISTER}
                className="text-[#2563eb] font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

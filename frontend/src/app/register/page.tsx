"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { registerUser } from "@/lib/api/auth";
import {
  BookOpen,
  Sparkles,
  Terminal,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  User,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [engineeringFocus, setEngineeringFocus] = React.useState<
    "learner" | "researcher" | "systems"
  >("researcher");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await registerUser({
        email,
        password,
        fullName,
        role: engineeringFocus === "researcher" ? "instructor" : "student",
      });
      setSuccess("Account registered successfully! Redirecting to Sign In...");
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-component="RegisterPage"
      className="register__container_01 min-h-screen flex flex-col justify-between bg-[#f8f9ff] text-[#0b1c30] select-none"
    >
      {/* 1. Specialized Minimal Auth Header */}
      <header className="register__header_01 w-full border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="register__header-inner_01 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={ROUTES.HOME}
            className="register__logo-btn_01 inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-lg cursor-pointer"
          >
            <div className="register__logo-icon_01 h-7 w-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-display font-bold text-sm shadow-sm">
              E
            </div>
            <span className="register__logo-text_01 font-display font-bold text-lg text-[#0b1c30] tracking-tight">
              EduPulse
            </span>
          </Link>

          <div className="register__header-nav_01 flex items-center gap-6 text-xs font-semibold">
            <Link
              href={ROUTES.COURSES}
              className="register__nav-link_01 text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Back to Courses
            </Link>
            <a
              href="#help"
              className="register__nav-link_02 text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              Help Center
            </a>
            <div className="register__avatar-pill_01 h-8 w-8 rounded-full bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#2563eb]">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Two-Column Content Area */}
      <main className="register__main_01 flex-1 py-10 sm:py-14">
        <div className="register__content-grid_01 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Academic & Engineering Value Proposition (~55%) */}
          <div className="register__left-col_01 lg:col-span-6 space-y-8 pt-2">
            <div className="space-y-4">
              <h1 className="register__hero-title_01 font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0b1c30] leading-[1.18] tracking-tight">
                The workspace for modern{" "}
                <span className="text-[#2563eb]">AI engineering</span>
                <br className="hidden sm:inline" /> &amp; research.
              </h1>
              <p className="register__hero-desc_01 text-sm sm:text-base text-[#434655] leading-relaxed max-w-xl">
                Gain reproducible intuition across transformer topologies,
                state-space representations, and distributed model execution
                environments with verifiable mathematical lineage.
              </p>
            </div>

            {/* Feature 1: arXiv Curricula */}
            <div className="register__feature-card_01 flex items-start gap-4 p-4 rounded-[15px] bg-[#eff4ff]/60 border border-[#dce9ff]">
              <div className="register__feature-icon_01 h-10 w-10 shrink-0 rounded-xl bg-white border border-[#cbdbf5] flex items-center justify-center text-[#2563eb] shadow-2xs">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="register__feature-title_01 font-display text-sm font-bold text-[#0b1c30]">
                  Peer-Reviewed arXiv Curricula
                </h3>
                <p className="register__feature-text_01 text-xs text-[#434655] leading-normal">
                  Continuous sync with pre-prints, mathematical derivations, and
                  reference implementations vetted by senior peers.
                </p>
              </div>
            </div>

            {/* Feature 2: RAG-Grounded Notebooks */}
            <div className="register__feature-card_02 flex items-start gap-4 p-4 rounded-[15px] bg-[#f0fdfa]/70 border border-[#bbf7d0]">
              <div className="register__feature-icon_02 h-10 w-10 shrink-0 rounded-xl bg-white border border-[#99f6e4] flex items-center justify-center text-[#006a61] shadow-2xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="register__feature-title_02 font-display text-sm font-bold text-[#0b1c30]">
                  RAG-Grounded Interactive Notebooks
                </h3>
                <p className="register__feature-text_02 text-xs text-[#434655] leading-normal">
                  Zero hallucinated proofs. Every code derivation cites source
                  lemmas, runtime memory footprints, and paper theorems.
                </p>
              </div>
            </div>

            {/* Feature 3: Vector Execution Sandboxes */}
            <div className="register__feature-card_03 flex items-start gap-4 p-4 rounded-[15px] bg-[#eff4ff]/60 border border-[#dce9ff]">
              <div className="register__feature-icon_03 h-10 w-10 shrink-0 rounded-xl bg-white border border-[#cbdbf5] flex items-center justify-center text-[#2563eb] shadow-2xs">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="register__feature-title_03 font-display text-sm font-bold text-[#0b1c30]">
                  Live Vector Execution Sandboxes
                </h3>
                <p className="register__feature-text_03 text-xs text-[#434655] leading-normal">
                  Direct kernel profiling, FlashAttention step tracing, and
                  distributed training telemetry in unified browser clusters.
                </p>
              </div>
            </div>

            {/* Social Proof Pill */}
            <div className="register__social-proof_01 flex items-center gap-4 p-3.5 rounded-[15px] bg-white border border-[#e2e8f0] shadow-2xs">
              <div className="flex -space-x-2 shrink-0">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Member"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Member"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Member"
                />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#0b1c30]">
                  42,000+{" "}
                  <span className="font-semibold text-[#434655]">
                    AI Engineers &amp; Academics
                  </span>
                </p>
                <p className="text-[11px] text-[#737686]">
                  Active members across MIT, Stanford, CMU, and top distributed labs.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Register Form Card (~45%) */}
          <div className="register__right-col_01 lg:col-span-6">
            <div className="register__form-card_01 rounded-[15px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="register__form-header_01 space-y-1.5 pb-6">
                <h2 className="register__form-title_01 font-display text-2xl font-bold text-[#0b1c30]">
                  Create your account
                </h2>
                <p className="register__form-subtitle_01 text-xs text-[#737686]">
                  Start mastering transformers, RoPE embeddings, and distributed AI systems.
                </p>
              </div>

              {/* SSO Buttons */}
              <div className="register__sso-group_01 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
                <button
                  type="button"
                  className="register__sso-btn_01 inline-flex items-center justify-center gap-2.5 h-10 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] hover:bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  className="register__sso-btn_02 inline-flex items-center justify-center gap-2.5 h-10 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] hover:bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 fill-current text-[#0b1c30]" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="register__divider-wrapper_01 relative pb-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2e8f0]" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                  Or register with academic / work email
                </span>
              </div>

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="register__form_01 space-y-4">
                {/* 1. Full Name */}
                <div className="register__field_01 space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Evelyn Vance"
                    className="w-full h-10.5 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] px-3.5 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                </div>

                {/* 2. Institutional Email */}
                <div className="register__field_02 space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                    Institutional or Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="evance@cs.stanford.edu"
                    className="w-full h-10.5 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] px-3.5 text-xs text-[#0b1c30] placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-[#737686] pt-0.5">
                    <Info className="h-3.5 w-3.5 text-[#2563eb] shrink-0" />
                    <span>Use an .edu or research affiliation email for verified research corpus access.</span>
                  </div>
                </div>

                {/* 3. Primary Engineering Focus (3 Segments) */}
                <div className="register__field_03 space-y-2 pt-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                    Primary Engineering Focus
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEngineeringFocus("learner")}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        engineeringFocus === "learner"
                          ? "bg-[#2563eb] text-white shadow-xs"
                          : "border border-[#e2e8f0] bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]"
                      }`}
                    >
                      Learner / Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setEngineeringFocus("researcher")}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        engineeringFocus === "researcher"
                          ? "bg-[#2563eb] text-white shadow-xs"
                          : "border border-[#e2e8f0] bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]"
                      }`}
                    >
                      Researcher
                    </button>
                    <button
                      type="button"
                      onClick={() => setEngineeringFocus("systems")}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        engineeringFocus === "systems"
                          ? "bg-[#2563eb] text-white shadow-xs"
                          : "border border-[#e2e8f0] bg-[#f8f9ff] text-[#434655] hover:bg-[#eff4ff]"
                      }`}
                    >
                      Systems Eng
                    </button>
                  </div>
                </div>

                {/* 4. Password */}
                <div className="register__field_04 space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                    Access Secret (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 12 chars, letters &amp; symbols"
                      className="w-full h-10.5 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] pl-3.5 pr-10 text-xs font-mono text-[#0b1c30] placeholder:font-sans placeholder:text-[#737686] focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#0b1c30] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength 4-segment meter (3 active green) */}
                  <div className="flex gap-1.5 pt-1.5">
                    <div className="h-1 flex-1 rounded-full bg-[#006a61]" />
                    <div className="h-1 flex-1 rounded-full bg-[#006a61]" />
                    <div className="h-1 flex-1 rounded-full bg-[#006a61]" />
                    <div className="h-1 flex-1 rounded-full bg-[#e2e8f0]" />
                  </div>
                </div>

                {/* 5. Checkbox Agreement */}
                <div className="register__field_05 flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#cbdbf5] text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[#434655] leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <span className="text-[#2563eb] font-semibold hover:underline">
                      Terms of Service
                    </span>
                    ,{" "}
                    <span className="text-[#2563eb] font-semibold hover:underline">
                      Academic Honor Code
                    </span>
                    , and data telemetry guidelines for RAG query caching.
                  </label>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="register__submit-btn_01 w-full h-11 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom Sign In Link */}
              <div className="register__footer-link_01 pt-6 text-center text-xs text-[#737686]">
                Already have an academic account?{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-bold text-[#2563eb] hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Global Minimal Footer */}
      <footer className="register__footer_01 w-full border-t border-[#e2e8f0] bg-white py-6">
        <div className="register__footer-inner_01 mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-[#737686]">
          <p>© 2025 EduPulse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-[#0b1c30] transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-[#0b1c30] transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-[#0b1c30] transition-colors">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

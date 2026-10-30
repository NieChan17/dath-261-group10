"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Presentation,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface PortalCardConfig {
  id: string;
  role: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  features: string[];
}

const PORTALS: PortalCardConfig[] = [
  {
    id: "learner",
    role: "Learner & Student",
    title: "Learner Portal",
    description: "Explore computer science curricula, solve interactive code challenges, and collaborate with peers.",
    href: "/login?role=learner",
    buttonText: "Continue as Learner",
    icon: GraduationCap,
    accentColor: "border-[#2563eb] text-[#2563eb] hover:border-[#1d4ed8]",
    badgeBg: "bg-[#eff4ff] text-[#2563eb] border-[#bfdbfe]",
    badgeText: "Learner Portal",
    features: [
      "Academic catalog, video lectures & player",
      "Interactive 3-pane Code Sandbox & algorithm labs",
      "Lesson discussion threads & EduPulse AI Assistant",
    ],
  },
  {
    id: "instructor",
    role: "Faculty & Instructor",
    title: "Instructor Workspace",
    description: "Author course curricula, organize assignments, and evaluate student submissions.",
    href: "/login?role=instructor",
    buttonText: "Continue as Instructor",
    icon: Presentation,
    accentColor: "border-[#006a61] text-[#006a61] hover:border-[#004d44]",
    badgeBg: "bg-[#e6f7f5] text-[#006a61] border-[#99ded7]",
    badgeText: "Instructor Workspace",
    features: [
      "Course management & CSV-based quiz generator",
      "Submission Review Hub & grading workflows",
      "Grading Studio with granular score evaluation",
    ],
  },
  {
    id: "admin",
    role: "System Administrator",
    title: "System Admin Portal",
    description: "Platform operations center, user role provisioning, and system auditing.",
    href: "/login?role=admin",
    buttonText: "Continue as Admin",
    icon: ShieldCheck,
    accentColor: "border-[#0b1c30] text-[#0b1c30] hover:border-[#2563eb]",
    badgeBg: "bg-[#f1f5f9] text-[#0b1c30] border-[#cbd5e1]",
    badgeText: "Admin Portal",
    features: [
      "Platform KPI analytics, enrollment trends & stats",
      "User directory & access control provisioning",
      "Content moderation reports & system audit logs",
    ],
  },
];

export default function PortalPage() {
  return (
    <div
      data-component="PortalPage"
      className="portal__container_01 min-h-[calc(100vh-8rem)] bg-[#f8f9ff] py-14 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center"
    >
      <div className="portal__content_01 max-w-6xl w-full mx-auto space-y-10">
        {/* Section Header */}
        <div className="portal__header_01 flex flex-col items-center text-center space-y-3">
          <h1 className="portal__title_01 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Select EduPulse Workspace
          </h1>
          <p className="portal__description_01 text-sm sm:text-base text-[#434655] max-w-xl">
            Please choose the appropriate portal for your role to begin your workflow.
          </p>
        </div>

        {/* 3 Portal Cards Grid */}
        <div className="portal__grid_01 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                data-testid={`portal-card-${portal.id}`}
                className="portal__card_01 group relative bg-white border border-[#e2e8f0] rounded-[20px] p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Section */}
                <div className="portal__card-top_01 space-y-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`portal__card-icon_01 h-12 w-12 rounded-2xl flex items-center justify-center ${portal.badgeBg} border shadow-xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`portal__badge_01 text-[11px] font-bold px-2.5 py-1 rounded-full border ${portal.badgeBg}`}
                    >
                      {portal.badgeText}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="portal__card-title_01 font-display text-xl font-bold text-[#0b1c30] group-hover:text-[#2563eb] transition-colors">
                      {portal.title}
                    </h2>
                    <p className="portal__card-desc_01 text-xs text-[#737686] leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <ul className="portal__features-list_01 space-y-2.5 pt-2 border-t border-[#f1f5f9]">
                    {portal.features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className="portal__feature-item_01 flex items-start gap-2 text-xs text-[#434655]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] mt-1.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Button */}
                <div className="portal__card-bottom_01 pt-6 mt-6 border-t border-[#f1f5f9]">
                  <Link
                    href={portal.href}
                    className={`portal__action-btn_01 inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-xs group-hover:shadow-md cursor-pointer ${
                      portal.id === "learner"
                        ? "bg-[#2563eb] hover:bg-[#1d4ed8]"
                        : portal.id === "instructor"
                        ? "bg-[#006a61] hover:bg-[#004d44]"
                        : "bg-[#0b1c30] hover:bg-[#1e293b]"
                    }`}
                  >
                    <span>{portal.buttonText}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

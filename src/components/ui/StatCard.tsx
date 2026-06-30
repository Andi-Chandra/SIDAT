"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string; positive: boolean };
  color?: "indigo" | "teal" | "purple" | "amber" | "rose";
  className?: string;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-500/10",
    icon: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20",
    trend: "text-indigo-400",
    trendBg: "bg-indigo-500/10 border border-indigo-500/20",
  },
  teal: {
    bg: "bg-teal-500/10",
    icon: "bg-teal-500/20 text-teal-400 border border-teal-500/20",
    trend: "text-teal-400",
    trendBg: "bg-teal-500/10 border border-teal-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    icon: "bg-purple-500/20 text-purple-400 border border-purple-500/20",
    trend: "text-purple-400",
    trendBg: "bg-purple-500/10 border border-purple-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "bg-amber-500/20 text-amber-400 border border-amber-500/20",
    trend: "text-amber-400",
    trendBg: "bg-amber-500/10 border border-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    icon: "bg-rose-500/20 text-rose-400 border border-rose-500/20",
    trend: "text-rose-400",
    trendBg: "bg-rose-500/10 border border-rose-500/20",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "indigo",
  className,
}: StatCardProps) {
  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={cn(
        "bento-card relative overflow-hidden p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="font-heading text-sm font-medium text-zinc-400 mb-1">
            {title}
          </p>
          <p className="font-mono text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            {value}
          </p>
          
          {subtitle && (
            <p className="font-mono text-xs text-zinc-400 bg-zinc-800/50 inline-block px-2 py-1 rounded-md border border-zinc-800">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={cn(
                  "font-mono text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center",
                  trend.positive 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                )}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-zinc-500">{trend.label}</span>
            </div>
          )}
        </div>
        
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
            colors.icon
          )}
        >
          {icon}
        </div>
      </div>
      
      {/* Decorative background circle */}
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none", colors.bg)} />
    </div>
  );
}

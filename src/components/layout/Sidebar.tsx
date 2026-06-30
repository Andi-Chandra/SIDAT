"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  Building2,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarProps {
  role: "admin" | "staff";
  userName: string;
  jabatan: string;
}

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/upload", label: "Upload Surat", icon: Upload },
  { href: "/admin/surat", label: "Semua Surat", icon: FileText },
  { href: "/admin/ahp", label: "Penilaian Kinerja", icon: TrendingUp },
  { href: "/admin/staf", label: "Manajemen Staf", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

const staffNavItems: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/disposisi", label: "Disposisi Saya", icon: FileText },
  { href: "/staff/pengaturan", label: "Pengaturan", icon: Settings },
];

export function Sidebar({ role, userName, jabatan }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBadge = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (role === 'admin') {
         const { count } = await supabase.from('disposisi').select('*', { count: 'exact', head: true }).eq('status', 'pending');
         setBadgeCount(count || 0);
      } else {
         const { count } = await supabase.from('disposisi').select('*', { count: 'exact', head: true }).eq('staff_id', user.id).eq('status', 'pending');
         setBadgeCount(count || 0);
      }
    };
    fetchBadge();
  }, [role, supabase]);

  const baseNavItems = role === "admin" ? adminNavItems : staffNavItems;
  const navItems = baseNavItems.map(item => {
    if (item.label === "Semua Surat" || item.label === "Disposisi Saya") {
      return { ...item, badge: badgeCount !== null && badgeCount > 0 ? badgeCount : undefined };
    }
    return item;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex sidebar h-screen flex-col transition-all duration-300 relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Building2 size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <p className="text-sm font-bold text-white truncate">SIDAT</p>
              <p className="text-[10px] text-slate-400 truncate">PPS Belawan</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="mx-4 mt-4 mb-2">
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-1 rounded-md",
                role === "admin"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/20"
                  : "bg-teal-500/20 text-teal-300 border border-teal-500/20"
              )}
            >
              {role === "admin" ? "🛡️ Admin" : "👤 Staff"}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-item",
                  isActive && "active",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors",
              collapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{jabatan}</p>
              </div>
            )}
            {!collapsed && (
              <Link href="/login" title="Logout">
                <LogOut size={14} className="text-slate-500 hover:text-red-400 transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50 flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px] transition-all",
                isActive ? "text-teal-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="relative">
                <Icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500/90 text-white text-[9px] font-bold flex items-center justify-center border border-slate-900 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-teal-500/30 transition-all">
          <Bell size={16} className="text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 notification-dot" />
        </button>
        {/* Date */}
        <div className="glass px-3 py-2 rounded-xl">
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "short", day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>
    </header>
  );
}

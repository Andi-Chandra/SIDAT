"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";

export function LiveNotification() {
  const [isVisible, setIsVisible] = useState(true);

  // In a real app, this would be tied to Pusher/SSE
  if (!isVisible) return null;

  return (
    <div className="w-full mb-6 bento-card p-4 border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-900/20 to-zinc-900 relative overflow-hidden flex items-center justify-between shadow-lg shadow-indigo-500/5">
      <div className="flex items-center gap-4 z-10 relative">
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 rounded-full animate-ping-soft bg-indigo-500 opacity-30"></div>
          <div className="relative bg-indigo-600 text-white p-2 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Bell size={18} />
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white text-sm md:text-base">Live Updates Aktif</h4>
          <p className="text-xs text-zinc-400">Menerima disposisi surat secara real-time</p>
        </div>
      </div>
      <div className="flex items-center gap-4 z-10">
        <span className="badge-info flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
          <span className="font-mono tracking-tight text-indigo-300">Terhubung</span>
        </span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 p-1 rounded-full transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

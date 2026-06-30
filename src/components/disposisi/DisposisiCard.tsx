"use client";

import React from "react";
import Link from "next/link";
import { FileText, Calendar, User, ChevronRight, Clock, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { DisposisiData } from "@/lib/types";
import { getDisposisiStatus } from "@/lib/utils";

interface DisposisiCardProps {
  data: DisposisiData;
  viewAs: "admin" | "staff";
  staffName?: string;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

function StatusIcon({ status }: { status: "pending" | "completed" }) {
  if (status === "completed") {
    return <CheckCircle2 size={14} className="text-emerald-400" />;
  }
  return <Clock size={14} className="text-amber-400" />;
}

export function DisposisiCard({ data, viewAs, staffName, onDelete }: DisposisiCardProps) {
  const pendingCount = data.penerima.filter((p) => p.status === "pending").length;
  const completedCount = data.penerima.filter((p) => p.status === "completed").length;
  const totalCount = data.penerima.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const basePath = viewAs === "admin" ? "/admin/surat" : "/staff/disposisi";

  return (
    <Link href={`${basePath}/${data.id}`} className="block">
      <div className="card p-6 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
              <FileText size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] text-indigo-300/60 font-semibold uppercase tracking-widest mb-0.5">{data.nomor_surat}</p>
              <div className="flex items-center gap-2">
                <SifatBadge sifat={data.sifat} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              {getDisposisiStatus(data) === "pending" ? (
                <span className="text-[11px] font-bold tracking-wide text-amber-400 uppercase">Pending</span>
              ) : (
                <span className="text-[11px] font-bold tracking-wide text-emerald-400 uppercase">Selesai</span>
              )}
              <ChevronRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            {onDelete && (
              <button 
                onClick={(e) => onDelete(data.id, e)}
                className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                title="Hapus Surat"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Hal */}
        <p className="text-base font-bold tracking-wide text-white leading-relaxed line-clamp-2 mb-4 group-hover:text-indigo-100 transition-colors">
          {data.hal}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Diterima: {formatDate(data.tanggal_diterima)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{data.dari}</span>
          </div>
        </div>

        {/* Penerima list (for admin view) */}
        {viewAs === "admin" && (
          <div className="space-y-1.5 mb-4">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Penerima Disposisi ({totalCount})
            </p>
            {data.penerima.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <StatusIcon status={p.status} />
                <span className="text-xs text-slate-400">{p.nama}</span>
              </div>
            ))}
            {data.penerima.length > 3 && (
              <p className="text-[11px] text-slate-600">
                +{data.penerima.length - 3} lainnya
              </p>
            )}
          </div>
        )}

        {/* Staff view: show only this staff's status */}
        {viewAs === "staff" && staffName && (
          <div className="flex items-center gap-2 mb-4">
            <StatusIcon status={data.penerima.find(p => p.nama === staffName)?.status || "pending"} />
            <span className="text-xs text-slate-400">
              {data.penerima.find(p => p.nama === staffName)?.status === "completed"
                ? "Tindak lanjut sudah diunggah"
                : "Menunggu tindak lanjut"}
            </span>
          </div>
        )}

        {/* Progress bar (admin only) */}
        {viewAs === "admin" && (
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Progress</span>
              <span>{completedCount}/{totalCount} selesai</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function SifatBadge({ sifat }: { sifat: string }) {
  const sifatConfig: Record<string, string> = {
    "Biasa": "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase",
    "Segera": "bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase",
    "Rahasia": "bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase",
    "Sangat Rahasia": "bg-red-900/40 text-red-300 border border-red-700/50 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase",
  };

  return (
    <span className={sifatConfig[sifat] || sifatConfig["Biasa"]}>
      {sifat}
    </span>
  );
}

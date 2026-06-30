"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { MOCK_DISPOSISI } from "@/lib/types";
import { formatDate, formatDateTime, getDisposisiStatus } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Tag,
  Hash,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Building2,
  Bookmark,
  ListChecks,
  Bot,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSuratDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserName(JSON.parse(user).name);
  }, []);

  const data = MOCK_DISPOSISI.find((d) => d.id === params.id);

  if (!data) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Surat tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  const completedCount = data.penerima.filter((p) => p.status === "completed").length;
  const totalCount = data.penerima.length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Detail Surat Disposisi" subtitle={data.nomor_surat} />
        <div className="flex-1 overflow-y-auto p-6">
          {/* Back button + actions */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <div className="flex gap-2">
              <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                <Download size={14} />
                Unduh PDF
              </button>
              <button className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                <Edit3 size={14} />
                Edit Data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main detail */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header card */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                      <FileText size={22} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Lembar Disposisi</p>
                      <h1 className="text-lg font-bold text-white">
                        PPS Belawan
                      </h1>
                    </div>
                  </div>
                  <span className={getDisposisiStatus(data) === "pending" ? "badge-pending" : "badge-completed"}>
                    {getDisposisiStatus(data) === "pending" ? "⏳ Pending" : "✅ Selesai"}
                  </span>
                </div>

                {/* Hal */}
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 mb-5">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    Hal / Perihal
                  </p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {data.hal}
                  </p>
                </div>

                {/* Key fields grid */}
                <div className="grid grid-cols-2 gap-3">
                  <DetailField icon={<Calendar size={14} />} label="Tanggal Diterima" value={formatDate(data.tanggal_diterima)} highlight />
                  <DetailField icon={<Tag size={14} />} label="Nomor Surat" value={data.nomor_surat} mono />
                  <DetailField icon={<Calendar size={14} />} label="Tanggal Surat" value={formatDate(data.tanggal_surat)} />
                  <DetailField icon={<Bookmark size={14} />} label="Sifat" value={data.sifat} />
                  <DetailField icon={<Hash size={14} />} label="Untuk" value={data.untuk || "-"} />
                  <DetailField icon={<Hash size={14} />} label="No. Agenda" value={data.no_agenda} mono />
                  <DetailField icon={<Tag size={14} />} label="Kode" value={data.kode || "-"} />
                  <DetailField icon={<Building2 size={14} />} label="Dari" value={data.dari} />
                </div>
              </div>

              {/* Instruksi */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ListChecks size={16} className="text-teal-400" />
                  Instruksi Disposisi
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.instruksi.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
                        item.checked
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                          : "bg-white/2 border-white/5 text-slate-600"
                      )}
                    >
                      {item.checked ? (
                        <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-sm border border-white/10 flex-shrink-0" />
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel: Penerima */}
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Users size={15} className="text-teal-400" />
                  Penerima Disposisi
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  {completedCount}/{totalCount} sudah menindaklanjuti
                </p>

                {/* Progress */}
                <div className="progress-bar mb-4">
                  <div
                    className="progress-fill"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {data.penerima.map((p, idx) => (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        p.status === "completed"
                          ? "bg-teal-500/8 border-teal-500/15"
                          : "bg-white/3 border-white/5"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400/30 to-teal-400/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-300">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {p.nama}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.status === "completed" ? (
                            <>
                              <CheckCircle2 size={10} className="text-teal-400" />
                              <span className="text-[10px] text-teal-400">Selesai</span>
                            </>
                          ) : (
                            <>
                              <Clock size={10} className="text-amber-400" />
                              <span className="text-[10px] text-amber-400">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={p.status === "pending" ? "badge-pending" : "badge-completed"}>
                          {p.status === "pending" ? "Pending" : "Done"}
                        </span>
                        {p.status === "completed" && (
                          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-semibold text-indigo-300">
                            <Bot size={10} /> AI Score: 4.5 <Star size={10} className="fill-indigo-300 ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Riwayat</h3>
                <div className="space-y-3">
                  <TimelineItem
                    title="Surat diterima"
                    desc={formatDate(data.tanggal_diterima)}
                    icon="📥"
                    active
                  />
                  <TimelineItem
                    title="Data diekstraksi"
                    desc="OCR Parsing berhasil"
                    icon="🤖"
                    active
                  />
                  <TimelineItem
                    title="Disposisi didistribusikan"
                    desc={`${totalCount} staf penerima`}
                    icon="📤"
                    active
                  />
                  <TimelineItem
                    title="Tindak lanjut selesai"
                    desc={getDisposisiStatus(data) === "completed" ? "Semua selesai" : "Menunggu..."}
                    icon="✅"
                    active={getDisposisiStatus(data) === "completed"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailField({
  icon, label, value, mono, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "p-3 rounded-xl",
      highlight ? "bg-blue-500/8 border border-blue-500/10" : "bg-white/2 border border-white/5"
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-slate-500">{icon}</span>
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn(
        "text-sm font-medium",
        highlight ? "text-blue-200" : "text-white",
        mono && "font-mono text-xs"
      )}>
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  title, desc, icon, active,
}: {
  title: string; desc: string; icon: string; active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5",
        active ? "bg-teal-500/20" : "bg-white/5"
      )}>
        {icon}
      </div>
      <div>
        <p className={cn("text-xs font-semibold", active ? "text-white" : "text-slate-600")}>{title}</p>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

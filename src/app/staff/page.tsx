"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { DisposisiCard } from "@/components/disposisi/DisposisiCard";
import { LiveNotification } from "@/components/layout/LiveNotification";
import { MOCK_DISPOSISI, MOCK_STAFF } from "@/lib/types";
import {
  FileText,
  Clock,
  CheckCircle,
  Upload,
  ArrowRight,
  Bell,
} from "lucide-react";
import Link from "next/link";

// Current staff (Suci Pratiwi Fahrina Siagian) - from login
const CURRENT_STAFF = "Suci Pratiwi Fahrina Siagian";

export default function StaffDashboard() {
  const [userName, setUserName] = useState("Staf");
  const [staffName, setStaffName] = useState(CURRENT_STAFF);
  const [statusAbsen, setStatusAbsen] = useState<string | null>(null);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const u = JSON.parse(user);
      setUserName(u.name);
      setStaffName(u.name);
    }
  }, []);

  const staffProfile = MOCK_STAFF.find(s => s.full_name === staffName);
  const divisi = staffProfile?.divisi || "Pendataan";

  // Filter only disposisi where this staff is a receiver
  const myDisposisi = MOCK_DISPOSISI.filter((d) =>
    d.penerima.some((p) => p.nama === staffName)
  );

  const pendingCount = myDisposisi.filter(
    (d) => d.penerima.find((p) => p.nama === staffName)?.status === "pending"
  ).length;

  const completedCount = myDisposisi.filter(
    (d) => d.penerima.find((p) => p.nama === staffName)?.status === "completed"
  ).length;

  const recentDisposisi = myDisposisi.slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar role="staff" userName={userName} jabatan="Staf Administrasi" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="Dashboard Staf"
          subtitle={`Selamat datang, ${userName}!`}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <LiveNotification />

            {/* Absensi Apel Card (Bento Style) */}
            <div className="bento-card p-6 md:p-8 mb-6 relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
              <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] text-white pointer-events-none">
                <CheckCircle size={200} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-xl font-bold text-white">Laporan Kehadiran (Apel Pagi)</h3>
                  <span className="font-mono text-sm font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 hidden sm:inline-block">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mb-6 sm:hidden">
                  {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                
                {statusAbsen ? (
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                      <CheckCircle size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-heading text-base font-bold text-emerald-300 mb-1">Terima kasih, Anda sudah absen hari ini</p>
                      <p className="text-sm text-emerald-500">Status tercatat: <span className="font-mono font-bold bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/30">{statusAbsen}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                    {(divisi === "Operasional" ? [
                      { label: "Hadir", icon: "✅", color: "bg-zinc-900 border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Cuti tahunan", icon: "🌴", color: "bg-zinc-900 border-zinc-800 hover:border-blue-500 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Dinas luar", icon: "💼", color: "bg-zinc-900 border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Off", icon: "🛌", color: "bg-zinc-900 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Telat", icon: "⏰", color: "bg-zinc-900 border-zinc-800 hover:border-amber-500 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                    ] : [
                      { label: "Hadir di apel", icon: "✅", color: "bg-zinc-900 border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Hadir di lapangan", icon: "🏃", color: "bg-zinc-900 border-zinc-800 hover:border-blue-500 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Cuti", icon: "🌴", color: "bg-zinc-900 border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Off", icon: "🛌", color: "bg-zinc-900 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Telat", icon: "⏰", color: "bg-zinc-900 border-zinc-800 hover:border-amber-500 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                    ]).map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => setStatusAbsen(btn.label)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:-translate-y-1 ${btn.color}`}
                      >
                        <span className="text-3xl grayscale-[0.5] hover:grayscale-0 transition-all">{btn.icon}</span>
                        <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8 bg-zinc-900 border border-zinc-800 shadow-lg text-white">
              <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none">
                <div className="absolute right-6 top-3 w-32 h-32 rounded-full bg-indigo-500 blur-3xl" />
                <div className="absolute right-14 bottom-3 w-20 h-20 rounded-full bg-blue-400 blur-2xl" />
              </div>
              <div className="relative z-10">
                <p className="text-zinc-400 font-semibold mb-2 uppercase tracking-wider text-xs md:text-sm">
                  Halo, {userName} 👋
                </p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                  Tugas Disposisi Anda
                </h2>
                <p className="text-zinc-300 text-sm md:text-base max-w-lg">
                  Anda memiliki{" "}
                  <span className="font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-bold text-sm border border-amber-500/30 mx-1">{pendingCount} disposisi</span>{" "}
                  yang memerlukan tindak lanjut segera.
                </p>
              </div>
              {pendingCount > 0 && (
                <Link
                  href="/staff/disposisi"
                  className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white text-sm font-bold shadow-[0_4px_15px_rgba(79,70,229,0.4)] transition-all"
                >
                  <Upload size={16} />
                  Mulai Tindak Lanjut
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
              <StatCard
                title="Total Disposisi"
                value={myDisposisi.length}
                subtitle="Diterima"
                icon={<FileText size={24} />}
                color="indigo"
              />
              <StatCard
                title="Menunggu"
                value={pendingCount}
                subtitle="Perlu tindak lanjut"
                icon={<Clock size={24} />}
                color="amber"
              />
              <StatCard
                title="Selesai"
                value={completedCount}
                subtitle="Sudah diunggah"
                icon={<CheckCircle size={24} />}
                color="teal"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent disposisi */}
              <div className="lg:col-span-2">
                <div className="bento-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-lg font-bold text-white">
                      Disposisi Terbaru
                    </h3>
                    <Link
                      href="/staff/disposisi"
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg"
                    >
                      Lihat semua <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentDisposisi.length > 0 ? (
                      recentDisposisi.map((d) => (
                        <DisposisiCard
                          key={d.id}
                          data={d}
                          viewAs="staff"
                          staffName={staffName}
                        />
                      ))
                    ) : (
                      <div className="border border-dashed border-zinc-800 rounded-2xl p-10 text-center bg-zinc-900/50">
                        <FileText size={40} className="text-zinc-600 mx-auto mb-4" />
                        <p className="font-heading text-base font-bold text-zinc-300 mb-1">Tidak Ada Tugas</p>
                        <p className="text-sm text-zinc-500">
                          Belum ada surat disposisi yang ditugaskan kepada Anda.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Notifications & Guide */}
              <div className="space-y-6">
                <div className="bento-card p-6 border-t-4 border-t-amber-500 shadow-[0_-5px_15px_-5px_rgba(245,158,11,0.1)]">
                  <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Bell size={18} className="text-amber-400" />
                    Pemberitahuan
                  </h3>
                  <div className="space-y-3">
                    {myDisposisi
                      .filter((d) => d.penerima.find((p) => p.nama === staffName)?.status === "pending")
                      .map((d) => (
                        <Link key={d.id} href={`/staff/disposisi/${d.id}`}>
                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group">
                            <div className="flex items-start gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                              <div>
                                <p className="text-sm font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                                  {d.hal}
                                </p>
                                <p className="text-[11px] font-mono font-medium text-amber-400 bg-amber-500/10 inline-block px-1.5 py-0.5 rounded mt-2 border border-amber-500/20">
                                  Tenggat Waktu Mendesak
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    {pendingCount === 0 && (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                          <CheckCircle size={24} className="text-emerald-400" />
                        </div>
                        <p className="font-heading font-bold text-zinc-200 text-sm">Semua Selesai</p>
                        <p className="text-xs text-zinc-500 mt-1">Anda tidak memiliki tunggakan tugas.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panduan */}
                <div className="bento-card p-6 bg-indigo-900/10 border-indigo-500/20 shadow-inner">
                  <h3 className="font-heading text-lg font-bold text-indigo-300 mb-4">
                    Panduan Upload
                  </h3>
                  <div className="space-y-4">
                    {[
                      { no: "1", text: "Buka detail surat disposisi yang berstatus Pending." },
                      { no: "2", text: "Klik tombol Tindak Lanjut di bagian bawah form." },
                      { no: "3", text: "Unggah dokumen balasan/bukti berformat PDF atau Gambar." },
                      { no: "4", text: "Status otomatis diperbarui menjadi Selesai." },
                    ].map((step) => (
                      <div key={step.no} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(79,70,229,0.4)]">
                          {step.no}
                        </div>
                        <p className="text-sm text-indigo-200/80 font-medium leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

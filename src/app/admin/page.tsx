"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { DisposisiCard } from "@/components/disposisi/DisposisiCard";
import { LiveNotification } from "@/components/layout/LiveNotification";
import { getDisposisiStatus } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  Upload,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function PollBar({ label, count, total, icon, color }: { label: string, count: number, total: number, icon: string, color: string }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <span className="text-sm">{icon}</span> {label}
        </span>
        <span className="font-mono font-bold text-white">{count}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [userName, setUserName] = useState("Admin");
  
  const [stats, setStats] = useState({ totalSurat: 0, pendingCount: 0, completedCount: 0, totalPenerima: 0 });
  const [recentDisposisi, setRecentDisposisi] = useState<any[]>([]);
  const [pendingDisposisi, setPendingDisposisi] = useState<any[]>([]);

  const [statusAbsen, setStatusAbsen] = useState<string | null>(null);
  const [absensiId, setAbsensiId] = useState<string | null>(null);
  const [isSavingAbsen, setIsSavingAbsen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [opsStats, setOpsStats] = useState({ total: 0, stats: { "Hadir": 0, "Cuti tahunan": 0, "Dinas luar": 0, "Off": 0, "Telat": 0, "Belum": 0 } as any });
  const [dataStats, setDataStats] = useState({ total: 0, stats: { "Hadir di apel": 0, "Hadir di lapangan": 0, "Cuti": 0, "Off": 0, "Telat": 0, "Belum": 0 } as any });

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      setUserName(JSON.parse(user).name);
    }
    
    const fetchDashboardData = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const today = new Date().toLocaleDateString('en-CA');
        const { data: absenData } = await supabase
          .from('absensi')
          .select('*')
          .eq('staff_id', user.id)
          .eq('tanggal', today)
          .single();
          
        if (absenData) {
          setStatusAbsen(absenData.status);
          setAbsensiId(absenData.id);
        }
      }
      
      const { data: disposisiData } = await supabase.from('disposisi').select('status, id, surat_id');
      const pendingCount = disposisiData?.filter(d => d.status === 'pending').length || 0;
      const completedCount = disposisiData?.filter(d => d.status === 'completed').length || 0;
      const totalPenerima = disposisiData?.length || 0;
      
      const { count: totalSurat } = await supabase.from('surat_masuk').select('*', { count: 'exact', head: true });
      
      setStats({
        totalSurat: totalSurat || 0,
        pendingCount,
        completedCount,
        totalPenerima
      });
      
      const { data: recentSurat } = await supabase.from('surat_masuk').select(`
        *,
        disposisi (
          id, status, catatan_instruksi,
          profiles ( id, full_name, jabatan )
        )
      `).order('created_at', { ascending: false }).limit(3);
      
      if (recentSurat) {
        const formatted = recentSurat.map((item: any) => {
          const penerima = item.disposisi ? item.disposisi.map((d: any) => ({
            id: d.profiles?.id || d.id,
            nama: d.profiles?.full_name || 'Unknown',
            status: d.status
          })) : [];
          const allCompleted = penerima.length > 0 && penerima.every((p: any) => p.status === 'completed');
          return {
            id: item.id,
            nomor_surat: item.nomor_surat,
            judul_surat: item.judul_surat,
            hal: item.judul_surat,
            tanggal_surat: item.tanggal_surat,
            tanggal_diterima: item.tanggal_diterima || item.tanggal_surat,
            sifat: item.sifat || 'Biasa',
            penerima,
            status: allCompleted ? 'completed' : 'pending',
            created_at: item.created_at
          };
        });
        setRecentDisposisi(formatted);
        setPendingDisposisi(formatted.filter(f => f.status === 'pending').slice(0, 4));
      }

      // Fetch dynamic Absensi stats
      const today = new Date().toLocaleDateString('en-CA');
      const { data: staffList } = await supabase.from('profiles').select('id, divisi').eq('role', 'staff');
      const { data: absenList } = await supabase.from('absensi').select('staff_id, status').eq('tanggal', today);
      
      if (staffList) {
        const opsStaff = staffList.filter(s => s.divisi === 'Operasional');
        const dataStaff = staffList.filter(s => s.divisi === 'Pendataan' || !s.divisi); // Default to pendataan
        
        const calcStats = (staffArr: any[], isOps: boolean) => {
          const result = isOps 
            ? { "Hadir": 0, "Cuti tahunan": 0, "Dinas luar": 0, "Off": 0, "Telat": 0, "Belum": 0 } as any
            : { "Hadir di apel": 0, "Hadir di lapangan": 0, "Cuti": 0, "Off": 0, "Telat": 0, "Belum": 0 } as any;
            
          let belum = 0;
          
          staffArr.forEach(stf => {
            const absen = absenList?.find(a => a.staff_id === stf.id);
            if (!absen) {
              belum++;
            } else {
              // Try to map status exactly, or fallback to similar
              if (result[absen.status] !== undefined) {
                result[absen.status]++;
              } else if (absen.status.includes('Hadir')) {
                const hadirk = isOps ? 'Hadir' : 'Hadir di apel';
                result[hadirk]++;
              } else if (absen.status.includes('Cuti')) {
                const cutik = isOps ? 'Cuti tahunan' : 'Cuti';
                result[cutik]++;
              } else {
                // If totally unmatched, add to 'Belum' or 'Hadir' just to be safe, but let's say 'Belum'
                belum++;
              }
            }
          });
          
          result["Belum"] = belum;
          return { total: staffArr.length, stats: result };
        };

        setOpsStats(calcStats(opsStaff, true));
        setDataStats(calcStats(dataStaff, false));
      }
    };
    fetchDashboardData();
  }, [refreshKey]);

  const { totalSurat, pendingCount, completedCount, totalPenerima } = stats;

  const handleAbsenClick = async (status: string) => {
    if (isSavingAbsen) return;
    setIsSavingAbsen(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toLocaleDateString('en-CA');
      const timeNow = new Date().toLocaleTimeString('en-GB', { hour12: false }).substring(0,5) + ":00";

      if (absensiId) {
        const { error } = await supabase
          .from('absensi')
          .update({ status, waktu_absen: timeNow })
          .eq('id', absensiId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('absensi')
          .insert({
            staff_id: user.id,
            tanggal: today,
            status,
            waktu_absen: timeNow
          })
          .select('id')
          .single();
        if (error) throw error;
        if (data) setAbsensiId(data.id);
      }
      // Kita TIDAK memanggil setStatusAbsen di sini, 
      // melainkan setRefreshKey() agar useEffect mem-fetch ulang data terbaru dari DB
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
      alert("Gagal menyimpan absensi: " + error.message);
    } finally {
      setIsSavingAbsen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="Dashboard Admin"
          subtitle="Selamat datang kembali! Berikut ringkasan disposisi hari ini."
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <LiveNotification />

            {/* Absensi Apel Card for Admin */}
            <div className="bento-card p-6 md:p-8 mb-6 relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
              <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] text-white pointer-events-none">
                <CheckCircle size={200} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-xl font-bold text-white">Laporan Kehadiran (Apel Pagi) Anda</h3>
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
                    <button 
                      onClick={() => setStatusAbsen(null)} 
                      className="ml-auto text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                    {[
                      { label: "Hadir", icon: "✅", color: "bg-zinc-900 border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Cuti tahunan", icon: "🌴", color: "bg-zinc-900 border-zinc-800 hover:border-blue-500 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Dinas luar", icon: "💼", color: "bg-zinc-900 border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Off", icon: "🛌", color: "bg-zinc-900 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                      { label: "Telat", icon: "⏰", color: "bg-zinc-900 border-zinc-800 hover:border-amber-500 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleAbsenClick(btn.label)}
                        disabled={isSavingAbsen}
                        className={`flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] hover:-translate-y-1 ${btn.color} ${isSavingAbsen ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-3xl grayscale-[0.5] hover:grayscale-0 transition-all">{btn.icon}</span>
                        <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Welcome banner (Bento Style) */}
            <div className="relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8 bg-indigo-600/20 border border-indigo-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.4)] text-white">
              <div className="absolute right-0 top-0 w-64 h-full opacity-30 pointer-events-none">
                <div className="absolute right-8 top-4 w-32 h-32 rounded-full bg-indigo-500 blur-[60px]" />
                <div className="absolute right-16 bottom-4 w-24 h-24 rounded-full bg-indigo-400 blur-[40px]" />
              </div>
              <div className="relative z-10">
                <p className="text-indigo-300 font-semibold mb-2 uppercase tracking-wider text-xs md:text-sm">
                  Halo, {userName} 👋
                </p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </h2>
                <p className="text-indigo-200 text-sm md:text-base max-w-lg">
                  Terdapat{" "}
                  <span className="font-mono bg-indigo-500/30 text-indigo-100 px-2 py-0.5 rounded-md border border-indigo-500/50 font-bold text-sm mx-1">{pendingCount} surat</span>{" "}
                  yang belum selesai ditindaklanjuti pada sistem.
                </p>
              </div>
              <Link
                href="/admin/upload"
                className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-100 items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm"
              >
                <Upload size={18} />
                Upload Surat Baru
              </Link>
            </div>

            {/* Stats (Bento Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <StatCard
                title="Total Surat"
                value={totalSurat}
                subtitle="Bulan ini"
                icon={<FileText size={24} />}
                color="indigo"
              />
              <StatCard
                title="Pending"
                value={pendingCount}
                subtitle="Belum selesai"
                icon={<Clock size={24} />}
                color="amber"
              />
              <StatCard
                title="Selesai"
                value={completedCount}
                subtitle="Tindak lanjut"
                icon={<CheckCircle size={24} />}
                color="teal"
              />
              <StatCard
                title="Penerima"
                value={totalPenerima}
                subtitle="Disposisi aktif"
                icon={<Users size={24} />}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                
                {/* Recent disposisi */}
                <div className="bento-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-lg font-bold text-white">Surat Terbaru</h3>
                    <Link
                      href="/admin/surat"
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg"
                    >
                      Lihat semua <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentDisposisi.map((d) => (
                      <DisposisiCard key={d.id} data={d} viewAs="admin" />
                    ))}
                  </div>
                </div>

                {/* Laporan Apel (Admin View) */}
                <div className="bento-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-lg font-bold text-white">Laporan Kehadiran</h3>
                    <div className="flex items-center gap-3">
                      <Link 
                        href="/admin/absensi" 
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg"
                      >
                        Detail Absensi <ArrowRight size={14} />
                      </Link>
                      <span className="font-mono text-xs font-semibold text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 hidden sm:block">
                        {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Operasional */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 shadow-inner">
                      <h4 className="font-heading text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div> Seksi Operasional
                      </h4>
                      <div className="space-y-4">
                        <PollBar label="Hadir" count={opsStats.stats["Hadir"]} total={opsStats.total} icon="✅" color="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <PollBar label="Cuti tahunan" count={opsStats.stats["Cuti tahunan"]} total={opsStats.total} icon="🌴" color="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <PollBar label="Dinas luar" count={opsStats.stats["Dinas luar"]} total={opsStats.total} icon="💼" color="bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <PollBar label="Off" count={opsStats.stats["Off"]} total={opsStats.total} icon="🛌" color="bg-zinc-500" />
                        <PollBar label="Telat" count={opsStats.stats["Telat"]} total={opsStats.total} icon="⏰" color="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        {opsStats.stats["Belum"] > 0 && (
                          <p className="text-[10px] text-zinc-500 mt-2 text-right font-mono font-medium">{opsStats.stats["Belum"]} staf belum absen</p>
                        )}
                      </div>
                    </div>

                    {/* Pendataan */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 shadow-inner">
                      <h4 className="font-heading text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div> Seksi Pendataan
                      </h4>
                      <div className="space-y-4">
                        <PollBar label="Hadir di apel" count={dataStats.stats["Hadir di apel"]} total={dataStats.total} icon="✅" color="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <PollBar label="Hadir di lapangan" count={dataStats.stats["Hadir di lapangan"]} total={dataStats.total} icon="🏃" color="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <PollBar label="Cuti" count={dataStats.stats["Cuti"]} total={dataStats.total} icon="🌴" color="bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <PollBar label="Off" count={dataStats.stats["Off"]} total={dataStats.total} icon="🛌" color="bg-zinc-500" />
                        <PollBar label="Telat" count={dataStats.stats["Telat"]} total={dataStats.total} icon="⏰" color="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        {dataStats.stats["Belum"] > 0 && (
                          <p className="text-[10px] text-zinc-500 mt-2 text-right font-mono font-medium">{dataStats.stats["Belum"]} staf belum absen</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column / Sidebar panel */}
              <div className="space-y-6">
                
                {/* Quick actions */}
                <div className="bento-card p-6 border-t-4 border-t-indigo-500 shadow-[0_-5px_15px_-5px_rgba(99,102,241,0.15)]">
                  <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-indigo-400" /> Aksi Cepat
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/admin/upload"
                      className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200 group-hover:text-white">Upload PDF Baru</p>
                        <p className="text-[11px] text-zinc-500">Mulai ekstraksi surat</p>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                    
                    <Link
                      href="/admin/staf"
                      className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200 group-hover:text-white">Manajemen Staf</p>
                        <p className="text-[11px] text-zinc-500">Kelola akses pengguna</p>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>

                {/* Status summary */}
                <div className="bento-card p-6">
                  <h3 className="font-heading text-lg font-bold text-white mb-5">
                    Rasio Penyelesaian
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-zinc-400">Selesai Ditindaklanjuti</span>
                        <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 rounded-md border border-emerald-500/20">
                          {totalSurat > 0 ? Math.round((completedCount / totalSurat) * 100) : 0}%
                        </span>
                      </div>
                      <div className="progress-bar bg-zinc-800 h-3 rounded-full border border-zinc-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                          style={{ width: `${totalSurat > 0 ? (completedCount / totalSurat) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-zinc-400">Status Pending</span>
                        <span className="text-amber-400 font-mono font-bold bg-amber-500/10 px-2 rounded-md border border-amber-500/20">
                          {totalSurat > 0 ? Math.round((pendingCount / totalSurat) * 100) : 0}%
                        </span>
                      </div>
                      <div className="progress-bar bg-zinc-800 h-3 rounded-full border border-zinc-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                          style={{ width: `${totalSurat > 0 ? (pendingCount / totalSurat) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mini list of pending staf */}
                  <div className="mt-6 pt-5 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 font-bold mb-3 uppercase tracking-wider">
                      Perhatian Khusus (Pending)
                    </p>
                    <div className="space-y-2">
                      {pendingDisposisi
                        .map((d) => {
                          return (
                            <Link key={d.id} href={`/admin/surat/${d.id}`}>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <Clock size={14} />
                                  </div>
                                  <div>
                                    <p className="font-mono text-xs font-bold text-zinc-300 group-hover:text-amber-400 transition-colors">
                                      {d.nomor_surat}
                                    </p>
                                    <p className="text-[10px] font-mono text-zinc-500">
                                      {d.penerima.filter((p: any) => p.status === "completed").length} dari {d.penerima.length} selesai
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight size={14} className="text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                              </div>
                            </Link>
                          );
                        })}
                    </div>
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

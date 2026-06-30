"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { DisposisiCard } from "@/components/disposisi/DisposisiCard";
import { DisposisiData, InstruksiItem } from "@/lib/types";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { cn, getDisposisiStatus } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type FilterStatus = "all" | "pending" | "completed";

export default function AdminSuratPage() {
  const [userName, setUserName] = useState("Admin");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const [suratList, setSuratList] = useState<DisposisiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserName(JSON.parse(user).name);
    
    fetchSurat();
  }, []);

  const fetchSurat = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('surat_masuk')
      .select(`
        *,
        disposisi (
          id, status, catatan_instruksi,
          profiles (
            id, full_name, jabatan
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching surat:", error);
    } else if (data) {
      const formatted: DisposisiData[] = data.map((item: any) => {
        // Map Supabase data to DisposisiData interface
        const penerima = item.disposisi ? item.disposisi.map((d: any) => ({
          id: d.profiles?.id || d.id,
          nama: d.profiles?.full_name || 'Unknown',
          jabatan: d.profiles?.jabatan || '',
          status: d.status
        })) : [];

        // Determine overall status
        const allCompleted = penerima.length > 0 && penerima.every((p: any) => p.status === 'completed');
        
        // Handle instruksi parsing (might be string or object from JSONB)
        let instruksi = item.instruksi;
        if (typeof instruksi === 'string') {
          try { instruksi = JSON.parse(instruksi); } catch(e) {}
        }
        if (!Array.isArray(instruksi)) instruksi = [];

        return {
          id: item.id,
          nomor_surat: item.nomor_surat,
          judul_surat: item.judul_surat,
          hal: item.judul_surat, // hal maps to judul_surat
          tanggal_surat: item.tanggal_surat,
          tanggal_diterima: item.tanggal_diterima || item.tanggal_surat,
          sifat: item.sifat || 'Biasa',
          untuk: item.untuk || '-',
          no_agenda: item.no_agenda || '-',
          kode: item.kode || '-',
          dari: item.dari || '-',
          lampiran: item.lampiran || '-',
          instruksi: instruksi as InstruksiItem[],
          penerima: penerima,
          status: allCompleted ? 'completed' : 'pending',
          file_url: item.file_url_asli,
          created_at: item.created_at
        };
      });
      setSuratList(formatted);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus surat disposisi ini? Tindakan ini tidak dapat dibatalkan (termasuk menghapus disposisi terkait).")) {
      // Optimistic UI update
      setSuratList(prev => prev.filter(s => s.id !== id));
      
      const { error } = await supabase
        .from('surat_masuk')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting surat:", error);
        alert("Gagal menghapus surat: " + error.message);
        fetchSurat(); // Revert on failure
      }
    }
  };

  const filtered = suratList.filter((d) => {
    const matchSearch =
      d.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
      d.hal.toLowerCase().includes(search.toLowerCase()) ||
      d.dari.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || getDisposisiStatus(d) === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Semua Surat Disposisi" subtitle="Kelola dan pantau seluruh surat masuk" />
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor surat, perihal, atau pengirim..."
                className="input-field pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "completed"] as FilterStatus[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                    filter === f
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/25"
                      : "bg-white/5 text-slate-500 border border-white/5 hover:bg-white/8 hover:text-slate-300"
                  )}
                >
                  {f === "all" ? "Semua" : f === "pending" ? "Pending" : "Selesai"}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {filtered.length} surat ditemukan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 py-16 text-center text-slate-500">
                <Loader2 size={32} className="mx-auto mb-3 opacity-50 animate-spin" />
                <p className="text-sm">Memuat data dari database...</p>
              </div>
            ) : (
              <>
                {filtered.map((d) => (
                  <DisposisiCard key={d.id} data={d} viewAs="admin" onDelete={handleDelete} />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-3 py-16 text-center text-slate-600">
                    <Search size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Tidak ada surat yang cocok dengan pencarian</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

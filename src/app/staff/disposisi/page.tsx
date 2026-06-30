"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { DisposisiCard } from "@/components/disposisi/DisposisiCard";
import { DisposisiData, InstruksiItem } from "@/lib/types";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type FilterStatus = "all" | "pending" | "completed";

export default function StaffDisposisiPage() {
  const [userName, setUserName] = useState("Staf");
  const [staffName, setStaffName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  
  const [disposisiList, setDisposisiList] = useState<DisposisiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUserDataAndDisposisi();
  }, []);

  const fetchUserDataAndDisposisi = async () => {
    setIsLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Get user profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      setUserName(profile.full_name);
      setStaffName(profile.full_name);
    }

    // Fetch disposisi assigned to this staff
    const { data, error } = await supabase
      .from('disposisi')
      .select(`
        id, status, catatan_instruksi, created_at,
        surat_masuk (*)
      `)
      .eq('staff_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching disposisi:", error);
    } else if (data) {
      const formatted: DisposisiData[] = data.map((item: any) => {
        const surat = item.surat_masuk;
        
        let instruksi = surat?.instruksi;
        if (typeof instruksi === 'string') {
          try { instruksi = JSON.parse(instruksi); } catch(e) {}
        }
        if (!Array.isArray(instruksi)) instruksi = [];

        return {
          id: item.id, // Using disposisi ID here for unique keys
          nomor_surat: surat?.nomor_surat || '-',
          judul_surat: surat?.judul_surat || '-',
          hal: surat?.judul_surat || '-', 
          tanggal_surat: surat?.tanggal_surat || '-',
          tanggal_diterima: surat?.tanggal_diterima || surat?.tanggal_surat,
          sifat: surat?.sifat || 'Biasa',
          untuk: surat?.untuk || '-',
          no_agenda: surat?.no_agenda || '-',
          kode: surat?.kode || '-',
          dari: surat?.dari || '-',
          lampiran: surat?.lampiran || '-',
          instruksi: instruksi as InstruksiItem[],
          penerima: [{ // Mocking the penerima array for the card
            id: user.id,
            nama: profile?.full_name || 'Staff',
            status: item.status
          }],
          status: item.status,
          file_url: surat?.file_url_asli,
          created_at: item.created_at
        };
      });
      setDisposisiList(formatted);
    }
    setIsLoading(false);
  };

  const filtered = disposisiList.filter((d) => {
    const matchSearch =
      d.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
      d.hal.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || d.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar role="staff" userName={userName} jabatan="Staf Administrasi" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="Disposisi Saya"
          subtitle="Daftar surat disposisi yang ditujukan kepada Anda"
        />
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor surat atau perihal..."
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
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/25"
                      : "bg-white/5 text-slate-500 border border-white/5 hover:bg-white/8 hover:text-slate-300"
                  )}
                >
                  {f === "all" ? "Semua" : f === "pending" ? "Pending" : "Selesai"}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-3">{filtered.length} disposisi ditemukan</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 py-16 text-center text-slate-500">
                <Loader2 size={32} className="mx-auto mb-3 opacity-50 animate-spin" />
                <p className="text-sm">Memuat data dari database...</p>
              </div>
            ) : (
              <>
                {filtered.map((d) => (
                  <DisposisiCard
                    key={d.id}
                    data={d}
                    viewAs="staff"
                    staffName={staffName}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 py-16 text-center text-slate-600">
                    <Search size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Tidak ada disposisi yang ditemukan</p>
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

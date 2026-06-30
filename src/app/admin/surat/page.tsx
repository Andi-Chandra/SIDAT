"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { DisposisiCard } from "@/components/disposisi/DisposisiCard";
import { MOCK_DISPOSISI } from "@/lib/types";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { cn, getDisposisiStatus } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "completed";

export default function AdminSuratPage() {
  const [userName, setUserName] = useState("Admin");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const [suratList, setSuratList] = useState(MOCK_DISPOSISI);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserName(JSON.parse(user).name);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus surat disposisi ini? Tindakan ini tidak dapat dibatalkan.")) {
      setSuratList(prev => prev.filter(s => s.id !== id));
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
            {filtered.map((d) => (
              <DisposisiCard key={d.id} data={d} viewAs="admin" onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center text-slate-600">
                <Search size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Tidak ada surat yang cocok dengan pencarian</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

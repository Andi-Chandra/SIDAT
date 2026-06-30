"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { DisposisiCard } from "@/components/disposisi/DisposisiCard";
import { MOCK_DISPOSISI } from "@/lib/types";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "completed";

export default function StaffDisposisiPage() {
  const [userName, setUserName] = useState("Staf");
  const [staffName, setStaffName] = useState("Suci Pratiwi Fahrina Siagian");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const u = JSON.parse(user);
      setUserName(u.name);
      setStaffName(u.name);
    }
  }, []);

  const myDisposisi = MOCK_DISPOSISI.filter((d) =>
    d.penerima.some((p) => p.nama === staffName)
  );

  const filtered = myDisposisi.filter((d) => {
    const myStatus = d.penerima.find((p) => p.nama === staffName)?.status;
    const matchSearch =
      d.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
      d.hal.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || myStatus === filter;
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
          </div>
        </div>
      </main>
    </div>
  );
}

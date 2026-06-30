"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { StaffProfile } from "@/lib/types";
import { Users, Plus, Mail, Shield, User, Edit, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function AdminStafPage() {
  const [userName, setUserName] = useState("Admin");
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserName(JSON.parse(user).name);

    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Error fetching staff:", error);
    } else if (data) {
      setStaffList(data.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        jabatan: p.jabatan || '-',
        email: p.nip || 'NIP/Email tidak tersedia', // Fallback to NIP since email is in auth
        role: p.role as 'admin' | 'staff'
      })));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Manajemen Staf" subtitle="Kelola akun pengguna staf penerima disposisi" />
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header action */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-400">
              {staffList.length} staf terdaftar
            </p>
            <button className="btn-primary flex items-center gap-2 text-sm py-2.5">
              <Plus size={15} />
              Tambah Staf Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 py-16 text-center text-slate-500">
                <Loader2 size={32} className="mx-auto mb-3 opacity-50 animate-spin" />
                <p className="text-sm">Memuat data staf dari database...</p>
              </div>
            ) : (
              staffList.map((staff) => (
                <div key={staff.id} className="card p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/30 to-teal-500/30 flex items-center justify-center">
                      <span className="text-base font-bold text-white">
                        {staff.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {staff.full_name}
                      </p>
                      <p className="text-xs text-slate-500">{staff.jabatan}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                      <Edit size={12} className="text-slate-500 hover:text-blue-400" />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                      <Trash2 size={12} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={12} />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} />
                    <span className="badge-info">{staff.role}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Disposisi aktif</span>
                    <span className="font-semibold text-amber-400">
                      {Math.floor(Math.random() * 3)} pending
                    </span>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </main>
    </div>
  );
}

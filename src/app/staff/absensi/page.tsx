"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { AbsensiList } from "@/components/absensi/AbsensiList";
import { createClient } from "@/lib/supabase/client";

export default function StaffAbsensiPage() {
  const [userName, setUserName] = useState("Staff");
  const [userId, setUserId] = useState("");
  const [jabatan, setJabatan] = useState("");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name);
      setUserId(parsed.id);
      
      const fetchJabatan = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('profiles').select('jabatan').eq('id', parsed.id).single();
        if (data && data.jabatan) setJabatan(data.jabatan);
      };
      fetchJabatan();
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar role="staff" userName={userName} jabatan={jabatan} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="Daftar Absensi"
          subtitle="Lihat data kehadiran seluruh staf hari ini"
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {userId && (
              <AbsensiList currentUserRole="staff" currentUserId={userId} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

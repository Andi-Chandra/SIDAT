"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { AbsensiList } from "@/components/absensi/AbsensiList";
import { createClient } from "@/lib/supabase/client";

export default function AdminAbsensiPage() {
  const [userName, setUserName] = useState("Admin");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile) setUserName(profile.full_name);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="Daftar Absensi"
          subtitle="Pantau dan kelola data absensi seluruh staf hari ini"
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {userId && (
              <AbsensiList currentUserRole="admin" currentUserId={userId} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

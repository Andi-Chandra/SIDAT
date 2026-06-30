"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { AbsensiList } from "@/components/absensi/AbsensiList";

export default function AdminAbsensiPage() {
  const [userName, setUserName] = useState("Admin");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name);
      setUserId(parsed.id);
    }
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

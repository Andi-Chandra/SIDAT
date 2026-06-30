"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Clock, CalendarDays, Edit3, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface AbsensiRecord {
  id?: string;
  staff_id: string;
  staff_name: string;
  jabatan: string;
  tanggal: string;
  status: string;
  waktu_absen: string;
}

interface AbsensiListProps {
  currentUserRole: "admin" | "staff";
  currentUserId: string;
}

const STATUS_OPTIONS = [
  "Hadir", 
  "Hadir di apel",
  "Telat", 
  "Sakit", 
  "Izin", 
  "Cuti tahunan", 
  "Dinas luar", 
  "Off",
  "Belum Absen"
];

export function AbsensiList({ currentUserRole, currentUserId }: AbsensiListProps) {
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  const fetchAbsensi = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all staff
      const { data: staffData } = await supabase
        .from('profiles')
        .select('id, full_name, jabatan, role')
        .order('full_name');

      if (!staffData) return;

      // 2. Fetch today's attendance for all staff
      const { data: absenData } = await supabase
        .from('absensi')
        .select('*')
        .eq('tanggal', today);

      // 3. Merge data
      const merged: AbsensiRecord[] = staffData.map(staff => {
        const absen = absenData?.find(a => a.staff_id === staff.id);
        return {
          id: absen?.id,
          staff_id: staff.id,
          staff_name: staff.full_name,
          jabatan: staff.jabatan || '-',
          tanggal: absen?.tanggal || today,
          status: absen?.status || 'Belum Absen',
          waktu_absen: absen?.waktu_absen ? absen.waktu_absen.substring(0, 5) : '-',
        };
      });

      setRecords(merged);
    } catch (error) {
      console.error("Error fetching absensi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi();
  }, []);

  const handleEditClick = (record: AbsensiRecord) => {
    setEditingId(record.staff_id);
    setEditStatus(record.status);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditStatus("");
  };

  const handleSave = async (staffId: string) => {
    setIsSaving(true);
    try {
      const existingRecord = records.find(r => r.staff_id === staffId);
      const timeNow = new Date().toLocaleTimeString('en-GB', { hour12: false }).substring(0,5) + ":00";

      if (existingRecord?.id) {
        // Update
        const { error } = await supabase
          .from('absensi')
          .update({ status: editStatus, waktu_absen: timeNow })
          .eq('id', existingRecord.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('absensi')
          .insert({
            staff_id: staffId,
            tanggal: today,
            status: editStatus,
            waktu_absen: timeNow
          });
        if (error) throw error;
      }

      await fetchAbsensi();
      setEditingId(null);
    } catch (error: any) {
      console.error("Error saving absensi:", error);
      alert("Gagal menyimpan absensi: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Hadir")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (status === "Telat") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (status === "Belum Absen") return "bg-zinc-800 text-zinc-400 border-zinc-700";
    return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"; // Sakit, Izin, Cuti, dll
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-400" />
            Daftar Kehadiran Hari Ini
          </h2>
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="badge-success">
            {records.filter(r => r.status.includes('Hadir')).length} Hadir
          </div>
          <div className="badge-warning">
            {records.filter(r => r.status === 'Telat').length} Telat
          </div>
          <div className="px-2 py-1 rounded-md text-xs font-bold border bg-zinc-800 text-zinc-400 border-zinc-700">
            {records.filter(r => r.status === 'Belum Absen').length} Belum
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400 border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-4 py-3 font-semibold text-slate-300 rounded-tl-xl">No</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Nama Staf</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Jabatan</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Waktu Absen</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-300 rounded-tr-xl text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
                  <p>Memuat data absensi...</p>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p>Tidak ada data staf.</p>
                </td>
              </tr>
            ) : (
              records.map((record, index) => {
                const canEdit = currentUserRole === 'admin' || currentUserId === record.staff_id;
                const isEditing = editingId === record.staff_id;

                return (
                  <tr key={record.staff_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{record.staff_name}</td>
                    <td className="px-4 py-3">{record.jabatan}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {record.waktu_absen !== '-' ? (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-500" />
                          {record.waktu_absen}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select 
                          className="input-field py-1 px-2 text-xs" 
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ background: '#1e293b' }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={cn("px-2 py-1 rounded-md text-[11px] font-bold border", getStatusColor(record.status))}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <button 
                            onClick={() => handleSave(record.staff_id)}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 transition-colors"
                          >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          </button>
                        </div>
                      ) : (
                        canEdit && (
                          <button 
                            onClick={() => handleEditClick(record)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-slate-500 transition-colors"
                            title="Edit Absensi"
                          >
                            <Edit3 size={14} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

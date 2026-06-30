"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { MOCK_DISPOSISI } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { UploadZone } from "@/components/disposisi/UploadZone";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Tag,
  Hash,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  Bookmark,
  Building2,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffDisposisiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [userName, setUserName] = useState("Staf");
  const [staffName, setStaffName] = useState("Suci Pratiwi Fahrina Siagian");
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [myStatus, setMyStatus] = useState<"pending" | "completed">("pending");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const u = JSON.parse(user);
      setUserName(u.name);
      setStaffName(u.name);
    }
  }, []);

  const data = MOCK_DISPOSISI.find((d) => d.id === params.id);

  useEffect(() => {
    if (data) {
      const me = data.penerima.find((p) => p.nama === staffName);
      if (me) setMyStatus(me.status);
    }
  }, [data, staffName]);

  if (!data) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="staff" userName={userName} jabatan="Staf Administrasi" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Disposisi tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  const handleFileSelected = (file: File) => {
    setUploadFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 2500));
    setUploading(false);
    setUploadDone(true);
    setMyStatus("completed");
  };

  const isPending = myStatus === "pending";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="staff" userName={userName} jabatan="Staf Administrasi" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Detail Disposisi" subtitle={data.nomor_surat} />
        <div className="flex-1 overflow-y-auto p-6">
          {/* Back button */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
              <Download size={14} />
              Unduh Surat Asli
            </button>
          </div>

          {/* My status banner */}
          {isPending ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Disposisi ini menunggu tindak lanjut Anda
                </p>
                <p className="text-xs text-amber-400/70">
                  Silakan unggah dokumen bukti tindak lanjut di bawah ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-5">
              <CheckCircle2 size={18} className="text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-teal-300">
                  Tindak lanjut sudah diunggah
                </p>
                <p className="text-xs text-teal-400/70">
                  Disposisi ini telah ditindaklanjuti.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Surat detail */}
            <div className="lg:col-span-2 space-y-5">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Lembar Disposisi</p>
                    <h2 className="text-base font-bold text-white">PPS Belawan</h2>
                  </div>
                  <span className={cn(
                    "ml-auto",
                    myStatus === "pending" ? "badge-pending" : "badge-completed"
                  )}>
                    {myStatus === "pending" ? "⏳ Pending" : "✅ Selesai"}
                  </span>
                </div>

                {/* Hal */}
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 mb-5">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    Hal / Perihal
                  </p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {data.hal}
                  </p>
                </div>

                {/* Data grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Tanggal Diterima" value={formatDate(data.tanggal_diterima)} icon={<Calendar size={13} />} highlight />
                  <InfoField label="Nomor Surat" value={data.nomor_surat} icon={<Tag size={13} />} mono />
                  <InfoField label="Tanggal Surat" value={formatDate(data.tanggal_surat)} icon={<Calendar size={13} />} />
                  <InfoField label="Sifat" value={data.sifat} icon={<Bookmark size={13} />} />
                  <InfoField label="Untuk" value={data.untuk || "-"} icon={<Hash size={13} />} />
                  <InfoField label="No. Agenda" value={data.no_agenda} icon={<Hash size={13} />} mono />
                  <InfoField label="Kode" value={data.kode || "-"} icon={<Tag size={13} />} />
                  <InfoField label="Dari" value={data.dari} icon={<Building2 size={13} />} />
                </div>
              </div>

              {/* Instruksi */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ListChecks size={16} className="text-teal-400" />
                  Instruksi untuk Anda
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.instruksi.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
                        item.checked
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                          : "bg-white/2 border-white/5 text-slate-600"
                      )}
                    >
                      {item.checked ? (
                        <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-sm border border-white/10 flex-shrink-0" />
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Upload tindak lanjut */}
            <div className="space-y-4">
              {isPending && !uploadDone && (
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Upload size={15} className="text-teal-400" />
                    Upload Tindak Lanjut
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Unggah dokumen bukti tindak lanjut Anda (PDF, DOCX, atau gambar).
                  </p>

                  <UploadZone
                    onFileSelected={handleFileSelected}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    maxSize={10 * 1024 * 1024}
                    label="Drop file di sini atau klik untuk memilih"
                    sublabel="PDF, DOCX, JPG, PNG (maks. 10MB)"
                  />

                  {uploadFile && (
                    <button
                      id="btn-upload-tl"
                      onClick={handleUploadSubmit}
                      disabled={uploading}
                      className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2 text-sm"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload size={15} />
                          Konfirmasi Upload
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {(uploadDone || myStatus === "completed") && (
                <div className="card p-5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/15 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={28} className="text-teal-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Tindak Lanjut Diunggah!
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Dokumen bukti tindak lanjut berhasil disimpan. Status disposisi ini telah berubah menjadi <strong className="text-teal-400">Selesai</strong>.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white/3 border border-white/5 text-xs text-slate-500">
                    📄 {uploadFile?.name || "dokumen-balasan.pdf"}
                  </div>
                </div>
              )}

              {/* Status all penerima */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Status Semua Penerima
                </h3>
                <div className="space-y-2">
                  {data.penerima.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border",
                        p.nama === staffName
                          ? "border-blue-500/20 bg-blue-500/8"
                          : "border-white/5 bg-white/2"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400/25 to-teal-400/25 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-300">
                          {p.nama.charAt(0)}
                        </span>
                      </div>
                      <span className={cn(
                        "text-xs flex-1 truncate",
                        p.nama === staffName ? "text-blue-300 font-semibold" : "text-slate-400"
                      )}>
                        {p.nama}
                        {p.nama === staffName && (
                          <span className="ml-1 text-[10px] text-slate-500">(Anda)</span>
                        )}
                      </span>
                      {(p.status === "completed" || (p.nama === staffName && myStatus === "completed")) ? (
                        <CheckCircle2 size={13} className="text-teal-400" />
                      ) : (
                        <Clock size={13} className="text-amber-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoField({
  label, value, icon, mono, highlight,
}: {
  label: string; value: string; icon?: React.ReactNode; mono?: boolean; highlight?: boolean;
}) {
  return (
    <div className={cn(
      "p-3 rounded-xl",
      highlight ? "bg-blue-500/8 border border-blue-500/10" : "bg-white/2 border border-white/5"
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn(
        "text-sm font-medium",
        highlight ? "text-blue-200" : "text-white",
        mono && "font-mono text-[11px]"
      )}>
        {value}
      </p>
    </div>
  );
}

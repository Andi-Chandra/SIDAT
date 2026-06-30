"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, TopBar } from "@/components/layout/Sidebar";
import { UploadZone } from "@/components/disposisi/UploadZone";
import {
  FileText,
  Loader2,
  CheckCircle2,
  Edit3,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  User,
} from "lucide-react";
import { INSTRUKSI_OPTIONS, MOCK_STAFF, type DisposisiData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Mock OCR result matching the sample PDF
const MOCK_OCR_RESULT: Partial<DisposisiData> = {
  tanggal_diterima: "2026-06-22",
  nomor_surat: "B.2383/DJPT.4/PI.310/VI/2026",
  tanggal_surat: "2026-06-19",
  sifat: "Biasa",
  untuk: "-",
  hal: "Penyampaian Hasil Evaluasi Kinerja Operasional Pelabuhan Perikanan Periode Triwulan I Tahun 2026",
  no_agenda: "0311000000/332881/2026",
  kode: "",
  dari: "Direktur Kepelabuhanan Perikanan",
  lampiran: "-",
  instruksi: [
    { id: "1", label: "Info", checked: true },
    { id: "2", label: "Aksi", checked: true },
    { id: "3", label: "Jadwalkan/agendakan", checked: false },
    { id: "4", label: "Siapkan bahan", checked: false },
    { id: "5", label: "Beri saran", checked: false },
    { id: "6", label: "Harap mewakili", checked: false },
    { id: "7", label: "Hadir bersama saya", checked: false },
    { id: "8", label: "Untuk dipelajari", checked: true },
  ],
  penerima: [
    { id: "p1", nama: "Nursaidah", status: "pending" },
    { id: "p2", nama: "Suci Pratiwi Fahrina Siagian", status: "pending" },
    { id: "p3", nama: "Andi Candra", status: "pending" },
    { id: "p4", nama: "Dedi Surbakti", status: "pending" },
  ],
};

type Step = "upload" | "parsing" | "review" | "saving" | "done";

interface FormData {
  tanggal_diterima: string;
  nomor_surat: string;
  tanggal_surat: string;
  sifat: string;
  untuk: string;
  hal: string;
  no_agenda: string;
  kode: string;
  dari: string;
  lampiran: string;
  instruksi: Array<{ id: string; label: string; checked: boolean }>;
  penerima: Array<{ id: string; nama: string; status: string }>;
}

export default function UploadPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");
  const [step, setStep] = useState<Step>("upload");
  const [parseProgress, setParseProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState<FormData>({
    tanggal_diterima: "",
    nomor_surat: "",
    tanggal_surat: "",
    sifat: "",
    untuk: "",
    hal: "",
    no_agenda: "",
    kode: "",
    dari: "",
    lampiran: "",
    instruksi: INSTRUKSI_OPTIONS.map((label, i) => ({
      id: String(i + 1),
      label,
      checked: false,
    })),
    penerima: [],
  });
  const [newPenerimaName, setNewPenerimaName] = useState("");
  const [saveProgress, setSaveProgress] = useState(0);

  const [dbStaff, setDbStaff] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) setUserName(JSON.parse(user).name);

    const fetchStaff = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'staff');
      if (data) setDbStaff(data);
    };
    fetchStaff();
  }, []);

  const handleFileSelected = async (file: File) => {
    setFileName(file.name);
    setStep("parsing");
    setParseProgress(0);

    try {
      // Create FormData to send the file
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      // Start the progress animation while the request is running
      const progressInterval = setInterval(() => {
        setParseProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      // Call the real extraction API
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setParseProgress(100);

      if (!response.ok) {
        throw new Error("Gagal mengekstrak dokumen");
      }

      const ocr = await response.json();

      // Find staff matches from dbStaff based on the extracted names
      // Ensure it maps to the correct ID if found, otherwise keep as custom
      const mappedPenerima = (ocr.penerima || []).map((nama: string, idx: number) => {
        const existingStaff = dbStaff.find(
          (s) => s.full_name.toLowerCase() === nama.toLowerCase()
        );
        return {
          id: existingStaff ? existingStaff.id : `custom-${Date.now()}-${idx}`,
          nama: existingStaff ? existingStaff.full_name : nama,
          status: "pending",
        };
      });

      // Populate form with real OCR result
      setFormData({
        tanggal_diterima: formData.tanggal_diterima || new Date().toISOString().split('T')[0],
        nomor_surat: ocr.nomorSurat || "",
        tanggal_surat: ocr.tanggalSurat || "",
        sifat: "Biasa", // Default
        untuk: "", // Default
        hal: ocr.perihal || "",
        no_agenda: "",
        kode: "",
        dari: "",
        lampiran: "",
        instruksi: INSTRUKSI_OPTIONS.map((label, i) => {
          const instruksiExtracted = (ocr.instruksi || "").toLowerCase();
          return { 
            id: String(i + 1), 
            label, 
            checked: instruksiExtracted.includes(label.toLowerCase()) 
          };
        }),
        penerima: mappedPenerima,
      });

      await new Promise((r) => setTimeout(r, 400));
      setStep("review");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses PDF menggunakan AI.");
      setStep("upload");
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInstruksiToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      instruksi: prev.instruksi.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleAddPenerima = () => {
    if (!newPenerimaName.trim()) return;
    const existing = dbStaff.find(s => s.full_name.toLowerCase() === newPenerimaName.trim().toLowerCase());
    setFormData((prev) => ({
      ...prev,
      penerima: [
        ...prev.penerima,
        { id: existing ? existing.id : `custom-${Date.now()}`, nama: newPenerimaName.trim(), status: "pending" },
      ],
    }));
    setNewPenerimaName("");
  };

  const handleRemovePenerima = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      penerima: prev.penerima.filter((p) => p.id !== id),
    }));
  };

  const handleSave = async () => {
    setStep("saving");
    setSaveProgress(20);

    const suratData = {
      tanggal_diterima: formData.tanggal_diterima || null,
      nomor_surat: formData.nomor_surat || '-',
      tanggal_surat: formData.tanggal_surat || new Date().toISOString().split('T')[0],
      sifat: formData.sifat || 'Biasa',
      untuk: formData.untuk || '-',
      judul_surat: formData.hal || 'Tanpa Perihal',
      no_agenda: formData.no_agenda || '-',
      kode: formData.kode || '-',
      dari: formData.dari || '-',
      lampiran: formData.lampiran || '-',
      instruksi: formData.instruksi,
      file_url_asli: "uploaded_file.pdf", // Placeholder
    };

    const { data: surat, error: suratError } = await supabase
      .from('surat_masuk')
      .insert(suratData)
      .select('id')
      .single();

    if (suratError) {
      console.error(suratError);
      alert("Gagal menyimpan surat: " + suratError.message);
      setStep("review");
      return;
    }

    setSaveProgress(60);

    if (formData.penerima.length > 0) {
      const disposisiData = formData.penerima.map(p => ({
        surat_id: surat.id,
        staff_id: p.id.startsWith('custom-') || p.id.startsWith('p') ? null : p.id,
        catatan_instruksi: null, // can be added later if needed
      }));

      const { error: dispError } = await supabase
        .from('disposisi')
        .insert(disposisiData);

      if (dispError) {
        console.error(dispError);
        alert("Gagal menyimpan disposisi: " + dispError.message);
      }
    }

    setSaveProgress(100);
    await new Promise((r) => setTimeout(r, 400));
    setStep("done");
  };

  const SIFAT_OPTIONS = ["Biasa", "Segera", "Sangat Segera", "Rahasia", "Sangat Rahasia"];

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar role="admin" userName={userName} jabatan="Sekretaris" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="Upload & Parsing Surat"
          subtitle="Unggah PDF surat disposisi untuk diekstraksi secara otomatis"
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {(["upload", "parsing", "review", "done"] as const).map((s, i) => {
              const labels = ["Upload", "Parsing", "Review", "Selesai"];
              const current = ["upload", "parsing", "review", "saving", "done"].indexOf(step);
              const thisIdx = i;
              const isDone = current > thisIdx || step === "done";
              const isActive = step === s || (step === "saving" && s === "review");
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isDone
                          ? "bg-teal-500 text-white"
                          : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-white/10 text-slate-500"
                      )}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium hidden sm:block",
                        isDone
                          ? "text-teal-400"
                          : isActive
                          ? "text-white"
                          : "text-slate-600"
                      )}
                    >
                      {labels[i]}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={cn(
                        "flex-1 h-px transition-colors",
                        current > thisIdx ? "bg-teal-500/40" : "bg-white/5"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step: Upload */}
          {step === "upload" && (
            <div className="max-w-2xl mx-auto slide-in">
              <div className="card p-6">
                <h2 className="text-lg font-bold text-white mb-2">
                  Upload File PDF Surat Disposisi
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Sistem akan membaca dan mengekstraksi data secara otomatis menggunakan AI Parser.
                </p>
                <UploadZone onFileSelected={handleFileSelected} />

                <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-400" /> Field yang akan diekstraksi:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                    {["Tanggal Diterima", "Nomor Surat", "Tanggal Surat", "Sifat", "Untuk", "Hal / Perihal", "No. Agenda", "Kode", "Nama Penerima", "Instruksi Disposisi"].map((f) => (
                      <div key={f} className="flex items-center gap-1">
                        <ChevronRight size={10} className="text-teal-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Parsing */}
          {step === "parsing" && (
            <div className="max-w-md mx-auto slide-in">
              <div className="card p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-500/15 flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={36} className="text-blue-400 animate-spin" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Sedang Memproses PDF</h2>
                <p className="text-slate-400 text-sm mb-6">
                  AI Parser sedang membaca dan mengekstrak data dari{" "}
                  <span className="text-blue-400">{fileName}</span>
                </p>
                <div className="progress-bar mb-2">
                  <div
                    className="progress-fill transition-all duration-500"
                    style={{ width: `${parseProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{parseProgress}% selesai</p>

                <div className="mt-6 space-y-2">
                  {["Membaca struktur PDF", "Menjalankan OCR Engine", "Mapping field data", "Identifikasi penerima"].map((t, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg text-left",
                      parseProgress >= (i + 1) * 25
                        ? "text-teal-400 bg-teal-500/10"
                        : "text-slate-600 bg-white/3"
                    )}>
                      {parseProgress >= (i + 1) * 25 ? (
                        <CheckCircle2 size={12} className="text-teal-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-700" />
                      )}
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Review Form */}
          {(step === "review" || step === "saving") && (
            <div className="max-w-4xl mx-auto slide-in">
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">
                  Data di bawah ini diekstraksi secara otomatis. Periksa dan edit jika ada kesalahan sebelum menyimpan.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main form */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="card p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-blue-400" /> Data Surat Utama
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        label="Tanggal Diterima"
                        required
                        hint="Field 1"
                      >
                        <input
                          id="tanggal_diterima"
                          type="date"
                          value={formData.tanggal_diterima}
                          onChange={(e) => handleFieldChange("tanggal_diterima", e.target.value)}
                          className="input-field"
                        />
                      </FormField>

                      <FormField label="Nomor Surat" required hint="Field 2">
                        <input
                          id="nomor_surat"
                          type="text"
                          value={formData.nomor_surat}
                          onChange={(e) => handleFieldChange("nomor_surat", e.target.value)}
                          className="input-field font-mono text-xs"
                        />
                      </FormField>

                      <FormField label="Tanggal Surat" required hint="Field 3">
                        <input
                          id="tanggal_surat"
                          type="date"
                          value={formData.tanggal_surat}
                          onChange={(e) => handleFieldChange("tanggal_surat", e.target.value)}
                          className="input-field"
                        />
                      </FormField>

                      <FormField label="Sifat" required hint="Field 4">
                        <select
                          id="sifat"
                          value={formData.sifat}
                          onChange={(e) => handleFieldChange("sifat", e.target.value)}
                          className="input-field"
                        >
                          {SIFAT_OPTIONS.map((s) => (
                            <option key={s} value={s} style={{ background: "#1e293b" }}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Untuk" hint="Field 5">
                        <input
                          id="untuk"
                          type="text"
                          value={formData.untuk}
                          onChange={(e) => handleFieldChange("untuk", e.target.value)}
                          className="input-field"
                        />
                      </FormField>

                      <FormField label="No. Agenda" required hint="Field 7">
                        <input
                          id="no_agenda"
                          type="text"
                          value={formData.no_agenda}
                          onChange={(e) => handleFieldChange("no_agenda", e.target.value)}
                          className="input-field font-mono text-xs"
                        />
                      </FormField>

                      <FormField label="Kode" hint="Field 8">
                        <input
                          id="kode"
                          type="text"
                          value={formData.kode}
                          onChange={(e) => handleFieldChange("kode", e.target.value)}
                          className="input-field"
                          placeholder="—"
                        />
                      </FormField>

                      <FormField label="Lampiran">
                        <input
                          id="lampiran"
                          type="text"
                          value={formData.lampiran}
                          onChange={(e) => handleFieldChange("lampiran", e.target.value)}
                          className="input-field"
                        />
                      </FormField>
                    </div>

                    <div className="mt-4">
                      <FormField label="Hal / Perihal" required hint="Field 6">
                        <textarea
                          id="hal"
                          value={formData.hal}
                          onChange={(e) => handleFieldChange("hal", e.target.value)}
                          className="input-field resize-none"
                          rows={3}
                        />
                      </FormField>
                    </div>

                    <div className="mt-4">
                      <FormField label="Dari (Pengirim)">
                        <input
                          id="dari"
                          type="text"
                          value={formData.dari}
                          onChange={(e) => handleFieldChange("dari", e.target.value)}
                          className="input-field"
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Instruksi */}
                  <div className="card p-6">
                    <h3 className="text-sm font-bold text-white mb-4">
                      Instruksi Disposisi
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.instruksi.map((item) => (
                        <label
                          key={item.id}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-sm",
                            item.checked
                              ? "bg-blue-500/15 border-blue-500/25 text-blue-300"
                              : "bg-white/3 border-white/5 text-slate-500 hover:border-white/10"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleInstruksiToggle(item.id)}
                            className="w-4 h-4 accent-blue-500"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Penerima panel */}
                <div className="space-y-4">
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <User size={15} className="text-teal-400" /> Nama Penerima
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-4">Field 9 — Staf penerima disposisi</p>

                    <div className="space-y-2 mb-4">
                      {formData.penerima.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-white/3 border border-white/5"
                        >
                          <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-teal-400">
                              {idx + 1}
                            </span>
                          </div>
                          <span className="text-xs text-slate-300 flex-1">{p.nama}</span>
                          <button
                            onClick={() => handleRemovePenerima(p.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      {formData.penerima.length === 0 && (
                        <p className="text-xs text-slate-600 text-center py-3">
                          Belum ada penerima
                        </p>
                      )}
                    </div>

                    {/* Add penerima */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newPenerimaName}
                        onChange={(e) => setNewPenerimaName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddPenerima()}
                        placeholder="Tambah nama penerima..."
                        className="input-field text-sm"
                      />
                      {/* Quick add from staff list */}
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-600 font-semibold">Pilih dari daftar staf:</p>
                        {dbStaff
                          .filter((s) => !formData.penerima.find((p) => p.nama === s.full_name))
                          .map((s) => (
                            <button
                              key={s.id}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  penerima: [
                                    ...prev.penerima,
                                    { id: s.id, nama: s.full_name, status: "pending" },
                                  ],
                                }))
                              }
                              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
                            >
                              <Plus size={11} className="text-teal-500" />
                              {s.full_name}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    id="btn-simpan"
                    onClick={handleSave}
                    disabled={step === "saving"}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm"
                  >
                    {step === "saving" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menyimpan... {saveProgress}%
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan ke Database
                      </>
                    )}
                  </button>

                  {step === "saving" && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill transition-all duration-500"
                        style={{ width: `${saveProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="max-w-md mx-auto slide-in">
              <div className="card p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-teal-500/15 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-teal-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Berhasil Disimpan! 🎉</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Data surat disposisi telah berhasil diekstraksi dan disimpan ke database.
                  Staf penerima telah mendapatkan notifikasi.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setStep("upload");
                      setFormData({
                        tanggal_diterima: "",
                        nomor_surat: "",
                        tanggal_surat: "",
                        sifat: "",
                        untuk: "",
                        hal: "",
                        no_agenda: "",
                        kode: "",
                        dari: "",
                        lampiran: "",
                        instruksi: INSTRUKSI_OPTIONS.map((label, i) => ({ id: String(i + 1), label, checked: false })),
                        penerima: [],
                      });
                    }}
                    className="btn-primary w-full py-3"
                  >
                    Upload Surat Lagi
                  </button>
                  <button
                    onClick={() => router.push("/admin/surat")}
                    className="btn-secondary w-full py-3"
                  >
                    Lihat Semua Surat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FormField({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && (
          <span className="text-[10px] text-slate-600 ml-auto">({hint})</span>
        )}
      </label>
      {children}
    </div>
  );
}

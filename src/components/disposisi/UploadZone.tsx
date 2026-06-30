"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  sublabel?: string;
}

export function UploadZone({
  onFileSelected,
  accept = ".pdf",
  maxSize = 5 * 1024 * 1024,
  label = "Drop file PDF di sini atau klik untuk memilih",
  sublabel = "PDF surat disposisi (maks. 5MB)",
}: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        if (err.code === "file-too-large") {
          setError("File terlalu besar. Maksimal 5MB.");
        } else if (err.code === "file-invalid-type") {
          setError("Hanya file PDF yang diperbolehkan.");
        } else {
          setError("File tidak valid.");
        }
        return;
      }
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize,
    multiple: false,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className="border border-indigo-500/30 rounded-3xl p-6 bg-indigo-500/5 transition-all">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <File size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-white truncate tracking-wide">
              {selectedFile.name}
            </p>
            <p className="text-sm text-indigo-200/60 font-medium mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF Document
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <CheckCircle2 size={20} className="text-indigo-400" />
            <div className="w-px h-8 bg-white/10" />
            <button
              onClick={removeFile}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
            >
              <X size={16} className="text-slate-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "upload-zone",
          isDragActive && "drag-over"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-5">
          <div
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center transition-all",
              isDragActive
                ? "bg-indigo-500/20 scale-110 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                : "bg-white/5 border border-white/5"
            )}
          >
            <Upload
              size={32}
              className={cn(isDragActive ? "text-indigo-400" : "text-slate-400")}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-semibold text-white tracking-wide">{label}</p>
            <p className="text-sm text-slate-400">{sublabel}</p>
          </div>
          {!isDragActive && (
            <button className="btn-primary text-sm px-6 py-2.5 mt-2 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
              Pilih File PDF
            </button>
          )}
          {isDragActive && (
            <p className="text-sm text-indigo-400 font-semibold tracking-wide animate-pulse mt-2">
              Lepaskan file di sini...
            </p>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-xs">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

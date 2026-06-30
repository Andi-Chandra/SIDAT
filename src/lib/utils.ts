import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DisposisiData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const date = new Date(dateString);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/**
 * Global status of a disposition letter is only 'completed' 
 * if ALL of its assigned staff have completed it.
 */
export function getDisposisiStatus(data: DisposisiData): "pending" | "completed" {
  if (!data.penerima || data.penerima.length === 0) return "pending";
  const allCompleted = data.penerima.every(p => p.status === "completed");
  return allCompleted ? "completed" : "pending";
}

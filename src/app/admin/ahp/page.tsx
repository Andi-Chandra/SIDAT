"use client";

import React, { useState, useMemo } from "react";
import { MOCK_STAFF } from "@/lib/types";
import { calculateAHP, normalizeBenefitCriteria, normalizeCostCriteria } from "@/lib/ahp";
import { Trophy, TrendingUp, Settings, Activity, Clock, ShieldCheck, CheckCircle, Info } from "lucide-react";

// K1: Kecepatan Respon (Cost)
// K2: Kualitas AI (Benefit)
// K3: Penyelesaian (Benefit)
// K4: Kedisiplinan (Benefit)

// Default Saaty pairwise matrix (1-9)
// Format: [K1, K2, K3, K4]
const DEFAULT_MATRIX = [
  [1,   2,   3,   4], // K1 vs K1, K2, K3, K4
  [1/2, 1,   2,   3], // K2 vs K1, K2, K3, K4
  [1/3, 1/2, 1,   2], // K3 vs K1, K2, K3, K4
  [1/4, 1/3, 1/2, 1]  // K4 vs K1, K2, K3, K4
];

export default function AHPPage() {
  const [matrix] = useState(DEFAULT_MATRIX);

  const { weights, CR, isConsistent } = useMemo(() => calculateAHP(matrix), [matrix]);

  // Extract raw values for normalization
  const staffs = MOCK_STAFF.filter(s => s.role === "staff" && s.ahpScores);
  
  const k1Raw = staffs.map(s => s.ahpScores!.k1_kecepatan);
  const k2Raw = staffs.map(s => s.ahpScores!.k2_kualitas_ai);
  const k3Raw = staffs.map(s => s.ahpScores!.k3_penyelesaian);
  const k4Raw = staffs.map(s => s.ahpScores!.k4_kedisiplinan);

  // Normalize
  const k1Norm = normalizeCostCriteria(k1Raw);
  const k2Norm = normalizeBenefitCriteria(k2Raw);
  const k3Norm = normalizeBenefitCriteria(k3Raw);
  const k4Norm = normalizeBenefitCriteria(k4Raw);

  // Calculate final score
  const rankedStaffs = staffs.map((staff, idx) => {
    const finalScore = 
      (k1Norm[idx] * weights[0]) +
      (k2Norm[idx] * weights[1]) +
      (k3Norm[idx] * weights[2]) +
      (k4Norm[idx] * weights[3]);
      
    return {
      ...staff,
      scores: {
        k1Norm: k1Norm[idx],
        k2Norm: k2Norm[idx],
        k3Norm: k3Norm[idx],
        k4Norm: k4Norm[idx],
      },
      finalScore
    };
  }).sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="flex-1 overflow-auto h-screen bg-[#09090b] text-white">
      <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="text-indigo-400" /> Evaluasi Kinerja (AHP)
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Sistem Pengambil Keputusan berbasis Analytical Hierarchy Process.</p>
          </div>
          <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Settings size={16} /> Konfigurasi Bobot Kriteria
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Bobot Kriteria */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                <Activity size={16} className="text-teal-400" /> Bobot Kriteria
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">K1: Kecepatan Respon</span>
                    <span className="font-bold text-teal-400">{(weights[0] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${weights[0] * 100}%` }} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">K2: Kualitas AI</span>
                    <span className="font-bold text-blue-400">{(weights[1] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${weights[1] * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">K3: Penyelesaian</span>
                    <span className="font-bold text-indigo-400">{(weights[2] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${weights[2] * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">K4: Kedisiplinan Apel</span>
                    <span className="font-bold text-emerald-400">{(weights[3] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${weights[3] * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className={`mt-6 p-3 rounded-xl border flex items-start gap-3 ${isConsistent ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <Info size={16} className={`shrink-0 mt-0.5 ${isConsistent ? 'text-emerald-400' : 'text-red-400'}`} />
                <div>
                  <p className={`text-xs font-semibold ${isConsistent ? 'text-emerald-300' : 'text-red-300'}`}>
                    Consistency Ratio: {(CR * 100).toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {isConsistent ? "Matriks penilaian sangat konsisten (< 10%)." : "Matriks penilaian tidak konsisten, harap perbaiki bobot antar kriteria."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Board */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Trophy size={20} className="text-amber-400" /> Papan Peringkat Kinerja Staf
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                      <th className="pb-4 font-semibold w-16 text-center">Rank</th>
                      <th className="pb-4 font-semibold">Staf</th>
                      <th className="pb-4 font-semibold text-center">Kecepatan (K1)</th>
                      <th className="pb-4 font-semibold text-center">Kualitas (K2)</th>
                      <th className="pb-4 font-semibold text-center">Selesai (K3)</th>
                      <th className="pb-4 font-semibold text-center">Disiplin (K4)</th>
                      <th className="pb-4 font-semibold text-right">Skor Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rankedStaffs.map((staff, idx) => (
                      <tr key={staff.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 text-center">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm
                            ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 
                              idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-50' :
                              'bg-white/10 text-zinc-400'}`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">
                              {staff.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{staff.full_name}</p>
                              <p className="text-xs text-zinc-500">{staff.divisi}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <p className="text-sm font-medium text-zinc-300">{staff.ahpScores?.k1_kecepatan.toFixed(1)} hr</p>
                          <p className="text-[10px] text-zinc-500">{(staff.scores.k1Norm * 100).toFixed(1)}%</p>
                        </td>
                        <td className="py-4 text-center">
                          <p className="text-sm font-medium text-zinc-300">{staff.ahpScores?.k2_kualitas_ai.toFixed(1)} ★</p>
                          <p className="text-[10px] text-zinc-500">{(staff.scores.k2Norm * 100).toFixed(1)}%</p>
                        </td>
                        <td className="py-4 text-center">
                          <p className="text-sm font-medium text-zinc-300">{staff.ahpScores?.k3_penyelesaian}%</p>
                          <p className="text-[10px] text-zinc-500">{(staff.scores.k3Norm * 100).toFixed(1)}%</p>
                        </td>
                        <td className="py-4 text-center">
                          <p className="text-sm font-medium text-zinc-300">{staff.ahpScores?.k4_kedisiplinan}%</p>
                          <p className="text-[10px] text-zinc-500">{(staff.scores.k4Norm * 100).toFixed(1)}%</p>
                        </td>
                        <td className="py-4 text-right">
                          <p className="text-lg font-bold text-white">{(staff.finalScore * 100).toFixed(2)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

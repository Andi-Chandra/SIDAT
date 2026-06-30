"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Users,
  FileText,
} from "lucide-react";

const MOCK_USERS = [
  { email: "admin@pps-belawan.go.id", password: "admin123", role: "admin", name: "Admin Sekretariat" },
  { email: "suci@pps-belawan.go.id", password: "staff123", role: "staff", name: "Suci Pratiwi Fahrina Siagian" },
  { email: "andi@pps-belawan.go.id", password: "staff123", role: "staff", name: "Andi Candra" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email atau password salah. Coba lagi.");
        setLoading(false);
        return;
      }

      // Check role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role || 'staff';

      // Middleware will handle exact redirect, but we can fast track it here
      router.push(role === "admin" ? "/admin" : "/staff");
      
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const quickLogin = (role: "admin" | "staff") => {
    if (role === "admin") {
      setEmail("admin@pps-belawan.go.id");
      setPassword("admin123"); // Assuming these match supabase auth
    } else {
      setEmail("suci@pps-belawan.go.id");
      setPassword("staff123");
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center p-6 lg:p-12 z-10">
        
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-10 pr-12">
          <div className="inline-flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)]">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">SIDAT</h2>
              <p className="text-sm text-zinc-400 font-medium tracking-wide uppercase mt-1">PPS Belawan</p>
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Manajemen Surat <br />
              <span className="gradient-text">Lebih Cerdas & Cepat</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
              Otomatisasi proses ekstraksi dan distribusi surat disposisi untuk Pelabuhan Perikanan Samudera Belawan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Bento Grid Item 1 (Full width) */}
            <div className="col-span-2 bg-indigo-900/20 border border-indigo-500/20 rounded-3xl p-6 group hover:bg-indigo-900/30 transition-all cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all duration-300">
                <FileText size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide mb-1">Ekstraksi AI Cerdas</h3>
              <p className="text-indigo-200/60 text-sm font-medium leading-relaxed">
                Membaca dan memproses surat disposisi otomatis dengan AI, menghemat waktu input data secara signifikan.
              </p>
            </div>
            
            {/* Bento Grid Item 2 */}
            <div className="bg-purple-900/10 border border-purple-500/10 rounded-3xl p-5 group hover:bg-purple-900/20 transition-all cursor-default">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <Users size={18} className="text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide mb-1">Distribusi Real-time</h3>
              <p className="text-purple-200/50 text-xs font-medium">Pengiriman instan ke staf penerima terkait.</p>
            </div>

            {/* Bento Grid Item 3 */}
            <div className="bg-emerald-900/10 border border-emerald-500/10 rounded-3xl p-5 group hover:bg-emerald-900/20 transition-all cursor-default">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <Shield size={18} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide mb-1">Keamanan RLS</h3>
              <p className="text-emerald-200/50 text-xs font-medium">Akses data dilindungi protokol ketat.</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full max-w-md mx-auto slide-in">
          <div className="card p-8 lg:p-10 relative overflow-hidden">
            {/* Mobile Branding */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText className="text-white w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">SIDAT</h2>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Selamat Datang 👋</h2>
              <p className="text-zinc-400 text-sm">Masuk untuk mengelola disposisi surat.</p>
            </div>

            {/* Quick Login */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => quickLogin("admin")}
                className="py-3 text-xs rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all font-medium flex justify-center items-center gap-2"
              >
                <Shield size={16} /> Admin Demo
              </button>
              <button
                onClick={() => quickLogin("staff")}
                className="py-3 text-xs rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all font-medium flex justify-center items-center gap-2"
              >
                <Users size={16} /> Staf Demo
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">atau masuk manual</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Email Instansi
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@pps-belawan.go.id"
                    className="input-field pl-12 py-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-12 py-3"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 slide-in">
                  <Shield size={16} className="text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-[15px] mt-6 font-semibold tracking-wide"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Sistem
                    <ArrowRight size={18} className="ml-1" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

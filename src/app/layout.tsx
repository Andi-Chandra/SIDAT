import type { Metadata } from "next";
import "./globals.css";

import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SIDAT - Sistem Manajemen Disposisi Surat PPS Belawan",
  description:
    "Aplikasi manajemen dan pembaca disposisi surat otomatis untuk Pelabuhan Perikanan Samudera Belawan. Efisiensi dokumen dan distribusi disposisi ke staf secara digital.",
  keywords: ["disposisi surat", "PPS Belawan", "manajemen surat", "pelabuhan perikanan"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased bg-slate-50 text-slate-900 font-sans`}>
        {children}
      </body>
    </html>
  );
}

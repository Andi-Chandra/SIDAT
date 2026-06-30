import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the PDF file into a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    // Use Gemini to structure the data
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
    
    const prompt = `
      Anda adalah asisten cerdas untuk sistem manajemen surat (disposisi).
      Berikut adalah teks mentah yang diekstrak dari sebuah dokumen surat (PDF):
      
      """
      ${extractedText.substring(0, 5000)}
      """
      
      Tugas Anda adalah mengekstrak informasi berikut dari teks di atas dan mengembalikannya secara eksklusif dalam format JSON, tanpa teks atau penjelasan lain:
      {
        "nomorSurat": "Nomor surat jika ada",
        "perihal": "Judul atau perihal surat",
        "tanggalSurat": "Tanggal pembuatan surat dalam format YYYY-MM-DD, jika tidak jelas gunakan null",
        "instruksi": "Instruksi khusus atau catatan yang bisa disimpulkan, jika tidak ada kosongkan",
        "penerima": ["Nama penerima pertama", "Penerima kedua"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
       throw new Error("Failed to generate content from AI");
    }

    const jsonResult = JSON.parse(resultText);

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Gagal memproses dan mengekstrak surat" },
      { status: 500 }
    );
  }
}

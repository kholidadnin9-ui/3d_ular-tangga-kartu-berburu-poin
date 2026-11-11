import React from 'react';
import { X, Star, Sparkles, HelpCircle, ArrowUpRight, AlertTriangle, Compass } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1a6b]/55 backdrop-blur-sm animate-fadeIn">
      <div className="hologram-panel rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-400/30 bg-[#173a9e]/70">
          <div className="flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-cyan-300" />
            <h2 className="font-display text-2xl font-extrabold text-white">
              PANDUAN KAPTEN ANTARIKSA
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-500/30 border border-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30">
            <h3 className="font-display font-bold text-lg text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              1. Tujuan Petualangan
            </h3>
            <p className="mt-1 text-cyan-50/90">
              Mulai dari <strong>Petak 1 (Planet Biru)</strong> dan jadilah kapten robot pertama yang mencapai <strong>Petak 100 (Planet Emas & Stasiun Luar Angkasa)</strong>! Kamu juga bisa mengumpulkan poin sebanyak-banyaknya di sepanjang perjalanan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30">
            <h3 className="font-display font-bold text-lg text-amber-300 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-300" />
              2. Tumpukan Kartu Berburu Poin (Pengganti Dadu)
            </h3>
            <p className="mt-1 text-amber-50/90">
              Permainan ini <strong>tidak menggunakan dadu</strong>. Tekan tombol <strong>AMBIL KARTU</strong> untuk mengambil 1 kartu dari tumpukan 8 kartu:
            </p>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
              <li className="bg-[#173a9e]/70 p-2.5 rounded-xl border border-cyan-400/30">
                🚀 <strong>Kartu Angka 1–6:</strong> Robot berjalan maju 1 sampai 6 petak.
              </li>
              <li className="bg-[#173a9e]/70 p-2.5 rounded-xl border border-rose-400/30">
                <AlertTriangle className="w-3.5 h-3.5 inline text-rose-400 mr-1" />
                <strong>Kartu ZONK:</strong> Robot tidak bergerak pada giliran ini.
              </li>
              <li className="sm:col-span-2 bg-[#173a9e]/70 p-2.5 rounded-xl border border-amber-400/40">
                ⭐ <strong>Kartu BINTANG:</strong> Pilih 1 dari 3 Bonus Spesial: <strong>+10 Poin</strong>, <strong>Maju 6 Langkah</strong>, atau <strong>Acak Kartu 1x</strong>. Masing-masing bonus bisa dipakai 1 kali per pemain!
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/30">
            <h3 className="font-display font-bold text-lg text-purple-300 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              3. 20 Petak Pertanyaan Matematika
            </h3>
            <p className="mt-1 text-purple-50/90">
              Berhenti di petak bertanda <strong>★ SOAL ★</strong> akan memunculkan hologram soal Perkalian atau Pembagian. Jawab benar untuk meraih <strong>+5 Poin</strong>! Jawaban salah tidak mengurangi poinmu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
            <h3 className="font-display font-bold text-lg text-emerald-300 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              4. Tangga Energi & Ular Antariksa + Kamera 360°
            </h3>
            <p className="mt-1 text-emerald-50/90">
              Mendarat di kaki <strong>Energy Ladder / Jembatan Laser</strong> akan menerbangkan robotmu naik ke atas! Hati-hati dengan kepala <strong>Cosmic Space Serpent</strong> yang membuat robotmu meluncur turun. Gunakan mouse atau jari untuk memutar kamera <strong>360 derajat</strong> mengelilingi papan 3D!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-400/20 bg-[#173a9e]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-arcade-cyan px-6 py-2.5 rounded-2xl font-display font-bold text-sm text-slate-950 cursor-pointer"
          >
            SIAP BERPETUALANG!
          </button>
        </div>
      </div>
    </div>
  );
};

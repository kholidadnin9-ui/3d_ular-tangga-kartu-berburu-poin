import React, { useState } from 'react';
import { X, Volume2, VolumeX, Trophy, Settings } from 'lucide-react';
import { AudioManager } from '../managers/AudioManager';
import { ScoreManager } from '../managers/ScoreManager';

interface SettingsModalProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  volume,
  onToggleMute,
  onChangeVolume,
  onClose,
}) => {
  const [records] = useState(() => ScoreManager.getMatchRecords());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1a6b]/55 backdrop-blur-sm animate-fadeIn">
      <div className="hologram-panel rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-400/30 bg-[#173a9e]/70">
          <div className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-cyan-300" />
            <h2 className="font-display text-2xl font-extrabold text-white">
              PENGATURAN & RIWAYAT
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Audio Controls */}
          <div className="p-4 rounded-2xl bg-[#173a9e]/80 border border-cyan-400/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-rose-400" />
                ) : (
                  <Volume2 className="w-6 h-6 text-cyan-300" />
                )}
                <div>
                  <div className="font-display font-bold text-base">Suara & Musik Antariksa</div>
                  <div className="text-xs text-cyan-200/75">
                    Efek suara Web Audio API & musik latar petualangan
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleMute}
                className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                  isMuted
                    ? 'bg-rose-500/25 border border-rose-400 text-rose-200'
                    : 'bg-emerald-500/25 border border-emerald-400 text-emerald-200'
                }`}
              >
                {isMuted ? 'SUARA MATI (MUTE)' : 'SUARA AKTIF'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-cyan-200 mb-1.5">
                <span>Volume Efek & Musik</span>
                <span className="font-mono-num">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangeVolume(val);
                  AudioManager.playButtonClick();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Match Records in LocalStorage */}
          <div className="p-4 rounded-2xl bg-[#173a9e]/80 border border-amber-400/30">
            <div className="flex items-center gap-2 font-display font-bold text-base text-amber-300 mb-3">
              <Trophy className="w-5 h-5" />
              <span>Riwayat Juara Galaksi (LocalStorage)</span>
            </div>

            {records.length === 0 ? (
              <p className="text-xs text-slate-300/80 py-3 text-center">
                Belum ada riwayat pertandingan selesai. Ayo mulai petualanganmu!
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f2a85]/70 border border-white/10 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{rec.winnerName}</span>
                      <span className="text-cyan-300/75 ml-2">({rec.date})</span>
                    </div>
                    <div className="font-mono-num font-extrabold text-amber-300">
                      {rec.winnerPoints} POIN
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-400/20 bg-[#173a9e]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-arcade-cyan px-6 py-2.5 rounded-2xl font-display font-bold text-sm text-slate-950 cursor-pointer"
          >
            SIMPAN & TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};

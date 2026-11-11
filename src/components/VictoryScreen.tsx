import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, Home, ClipboardList, Sparkles, CheckCircle2 } from 'lucide-react';
import { Player } from '../types/game';
import { ScoreManager } from '../managers/ScoreManager';
import { RobotAvatar } from './RobotAvatar';
import { ROBOT_THEMES } from '../managers/PlayerManager';

interface VictoryScreenProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winner,
  players,
  onPlayAgain,
  onBackToMenu,
}) => {
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const rankedPlayers = ScoreManager.rankPlayers(players, winner.id);
  const winnerTheme = ROBOT_THEMES[winner.robotColor];

  useEffect(() => {
    // Launch colorful space fireworks
    const end = Date.now() + 3600;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#00F2FE', '#FDE047', '#FF2A85', '#34D399'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#00F2FE', '#FDE047', '#FF2A85', '#34D399'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1a6b]/55 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="hologram-panel rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-white my-auto relative overflow-hidden">
        <div className="hologram-scanline absolute inset-0" />

        {/* Golden Planet & Star Glow Backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-400/25 blur-3xl pointer-events-none" />

        {/* Champion Header */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/20 border-2 border-amber-300 text-amber-200 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>PETAK 100 • PLANET EMAS TERCAPAI!</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-[0_4px_20px_rgba(245,158,11,0.5)]">
            GALAXY CHAMPION!
          </h1>

          {/* Winner Robot & Golden Planet Badge */}
          <div className="mt-4 relative flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-b from-amber-300/30 to-amber-600/20 border-4 border-amber-300 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-bounce">
              <RobotAvatar color={winner.robotColor} size="lg" mood="victory" />
            </div>
            <div className="absolute -bottom-2 bg-amber-400 text-slate-950 font-display font-extrabold text-xs px-3 py-1 rounded-full border-2 border-white shadow-lg flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>JUARA 1</span>
            </div>
          </div>

          <h2 className="mt-5 font-display text-2xl sm:text-3xl font-extrabold text-white">
            {winner.name}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-cyan-200 mt-0.5">
            {winnerTheme.name} ({winnerTheme.title}) • Posisi Akhir: Petak #{winner.position}
          </p>

          {/* Winner Summary Stats */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-4">
            <div className="p-3 rounded-2xl bg-[#173a9e]/85 border border-amber-400/40">
              <div className="text-[11px] font-bold text-amber-200/80 uppercase">TOTAL POIN</div>
              <div className="font-mono-num font-extrabold text-2xl text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-5 h-5 fill-amber-300" />
                <span>{winner.points}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#173a9e]/85 border border-cyan-400/40">
              <div className="text-[11px] font-bold text-cyan-200/80 uppercase">POSISI AKHIR</div>
              <div className="font-mono-num font-extrabold text-2xl text-cyan-300 mt-0.5">
                PETAK {winner.position}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#173a9e]/85 border border-emerald-400/40">
              <div className="text-[11px] font-bold text-emerald-200/80 uppercase">SOAL BENAR</div>
              <div className="font-mono-num font-extrabold text-2xl text-emerald-300 mt-0.5">
                {winner.correctAnswers}/{winner.totalQuestions}
              </div>
            </div>
          </div>
        </div>

        {/* Standings / Detailed History Toggle View */}
        <div className="relative z-10 mt-6">
          {!showDetailedResults ? (
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 mb-2">
                PERINGKAT SELURUH PEMAIN & RIWAYAT BONUS:
              </div>
              {rankedPlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    p.id === winner.id
                      ? 'bg-amber-400/15 border-amber-300'
                      : 'bg-[#173a9e]/80 border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl font-mono-num font-extrabold text-sm flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-[#1e4fd8] text-cyan-200 border border-white/15'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <RobotAvatar color={p.robotColor} size="sm" mood={idx === 0 ? 'victory' : 'happy'} />
                    <div>
                      <div className="font-display font-bold text-base text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.id === winner.id && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            FINISH PETAK 100
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cyan-200/80">
                        Riwayat Bonus Bintang:{' '}
                        {p.bonusHistory.length > 0 ? p.bonusHistory.join(', ') : 'Belum menggunakan bonus'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] text-cyan-200/70 font-bold">POSISI</div>
                      <div className="font-mono-num font-extrabold text-sm text-white">
                        Petak {p.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-amber-200/70 font-bold">TOTAL POIN</div>
                      <div className="font-mono-num font-extrabold text-base text-amber-300">
                        {p.points} Poin
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#173a9e]/90 border border-cyan-400/30 max-h-52 overflow-y-auto space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                LOG RIWAYAT PERJALANAN PEMAIN:
              </div>
              {rankedPlayers.map((p) => (
                <div key={p.id} className="border-b border-white/10 pb-2 last:border-b-0">
                  <div className="font-display font-bold text-sm text-amber-300 mb-1">
                    {p.name} (Petak {p.position} • {p.points} Poin)
                  </div>
                  <div className="space-y-1">
                    {p.history.slice(-5).map((h, i) => (
                      <div key={i} className="text-xs text-cyan-100/85 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          Giliran {h.turn}: {h.action} (Petak {h.tileFrom} → {h.tileTo})
                          {h.pointsDelta > 0 ? ` [+${h.pointsDelta} Poin]` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3 Required Action Buttons: MAIN LAGI, KEMBALI KE MENU, LIHAT HASIL */}
        <div className="relative z-10 mt-6 pt-4 border-t border-cyan-400/30 flex flex-wrap items-center justify-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowDetailedResults((v) => !v)}
            className="btn-arcade-purple px-5 py-3 rounded-2xl font-display font-bold text-sm text-white flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{showDetailedResults ? 'LIHAT PERINGKAT' : 'LIHAT HASIL'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToMenu}
              className="btn-arcade-cyan px-5 py-3 rounded-2xl font-display font-bold text-sm text-slate-950 flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>KEMBALI KE MENU</span>
            </button>

            <button
              type="button"
              onClick={onPlayAgain}
              className="btn-arcade-gold px-6 py-3 rounded-2xl font-display font-extrabold text-sm flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>MAIN LAGI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Star, CheckCircle2, Sparkles, ArrowUpRight, Shuffle } from 'lucide-react';
import { Player, StarBonusType } from '../types/game';
import { STAR_BONUS_OPTIONS } from '../managers/StarBonusManager';
import { RobotAvatar } from './RobotAvatar';

interface StarBonusModalProps {
  player: Player;
  onSelectBonus: (bonus: StarBonusType) => void;
}

export const StarBonusModal: React.FC<StarBonusModalProps> = ({ player, onSelectBonus }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0b1a6b]/55 backdrop-blur-sm animate-fadeIn">
      <div className="hologram-panel rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1rem)] p-4 sm:p-8 text-white relative overflow-y-auto overflow-x-hidden">
        <div className="hologram-scanline absolute inset-0" />

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] mb-3">
            <Star className="w-10 h-10 text-amber-300 fill-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KARTU BINTANG SPESIAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Pilih Bonus Bintangmu, {player.name}!
          </h2>
          <p className="text-sm text-cyan-100/85 mt-1 max-w-md">
            Setiap kapten memiliki jatah <strong className="text-amber-300">1 kali</strong> untuk masing-masing bonus selama petualangan!
          </p>
        </div>

        {/* 3 Bonus Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mt-4 sm:mt-6">
          {STAR_BONUS_OPTIONS.map((opt) => {
            const isAvailable = player.bonusInventory[opt.type];

            return (
              <button
                key={opt.type}
                type="button"
                disabled={!isAvailable || player.isAI}
                onClick={() => isAvailable && onSelectBonus(opt.type)}
                className={`group relative rounded-2xl p-4 text-left flex flex-col justify-between border-2 transition-all ${
                  isAvailable
                    ? 'bg-[#173a9e]/90 border-cyan-400/60 hover:border-amber-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(245,158,11,0.35)] cursor-pointer'
                    : 'bg-[#173a9e]/40 border-slate-700/60 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: `${opt.color}25`,
                        borderColor: opt.color,
                      }}
                    >
                      {opt.type === 'POINTS_10' && <Star className="w-6 h-6 text-amber-300 fill-amber-300" />}
                      {opt.type === 'STEPS_6' && <ArrowUpRight className="w-6 h-6 text-cyan-300" />}
                      {opt.type === 'EXTRA_CARD' && <Shuffle className="w-6 h-6 text-purple-300" />}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isAvailable ? 'TERSEDIA' : 'SUDAH DIPAKAI'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-200">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-cyan-100/80 mt-1 leading-relaxed">{opt.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono-num text-xs font-extrabold" style={{ color: opt.color }}>
                    {opt.badge}
                  </span>
                  {isAvailable ? (
                    <span className="text-xs font-extrabold text-amber-300 group-hover:translate-x-0.5 transition-transform">
                      PILIH →
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer AI Indicator if AI is choosing */}
        {player.isAI && (
          <div className="relative z-10 mt-5 flex items-center justify-center gap-3 text-sm font-bold text-amber-300 bg-amber-400/10 py-2.5 px-4 rounded-2xl border border-amber-400/30">
            <RobotAvatar color={player.robotColor} size="sm" mood="excited" />
            <span>Robot AI {player.name} sedang memilih bonus bintang terbaik...</span>
          </div>
        )}
      </div>
    </div>
  );
};

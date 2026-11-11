import React, { useState } from 'react';
import { Users, Bot, Rocket, ArrowLeft, Sparkles } from 'lucide-react';
import { Player, RobotColorId } from '../types/game';
import { PlayerManager, ROBOT_COLOR_LIST, ROBOT_THEMES } from '../managers/PlayerManager';
import { RobotAvatar } from './RobotAvatar';
import { AudioManager } from '../managers/AudioManager';

interface PlayerSetupScreenProps {
  onBack: () => void;
  onStartGame: (players: Player[]) => void;
}

interface DraftPlayer {
  name: string;
  robotColor: RobotColorId;
  isAI: boolean;
}

export const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({ onBack, onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [vsAIInSinglePlayer, setVsAIInSinglePlayer] = useState<boolean>(true);
  const [drafts, setDrafts] = useState<DraftPlayer[]>([
    { name: 'Kapten Leo', robotColor: 'gold', isAI: false },
    { name: 'Kapten Astra', robotColor: 'blue', isAI: false },
    { name: 'Kapten Orion', robotColor: 'green', isAI: false },
    { name: 'Kapten Nova', robotColor: 'red', isAI: false },
  ]);

  const handleUpdateDraft = (index: number, patch: Partial<DraftPlayer>) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const handleLaunch = () => {
    AudioManager.playSpaceshipHum();
    const finalPlayers: Player[] = [];

    if (playerCount === 1) {
      finalPlayers.push(
        PlayerManager.createPlayer(1, drafts[0].name || 'Kapten 1', drafts[0].robotColor, false)
      );
      if (vsAIInSinglePlayer) {
        // Pick a different robot color for the AI opponent
        const aiColor =
          ROBOT_COLOR_LIST.find((c) => c !== drafts[0].robotColor) || 'blue';
        finalPlayers.push(
          PlayerManager.createPlayer(2, 'Robo-AI Astro', aiColor, true)
        );
      }
    } else {
      for (let i = 0; i < playerCount; i++) {
        finalPlayers.push(
          PlayerManager.createPlayer(
            i + 1,
            drafts[i].name || `Kapten ${i + 1}`,
            drafts[i].robotColor,
            drafts[i].isAI
          )
        );
      }
    }

    onStartGame(finalPlayers);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-[#0b1a6b]/45 backdrop-blur-sm overflow-y-auto">
      <div className="hologram-panel rounded-3xl max-w-4xl w-full max-h-[calc(100dvh-1rem)] p-3 sm:p-8 text-white my-auto relative overflow-hidden">
        <div className="hologram-scanline absolute inset-0" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-cyan-400/30">
          <button
            type="button"
            onClick={() => {
              AudioManager.playButtonClick();
              onBack();
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 block">
              KONFIGURASI MISI ANTARIKSA
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              PILIH PEMAIN & ROBOT 3D
            </h2>
          </div>

          <div className="w-24 hidden sm:block" />
        </div>

        {/* Player Count Selector (1 - 4 Pemain) */}
        <div className="relative z-10 mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#173a9e]/80 p-4 rounded-2xl border border-cyan-400/30">
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-300" />
            <div>
              <div className="font-display font-bold text-base">Jumlah Pemain (1–4 Kapten)</div>
              <div className="text-xs text-cyan-200/75">
                Main sendiri melawan Robot AI atau bergantian bersama teman!
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto">
            {[1, 2, 3, 4].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  AudioManager.playButtonClick();
                  setPlayerCount(cnt);
                }}
                className={`px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-display font-extrabold text-[11px] sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
                  playerCount === cnt
                    ? 'btn-arcade-cyan text-slate-950 scale-105'
                    : 'bg-[#1e4fd8] text-slate-200 border border-white/40 hover:border-cyan-400'
                }`}
              >
                {cnt} PEMAIN
              </button>
            ))}
          </div>
        </div>

        {/* Single Player VS AI Toggle */}
        {playerCount === 1 && (
          <div className="relative z-10 mt-3 flex items-center justify-between bg-purple-950/50 border border-purple-400/40 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-purple-300" />
              <div>
                <div className="font-display font-bold text-sm text-white">
                  Lawan Robot AI Antariksa (Robo-AI Astro)
                </div>
                <div className="text-xs text-purple-200/80">
                  Aktifkan agar kamu bertanding melawan Robot AI pintar menuju Petak 100!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                AudioManager.playButtonClick();
                setVsAIInSinglePlayer((v) => !v);
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                vsAIInSinglePlayer
                  ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-200'
                  : 'bg-[#1e4fd8] border border-white/40 text-slate-300'
              }`}
            >
              {vsAIInSinglePlayer ? 'LAWAN AI: AKTIF' : 'MODE SOLO'}
            </button>
          </div>
        )}

        {/* Player Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-5 max-h-[min(46dvh,460px)] overflow-y-auto pr-1">
          {Array.from({ length: playerCount }).map((_, idx) => {
            const draft = drafts[idx];
            const theme = ROBOT_THEMES[draft.robotColor];

            return (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-2xl bg-[#173a9e]/90 border-2 border-cyan-400/35 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-1.5 rounded-2xl bg-[#0f2a85]/80 border border-white/15">
                    <RobotAvatar color={draft.robotColor} size="md" mood="excited" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                        PEMAIN {idx + 1} • {theme.name}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateDraft(idx, { isAI: !draft.isAI })
                          }
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border cursor-pointer ${
                            draft.isAI
                              ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                              : 'bg-white/10 border-white/20 text-slate-300'
                          }`}
                        >
                          {draft.isAI ? '🤖 ROBOT AI' : '👤 MANUSIA'}
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      maxLength={18}
                      value={draft.name}
                      onChange={(e) =>
                        handleUpdateDraft(idx, { name: e.target.value })
                      }
                      placeholder={`Nama Kapten ${idx + 1}`}
                      className="mt-1 w-full px-3 py-1.5 rounded-xl bg-[#0f2a85] border border-cyan-400/40 text-sm font-bold text-white focus:outline-none focus:border-amber-300"
                    />
                  </div>
                </div>

                {/* Robot Color Variations Selector */}
                <div>
                  <div className="text-[11px] font-bold text-cyan-200/80 mb-1.5 flex items-center justify-between">
                    <span>Pilih Warna Armor Robot Chibi:</span>
                    <span className="text-amber-300">{theme.title}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {ROBOT_COLOR_LIST.map((colId) => {
                      const t = ROBOT_THEMES[colId];
                      const active = draft.robotColor === colId;
                      return (
                        <button
                          key={colId}
                          type="button"
                          onClick={() => {
                            AudioManager.playButtonClick();
                            handleUpdateDraft(idx, { robotColor: colId });
                          }}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            active
                              ? 'bg-white/15 border-amber-300 text-white scale-105 shadow-[0_0_12px_rgba(253,224,71,0.4)]'
                              : 'bg-slate-950/60 border-white/15 text-slate-300 hover:border-cyan-300'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white"
                            style={{ backgroundColor: t.accentHex }}
                          />
                          <span className="capitalize">{colId}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Launch Adventure CTA */}
        <div className="relative z-10 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-cyan-400/30 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-xs text-cyan-200/85">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Papan 3D 100 Petak • 8 Kartu Berburu Poin • 20 Petak Soal Matematika</span>
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            className="w-full sm:w-auto btn-arcade-gold px-8 py-4 rounded-2xl font-display font-extrabold text-lg tracking-wide flex items-center justify-center gap-3 cursor-pointer"
          >
            <Rocket className="w-6 h-6" />
            <span>MULAI PETUALANGAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

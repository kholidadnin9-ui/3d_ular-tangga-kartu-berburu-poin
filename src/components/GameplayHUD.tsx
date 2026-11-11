import React, { useState } from 'react';
import { Camera, RotateCcw, Volume2, VolumeX, BookOpen, Settings, Home, Users, Star, Check, X } from 'lucide-react';
import { CameraPreset, Player } from '../types/game';
import { RobotAvatar } from './RobotAvatar';
import { AudioManager } from '../managers/AudioManager';

interface GameplayHUDProps {
  players: Player[];
  activePlayerIndex: number;
  currentCamera: CameraPreset;
  autoRotate: boolean;
  isMuted: boolean;
  onSelectCamera: (preset: CameraPreset) => void;
  onToggleAutoRotate: () => void;
  onToggleMute: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenPlayerSetup: () => void;
  onReturnHome: () => void;
}

export const GameLogo: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="flex flex-col items-center select-none">
    <div className="relative leading-[0.85] text-center">
      <div className={`logo-galaxy ${compact ? 'text-3xl sm:text-4xl' : 'text-6xl sm:text-8xl'}`}>GALAXY</div>
      <div className={`logo-adventure ${compact ? 'text-2xl sm:text-3xl' : 'text-5xl sm:text-7xl'}`}>ADVENTURE</div>
    </div>
    <div
      className={`logo-ribbon rounded-full flex items-center gap-2 text-white font-display font-bold ${
        compact ? 'mt-1 px-3 py-0.5 text-[10px] sm:text-xs' : 'mt-3 px-5 py-1.5 text-sm sm:text-lg'
      }`}
    >
      <Star className={`${compact ? 'w-3 h-3' : 'w-5 h-5'} fill-yellow-300 text-yellow-300`} />
      <span className="drop-shadow-[0_2px_0_rgba(40,0,90,0.8)]">Petualangan Ular Tangga Antariksa 3D</span>
      <Star className={`${compact ? 'w-3 h-3' : 'w-5 h-5'} fill-yellow-300 text-yellow-300`} />
    </div>
  </div>
);

const BonusStars: React.FC<{ player: Player; size?: number }> = ({ player, size = 16 }) => {
  const inv = player.bonusInventory;
  const list = [inv.POINTS_10, inv.STEPS_6, inv.EXTRA_CARD];
  return (
    <div className="flex items-center gap-0.5" title="Bonus Bintang tersisa">
      {list.map((avail, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={avail ? 'fill-yellow-300 text-yellow-500 drop-shadow' : 'text-white/70'}
          strokeWidth={2.2}
        />
      ))}
    </div>
  );
};

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  players,
  activePlayerIndex,
  currentCamera,
  autoRotate,
  isMuted,
  onSelectCamera,
  onToggleAutoRotate,
  onToggleMute,
  onOpenGuide,
  onOpenSettings,
  onOpenPlayerSetup,
  onReturnHome,
}) => {
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const active = players[activePlayerIndex];
  const click = (fn: () => void) => () => {
    AudioManager.playButtonClick();
    fn();
  };

  const viewChips: { id: CameraPreset; label: string }[] = [
    { id: 'TOP', label: 'TOP VIEW' },
    { id: 'FRONT', label: 'Depan' },
    { id: 'SIDE', label: 'Samping' },
    { id: 'BACK', label: 'Belakang' },
    { id: 'FOLLOW', label: 'IKUTI ROBOT' },
  ];

  return (
    <>
      {/* TOP-LEFT utility buttons */}
      <div className="fixed safe-top left-3 z-30 flex gap-1.5 sm:gap-2">
        <button type="button" onClick={click(onReturnHome)} title="Menu Utama" className="btn-glossy-blue w-10 h-10 xl:w-11 xl:h-11 rounded-2xl flex items-center justify-center cursor-pointer">
          <Home className="w-5 h-5" />
        </button>
        <button type="button" onClick={onToggleMute} title={isMuted ? 'Aktifkan suara' : 'Matikan suara'} className="btn-glossy-blue w-10 h-10 xl:w-11 xl:h-11 rounded-2xl flex items-center justify-center cursor-pointer">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button type="button" onClick={click(onOpenGuide)} title="Panduan" className="btn-glossy-blue w-10 h-10 xl:w-11 xl:h-11 rounded-2xl flex items-center justify-center cursor-pointer">
          <BookOpen className="w-5 h-5" />
        </button>
        <button type="button" onClick={click(onOpenPlayerSetup)} title="Pemain" className="btn-glossy-blue w-10 h-10 xl:hidden rounded-2xl flex items-center justify-center cursor-pointer">
          <Users className="w-5 h-5" />
        </button>
        <button type="button" onClick={click(onOpenSettings)} title="Pengaturan" className="btn-glossy-blue w-10 h-10 xl:hidden rounded-2xl flex items-center justify-center cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* TOP-CENTER logo */}
      <div className="fixed safe-top left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden xl:block">
        <GameLogo compact />
      </div>

      {/* RIGHT: Player cards + Bonus Bintang panel (desktop / tablet) */}
      <div className="fixed safe-top right-3 z-20 w-56 lg:w-60 space-y-2 hidden xl:block max-h-[calc(100dvh-190px)] overflow-y-auto pr-0.5">
        {players.map((p, idx) => {
          const isTurn = idx === activePlayerIndex;
          return (
            <div
              key={p.id}
              className={`player-card player-card-${p.robotColor} rounded-2xl p-2 flex items-center gap-2.5 transition-all ${
                isTurn ? 'ring-4 ring-yellow-300 scale-[1.03]' : 'opacity-90'
              }`}
            >
              <RobotAvatar color={p.robotColor} size="md" mood={isTurn ? 'excited' : 'happy'} />
              <div className="flex-1 min-w-0 text-white">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display font-bold text-lg leading-tight truncate drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
                    {p.name}
                  </span>
                  {p.isAI && <span className="text-[9px] font-extrabold bg-black/30 px-1.5 rounded">AI</span>}
                </div>
                <div className="text-xs font-bold leading-tight opacity-95">Posisi: {p.position}</div>
                <div className="text-xs font-bold leading-tight opacity-95">Poin: {p.points}</div>
                <div className="mt-0.5 flex items-center justify-between">
                  <BonusStars player={p} />
                  {isTurn && (
                    <span className="text-[9px] font-extrabold bg-yellow-300 text-amber-900 px-1.5 py-0.5 rounded-full">GILIRAN</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {active && (
          <div className="parchment-panel rounded-2xl p-2.5 pt-1">
            <div className="parchment-header rounded-xl -mx-1 px-2 py-1 flex items-center gap-1.5 font-display font-bold text-sm">
              <Star className="w-5 h-5 fill-yellow-300 text-yellow-400" />
              <span>Bonus Bintang</span>
              <span className="ml-auto text-[10px] font-semibold opacity-90 truncate max-w-[70px]">{active.name}</span>
            </div>
            {[
              { key: 'POINTS_10' as const, icon: '🪙', label: '10 Poin' },
              { key: 'STEPS_6' as const, icon: '👟', label: '6 Langkah' },
              { key: 'EXTRA_CARD' as const, icon: '🃏', label: 'Acak Kartu 1x' },
            ].map((b) => {
              const avail = active.bonusInventory[b.key];
              return (
                <div key={b.key} className="flex items-center gap-2 py-1.5 border-b border-amber-300/50 last:border-b-0">
                  <span className="text-xl w-7 text-center">{b.icon}</span>
                  <span className={`flex-1 font-bold text-sm ${avail ? '' : 'line-through opacity-50'}`}>{b.label}</span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      avail ? 'border-amber-700 bg-white' : 'border-emerald-600 bg-emerald-500'
                    }`}
                    title={avail ? 'Tersedia' : 'Sudah dipakai'}
                  >
                    {!avail && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MOBILE: compact player chips */}
      <div className="fixed player-strip-top left-2 right-2 z-20 flex justify-start md:justify-center gap-1.5 overflow-x-auto pb-1 xl:hidden hud-scroll">
        {players.map((p, idx) => (
          <div
            key={p.id}
            className={`player-card player-card-${p.robotColor} rounded-xl px-1.5 py-1 flex items-center gap-1.5 shrink-0 ${
              idx === activePlayerIndex ? 'ring-2 ring-yellow-300' : 'opacity-90'
            }`}
          >
            <RobotAvatar color={p.robotColor} size="sm" />
            <div className="text-white leading-tight">
              <div className="font-display font-bold text-xs truncate max-w-[72px]">{p.name}</div>
              <div className="text-[10px] font-bold">
                P{p.position} • {p.points}pt
              </div>
              <BonusStars player={p} size={10} />
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM-LEFT: 1-4 Pemain + Pengaturan */}
      <div className="fixed safe-bottom left-3 z-30 hidden xl:flex flex-col gap-2.5">
        <button type="button" onClick={click(onOpenPlayerSetup)} className="btn-glossy-blue rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 cursor-pointer">
          <Users className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="hidden sm:flex flex-col leading-none font-display font-bold text-left">
            <span className="text-lg">1–4</span>
            <span className="text-sm">Pemain</span>
          </span>
        </button>
        <button type="button" onClick={click(onOpenSettings)} className="btn-glossy-blue rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 cursor-pointer">
          <Settings className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="hidden sm:inline font-display font-bold text-base">Pengaturan</span>
        </button>
      </div>

      {/* BOTTOM-RIGHT: 360° + Reset + view chips */}
      <div className="fixed safe-bottom right-3 z-30 hidden xl:flex flex-col items-end gap-2">
        <div className="hidden sm:flex flex-wrap justify-end gap-1 max-w-[260px]">
          {viewChips.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={click(() => onSelectCamera(v.id))}
              className={`btn-glossy-blue ${currentCamera === v.id && !autoRotate ? 'is-active' : ''} rounded-xl px-2 py-1 text-[11px] font-extrabold cursor-pointer`}
              style={{ borderWidth: 2 }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={click(onToggleAutoRotate)}
          className={`btn-glossy-blue ${autoRotate ? 'is-active' : ''} rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 cursor-pointer`}
          title="Putar papan 360° otomatis"
        >
          <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="hidden sm:flex flex-col leading-none font-display font-bold text-left">
            <span className="text-lg">360°</span>
            <span className="text-xs">{autoRotate ? 'Stop Putar' : 'Putar Papan'}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={click(() => onSelectCamera('ISOMETRIC'))}
          className="btn-glossy-blue rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 cursor-pointer"
          title="Reset Kamera"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="hidden sm:inline font-display font-bold text-base">Reset Kamera</span>
        </button>
      </div>

      {/* Compact camera menu on phone and tablet; closed by default to keep the board clear. */}
      <div className="fixed safe-top right-3 z-30 xl:hidden">
        <button
          type="button"
          onClick={() => setCameraMenuOpen((open) => !open)}
          aria-label={cameraMenuOpen ? 'Tutup menu kamera' : 'Buka menu kamera'}
          aria-expanded={cameraMenuOpen}
          className={`btn-glossy-blue w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer ${cameraMenuOpen ? 'is-active' : ''}`}
        >
          {cameraMenuOpen ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
        {cameraMenuOpen && (
          <div className="absolute right-0 top-12 w-48 rounded-2xl border-2 border-white/90 bg-[#1640bd]/95 p-2 shadow-[0_8px_0_#0f2a85,0_14px_28px_rgba(0,0,0,0.35)] backdrop-blur-md grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={click(() => { onSelectCamera('ISOMETRIC'); setCameraMenuOpen(false); })}
              className="btn-glossy-blue rounded-xl px-2 py-2 text-[10px] font-extrabold cursor-pointer"
            >
              RESET
            </button>
            {viewChips.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={click(() => { onSelectCamera(view.id); setCameraMenuOpen(false); })}
                className={`btn-glossy-blue ${currentCamera === view.id ? 'is-active' : ''} rounded-xl px-2 py-2 text-[10px] font-extrabold cursor-pointer`}
              >
                {view.label}
              </button>
            ))}
            <button
              type="button"
              onClick={click(() => { onToggleAutoRotate(); setCameraMenuOpen(false); })}
              className={`btn-glossy-blue ${autoRotate ? 'is-active' : ''} rounded-xl px-2 py-2 text-[10px] font-extrabold cursor-pointer col-span-2`}
            >
              {autoRotate ? 'BERHENTI PUTAR 360°' : 'PUTAR PAPAN 360°'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

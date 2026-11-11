import React from 'react';
import { Rocket, BookOpen, Settings, Play } from 'lucide-react';
import { RobotAvatar, robotImageUrl } from './RobotAvatar';
import { GameLogo } from './GameplayHUD';
import { AudioManager } from '../managers/AudioManager';

interface HomeScreenProps {
  hasSavedMatch: boolean;
  onStartSetup: () => void;
  onResumeSavedMatch: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  hasSavedMatch,
  onStartSetup,
  onResumeSavedMatch,
  onOpenGuide,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center p-4 overflow-y-auto bg-gradient-to-b from-[#0b1a6b]/30 via-transparent to-[#0b1a6b]/50">
      <div className="flex flex-col items-center w-full max-w-3xl my-auto">
        <div className="animate-float">
          <GameLogo />
        </div>

        {/* Hero robot squad */}
        <div className="mt-6 flex items-end justify-center gap-3 sm:gap-5">
          <div className="hidden sm:block -rotate-6">
            <RobotAvatar color="blue" size="lg" mood="happy" />
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-yellow-300/50 blur-2xl" />
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-[32px] overflow-hidden border-[5px] border-yellow-300 shadow-[0_0_0_4px_#fff,0_14px_40px_rgba(255,170,0,0.6)]">
              <img src={robotImageUrl('gold')} alt="Kapten Aurum" className="w-full h-full object-cover" draggable={false} />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap logo-ribbon rounded-full px-3 py-0.5 text-xs font-display font-bold text-white">
              ⭐ Kapten Aurum X-1
            </div>
          </div>
          <div className="hidden sm:block rotate-6">
            <RobotAvatar color="green" size="lg" mood="excited" />
          </div>
          <div className="hidden md:block rotate-12">
            <RobotAvatar color="red" size="md" mood="happy" />
          </div>
        </div>

        {/* Feature chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs sm:text-sm font-bold text-white">
          {['🪐 Papan 3D 100 Petak', '🃏 8 Kartu Berburu Poin', '🧮 20 Soal Matematika', '🎥 Kamera 360°'].map((f) => (
            <span key={f} className="px-3 py-1 rounded-full bg-[#1b3fae]/85 border-2 border-white/80 shadow">
              {f}
            </span>
          ))}
        </div>

        {/* Main buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              AudioManager.playButtonClick();
              AudioManager.startBGM();
              onStartSetup();
            }}
            className="btn-ambil-kartu w-full sm:w-auto rounded-[26px] px-10 py-3.5 font-display font-bold flex items-center justify-center gap-3 cursor-pointer"
          >
            <Rocket className="w-8 h-8 text-[#1d4fd6]" />
            <span className="label text-3xl sm:text-4xl">MULAI</span>
          </button>

          {hasSavedMatch && (
            <button
              type="button"
              onClick={() => {
                AudioManager.playButtonClick();
                AudioManager.startBGM();
                onResumeSavedMatch();
              }}
              className="btn-arcade-emerald w-full sm:w-auto rounded-2xl px-6 py-4 font-display font-bold text-lg text-white border-[3px] border-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>LANJUTKAN</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              AudioManager.playButtonClick();
              onOpenGuide();
            }}
            className="btn-glossy-blue w-full sm:w-auto rounded-2xl px-6 py-4 font-display font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-6 h-6" />
            <span>PANDUAN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioManager.playButtonClick();
              onOpenSettings();
            }}
            className="btn-glossy-blue w-full sm:w-auto rounded-2xl px-6 py-4 font-display font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-6 h-6" />
            <span>PENGATURAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

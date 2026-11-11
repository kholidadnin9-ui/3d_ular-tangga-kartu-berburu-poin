import React from 'react';
import { Star, AlertTriangle, Rocket } from 'lucide-react';
import { CardItem, Player, TurnSubPhase } from '../types/game';
import { ROBOT_THEMES } from '../managers/PlayerManager';

interface PointHuntingDeck3DProps {
  activePlayer: Player;
  turnSubPhase: TurnSubPhase;
  remainingInCycle: number;
  drawnCard: CardItem | null;
  isCardFlipped: boolean;
  statusBannerText: string;
  onDrawCard: () => void;
}

const CardBackFace: React.FC<{ small?: boolean }> = ({ small }) => (
  <div className="w-full h-full rounded-[inherit] p-[3px] bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600">
    <div className="relative w-full h-full rounded-[inherit] bg-gradient-to-br from-[#2a5cf0] via-[#1b3fae] to-[#0f2370] overflow-hidden flex items-center justify-center">
      {/* galaxy ornaments */}
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_25%,#ffffff_0.8px,transparent_1.5px),radial-gradient(circle_at_70%_65%,#ffffff_0.8px,transparent_1.5px),radial-gradient(circle_at_40%_80%,#bfe6ff_0.8px,transparent_1.5px)] bg-[length:22px_22px,28px_28px,18px_18px]" />
      <div className="absolute inset-[6%] rounded-[inherit] border-2 border-yellow-300/70" />
      <div className="absolute w-3/4 h-3/4 rounded-full bg-[radial-gradient(circle,rgba(120,200,255,0.55)_0%,transparent_70%)]" />
      <Star
        className={`relative ${small ? 'w-10 h-10' : 'w-24 h-24'} fill-yellow-300 text-amber-500 drop-shadow-[0_0_12px_rgba(255,210,60,0.9)]`}
        strokeWidth={1.5}
      />
    </div>
  </div>
);

export const PointHuntingDeck3D: React.FC<PointHuntingDeck3DProps> = ({
  activePlayer,
  turnSubPhase,
  remainingInCycle,
  drawnCard,
  isCardFlipped,
  statusBannerText,
  onDrawCard,
}) => {
  const canDraw = turnSubPhase === 'READY_TO_DRAW' && !activePlayer.isAI;
  const isShuffling = turnSubPhase === 'SHUFFLING';
  const showCardPopup = turnSubPhase === 'CARD_REVEAL' && drawnCard !== null;
  const theme = ROBOT_THEMES[activePlayer.robotColor];
  const layers = Math.max(3, remainingInCycle + 2);

  return (
    <>
      {/* Center-stage 3D card reveal */}
      {showCardPopup && drawnCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none bg-[#0b1a6b]/45">
          <div
            className="absolute w-[28rem] h-[28rem] rounded-full blur-3xl opacity-70 transition-all duration-500"
            style={{
              background: isCardFlipped
                ? `radial-gradient(circle, ${drawnCard.color} 0%, transparent 70%)`
                : 'radial-gradient(circle, #7fe7ff 0%, transparent 70%)',
            }}
          />
          <div className="card-reveal-frame perspective-1000" style={{ aspectRatio: '5 / 7' }}>
            <div
              className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
                isCardFlipped ? 'rotate-y-180 scale-105' : 'scale-95'
              }`}
            >
              <div className="absolute inset-0 backface-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,30,120,0.6)]">
                <CardBackFace />
              </div>

              <div
                className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-[5px] shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
                style={{ background: 'linear-gradient(135deg, #fff6c9, #ffc21a, #ff9500)' }}
              >
                <div
                  className="w-full h-full rounded-[20px] flex flex-col items-center justify-between p-5 text-center relative overflow-hidden"
                  style={{ background: `linear-gradient(180deg, #2a5cf0 0%, #1b3fae 60%, ${drawnCard.color}55 100%)` }}
                >
                  <div className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-yellow-300 text-amber-900 border-2 border-white">
                    Kartu Berburu Poin
                  </div>

                  <div className="my-auto flex flex-col items-center">
                    {drawnCard.value === 'STAR' ? (
                      <Star className="w-28 h-28 fill-yellow-300 text-amber-500 animate-bounce drop-shadow-[0_0_20px_#ffd43b]" />
                    ) : drawnCard.value === 'ZONK' ? (
                      <div className="w-28 h-28 rounded-full bg-rose-500 border-4 border-white flex items-center justify-center shadow-[0_0_30px_#f43f5e] animate-bounce">
                        <AlertTriangle className="w-16 h-16 text-white" />
                      </div>
                    ) : (
                      <div
                        className="w-28 h-28 rounded-3xl flex items-center justify-center border-4 border-white font-display font-bold text-8xl text-white text-outline-dark"
                        style={{ background: `linear-gradient(180deg, ${drawnCard.color}, #1745c4)`, boxShadow: `0 0 30px ${drawnCard.color}` }}
                      >
                        {drawnCard.value}
                      </div>
                    )}
                    <h3 className="mt-4 font-display text-3xl font-bold text-white text-outline-dark">{drawnCard.label}</h3>
                    <p className="mt-1 text-sm font-bold text-white/95 leading-snug">
                      {drawnCard.value === 'ZONK' ? 'ZONK! Kesempatan bergerak terlewat.' : drawnCard.subtitle}
                    </p>
                  </div>

                  <div className="w-full pt-2 border-t border-white/25 flex items-center justify-center gap-1.5 text-xs font-bold text-yellow-200">
                    <Rocket className="w-4 h-4" />
                    <span>{activePlayer.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-center: status pill + deck on pedestal + AMBIL KARTU */}
      <div className="game-deck-dock fixed safe-bottom left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-[min(96vw,560px)] pointer-events-none">
        {/* Turn status */}
        <div className="game-deck-status pointer-events-auto mb-1.5 max-w-full px-3 py-1 rounded-full bg-[#0f2a9a]/85 border-2 border-white/80 shadow-lg flex items-center gap-2 text-white">
          <span className="w-3 h-3 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: theme.glowHex }} />
          <span className="text-xs sm:text-sm font-extrabold truncate">
            {activePlayer.name}
            {activePlayer.isAI ? ' (AI)' : ''}: <span className="text-yellow-200 font-bold">{statusBannerText}</span>
          </span>
        </div>

        <div className="flex w-full items-end justify-center gap-[clamp(8px,3vw,24px)] pointer-events-auto">
          {/* Pedestal with single stacked deck */}
          <div className="deck-pedestal-wrap relative flex items-end justify-center">
            <div className="deck-pedestal absolute bottom-0 w-full h-[clamp(36px,10vw,56px)] rounded-[50%]" />
            <div className="absolute bottom-3 w-[80%] h-6 rounded-[50%] border-2 border-cyan-200/80 shadow-[0_0_20px_#7fe7ff] animate-pulse" />
            <div
              onClick={() => canDraw && onDrawCard()}
              className={`relative mb-5 sm:mb-6 cursor-pointer ${isShuffling ? 'animate-deck-shuffle' : canDraw ? 'hover:-translate-y-1' : ''} transition-transform`}
              style={{ perspective: '600px' }}
              title="Tumpukan 8 Kartu Berburu Poin"
            >
              <div className="deck-card-stack relative" style={{ transform: 'rotateX(48deg) rotateZ(-8deg)', transformStyle: 'preserve-3d' }}>
                {Array.from({ length: layers }).map((_, i) => {
                  const isTop = i === layers - 1;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-xl"
                      style={{
                        transform: `translateZ(${i * 3}px)`,
                        boxShadow: isTop ? '0 0 18px rgba(255,220,90,0.8)' : '0 1px 0 #c9a24a',
                        background: isTop ? undefined : 'linear-gradient(90deg,#f5f0e1,#e2d6b5)',
                        border: isTop ? undefined : '1px solid #b8933f',
                      }}
                    >
                      {isTop && <CardBackFace small />}
                    </div>
                  );
                })}
              </div>
            </div>
            <span className="absolute -top-1 right-2 sm:right-4 font-mono-num text-[11px] font-extrabold bg-yellow-300 text-amber-900 px-2 py-0.5 rounded-full border-2 border-white shadow">
              {remainingInCycle}/8
            </span>
          </div>

          {/* AMBIL KARTU */}
          <div className="relative mb-2">
            <button
              type="button"
              disabled={!canDraw}
              onClick={onDrawCard}
              className={`btn-ambil-kartu rounded-[22px] sm:rounded-[28px] px-3 sm:px-7 py-2.5 sm:py-4 font-display font-bold leading-[0.95] text-center cursor-pointer ${
                canDraw ? 'animate-pulse' : 'grayscale-[0.55] opacity-80 cursor-not-allowed'
              }`}
            >
              <span className="deck-action-label label block">{isShuffling ? 'MENGOCOK' : 'AMBIL'}</span>
              <span className="deck-action-label label block">{isShuffling ? '...' : 'KARTU'}</span>
            </button>
            {canDraw && <span className="hidden sm:block absolute -bottom-2 -right-2 text-3xl sm:text-4xl animate-bounce pointer-events-none">👆</span>}
          </div>
        </div>
      </div>
    </>
  );
};

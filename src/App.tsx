import { useEffect, useRef, useState, useCallback } from 'react';
import { GalaxyScene3D } from './three/GalaxyScene3D';
import { GameEngine } from './managers/GameEngine';
import { PlayerManager } from './managers/PlayerManager';
import { StarBonusManager } from './managers/StarBonusManager';
import { ScoreManager } from './managers/ScoreManager';
import { AudioManager } from './managers/AudioManager';
import {
  CameraPreset,
  CardItem,
  MathQuestion,
  Player,
  ScreenMode,
  StarBonusType,
  TurnSubPhase,
} from './types/game';
import { HomeScreen } from './components/HomeScreen';
import { PlayerSetupScreen } from './components/PlayerSetupScreen';
import { GameplayHUD } from './components/GameplayHUD';
import { PointHuntingDeck3D } from './components/PointHuntingDeck3D';
import { StarBonusModal } from './components/StarBonusModal';
import { MathQuestionModal } from './components/MathQuestionModal';
import { VictoryScreen } from './components/VictoryScreen';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GalaxyScene3D | null>(null);
  const engineRef = useRef<GameEngine>(new GameEngine());

  // Screen & Modals
  const [screenMode, setScreenMode] = useState<ScreenMode>('HOME');
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(() => AudioManager.getMuted());
  const [volume, setVolume] = useState<number>(() => AudioManager.getVolume());

  // Players & Turn state
  const [players, setPlayers] = useState<Player[]>(() => [
    PlayerManager.createPlayer(1, 'Kapten Leo', 'gold', false),
    PlayerManager.createPlayer(2, 'Kapten Astra', 'blue', true),
  ]);
  const playersRef = useRef<Player[]>(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [turnCounter, setTurnCounter] = useState<number>(1);
  const [turnSubPhase, setTurnSubPhase] = useState<TurnSubPhase>('READY_TO_DRAW');
  const [statusBannerText, setStatusBannerText] = useState<string>(
    'Tekan AMBIL KARTU untuk memulai langkahmu!'
  );
  const [eventToast, setEventToast] = useState<{ text: string; color: string } | null>(null);

  // Card Deck & Active Question state
  const [remainingCardsInCycle, setRemainingCardsInCycle] = useState<number>(8);
  const [drawnCard, setDrawnCard] = useState<CardItem | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<{
    tile: number;
    question: MathQuestion;
  } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [currentCamera, setCurrentCamera] = useState<CameraPreset>('ISOMETRIC');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [setupFrom, setSetupFrom] = useState<'HOME' | 'PLAYING'>('HOME');
  const [hasSavedMatch, setHasSavedMatch] = useState<boolean>(
    () => ScoreManager.loadActiveProgress() !== null
  );

  // In follow mode, switch the camera to whichever player currently has the turn.
  useEffect(() => {
    if (screenMode !== 'PLAYING' || currentCamera !== 'FOLLOW') return;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer) sceneRef.current?.setCameraPreset('FOLLOW', activePlayer.id);
  }, [activePlayerIndex, currentCamera, screenMode]);

  // Initialize Three.js 3D Galaxy Scene
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const galaxyScene = new GalaxyScene3D(canvasContainerRef.current);
    sceneRef.current = galaxyScene;
    galaxyScene.syncPlayers(playersRef.current);

    return () => {
      galaxyScene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const showToast = useCallback((text: string, color: string = '#00F2FE', duration = 2600) => {
    setEventToast({ text, color });
    setTimeout(() => {
      setEventToast((prev) => (prev?.text === text ? null : prev));
    }, duration);
  }, []);

  // Advance turn to the next player
  const finishTurnAndAdvance = useCallback(
    (updatedPlayers: Player[]) => {
      const nextIndex = (activePlayerIndex + 1) % updatedPlayers.length;
      const nextTurnCounter = turnCounter + 1;
      setPlayers(updatedPlayers);
      setActivePlayerIndex(nextIndex);
      setTurnCounter(nextTurnCounter);
      setDrawnCard(null);
      setIsCardFlipped(false);
      setTurnSubPhase('READY_TO_DRAW');

      const nextPlayer = updatedPlayers[nextIndex];
      setStatusBannerText(
        nextPlayer.isAI
          ? `Robot AI ${nextPlayer.name} bersiap mengambil kartu...`
          : `Giliran ${nextPlayer.name}! Tekan AMBIL KARTU.`
      );

      engineRef.current.saveProgress(updatedPlayers, nextIndex, nextTurnCounter);
      sceneRef.current?.updateRobotPositionsInstant(updatedPlayers);
    },
    [activePlayerIndex, turnCounter]
  );

  // Crown winner when a player reaches Tile 100
  const triggerVictory = useCallback((winningPlayer: Player, allPlayers: Player[]) => {
    setWinner(winningPlayer);
    setTurnSubPhase('GAME_WON');
    setScreenMode('VICTORY');
    AudioManager.playVictoryFanfare();
    sceneRef.current?.setRobotAnimation(winningPlayer.id, 'VICTORY');
    sceneRef.current?.triggerCelebrationBurst(winningPlayer.id, '#FDE047');
    ScoreManager.saveMatchResult(winningPlayer, allPlayers);
    ScoreManager.clearActiveProgress();
    setHasSavedMatch(false);
  }, []);

  // Execute step-by-step 3D movement, followed by Snake/Ladder check, followed by Question Tile check
  const executeRobotSteps = useCallback(
    async (steps: number, reasonLabel: string) => {
      const currentPlayers = [...playersRef.current];
      const player = { ...currentPlayers[activePlayerIndex] };
      const startTile = player.position;
      const targetTile = Math.min(100, startTile + steps);

      setTurnSubPhase('ROBOT_MOVING');
      setStatusBannerText(`${player.name} berjalan ${steps} petak (${startTile} → ${targetTile})...`);

      if (sceneRef.current) {
        await sceneRef.current.animateRobotSteps(
          player.id,
          startTile,
          targetTile,
          (stepTile) => {
            player.position = stepTile;
            currentPlayers[activePlayerIndex] = { ...player };
            setPlayers([...currentPlayers]);
          }
        );
      } else {
        player.position = targetTile;
      }

      let finalTile = targetTile;
      let actionSummary = `${reasonLabel} (${startTile} → ${targetTile})`;

      // 1. Check if player reached FINISH (Tile 100)
      if (finalTile >= 100) {
        player.position = 100;
        player.history = [
          ...player.history,
          {
            turn: turnCounter,
            action: `${actionSummary} - MENCAPAI FINISH!`,
            tileFrom: startTile,
            tileTo: 100,
            pointsDelta: 0,
          },
        ];
        currentPlayers[activePlayerIndex] = player;
        setPlayers(currentPlayers);
        sceneRef.current?.updateRobotPositionsInstant(currentPlayers);
        triggerVictory(player, currentPlayers);
        return;
      }

      // 2. Check if landed on Energy Ladder or Cosmic Space Serpent
      const sl = engineRef.current.checkSnakeOrLadder(finalTile);
      if (sl) {
        setTurnSubPhase('SNAKE_OR_LADDER');
        const isLadder = sl.type === 'LADDER';
        const bannerMsg = isLadder
          ? `⚡ NAIK ${sl.name.toUpperCase()}! (Petak ${sl.startTile} → ${sl.endTile})`
          : `🐍 MELUNCUR DI ${sl.name.toUpperCase()}! (Petak ${sl.startTile} → ${sl.endTile})`;

        setStatusBannerText(bannerMsg);
        showToast(bannerMsg, isLadder ? '#34D399' : '#FF2A85', 3000);

        if (sceneRef.current) {
          await sceneRef.current.animateSnakeOrLadder(player.id, sl.id, sl.type);
        }

        finalTile = sl.endTile;
        player.position = finalTile;
        actionSummary += isLadder
          ? ` + Naik Tangga ke ${finalTile}`
          : ` + Turun Ular ke ${finalTile}`;
        currentPlayers[activePlayerIndex] = { ...player };
        setPlayers([...currentPlayers]);
        sceneRef.current?.updateRobotPositionsInstant(currentPlayers);
      }

      // Record movement in player history
      player.history = [
        ...player.history,
        {
          turn: turnCounter,
          action: actionSummary,
          tileFrom: startTile,
          tileTo: finalTile,
          pointsDelta: 0,
        },
      ];
      currentPlayers[activePlayerIndex] = player;
      setPlayers([...currentPlayers]);

      // 3. Check if final resting tile is one of the 20 Math Question Tiles
      const mathQ = engineRef.current.checkQuestionTile(finalTile);
      if (mathQ) {
        setTurnSubPhase('MATH_QUESTION');
        setStatusBannerText(`Petak Soal #${finalTile}! Jawab soal matematika untuk +5 Poin!`);
        setActiveQuestion({ tile: finalTile, question: mathQ });
        return;
      }

      // Otherwise finish turn
      finishTurnAndAdvance(currentPlayers);
    },
    [activePlayerIndex, turnCounter, finishTurnAndAdvance, showToast, triggerVictory]
  );

  // Draw a card from the single 3D Point Hunting Deck
  const handleDrawCard = useCallback(
    (forceNonStar: boolean = false, bonusExtraDraw: boolean = false) => {
      if (
        turnSubPhase !== 'READY_TO_DRAW' &&
        !forceNonStar &&
        !bonusExtraDraw
      ) {
        return;
      }

      const activePlayer = playersRef.current[activePlayerIndex];
      setTurnSubPhase('SHUFFLING');
      setStatusBannerText(`Mengocok Tumpukan Kartu Berburu Poin untuk ${activePlayer.name}...`);
      AudioManager.playCardShuffle();

      setTimeout(() => {
        const result = forceNonStar
          ? engineRef.current.drawGuaranteedNonStarCard()
          : engineRef.current.drawPointHuntingCard();

        if (result.reshuffled) {
          showToast('🔄 8 Kartu selesai 1 putaran! Deck dikocok ulang secara adil.', '#00F2FE');
        }

        setRemainingCardsInCycle(engineRef.current.cardManager.getRemainingCount());
        setDrawnCard(result.card);
        setIsCardFlipped(false);
        setTurnSubPhase('CARD_REVEAL');

        // Trigger 3D flip animation shortly after card pops out of deck
        setTimeout(() => {
          setIsCardFlipped(true);
          AudioManager.playCardFlip();
        }, 180);

        // Resolve card effect after reveal
        setTimeout(() => {
          const cardVal = result.card.value;

          if (typeof cardVal === 'number') {
            // Kartu Angka 1 - 6
            executeRobotSteps(cardVal, `Kartu Angka ${cardVal}`);
          } else if (cardVal === 'ZONK') {
            // Kartu Zonk: Robot tidak bergerak
            AudioManager.playZonk();
            sceneRef.current?.setRobotAnimation(activePlayer.id, 'DISAPPOINTED');
            const zonkMsg = 'ZONK! Kesempatan bergerak terlewat.';
            setStatusBannerText(zonkMsg);
            showToast(`💥 ${activePlayer.name}: ${zonkMsg}`, '#F43F5E', 2500);

            setTimeout(() => {
              sceneRef.current?.setRobotAnimation(activePlayer.id, 'IDLE');
              const updated = [...playersRef.current];
              const p = { ...updated[activePlayerIndex] };
              p.history = [
                ...p.history,
                {
                  turn: turnCounter,
                  action: 'Kartu ZONK (Tidak bergerak)',
                  tileFrom: p.position,
                  tileTo: p.position,
                  pointsDelta: 0,
                },
              ];
              updated[activePlayerIndex] = p;
              finishTurnAndAdvance(updated);
            }, 1700);
          } else if (cardVal === 'STAR') {
            // Kartu Bintang
            AudioManager.playStarBonus();
            sceneRef.current?.setRobotAnimation(activePlayer.id, 'SPECIAL');
            sceneRef.current?.triggerCelebrationBurst(activePlayer.id, '#FDE047');

            const currentPlayer = playersRef.current[activePlayerIndex] || activePlayer;
            const hasBonus = engineRef.current.hasAvailableStarBonus(currentPlayer);
            if (hasBonus) {
              setDrawnCard(null);
              setIsCardFlipped(false);
              setTurnSubPhase('STAR_BONUS_CHOICE');
              setStatusBannerText(
                `${activePlayer.name} mendapat KARTU BINTANG! Pilih 1 Bonus Spesial!`
              );
            } else {
              // Specification: If all 3 bonuses have been used by this player, automatically redraw until number or Zonk
              showToast(
                `⭐ Semua 3 Bonus Bintang ${activePlayer.name} sudah terpakai! Mengambil kartu acak otomatis...`,
                '#F59E0B',
                2800
              );
              setStatusBannerText('Semua 3 Bonus Bintang sudah dipakai! Mengambil kartu lagi...');
              setTimeout(() => {
                sceneRef.current?.setRobotAnimation(activePlayer.id, 'IDLE');
                handleDrawCard(true);
              }, 1100);
            }
          }
        }, 1650);
      }, 600);
    },
    [activePlayerIndex, executeRobotSteps, finishTurnAndAdvance, showToast, turnCounter, turnSubPhase]
  );

  // Handle player (or AI) choosing one of the 3 Star Bonuses
  const handleSelectStarBonus = useCallback(
    (bonusType: StarBonusType) => {
      const currentPlayers = [...playersRef.current];
      const currentPlayer = currentPlayers[activePlayerIndex];
      if (!currentPlayer || !currentPlayer.bonusInventory[bonusType]) return;

      AudioManager.playStarBonus();
      const player = {
        ...currentPlayer,
        bonusInventory: { ...currentPlayer.bonusInventory },
      };

      // Mark this bonus as used for this player
      player.bonusInventory[bonusType] = false;
      currentPlayers[activePlayerIndex] = player;
      // Keep turn logic in sync before movement or an extra draw starts.
      playersRef.current = currentPlayers;
      sceneRef.current?.setRobotAnimation(player.id, 'IDLE');

      if (bonusType === 'POINTS_10') {
        player.points += 10;
        player.bonusHistory = [...player.bonusHistory, '+10 Poin'];
        player.history = [
          ...player.history,
          {
            turn: turnCounter,
            action: 'Bonus Bintang: +10 Poin',
            tileFrom: player.position,
            tileTo: player.position,
            pointsDelta: 10,
          },
        ];
        currentPlayers[activePlayerIndex] = player;
        setPlayers(currentPlayers);
        sceneRef.current?.triggerCelebrationBurst(player.id, '#FDE047');
        showToast(`⭐ ${player.name} memilih BONUS +10 POIN!`, '#F59E0B');
        finishTurnAndAdvance(currentPlayers);
      } else if (bonusType === 'STEPS_6') {
        player.bonusHistory = [...player.bonusHistory, 'Maju 6 Langkah'];
        currentPlayers[activePlayerIndex] = player;
        setPlayers(currentPlayers);
        showToast(`🚀 ${player.name} memilih BONUS MAJU 6 LANGKAH!`, '#00F2FE');
        executeRobotSteps(6, 'Bonus Bintang: Maju 6 Langkah');
      } else if (bonusType === 'EXTRA_CARD') {
        player.bonusHistory = [...player.bonusHistory, 'Acak Kartu 1x'];
        currentPlayers[activePlayerIndex] = player;
        setPlayers(currentPlayers);
        showToast(`🃏 ${player.name} memilih BONUS ACAK KARTU 1X!`, '#A855F7');
        // An extra draw is allowed during bonus resolution, but only once per inventory.
        const stillHasBonus = StarBonusManager.hasAnyBonusAvailable(player);
        handleDrawCard(!stillHasBonus, true);
      }
    },
    [activePlayerIndex, executeRobotSteps, finishTurnAndAdvance, handleDrawCard, showToast, turnCounter]
  );

  // Handle AI automatic turn & AI automatic Star Bonus selection
  useEffect(() => {
    if (screenMode !== 'PLAYING') return;
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || !activePlayer.isAI) return;

    if (turnSubPhase === 'READY_TO_DRAW') {
      const timer = setTimeout(() => {
        handleDrawCard(false);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (turnSubPhase === 'STAR_BONUS_CHOICE') {
      const timer = setTimeout(() => {
        const aiChoice = StarBonusManager.chooseBonusForAI(activePlayer);
        if (aiChoice) {
          handleSelectStarBonus(aiChoice);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [screenMode, activePlayerIndex, turnSubPhase, players, handleDrawCard, handleSelectStarBonus]);

  // Handle completing a Math Question on one of the 20 Question Tiles
  const handleMathQuestionComplete = (isCorrect: boolean) => {
    const currentPlayers = [...playersRef.current];
    const player = { ...currentPlayers[activePlayerIndex] };
    player.totalQuestions += 1;

    if (isCorrect) {
      player.points += 5;
      player.correctAnswers += 1;
      sceneRef.current?.setRobotAnimation(player.id, 'VICTORY');
      sceneRef.current?.triggerCelebrationBurst(player.id, '#34D399');
      showToast(`🌟 JAWABAN BENAR! ${player.name} mendapat +5 POIN!`, '#10B981');
    } else {
      sceneRef.current?.setRobotAnimation(player.id, 'DISAPPOINTED');
      showToast(`💡 Jawaban belum tepat (+0 Poin). Tetap semangat ${player.name}!`, '#F43F5E');
    }

    player.history = [
      ...player.history,
      {
        turn: turnCounter,
        action: isCorrect ? 'Soal Matematika: BENAR (+5 Poin)' : 'Soal Matematika: SALAH (+0 Poin)',
        tileFrom: player.position,
        tileTo: player.position,
        pointsDelta: isCorrect ? 5 : 0,
      },
    ];

    currentPlayers[activePlayerIndex] = player;
    setActiveQuestion(null);

    setTimeout(() => {
      sceneRef.current?.setRobotAnimation(player.id, 'IDLE');
      finishTurnAndAdvance(currentPlayers);
    }, 900);
  };

  // Start a fresh game session from Setup
  const handleStartNewGame = (configuredPlayers: Player[]) => {
    engineRef.current.resetSession();
    setPlayers(configuredPlayers);
    setActivePlayerIndex(0);
    setTurnCounter(1);
    setRemainingCardsInCycle(8);
    setDrawnCard(null);
    setIsCardFlipped(false);
    setActiveQuestion(null);
    setWinner(null);
    setTurnSubPhase('READY_TO_DRAW');
    setStatusBannerText(
      `Petualangan dimulai! Giliran ${configuredPlayers[0].name} mengambil kartu.`
    );
    setScreenMode('PLAYING');

    sceneRef.current?.syncPlayers(configuredPlayers);
    sceneRef.current?.setCameraPreset('ISOMETRIC');
    setCurrentCamera('ISOMETRIC');
    engineRef.current.saveProgress(configuredPlayers, 0, 1);
    setHasSavedMatch(true);
  };

  // Resume saved match from LocalStorage
  const handleResumeSavedMatch = () => {
    const saved = ScoreManager.loadActiveProgress();
    if (!saved || !saved.players || saved.players.length === 0) return;
    setPlayers(saved.players);
    setActivePlayerIndex(saved.currentTurnIndex);
    setTurnCounter(saved.turnCounter);
    setTurnSubPhase('READY_TO_DRAW');
    setScreenMode('PLAYING');
    sceneRef.current?.syncPlayers(saved.players);
    sceneRef.current?.setCameraPreset('ISOMETRIC');
  };

  // Camera Preset Selection
  const handleSelectCamera = (preset: CameraPreset) => {
    setCurrentCamera(preset);
    setAutoRotate(false);
    sceneRef.current?.setAutoRotate(false);
    const activePlayer = players[activePlayerIndex];
    sceneRef.current?.setCameraPreset(preset, activePlayer?.id);
  };

  const handleToggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    sceneRef.current?.setAutoRotate(next);
  };

  // Audio Mute & Volume Handlers
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    AudioManager.setMuted(nextMute);
  };

  const handleChangeVolume = (val: number) => {
    setVolume(val);
    AudioManager.setVolume(val);
  };

  const activePlayer = players[activePlayerIndex] || players[0];

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden galaxy-bg select-none">
      {/* 100% Full-Viewport Interactive Three.js 3D Galaxy & 100-Tile Board Canvas */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating Event Toast Banner */}
      {eventToast && (
        <div className="fixed top-32 sm:top-36 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce w-max max-w-[92vw]">
          <div
            className="px-5 py-2.5 rounded-2xl font-display font-bold text-sm sm:text-lg text-white text-center shadow-2xl border-[3px] border-white"
            style={{
              background: `linear-gradient(180deg, ${eventToast.color} 0%, #1b3fae 100%)`,
              boxShadow: `0 5px 0 #0f2a85, 0 0 30px ${eventToast.color}aa`,
              textShadow: '0 2px 0 rgba(0,0,60,0.6)',
            }}
          >
            {eventToast.text}
          </div>
        </div>
      )}

      {/* SCREEN 1: HOME SCREEN */}
      {screenMode === 'HOME' && (
        <HomeScreen
          hasSavedMatch={hasSavedMatch}
          onStartSetup={() => {
            setSetupFrom('HOME');
            setScreenMode('SETUP');
          }}
          onResumeSavedMatch={handleResumeSavedMatch}
          onOpenGuide={() => setShowGuide(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* SCREEN 2: PLAYER & ROBOT SETUP */}
      {screenMode === 'SETUP' && (
        <PlayerSetupScreen
          onBack={() => setScreenMode(setupFrom)}
          onStartGame={handleStartNewGame}
        />
      )}

      {/* SCREEN 3: ACTIVE 3D GAMEPLAY HUD & 3D CARD DECK */}
      {screenMode === 'PLAYING' && activePlayer && (
        <>
          <GameplayHUD
            players={players}
            activePlayerIndex={activePlayerIndex}
            currentCamera={currentCamera}
            autoRotate={autoRotate}
            isMuted={isMuted}
            onSelectCamera={handleSelectCamera}
            onToggleAutoRotate={handleToggleAutoRotate}
            onOpenPlayerSetup={() => {
              setSetupFrom('PLAYING');
              setScreenMode('SETUP');
            }}
            onToggleMute={handleToggleMute}
            onOpenGuide={() => setShowGuide(true)}
            onOpenSettings={() => setShowSettings(true)}
            onReturnHome={() => setScreenMode('HOME')}
          />

          <PointHuntingDeck3D
            activePlayer={activePlayer}
            turnSubPhase={turnSubPhase}
            remainingInCycle={remainingCardsInCycle}
            drawnCard={drawnCard}
            isCardFlipped={isCardFlipped}
            statusBannerText={statusBannerText}
            onDrawCard={() => handleDrawCard(false)}
          />

          {/* Star Bonus Modal when Kartu Bintang is drawn */}
          {turnSubPhase === 'STAR_BONUS_CHOICE' && (
            <StarBonusModal
              player={activePlayer}
              onSelectBonus={handleSelectStarBonus}
            />
          )}

          {/* Holographic Math Question Modal when landing on one of the 20 Question Tiles */}
          {turnSubPhase === 'MATH_QUESTION' && activeQuestion && (
            <MathQuestionModal
              player={activePlayer}
              tileNumber={activeQuestion.tile}
              question={activeQuestion.question}
              onComplete={handleMathQuestionComplete}
            />
          )}
        </>
      )}

      {/* SCREEN 4: VICTORY CELEBRATION (GALAXY CHAMPION!) */}
      {screenMode === 'VICTORY' && winner && (
        <VictoryScreen
          winner={winner}
          players={players}
          onPlayAgain={() => {
            // Reset current players to Tile 1 for an instant rematch
            const resetPlayers = players.map((p, idx) =>
              PlayerManager.createPlayer(idx + 1, p.name, p.robotColor, p.isAI)
            );
            handleStartNewGame(resetPlayers);
          }}
          onBackToMenu={() => setScreenMode('HOME')}
        />
      )}

      {/* GUIDE MODAL */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {/* SETTINGS & AUDIO MODAL */}
      {showSettings && (
        <SettingsModal
          isMuted={isMuted}
          volume={volume}
          onToggleMute={handleToggleMute}
          onChangeVolume={handleChangeVolume}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;

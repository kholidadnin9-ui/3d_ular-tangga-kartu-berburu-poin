import { Player, RobotColorId, RobotTheme } from '../types/game';
import { StarBonusManager } from './StarBonusManager';

export const ROBOT_THEMES: Record<RobotColorId, RobotTheme> = {
  gold: {
    id: 'gold',
    name: 'Gold Robot',
    title: 'Kapten Aurum X-1',
    primaryHex: '#F8FAFC',
    accentHex: '#F59E0B',
    glowHex: '#FDE047',
    badgeBg: 'from-amber-400 to-yellow-600',
    description: 'Robot penjelajah galaksi dengan armor putih mutiara dan inti energi emas.',
  },
  blue: {
    id: 'blue',
    name: 'Blue Robot',
    title: 'Kapten Nova B-2',
    primaryHex: '#3B82F6',
    accentHex: '#00F2FE',
    glowHex: '#38BDF8',
    badgeBg: 'from-cyan-400 to-blue-600',
    description: 'Robot navigasi cepat dengan perisai sian elektrik dan sayap ion.',
  },
  green: {
    id: 'green',
    name: 'Green Robot',
    title: 'Kapten Emerald G-3',
    primaryHex: '#22C55E',
    accentHex: '#10B981',
    glowHex: '#34D399',
    badgeBg: 'from-emerald-400 to-green-600',
    description: 'Robot peneliti planet dengan sensor zamrud bercahaya.',
  },
  red: {
    id: 'red',
    name: 'Red Robot',
    title: 'Kapten Blaze R-4',
    primaryHex: '#EF4444',
    accentHex: '#F43F5E',
    glowHex: '#FB7185',
    badgeBg: 'from-rose-400 to-red-600',
    description: 'Robot pendorong roket dengan turbin merah supernova.',
  },
};

export const ROBOT_COLOR_LIST: RobotColorId[] = ['gold', 'blue', 'green', 'red'];

export class PlayerManager {
  public static createPlayer(
    id: number,
    name: string,
    robotColor: RobotColorId,
    isAI: boolean = false
  ): Player {
    return {
      id,
      name: name.trim() || `Kapten ${id}`,
      isAI,
      robotColor,
      position: 1,
      points: 0,
      bonusInventory: StarBonusManager.createInitialInventory(),
      bonusHistory: [],
      history: [
        {
          turn: 0,
          action: 'Siap di Planet Biru (START)',
          tileFrom: 1,
          tileTo: 1,
          pointsDelta: 0,
        },
      ],
      correctAnswers: 0,
      totalQuestions: 0,
    };
  }
}

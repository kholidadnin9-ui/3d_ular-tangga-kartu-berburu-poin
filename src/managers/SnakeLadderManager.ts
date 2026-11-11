import { SnakeOrLadder } from '../types/game';

export const SNAKES_AND_LADDERS: SnakeOrLadder[] = [
  // 6 Space Ladders (Energy Ladder, Jembatan Laser, Space Elevator, Warp Energy Bridge)
  {
    id: 'ladder-1',
    type: 'LADDER',
    name: 'Energy Ladder Alpha',
    startTile: 4,
    endTile: 25,
    colorHex: '#00F2FE',
    accentHex: '#38BDF8',
  },
  {
    id: 'ladder-2',
    type: 'LADDER',
    name: 'Jembatan Laser Cygnus',
    startTile: 13,
    endTile: 46,
    colorHex: '#10B981',
    accentHex: '#34D399',
  },
  {
    id: 'ladder-3',
    type: 'LADDER',
    name: 'Space Elevator Orion',
    startTile: 33,
    endTile: 49,
    colorHex: '#00F2FE',
    accentHex: '#A7F3D0',
  },
  {
    id: 'ladder-4',
    type: 'LADDER',
    name: 'Warp Energy Bridge',
    startTile: 42,
    endTile: 63,
    colorHex: '#34D399',
    accentHex: '#00F2FE',
  },
  {
    id: 'ladder-5',
    type: 'LADDER',
    name: 'Hyperion Laser Lift',
    startTile: 50,
    endTile: 69,
    colorHex: '#00F2FE',
    accentHex: '#60A5FA',
  },
  {
    id: 'ladder-6',
    type: 'LADDER',
    name: 'Nova Star Elevator',
    startTile: 74,
    endTile: 92,
    colorHex: '#10B981',
    accentHex: '#FACC15',
  },

  // 6 Cosmic Space Serpents (Cosmic Space Serpent, Alien Space Dragon, Ular Energi Bercahaya)
  {
    id: 'snake-1',
    type: 'SNAKE',
    name: 'Ular Energi Bercahaya',
    startTile: 27,
    endTile: 7,
    colorHex: '#FF2A85',
    accentHex: '#F97316',
  },
  {
    id: 'snake-2',
    type: 'SNAKE',
    name: 'Cosmic Space Serpent',
    startTile: 40,
    endTile: 19,
    colorHex: '#A855F7',
    accentHex: '#EC4899',
  },
  {
    id: 'snake-3',
    type: 'SNAKE',
    name: 'Alien Space Dragon',
    startTile: 54,
    endTile: 31,
    colorHex: '#F97316',
    accentHex: '#FB7185',
  },
  {
    id: 'snake-4',
    type: 'SNAKE',
    name: 'Nebula Plasma Serpent',
    startTile: 66,
    endTile: 45,
    colorHex: '#EC4899',
    accentHex: '#A855F7',
  },
  {
    id: 'snake-5',
    type: 'SNAKE',
    name: 'Draco Meteor Serpent',
    startTile: 87,
    endTile: 56,
    colorHex: '#F43F5E',
    accentHex: '#F59E0B',
  },
  {
    id: 'snake-6',
    type: 'SNAKE',
    name: 'Supernova Space Dragon',
    startTile: 97,
    endTile: 78,
    colorHex: '#FF2A85',
    accentHex: '#C084FC',
  },
];

export class SnakeLadderManager {
  public static getByStartTile(tileNumber: number): SnakeOrLadder | undefined {
    return SNAKES_AND_LADDERS.find((item) => item.startTile === tileNumber);
  }

  public static getAll(): SnakeOrLadder[] {
    return SNAKES_AND_LADDERS;
  }
}

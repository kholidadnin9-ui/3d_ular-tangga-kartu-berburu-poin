export type RobotColorId = 'gold' | 'blue' | 'green' | 'red';

export interface RobotTheme {
  id: RobotColorId;
  name: string;
  title: string;
  primaryHex: string;
  accentHex: string;
  glowHex: string;
  badgeBg: string;
  description: string;
}

export type StarBonusType = 'POINTS_10' | 'STEPS_6' | 'EXTRA_CARD';

export interface StarBonusInventory {
  POINTS_10: boolean; // true = still available, false = already used
  STEPS_6: boolean;
  EXTRA_CARD: boolean;
}

export interface PlayerHistoryItem {
  turn: number;
  action: string;
  tileFrom: number;
  tileTo: number;
  pointsDelta: number;
}

export interface Player {
  id: number;
  name: string;
  isAI: boolean;
  robotColor: RobotColorId;
  position: number; // 1 to 100
  points: number;
  bonusInventory: StarBonusInventory;
  bonusHistory: string[];
  history: PlayerHistoryItem[];
  correctAnswers: number;
  totalQuestions: number;
}

export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 'STAR' | 'ZONK';

export interface CardItem {
  id: string;
  value: CardValue;
  label: string;
  subtitle: string;
  color: string;
}

export interface MathQuestion {
  id: number;
  question: string;
  options: [number, number, number];
  correctAnswer: number;
  category: 'PERKALIAN' | 'PEMBAGIAN';
  explanation: string;
}

export interface SnakeOrLadder {
  id: string;
  type: 'LADDER' | 'SNAKE';
  name: string;
  startTile: number;
  endTile: number;
  colorHex: string;
  accentHex: string;
}

export type TileSpecialType = 'NORMAL' | 'START' | 'FINISH' | 'QUESTION' | 'LADDER_START' | 'SNAKE_HEAD';

export interface TileData {
  number: number; // 1 - 100
  row: number; // 0 - 9
  col: number; // 0 - 9
  x: number;
  y: number;
  z: number;
  special: TileSpecialType;
  connectedTo?: number;
  label?: string;
}

export type CameraPreset = 'ISOMETRIC' | 'TOP' | 'FRONT' | 'SIDE' | 'BACK' | 'FOLLOW';

export type RobotAnimState =
  | 'IDLE'
  | 'WALK'
  | 'RUN'
  | 'JUMP'
  | 'SLIDE'
  | 'VICTORY'
  | 'DISAPPOINTED'
  | 'SPECIAL';

export type ScreenMode = 'HOME' | 'SETUP' | 'PLAYING' | 'VICTORY';

export type TurnSubPhase =
  | 'READY_TO_DRAW'
  | 'SHUFFLING'
  | 'CARD_REVEAL'
  | 'STAR_BONUS_CHOICE'
  | 'ROBOT_MOVING'
  | 'SNAKE_OR_LADDER'
  | 'MATH_QUESTION'
  | 'TURN_END'
  | 'GAME_WON';

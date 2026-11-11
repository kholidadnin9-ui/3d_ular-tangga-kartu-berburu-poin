import { Player, StarBonusInventory, StarBonusType } from '../types/game';

export interface StarBonusOptionInfo {
  type: StarBonusType;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
}

export const STAR_BONUS_OPTIONS: StarBonusOptionInfo[] = [
  {
    type: 'POINTS_10',
    title: 'BONUS 1: +10 POIN',
    subtitle: 'Langsung tambah 10 Poin Bintang ke skor kamu!',
    badge: '+10 POIN',
    color: '#F59E0B',
  },
  {
    type: 'STEPS_6',
    title: 'BONUS 2: 6 LANGKAH',
    subtitle: 'Robot melaju cepat 6 petak ke depan!',
    badge: '+6 PETAK',
    color: '#00F2FE',
  },
  {
    type: 'EXTRA_CARD',
    title: 'BONUS 3: ACAK KARTU 1X',
    subtitle: 'Ambil 1 kartu tambahan secara acak sekarang!',
    badge: 'ACAK 1X',
    color: '#A855F7',
  },
];

export class StarBonusManager {
  public static createInitialInventory(): StarBonusInventory {
    return {
      POINTS_10: true,
      STEPS_6: true,
      EXTRA_CARD: true,
    };
  }

  public static hasAnyBonusAvailable(player: Player): boolean {
    const inv = player.bonusInventory;
    return inv.POINTS_10 || inv.STEPS_6 || inv.EXTRA_CARD;
  }

  public static getAvailableBonuses(player: Player): StarBonusType[] {
    const available: StarBonusType[] = [];
    if (player.bonusInventory.POINTS_10) available.push('POINTS_10');
    if (player.bonusInventory.STEPS_6) available.push('STEPS_6');
    if (player.bonusInventory.EXTRA_CARD) available.push('EXTRA_CARD');
    return available;
  }

  // Smart AI decision when AI draws a Star Card
  public static chooseBonusForAI(player: Player): StarBonusType | null {
    const avail = this.getAvailableBonuses(player);
    if (avail.length === 0) return null;
    // Prefer 6 steps if available to race toward tile 100, then 10 points, then extra card
    if (avail.includes('STEPS_6')) return 'STEPS_6';
    if (avail.includes('POINTS_10')) return 'POINTS_10';
    return avail[0];
  }
}

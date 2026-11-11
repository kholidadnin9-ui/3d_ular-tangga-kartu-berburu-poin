import { Player } from '../types/game';

export interface SavedMatchRecord {
  id: string;
  date: string;
  winnerName: string;
  winnerRobot: string;
  winnerPoints: number;
  players: {
    name: string;
    position: number;
    points: number;
    robotColor: string;
  }[];
}

const STORAGE_RECORDS_KEY = 'galaxy_adventure_records_v1';
const STORAGE_PROGRESS_KEY = 'galaxy_adventure_saved_match_v1';

export class ScoreManager {
  // Specification: Pemenang ditentukan oleh pemain pertama yang mencapai petak FINISH (100),
  // bukan berdasarkan poin tertinggi. Peringkat mengutamakan pemain yang mencapai petak 100, lalu posisi petak & poin.
  public static rankPlayers(players: Player[], winnerId?: number | null): Player[] {
    return [...players].sort((a, b) => {
      if (winnerId !== undefined && winnerId !== null) {
        if (a.id === winnerId) return -1;
        if (b.id === winnerId) return 1;
      }
      if (b.position !== a.position) {
        return b.position - a.position;
      }
      return b.points - a.points;
    });
  }

  public static saveMatchResult(winner: Player, players: Player[]) {
    try {
      const existing = this.getMatchRecords();
      const record: SavedMatchRecord = {
        id: String(Date.now()),
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        winnerName: winner.name,
        winnerRobot: winner.robotColor,
        winnerPoints: winner.points,
        players: this.rankPlayers(players, winner.id).map((p) => ({
          name: p.name,
          position: p.position,
          points: p.points,
          robotColor: p.robotColor,
        })),
      };
      const updated = [record, ...existing].slice(0, 10);
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }

  public static getMatchRecords(): SavedMatchRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_RECORDS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static saveActiveProgress(data: {
    players: Player[];
    currentTurnIndex: number;
    turnCounter: number;
  }) {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(data));
    } catch {}
  }

  public static loadActiveProgress(): {
    players: Player[];
    currentTurnIndex: number;
    turnCounter: number;
  } | null {
    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static clearActiveProgress() {
    try {
      localStorage.removeItem(STORAGE_PROGRESS_KEY);
    } catch {}
  }
}

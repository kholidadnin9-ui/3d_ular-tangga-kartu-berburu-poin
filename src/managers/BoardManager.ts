import { TileData, TileSpecialType } from '../types/game';
import { QUESTION_TILES } from './QuestionManager';
import { SNAKES_AND_LADDERS } from './SnakeLadderManager';

export const TILE_SPACING = 2.25;
export const BOARD_SIZE = 10;

export class BoardManager {
  private static tiles: TileData[] = [];

  public static getTiles(): TileData[] {
    if (this.tiles.length > 0) return this.tiles;

    const list: TileData[] = [];
    const offset = ((BOARD_SIZE - 1) * TILE_SPACING) / 2;

    for (let num = 1; num <= 100; num++) {
      const idx = num - 1;
      const row = Math.floor(idx / 10); // 0 (bottom/front) to 9 (top/back)
      const colInRow = idx % 10;
      // Classic snakes & ladders zig-zag: even rows left-to-right, odd rows right-to-left
      const col = row % 2 === 0 ? colInRow : 9 - colInRow;

      // X goes left (-) to right (+)
      const x = col * TILE_SPACING - offset;
      // Z goes front (+) to back (-) so Tile 1 is at the front-left closest to player
      const z = (9 - row) * TILE_SPACING - offset;
      // Slight gentle terrace rise per row so the 3D board has rich depth
      const y = 0;

      let special: TileSpecialType = 'NORMAL';
      let connectedTo: number | undefined;
      let label: string | undefined;

      const sl = SNAKES_AND_LADDERS.find((item) => item.startTile === num);
      if (num === 1) {
        special = 'START';
        label = 'START';
      } else if (num === 100) {
        special = 'FINISH';
        label = 'FINISH';
      } else if (sl) {
        special = sl.type === 'LADDER' ? 'LADDER_START' : 'SNAKE_HEAD';
        connectedTo = sl.endTile;
        label = sl.type === 'LADDER' ? `▲ ${sl.endTile}` : `▼ ${sl.endTile}`;
      } else if (QUESTION_TILES.includes(num)) {
        special = 'QUESTION';
        label = '?';
      }

      list.push({
        number: num,
        row,
        col,
        x,
        y,
        z,
        special,
        connectedTo,
        label,
      });
    }

    this.tiles = list;
    return this.tiles;
  }

  public static getTile(tileNumber: number): TileData {
    const tiles = this.getTiles();
    const clamped = Math.max(1, Math.min(100, tileNumber));
    return tiles[clamped - 1];
  }

  // Offset multiple robots standing on the same tile so they never clip into each other
  public static getRobotSlotOffset(playerIndex: number, totalOnTile: number): { dx: number; dz: number } {
    if (totalOnTile <= 1) return { dx: 0, dz: 0 };
    const radius = 0.52;
    const angle = (playerIndex / totalOnTile) * Math.PI * 2 + Math.PI / 4;
    return {
      dx: Math.cos(angle) * radius,
      dz: Math.sin(angle) * radius,
    };
  }
}

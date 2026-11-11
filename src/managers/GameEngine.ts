import { CardManager } from './CardManager';
import { QuestionManager } from './QuestionManager';
import { SnakeLadderManager } from './SnakeLadderManager';
import { StarBonusManager } from './StarBonusManager';
import { ScoreManager } from './ScoreManager';
import { CardItem, MathQuestion, Player, SnakeOrLadder } from '../types/game';

export class GameEngine {
  public cardManager: CardManager;
  public questionManager: QuestionManager;

  constructor() {
    this.cardManager = new CardManager();
    this.questionManager = new QuestionManager();
  }

  public resetSession() {
    this.cardManager.shuffleNewCycle();
    this.questionManager.resetPool();
  }

  public drawPointHuntingCard(): { card: CardItem; reshuffled: boolean } {
    return this.cardManager.drawCard();
  }

  public drawGuaranteedNonStarCard(): { card: CardItem; reshuffled: boolean } {
    return this.cardManager.drawGuaranteedNonStarCard();
  }

  public checkSnakeOrLadder(tileNumber: number): SnakeOrLadder | undefined {
    return SnakeLadderManager.getByStartTile(tileNumber);
  }

  public checkQuestionTile(tileNumber: number): MathQuestion | null {
    if (this.questionManager.isQuestionTile(tileNumber)) {
      return this.questionManager.drawNextQuestion();
    }
    return null;
  }

  public hasAvailableStarBonus(player: Player): boolean {
    return StarBonusManager.hasAnyBonusAvailable(player);
  }

  public saveProgress(players: Player[], currentTurnIndex: number, turnCounter: number) {
    ScoreManager.saveActiveProgress({ players, currentTurnIndex, turnCounter });
  }
}

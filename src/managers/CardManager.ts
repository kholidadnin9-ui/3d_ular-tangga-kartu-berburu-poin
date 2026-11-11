import { CardItem, CardValue } from '../types/game';

export const MASTER_DECK_CARDS: CardItem[] = [
  {
    id: 'card-1',
    value: 1,
    label: '1 LANGKAH',
    subtitle: 'Robot maju 1 petak antariksa',
    color: '#00F2FE',
  },
  {
    id: 'card-2',
    value: 2,
    label: '2 LANGKAH',
    subtitle: 'Robot maju 2 petak antariksa',
    color: '#38BDF8',
  },
  {
    id: 'card-3',
    value: 3,
    label: '3 LANGKAH',
    subtitle: 'Robot maju 3 petak antariksa',
    color: '#10B981',
  },
  {
    id: 'card-4',
    value: 4,
    label: '4 LANGKAH',
    subtitle: 'Robot maju 4 petak antariksa',
    color: '#A855F7',
  },
  {
    id: 'card-5',
    value: 5,
    label: '5 LANGKAH',
    subtitle: 'Robot maju 5 petak antariksa',
    color: '#F97316',
  },
  {
    id: 'card-6',
    value: 6,
    label: '6 LANGKAH',
    subtitle: 'Kecepatan penuh! Maju 6 petak',
    color: '#EC4899',
  },
  {
    id: 'card-star',
    value: 'STAR',
    label: 'KARTU BINTANG!',
    subtitle: 'Pilih 1 dari 3 Bonus Bintang Spesial!',
    color: '#F59E0B',
  },
  {
    id: 'card-zonk',
    value: 'ZONK',
    label: 'ZONK!',
    subtitle: 'Kesempatan bergerak terlewat!',
    color: '#F43F5E',
  },
];

export class CardManager {
  private currentDeck: CardItem[] = [];
  private discardPile: CardItem[] = [];

  constructor() {
    this.shuffleNewCycle();
  }

  public shuffleNewCycle() {
    const copy = [...MASTER_DECK_CARDS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    this.currentDeck = copy;
    this.discardPile = [];
  }

  public drawCard(): { card: CardItem; reshuffled: boolean } {
    let reshuffled = false;
    if (this.currentDeck.length === 0) {
      this.shuffleNewCycle();
      reshuffled = true;
    }
    const card = this.currentDeck.pop()!;
    this.discardPile.push(card);
    return { card, reshuffled };
  }

  /** Draws from the top in order, consuming any Stars until a number or Zonk appears. */
  public drawGuaranteedNonStarCard(): { card: CardItem; reshuffled: boolean } {
    let reshuffled = false;
    while (true) {
      if (this.currentDeck.length === 0) {
        this.shuffleNewCycle();
        reshuffled = true;
      }

      const card = this.currentDeck.pop()!;
      this.discardPile.push(card);
      if (card.value !== 'STAR') return { card, reshuffled };
    }
  }

  public getRemainingCount(): number {
    return this.currentDeck.length;
  }

  public getRemainingValues(): CardValue[] {
    return this.currentDeck.map((c) => c.value);
  }
}

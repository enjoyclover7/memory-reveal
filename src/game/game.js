const ICONS = [
  { label: '체리', image: './assets/cards/card-01.png' },
  { label: '브라', image: './assets/cards/card-02.png' },
  { label: '팬티', image: './assets/cards/card-03.png' },
  { label: '하이힐', image: './assets/cards/card-04.png' },
  { label: '립스틱', image: './assets/cards/card-05.png' },
  { label: '리본', image: './assets/cards/card-06.png' },
  { label: '장미', image: './assets/cards/card-07.png' },
  { label: '다이아몬드', image: './assets/cards/card-08.png' },
  { label: '핸드백', image: './assets/cards/card-09.png' },
  { label: '달', image: './assets/cards/card-10.png' },
];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

class MemoryGame {
  constructor({ onUpdate, onMatch, onClear }) {
    this.onUpdate = onUpdate;
    this.onMatch = onMatch;
    this.onClear = onClear;
    this.reset();
  }

  reset() {
    this.state = 'START';
    this.cards = shuffle(ICONS.flatMap((icon, pairId) => [
      { id: `${pairId}-a`, pairId, ...icon, status: 'hidden' },
      { id: `${pairId}-b`, pairId, ...icon, status: 'hidden' },
    ]));
    this.flipped = [];
    this.moves = 0;
    this.matches = 0;
    this.startedAt = 0;
    this.finishedAt = 0;
    this.timeoutId = null;
  }

  start() {
    clearTimeout(this.timeoutId);
    this.reset();
    this.state = 'PLAYING';
    this.startedAt = performance.now();
    this.onUpdate(this.snapshot());
  }

  select(cardId) {
    if (this.state !== 'PLAYING') return;
    const card = this.cards.find((item) => item.id === cardId);
    if (!card || card.status !== 'hidden') return;

    card.status = 'flipped';
    this.flipped.push(card);
    this.onUpdate(this.snapshot());
    if (this.flipped.length < 2) return;

    this.moves += 1;
    this.state = 'MATCH_CHECK';
    const [first, second] = this.flipped;
    const matched = first.pairId === second.pairId;
    this.onUpdate(this.snapshot());

    this.timeoutId = setTimeout(() => {
      if (matched) {
        first.status = 'matched';
        second.status = 'matched';
        this.matches += 1;
        this.onMatch(first.pairId);
      } else {
        first.status = 'hidden';
        second.status = 'hidden';
      }
      this.flipped = [];

      if (this.matches === ICONS.length) {
        this.state = 'CLEAR';
        this.finishedAt = performance.now();
        this.onUpdate(this.snapshot());
        this.onClear(this.snapshot());
      } else {
        this.state = 'PLAYING';
        this.onUpdate(this.snapshot());
      }
    }, matched ? 480 : 720);
  }

  elapsedMs() {
    if (!this.startedAt) return 0;
    return (this.finishedAt || performance.now()) - this.startedAt;
  }

  snapshot() {
    return { state: this.state, cards: this.cards, moves: this.moves, matches: this.matches, elapsedMs: this.elapsedMs() };
  }
}

window.MemoryGame = MemoryGame;

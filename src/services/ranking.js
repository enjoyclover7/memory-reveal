const STORAGE_KEY = 'memory-reveal:scores';

function validateNickname(value) {
  const nickname = value.trim().replace(/\s+/g, ' ');
  if (nickname.length < 2 || nickname.length > 12) throw new Error('닉네임은 2~12자로 입력해 주세요.');
  if (/[<>]/.test(nickname)) throw new Error('사용할 수 없는 문자가 포함되어 있습니다.');
  return nickname;
}

function validScore(score) {
  return Number.isFinite(score.clear_time_ms)
    && score.clear_time_ms >= 3000
    && Number.isInteger(score.moves)
    && score.moves >= 10
    && score.moves <= 999;
}

class RankingService {
  // 서버 연결 전 임시 저장소. 추후 이 클래스 내부만 API fetch 구현으로 교체한다.
  async submit({ nickname, clearTimeMs, moves, rewardImageId }) {
    const record = {
      id: crypto.randomUUID(),
      nickname: validateNickname(nickname),
      clear_time_ms: Math.round(clearTimeMs),
      moves: Number(moves),
      reward_image_id: rewardImageId,
      game_version: '1.0.0',
      created_at: new Date().toISOString(),
    };
    if (!validScore(record)) throw new Error('유효하지 않은 게임 기록입니다.');
    const scores = this.readAll();
    scores.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return record;
  }

  async getLeaderboard() {
    const bestByName = new Map();
    for (const score of this.readAll().filter(validScore)) {
      const key = score.nickname.toLocaleLowerCase('ko-KR');
      const current = bestByName.get(key);
      if (!current || this.compare(score, current) < 0) bestByName.set(key, score);
    }
    return [...bestByName.values()].sort((a, b) => this.compare(a, b)).slice(0, 100);
  }

  compare(a, b) {
    return a.clear_time_ms - b.clear_time_ms || a.moves - b.moves || a.created_at.localeCompare(b.created_at);
  }

  readAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
}

window.MemoryRevealRanking = { RankingService, validateNickname };

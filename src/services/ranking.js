function validateNickname(value) {
  const nickname = value.trim().replace(/\s+/g, ' ');
  if (nickname.length < 2 || nickname.length > 12) throw new Error('닉네임은 2~12자로 입력해 주세요.');
  if (/[<>]/.test(nickname)) throw new Error('사용할 수 없는 문자가 포함되어 있습니다.');
  return nickname;
}

class RankingService {
  constructor() {
    const config = window.MemoryRevealSupabaseConfig;
    if (!config?.url || !config?.anonKey) throw new Error('온라인 랭킹 설정이 없습니다.');
    this.rpcUrl = `${config.url}/rest/v1/rpc`;
    this.headers = {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
    };
  }

  async call(functionName, body) {
    let response;
    try {
      response = await fetch(`${this.rpcUrl}/${functionName}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error('인터넷 연결을 확인해 주세요.');
    }
    if (!response.ok) {
      let message = '';
      try { message = (await response.json()).message || ''; } catch {}
      throw new Error(message || '온라인 랭킹 서버에 연결하지 못했습니다.');
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async startSession() {
    return this.call('start_memory_game', {});
  }

  async submit({ nickname, moves, rewardImageId, sessionId }) {
    if (!sessionId) throw new Error('온라인 게임 세션이 없어 기록을 등록할 수 없습니다.');
    return this.call('submit_memory_score', {
      p_session_id: sessionId,
      p_nickname: validateNickname(nickname),
      p_moves: Number(moves),
      p_reward_image_id: rewardImageId,
    });
  }

  async getLeaderboard() {
    return this.call('get_memory_leaderboard', { p_limit: 100 });
  }
}

window.MemoryRevealRanking = { RankingService, validateNickname };

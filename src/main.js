const imageTools = window.MemoryRevealImages;
const RankingServiceAdapter = window.MemoryRevealRanking.RankingService;

const $ = (selector) => document.querySelector(selector);
const screens = [...document.querySelectorAll('.screen')];
const cardGrid = $('#cardGrid');
const rankingService = new RankingServiceAdapter();
let reward = null;
let timerFrame = 0;
let onlineSessionId = null;
let startSequenceId = 0;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function preloadImages(sources) {
  return Promise.all([...new Set(sources)].map((source) => new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = source;
  })));
}

function formatTime(milliseconds) {
  const total = Math.max(0, Math.round(milliseconds));
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const hundredths = Math.floor((total % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === id));
}

function createCards(cards) {
  cardGrid.replaceChildren(...cards.map((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-card';
    button.dataset.cardId = card.id;
    button.setAttribute('aria-label', `${index + 1}번 카드`);
    button.innerHTML = `<span class="card-inner"><span class="card-back"><i></i></span><span class="card-front" aria-label="${card.label}"><img src="${card.image}" alt="" draggable="false"></span></span>`;
    return button;
  }));
}

const game = new MemoryGame({
  onUpdate(snapshot) {
    snapshot.cards.forEach((card) => {
      const element = cardGrid.querySelector(`[data-card-id="${card.id}"]`);
      if (!element) return;
      element.classList.toggle('is-flipped', card.status === 'flipped');
      element.classList.toggle('is-matched', card.status === 'matched');
      element.disabled = snapshot.state !== 'PLAYING' || card.status !== 'hidden';
    });
    $('#progressBar').style.width = `${snapshot.matches * 10}%`;
  },
  onMatch() {},
  onClear(snapshot) {
    cancelAnimationFrame(timerFrame);
    $('#timeDisplay').textContent = formatTime(snapshot.elapsedMs);
    $('#clearTime').textContent = formatTime(snapshot.elapsedMs);
    $('#gameScreen').classList.add('is-clear');
    setTimeout(() => {
      $('#clearPanel').classList.add('is-visible');
      $('#clearPanel').setAttribute('aria-hidden', 'false');
    }, 2000);
  },
});

function updateTimer() {
  $('#timeDisplay').textContent = formatTime(game.elapsedMs());
  if (game.state === 'PLAYING' || game.state === 'MATCH_CHECK') timerFrame = requestAnimationFrame(updateTimer);
}

async function startGame(event) {
  const sequenceId = ++startSequenceId;
  const button = event?.currentTarget;
  if (button) button.disabled = true;
  onlineSessionId = null;
  reward = imageTools.pickRewardImage();
  const image = $('#rewardImage');
  image.src = reward.src;
  image.style.objectPosition = reward.position;
  $('#clearPanel').classList.remove('is-visible');
  $('#clearPanel').setAttribute('aria-hidden', 'true');
  $('#gameScreen').classList.remove('is-clear');
  $('#formMessage').textContent = '';
  $('#scoreForm').reset();
  $('#timeDisplay').textContent = formatTime(0);
  game.preview();
  await preloadImages([reward.src, ...game.cards.map((card) => card.image)]);
  if (sequenceId !== startSequenceId) {
    if (button) button.disabled = false;
    return;
  }
  createCards(game.cards);
  game.onUpdate(game.snapshot());
  showScreen('gameScreen');
  cancelAnimationFrame(timerFrame);

  await wait(1000);
  if (sequenceId !== startSequenceId) {
    if (button) button.disabled = false;
    return;
  }
  game.hidePreview();
  await wait(380);
  if (sequenceId !== startSequenceId) {
    if (button) button.disabled = false;
    return;
  }

  try {
    onlineSessionId = await rankingService.startSession();
  } catch (error) {
    console.warn(error.message);
  } finally {
    if (button) button.disabled = false;
  }
  if (sequenceId !== startSequenceId) return;
  game.start();
  timerFrame = requestAnimationFrame(updateTimer);
}

async function showRanking() {
  showScreen('rankingScreen');
  const status = $('#rankingStatus');
  const list = $('#rankingList');
  status.hidden = false;
  status.textContent = '기록을 불러오는 중...';
  list.replaceChildren();
  try {
    const scores = await rankingService.getLeaderboard();
    if (!scores.length) {
      status.textContent = '아직 등록된 기록이 없어요.\n첫 번째 기록의 주인공이 되어보세요!';
      return;
    }
    status.hidden = true;
    list.replaceChildren(...scores.map((score, index) => {
      const item = document.createElement('li');
      if (index < 3) item.className = `top-rank rank-${index + 1}`;
      const rank = document.createElement('strong');
      const name = document.createElement('span');
      const time = document.createElement('span');
      rank.textContent = index + 1;
      name.textContent = score.nickname;
      time.textContent = formatTime(score.clear_time_ms);
      item.append(rank, name, time);
      return item;
    }));
  } catch {
    status.textContent = '랭킹을 불러오지 못했습니다.\n잠시 후 다시 시도해 주세요.';
  }
}

cardGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.memory-card');
  if (card) game.select(card.dataset.cardId);
});

$('#startButton').addEventListener('click', startGame);
$('#replayButton').addEventListener('click', startGame);
$('#rankingButton').addEventListener('click', showRanking);
$('#clearRankingButton').addEventListener('click', showRanking);
$('#rankingBackButton').addEventListener('click', () => showScreen('startScreen'));
$('#homeButton').addEventListener('click', () => {
  startSequenceId += 1;
  cancelAnimationFrame(timerFrame);
  game.stop();
  showScreen('startScreen');
});

$('#scoreForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = $('#formMessage');
  try {
    await rankingService.submit({
      nickname: $('#nickname').value,
      moves: game.moves,
      rewardImageId: reward.id,
      sessionId: onlineSessionId,
    });
    message.textContent = '기록이 등록되었습니다!';
    event.submitter.disabled = true;
  } catch (error) {
    message.textContent = error.message;
  }
});

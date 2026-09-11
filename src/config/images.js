const REWARD_IMAGES = [
  { id: 'stage1', src: './배경사진/stage1.png', position: '50% 45%' },
  { id: 'stage2', src: './배경사진/stage2.png', position: '50% 42%' },
  { id: 'stage3', src: './배경사진/stage3.png', position: '50% 42%' },
  { id: 'stage4', src: './배경사진/stage4.png', position: '50% 42%' },
  { id: 'stage5', src: './배경사진/stage5.png', position: '50% 45%' },
  { id: 'stage6', src: './배경사진/stage6.png', position: '50% 42%' },
  { id: 'stage7', src: './배경사진/stage7.png', position: '64% 48%' },
];

function pickRewardImage() {
  let previous = null;
  try {
    previous = sessionStorage.getItem('memory-reveal:last-image');
  } catch {
    previous = window.MemoryRevealLastImage || null;
  }
  const candidates = REWARD_IMAGES.length > 1
    ? REWARD_IMAGES.filter((image) => image.id !== previous)
    : REWARD_IMAGES;
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  window.MemoryRevealLastImage = selected.id;
  try {
    sessionStorage.setItem('memory-reveal:last-image', selected.id);
  } catch {
    // file:// 환경에서 저장소가 차단돼도 게임 진행은 유지한다.
  }
  return selected;
}

function preloadRewardImages() {
  REWARD_IMAGES.forEach(({ src }) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });
}

window.MemoryRevealImages = { REWARD_IMAGES, pickRewardImage, preloadRewardImages };

const REWARD_IMAGES = [
  { id: 'stage1', src: './배경사진/stage1.png', position: '50% 45%' },
  { id: 'stage2', src: './배경사진/stage2.png', position: '50% 42%' },
  { id: 'stage3', src: './배경사진/stage3.png', position: '50% 42%' },
  { id: 'stage4', src: './배경사진/stage4.png', position: '50% 42%' },
  { id: 'stage5', src: './배경사진/stage5.png', position: '50% 45%' },
  { id: 'stage6', src: './배경사진/stage6.png', position: '50% 42%' },
  { id: 'stage7', src: './배경사진/stage7.png', position: '64% 48%' },
  { id: 'stage8', src: './배경사진/stage8.png', position: '50% 42%' },
  { id: 'stage9', src: './배경사진/stage9.png', position: '50% 45%' },
  { id: 'stage10', src: './배경사진/stage10.png', position: '50% 42%' },
  { id: 'stage11', src: './배경사진/stage11.png', position: '50% 43%' },
];

const SEEN_IMAGES_KEY = 'memory-reveal:seen-images';

function readSeenImages() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SEEN_IMAGES_KEY) || '[]');
    return stored.filter((id) => REWARD_IMAGES.some((image) => image.id === id));
  } catch {
    return window.MemoryRevealSeenImages || [];
  }
}

function writeSeenImages(ids) {
  window.MemoryRevealSeenImages = ids;
  try { sessionStorage.setItem(SEEN_IMAGES_KEY, JSON.stringify(ids)); } catch {}
}

function hasSeenAllImages() {
  return readSeenImages().length >= REWARD_IMAGES.length;
}

function resetSeenImages() {
  writeSeenImages([]);
}

function pickRewardImage() {
  if (hasSeenAllImages()) resetSeenImages();
  const seen = readSeenImages();
  const candidates = REWARD_IMAGES.filter((image) => !seen.includes(image.id));
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  writeSeenImages([...seen, selected.id]);
  return selected;
}

function preloadRewardImages() {
  REWARD_IMAGES.forEach(({ src }) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });
}

window.MemoryRevealImages = {
  REWARD_IMAGES,
  pickRewardImage,
  preloadRewardImages,
  hasSeenAllImages,
  resetSeenImages,
};

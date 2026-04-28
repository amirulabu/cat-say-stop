import fatcatImg from '@/assets/fatcat.webp';

const OVERLAY_ID = 'cat-say-stop-overlay';
const GIF_ROTATE_MS = 30_000;

const FAT_CAT_GIFS = [
  'https://media.giphy.com/media/pVkmGyqYRt4qY/giphy.gif',
  'https://media.giphy.com/media/YVm9sOmwsdLe8/giphy.gif',
  'https://media.giphy.com/media/gFP318Ouj5x2U/giphy.gif',
  'https://media.giphy.com/media/Tfi5w35wly0x2/giphy.gif',
  'https://media.giphy.com/media/AiTAxk2kavgpa/giphy.gif',
  'https://media.giphy.com/media/zVN0OolkDHmbC/giphy.gif',
  'https://media.giphy.com/media/NQ3SGAMneQ920/giphy.gif',
  'https://media.giphy.com/media/FZuRP6WaW5qg/giphy.gif',
  'https://media.giphy.com/media/jPHnCXMXVa2U8/giphy.gif',
  'https://media.giphy.com/media/12d71hRlD9T2Cc/giphy.gif',
  'https://media.giphy.com/media/Zu6AATBpCeUzm/giphy.gif',
  'https://media.giphy.com/media/3OhXBaoR1tVPW/giphy.gif',
];

let gifQueue: string[] = [];
let gifRotationInterval: ReturnType<typeof setInterval> | null = null;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextGif(): string {
  if (gifQueue.length === 0) gifQueue = shuffle(FAT_CAT_GIFS);
  return gifQueue.pop()!;
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function createOverlay(remainingSeconds: number): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(13, 13, 30, 0.82);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      color: #fff;
      pointer-events: all;
      user-select: none;
    ">
      <img id="cat-say-stop-gif" src="${fatcatImg}" alt="Fat cat" style="
        width: 320px;
        max-width: 80vw;
        max-height: 50vh;
        height: auto;
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        object-fit: contain;
        transition: opacity 0.3s;
      " />
      <div id="cat-say-stop-timer" style="
        font-size: 4.5rem;
        font-weight: 700;
        margin-top: 1.5rem;
        letter-spacing: 0.05em;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 2px 12px rgba(0,0,0,0.6);
      ">${fmtTime(remainingSeconds)}</div>
      <p style="font-size: 1.25rem; opacity: 0.85; margin-top: 0.5rem;">Cat says stop! Take a break.</p>
      <p style="font-size: 0.8125rem; opacity: 0.5; margin-top: 0.25rem;">You'll get your feed back when the timer ends.</p>
    </div>
  `;
  return overlay;
}

function removeOverlay() {
  if (gifRotationInterval) {
    clearInterval(gifRotationInterval);
    gifRotationInterval = null;
  }
  document.getElementById(OVERLAY_ID)?.remove();
}

function setGif(url: string) {
  const img = document.getElementById('cat-say-stop-gif') as HTMLImageElement | null;
  if (!img) return;
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = url;
    img.style.opacity = '1';
  }, 250);
}

function onGifError() {
  const img = document.getElementById('cat-say-stop-gif') as HTMLImageElement | null;
  if (!img || img.src === fatcatImg) return;
  img.src = fatcatImg;
  img.style.opacity = '1';
}

function startGifRotation() {
  if (gifRotationInterval) clearInterval(gifRotationInterval);
  gifQueue = shuffle(FAT_CAT_GIFS);
  const img = document.getElementById('cat-say-stop-gif') as HTMLImageElement | null;
  if (img) img.onerror = onGifError;
  setGif(nextGif());
  gifRotationInterval = setInterval(() => {
    setGif(nextGif());
    const el = document.getElementById('cat-say-stop-gif') as HTMLImageElement | null;
    if (el) el.onerror = onGifError;
  }, GIF_ROTATE_MS);
}

let countdownInterval: ReturnType<typeof setInterval> | null = null;

function updateTimerDisplay(remaining: number) {
  const el = document.getElementById('cat-say-stop-timer');
  if (el) el.textContent = fmtTime(Math.max(0, remaining));
}

function startCountdown(initialSeconds: number) {
  if (countdownInterval) clearInterval(countdownInterval);
  let remaining = initialSeconds;
  updateTimerDisplay(remaining);
  countdownInterval = setInterval(() => {
    remaining--;
    updateTimerDisplay(remaining);
    if (remaining <= 0) {
      clearInterval(countdownInterval!);
      countdownInterval = null;
      removeOverlay();
    }
  }, 1000);
}

async function poll() {
  const res = (await browser.runtime.sendMessage({ type: 'GET_STATUS' })) as {
    isBreak: boolean;
    breakRemainingSeconds: number;
  };

  if (res.isBreak) {
    if (!document.getElementById(OVERLAY_ID)) {
      document.body.appendChild(createOverlay(res.breakRemainingSeconds));
      startCountdown(res.breakRemainingSeconds);
      startGifRotation();
    }
  } else {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    removeOverlay();
  }
}

export default defineContentScript({
  matches: [
    '*://x.com/*',
    '*://twitter.com/*',
    '*://*.x.com/*',
    '*://www.instagram.com/*',
    '*://www.tiktok.com/*',
    '*://www.youtube.com/*',
  ],
  main() {
    poll();
    setInterval(poll, 2000);
  },
});

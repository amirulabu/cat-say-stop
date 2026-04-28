const SOCIAL_HOSTS = ['x.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'youtube.com'];

const K = {
  usageSeconds: 'cssUsageSeconds',
  breakStartedAt: 'cssBreakStartedAt',
  activeSince: 'cssActiveSince',
  usageLimitMin: 'cssUsageLimitMin',
  breakDurationMin: 'cssBreakDurationMin',
};

function isSocialMedia(url: string): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return SOCIAL_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

interface StoredState {
  usageSeconds: number;
  breakStartedAt: number | null;
  activeSince: number | null;
  usageLimitMin: number;
  breakDurationMin: number;
}

async function getState(): Promise<StoredState> {
  const data = await browser.storage.local.get([K.usageSeconds, K.breakStartedAt, K.activeSince]);
  const sync = await browser.storage.sync.get([K.usageLimitMin, K.breakDurationMin]);
  return {
    usageSeconds: (data[K.usageSeconds] as number) ?? 0,
    breakStartedAt: (data[K.breakStartedAt] as number) ?? null,
    activeSince: (data[K.activeSince] as number) ?? null,
    usageLimitMin: (sync[K.usageLimitMin] as number) ?? 60,
    breakDurationMin: (sync[K.breakDurationMin] as number) ?? 5,
  };
}

async function setLocal(items: Record<string, unknown>) {
  await browser.storage.local.set(items);
}

async function transitionToBreak() {
  const state = await getState();
  let totalUsage = state.usageSeconds;
  if (state.activeSince !== null) {
    totalUsage += (Date.now() - state.activeSince) / 1000;
  }
  await setLocal({
    [K.breakStartedAt]: Date.now(),
    [K.activeSince]: null,
    [K.usageSeconds]: Math.min(totalUsage, state.usageLimitMin * 60),
  });
}

async function endBreak() {
  await setLocal({
    [K.breakStartedAt]: null,
    [K.usageSeconds]: 0,
    [K.activeSince]: null,
  });
}

async function startTracking() {
  const state = await getState();
  if (state.breakStartedAt !== null) return;
  await setLocal({ [K.activeSince]: Date.now() });
}

async function stopTracking() {
  const state = await getState();
  if (state.activeSince === null) return;
  const elapsed = (Date.now() - state.activeSince) / 1000;
  const totalUsage = state.usageSeconds + elapsed;
  const limitSec = state.usageLimitMin * 60;

  if (totalUsage >= limitSec) {
    await setLocal({
      [K.activeSince]: null,
      [K.usageSeconds]: Math.min(totalUsage, limitSec),
      [K.breakStartedAt]: Date.now(),
    });
  } else {
    await setLocal({
      [K.activeSince]: null,
      [K.usageSeconds]: totalUsage,
    });
  }
}

async function checkActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab || !activeTab.id) return;

  const state = await getState();
  if (state.breakStartedAt !== null) return;

  if (isSocialMedia(activeTab.url ?? '')) {
    await startTracking();
  } else {
    await stopTracking();
  }
}

type Message =
  | { type: 'GET_STATUS' }
  | { type: 'GET_SETTINGS' }
  | { type: 'SAVE_SETTINGS'; usageLimitMin: number; breakDurationMin: number };

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
    (async () => {
      if (msg.type === 'GET_STATUS') {
        const state = await getState();
        const now = Date.now();
        const usageLimitSec = state.usageLimitMin * 60;
        const breakDurationSec = state.breakDurationMin * 60;

        let isBreak = false;
        let usageSeconds = state.usageSeconds;
        let breakRemainingSeconds = 0;

        if (state.breakStartedAt !== null) {
          const breakElapsed = (now - state.breakStartedAt) / 1000;
          if (breakElapsed >= breakDurationSec) {
            await endBreak();
            usageSeconds = 0;
          } else {
            isBreak = true;
            usageSeconds = usageLimitSec;
            breakRemainingSeconds = Math.ceil(breakDurationSec - breakElapsed);
          }
        } else if (state.activeSince !== null) {
          const sessionElapsed = (now - state.activeSince) / 1000;
          const total = state.usageSeconds + sessionElapsed;
          if (total >= usageLimitSec) {
            await transitionToBreak();
            isBreak = true;
            usageSeconds = usageLimitSec;
            breakRemainingSeconds = breakDurationSec;
          } else {
            usageSeconds = total;
          }
        }

        sendResponse({ isBreak, usageSeconds, usageLimitSeconds: usageLimitSec, breakRemainingSeconds, breakDurationSeconds: breakDurationSec });
      } else if (msg.type === 'GET_SETTINGS') {
        const sync = await browser.storage.sync.get([K.usageLimitMin, K.breakDurationMin]);
        sendResponse({
          usageLimitMin: sync[K.usageLimitMin] ?? 60,
          breakDurationMin: sync[K.breakDurationMin] ?? 5,
        });
      } else if (msg.type === 'SAVE_SETTINGS') {
        await browser.storage.sync.set({
          [K.usageLimitMin]: msg.usageLimitMin,
          [K.breakDurationMin]: msg.breakDurationMin,
        });
        sendResponse({ success: true });
      }
    })();
    return true;
  });

  browser.tabs.onActivated.addListener(() => checkActiveTab());
  browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (changeInfo.url) checkActiveTab();
  });
  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) {
      stopTracking();
    } else {
      checkActiveTab();
    }
  });

  checkActiveTab();
});

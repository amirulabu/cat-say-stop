import { useState, useEffect, useCallback } from 'react';
import fatcatImg from '@/assets/fatcat.webp';
import './App.css';

interface Status {
  isBreak: boolean;
  usageSeconds: number;
  usageLimitSeconds: number;
  breakRemainingSeconds: number;
  breakDurationSeconds: number;
}

interface Settings {
  usageLimitMin: number;
  breakDurationMin: number;
}

function fmtTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.floor(Math.max(0, seconds) % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtPct(part: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.min(100, Math.round((part / total) * 100))}%`;
}

export default function App() {
  const [status, setStatus] = useState<Status | null>(null);
  const [settings, setSettings] = useState<Settings>({ usageLimitMin: 60, breakDurationMin: 5 });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadStatus = useCallback(async () => {
    const res = await browser.runtime.sendMessage({ type: 'GET_STATUS' });
    setStatus(res);
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await browser.runtime.sendMessage({ type: 'GET_SETTINGS' });
    setSettings(res);
  }, []);

  useEffect(() => {
    loadStatus();
    loadSettings();
    const interval = setInterval(loadStatus, 1000);
    return () => clearInterval(interval);
  }, [loadStatus, loadSettings]);

  const saveSettings = async () => {
    await browser.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      usageLimitMin: settings.usageLimitMin,
      breakDurationMin: settings.breakDurationMin,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1500);
  };

  const isIdle = status && status.usageSeconds === 0 && !status.isBreak;

  return (
    <div className="popup">
      <div className="header">
        <img src={fatcatImg} alt="Cat" className="header-img" />
        <span className="logo-text">Cat Say Stop</span>
      </div>

      {/* Status */}
      <div className="section">
        <div className="section-label">Status</div>
        <div className={`status-badge ${status?.isBreak ? 'break' : isIdle ? 'idle' : 'active'}`}>
          {!status ? '...' : status.isBreak ? 'BREAK TIME' : isIdle ? 'Idle' : 'Browsing'}
        </div>

        {status && !status.isBreak && !isIdle && (
          <div className="timer-row">
            <span className="timer-value">{fmtTime(status.usageLimitSeconds - status.usageSeconds)}</span>
            <span className="timer-label">remaining</span>
          </div>
        )}

        {status && status.isBreak && (
          <div className="timer-row">
            <span className="timer-value break">{fmtTime(status.breakRemainingSeconds)}</span>
            <span className="timer-label">until break ends</span>
          </div>
        )}

        {status && (
          <div className="bar-track">
            <div
              className={`bar-fill ${status.isBreak ? 'break' : ''}`}
              style={{
                width: status.isBreak
                  ? fmtPct(status.breakDurationSeconds - status.breakRemainingSeconds, status.breakDurationSeconds)
                  : fmtPct(status.usageSeconds, status.usageLimitSeconds),
              }}
            />
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="section">
        <div className="section-label">Settings</div>

        <div className="setting-row">
          <label htmlFor="usageLimit">Usage limit (minutes)</label>
          <div className="input-group">
            <input
              id="usageLimit"
              type="range"
              min={1}
              max={120}
              value={settings.usageLimitMin}
              onChange={(e) => setSettings((s) => ({ ...s, usageLimitMin: Number(e.target.value) }))}
            />
            <span className="input-value">{settings.usageLimitMin}m</span>
          </div>
        </div>

        <div className="setting-row">
          <label htmlFor="breakDuration">Break duration (minutes)</label>
          <div className="input-group">
            <input
              id="breakDuration"
              type="range"
              min={1}
              max={30}
              value={settings.breakDurationMin}
              onChange={(e) => setSettings((s) => ({ ...s, breakDurationMin: Number(e.target.value) }))}
            />
            <span className="input-value">{settings.breakDurationMin}m</span>
          </div>
        </div>

        <button className="save-btn" onClick={saveSettings}>
          {settingsSaved ? 'Saved!' : 'Save settings'}
        </button>
      </div>

      <div className="footer">
        Supported: X, Instagram, TikTok, YouTube
      </div>
    </div>
  );
}

import { Storage } from './storage.js';

const SOUND_BASE_PATH = 'js/assets/sounds/';
const SOUND_NAMES = [
  'hit',
  'kill',
  'armoredFirstHit',
  'consumeTick',
  'criticalHealth',
  'levelComplete',
  'gameOver',
  'uiTap',
];

const CONSUME_TICK_THROTTLE_MS = 400;

// Vibrace jako progressive enhancement pouze u zásahu/zabití, viz sekce 11 dokumentu 00.
const VIBRATION_PATTERNS = {
  hit: 15,
  kill: 30,
};

export class AudioManager {
  constructor() {
    this._muted = Storage.get('soundMuted', false);
    this._buffers = {};
    this._lastConsumeTickAt = -Infinity;
    this._context = null;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this._context = AudioContextClass ? new AudioContextClass() : null;
    } catch (err) {
      console.warn('[AudioManager] AudioContext nedostupný, hra poběží bez zvuku:', err);
    }

    if (this._context) this._preloadAll();
  }

  async _preloadAll() {
    await Promise.all(SOUND_NAMES.map((name) => this._loadSound(name)));
  }

  async _loadSound(name) {
    try {
      const response = await fetch(`${SOUND_BASE_PATH}${name}.mp3`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this._buffers[name] = await this._context.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn(`[AudioManager] nepodařilo se načíst zvuk "${name}", event zůstane tichý:`, err);
    }
  }

  // Autoplay unlock pro iOS Safari a další prohlížeče vyžadující gesto uživatele.
  unlock() {
    if (this._context && this._context.state === 'suspended') {
      this._context.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this._muted = muted;
    Storage.set('soundMuted', muted);
  }

  isMuted() {
    return this._muted;
  }

  play(eventName) {
    if (this._muted) return;

    this._maybeVibrate(eventName);

    if (!this._context) return;

    if (eventName === 'consumeTick') {
      const now = this._context.currentTime * 1000;
      if (now - this._lastConsumeTickAt < CONSUME_TICK_THROTTLE_MS) return;
      this._lastConsumeTickAt = now;
    }

    const buffer = this._buffers[eventName];
    if (!buffer) return;

    const source = this._context.createBufferSource();
    source.buffer = buffer;
    source.connect(this._context.destination);
    source.start(0);
  }

  _maybeVibrate(eventName) {
    const pattern = VIBRATION_PATTERNS[eventName];
    if (!pattern || !('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
  }
}

import type { Storage } from './Storage';

const SOUND_NAMES = [
  'hit',
  'kill',
  'armoredFirstHit',
  'consumeTick',
  'criticalHealth',
  'levelComplete',
  'gameOver',
  'uiTap',
] as const;

export type SoundName = (typeof SOUND_NAMES)[number];

const CONSUME_TICK_THROTTLE_MS = 400;

// Vibrace jako progressive enhancement pouze u zásahu/zabití, viz sekce 11 dokumentu 00.
const VIBRATION_PATTERNS: Partial<Record<SoundName, number>> = {
  hit: 15,
  kill: 30,
};

export interface AudioManagerOptions {
  baseUrl: string;
  overrides?: Partial<Record<SoundName, string>>;
  storage: Storage;
}

interface WindowWithWebkitAudio {
  webkitAudioContext?: typeof AudioContext;
}

interface NavigatorWithAudioSession {
  audioSession?: { type: string };
}

export class AudioManager {
  private readonly baseUrl: string;
  private readonly overrides: Partial<Record<SoundName, string>>;
  private readonly storage: Storage;
  private _muted: boolean;
  private readonly _buffers: Partial<Record<SoundName, AudioBuffer>> = {};
  private _lastConsumeTickAt = -Infinity;
  private _context: AudioContext | null = null;

  constructor(options: AudioManagerOptions) {
    this.baseUrl = options.baseUrl.endsWith('/') ? options.baseUrl : `${options.baseUrl}/`;
    this.overrides = options.overrides ?? {};
    this.storage = options.storage;
    this._muted = this.storage.get('soundMuted', false);

    try {
      const AudioContextClass: typeof AudioContext | undefined =
        typeof AudioContext !== 'undefined' ? AudioContext : (window as unknown as WindowWithWebkitAudio).webkitAudioContext;
      this._context = AudioContextClass ? new AudioContextClass() : null;
    } catch (err) {
      console.warn('[AudioManager] AudioContext nedostupný, hra poběží bez zvuku:', err);
    }

    // iOS: bez kategorie "playback" je Web Audio němé při vypnutém zvonění (Safari 16.4+).
    try {
      const audioSession = (navigator as unknown as NavigatorWithAudioSession).audioSession;
      if (audioSession) audioSession.type = 'playback';
    } catch {
      // API není dostupné, pokračujeme bez něj
    }

    if (this._context) this._preloadAll();
  }

  // Zavolá callback při každé změně stavu kontextu (iOS: running -> interrupted/suspended).
  onStateChange(callback: () => void): void {
    if (this._context) this._context.onstatechange = callback;
  }

  // Bez kontextu není co odemykat, proto true. Cast kvůli stavu 'interrupted' (iOS), který chybí v TS typech.
  isRunning(): boolean {
    return !this._context || (this._context.state as string) === 'running';
  }

  private async _preloadAll(): Promise<void> {
    await Promise.all(SOUND_NAMES.map((name) => this._loadSound(name)));
  }

  private _resolveUrl(name: SoundName): string {
    return this.overrides[name] ?? `${this.baseUrl}${name}.mp3`;
  }

  private async _loadSound(name: SoundName): Promise<void> {
    if (!this._context) return;
    try {
      const response = await fetch(this._resolveUrl(name));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this._buffers[name] = await this._decode(this._context, arrayBuffer);
    } catch (err) {
      console.warn(`[AudioManager] nepodařilo se načíst zvuk "${name}", event zůstane tichý:`, err);
    }
  }

  // Callback varianta kvůli iOS < 14.5, kde decodeAudioData nevrací Promise.
  private _decode(context: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      const result = context.decodeAudioData(data, resolve, reject);
      if (result && typeof result.then === 'function') result.then(resolve, reject);
    });
  }

  // Autoplay unlock pro iOS Safari a další prohlížeče vyžadující gesto uživatele.
  // Vrací true, pokud je kontext po pokusu ve stavu 'running'.
  async unlock(): Promise<boolean> {
    const context = this._context;
    if (!context || this.isRunning()) return true;
    try {
      await context.resume();
    } catch {
      // chybu pohlcujeme, zkusí se znovu při dalším gestu
    }
    return this.isRunning();
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    this.storage.set('soundMuted', muted);
  }

  isMuted(): boolean {
    return this._muted;
  }

  play(eventName: SoundName): void {
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

  private _maybeVibrate(eventName: SoundName): void {
    const pattern = VIBRATION_PATTERNS[eventName];
    if (!pattern || !('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
  }

  // Nutné doplnění oproti js/audio.js — v React komponentě se na rozdíl od statické
  // stránky AudioManager běžně unmountuje, viz riziko "Game.destroy()" v plánu.
  destroy(): void {
    // close() vyvolá statechange -> 'closed'; bez odpojení by Game znovu přihlásil unlock listenery.
    if (this._context) this._context.onstatechange = null;
    this._context?.close().catch(() => {});
  }
}

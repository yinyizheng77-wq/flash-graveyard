// Procedural WebAudio sound effects — no audio files, no copyrighted music.
// Every effect is a short oscillator envelope. The context is created on
// the first user gesture (autoplay policy) via unlock().

const PRESETS = {
  click: [{ freq: 660, dur: 0.06, type: 'square', vol: 0.12 }],
  eat: [
    { freq: 520, dur: 0.07, type: 'sine', vol: 0.2 },
    { freq: 780, dur: 0.09, type: 'sine', vol: 0.2, delay: 0.06 },
  ],
  die: [
    { freq: 220, dur: 0.18, type: 'sawtooth', vol: 0.18 },
    { freq: 110, dur: 0.3, type: 'sawtooth', vol: 0.18, delay: 0.14 },
  ],
  win: [
    { freq: 523, dur: 0.12, type: 'triangle', vol: 0.2 },
    { freq: 659, dur: 0.12, type: 'triangle', vol: 0.2, delay: 0.1 },
    { freq: 784, dur: 0.22, type: 'triangle', vol: 0.2, delay: 0.2 },
  ],
  flip: [{ freq: 440, dur: 0.05, type: 'sine', vol: 0.15 }],
  match: [
    { freq: 587, dur: 0.1, type: 'sine', vol: 0.2 },
    { freq: 880, dur: 0.16, type: 'sine', vol: 0.2, delay: 0.09 },
  ],
  break: [{ freq: 180, dur: 0.08, type: 'square', vol: 0.2 }],
  launch: [{ freq: 330, dur: 0.08, type: 'sine', vol: 0.15 }],
};

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  play(name) {
    if (this.muted || !this.ctx) return;
    const notes = PRESETS[name];
    if (!notes) return;
    const t0 = this.ctx.currentTime;
    for (const note of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = note.type;
      osc.frequency.value = note.freq;
      const start = t0 + (note.delay || 0);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(note.vol, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + note.dur + 0.02);
    }
  }
}

// Web Audio API Sound & Music Synthesizer for GALAXY ADVENTURE 3D

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;
  private bgmPlaying: boolean = false;
  private bgmInterval: number | null = null;
  private stepCount: number = 0;

  constructor() {
    try {
      const savedMute = localStorage.getItem('galaxy_adv_muted');
      const savedVol = localStorage.getItem('galaxy_adv_volume');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      if (savedVol !== null) this.volume = parseFloat(savedVol);
    } catch {
      // ignore storage errors
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('galaxy_adv_muted', String(muted));
    } catch {}
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('galaxy_adv_volume', String(this.volume));
    } catch {}
  }

  public getVolume(): number {
    return this.volume;
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    delay: number = 0,
    gainScale: number = 0.25,
    endFreq?: number
  ) {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    const peakGain = Math.max(0.001, gainScale * this.volume);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // Cheerful space adventure arpeggio loop
  public startBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.bgmPlaying = true;
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 587.33, 440.0, 349.23];
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.bgmPlaying) return;
      const note = notes[this.stepCount % notes.length];
      this.playTone(note, 'sine', 0.36, 0, 0.05);
      if (this.stepCount % 4 === 0) {
        this.playTone(note * 0.5, 'triangle', 0.65, 0, 0.04);
      }
      this.stepCount++;
    }, 420);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public playButtonClick() {
    this.playTone(580, 'sine', 0.08, 0, 0.2, 860);
  }

  public playSpaceshipHum() {
    this.playTone(110, 'sawtooth', 0.45, 0, 0.08, 220);
    this.playTone(220, 'sine', 0.5, 0.05, 0.12, 440);
  }

  public playCardShuffle() {
    for (let i = 0; i < 6; i++) {
      this.playTone(300 + i * 75, 'triangle', 0.06, i * 0.075, 0.18, 600 + i * 50);
    }
  }

  public playCardFlip() {
    this.playTone(420, 'sine', 0.14, 0, 0.25, 920);
    this.playTone(920, 'triangle', 0.22, 0.1, 0.2, 1240);
  }

  public playRobotStep(stepIndex: number = 0) {
    const pitch = stepIndex % 2 === 0 ? 340 : 410;
    this.playTone(pitch, 'square', 0.09, 0, 0.14, pitch * 1.35);
    this.playTone(160, 'triangle', 0.08, 0, 0.15, 95);
  }

  public playLaserLadder() {
    // Rising futuristic warp elevator sound
    for (let i = 0; i < 8; i++) {
      this.playTone(330 + i * 95, 'sawtooth', 0.14, i * 0.08, 0.15, 480 + i * 110);
    }
  }

  public playSnakeSlide() {
    // Playful descending space serpent whoosh
    for (let i = 0; i < 8; i++) {
      this.playTone(880 - i * 80, 'sine', 0.15, i * 0.08, 0.2, 720 - i * 80);
    }
  }

  public playStarBonus() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((f, idx) => {
      this.playTone(f, 'triangle', 0.28, idx * 0.07, 0.24);
    });
  }

  public playZonk() {
    // Funny cartoon wah-wah-waaah
    this.playTone(311.13, 'sawtooth', 0.24, 0, 0.22, 293.66);
    this.playTone(293.66, 'sawtooth', 0.24, 0.25, 0.22, 277.18);
    this.playTone(277.18, 'sawtooth', 0.24, 0.5, 0.22, 261.63);
    this.playTone(246.94, 'sawtooth', 0.55, 0.75, 0.26, 175.0);
  }

  public playCorrectAnswer() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 'triangle', 0.22, i * 0.09, 0.28);
    });
  }

  public playWrongAnswer() {
    this.playTone(250, 'sawtooth', 0.22, 0, 0.22, 190);
    this.playTone(195, 'sawtooth', 0.36, 0.22, 0.22, 145);
  }

  public playVictoryFanfare() {
    const melody = [
      { f: 523.25, d: 0.16, t: 0 },
      { f: 523.25, d: 0.16, t: 0.18 },
      { f: 523.25, d: 0.16, t: 0.36 },
      { f: 659.25, d: 0.35, t: 0.54 },
      { f: 587.33, d: 0.2, t: 0.92 },
      { f: 659.25, d: 0.2, t: 1.15 },
      { f: 783.99, d: 0.65, t: 1.38 },
      { f: 1046.5, d: 0.85, t: 2.05 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, 'triangle', m.d, m.t, 0.3);
      this.playTone(m.f * 0.5, 'sine', m.d, m.t, 0.18);
    });
  }
}

export const AudioManager = new AudioManagerClass();

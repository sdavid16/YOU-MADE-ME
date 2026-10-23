(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class AudioSystem {
    constructor() { this.ctx = null; this.muted = false; this.master = null; this.volume = .12; }
    unlock() {
      if (this.muted) return;
      const AudioCtx = root.AudioContext || root.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) { this.ctx = new AudioCtx(); this.master = this.ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx.destination); }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    }
    setMuted(value) { this.muted = !!value; if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, .03); }
    toggle() { this.setMuted(!this.muted); return this.muted; }
    setVolume(value) { this.volume = Math.max(0, Math.min(.3, Number(value) || 0)); if (this.master && !this.muted) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, .03); }
    tone(freq = 440, duration = .08, type = 'sine', volume = .2, endFreq = null) {
      if (this.muted || !this.ctx || !this.master) return;
      const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, now);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      gain.gain.setValueAtTime(Math.max(.0001, volume), now); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(gain); gain.connect(this.master); osc.start(now); osc.stop(now + duration + .02);
    }
    play(name) {
      const cues = {
        start: [[330,.09,'sine',.15,440],[660,.12,'triangle',.12,880]], taunt: [[180,.08,'square',.08,120],[520,.07,'triangle',.12,710]],
        collect: [[550,.07,'sine',.15,720],[810,.13,'sine',.1,980]], phase: [[220,.17,'sawtooth',.09,90],[110,.25,'triangle',.15,55]],
        glitch: [[90,.25,'sawtooth',.1,42]], hit: [[130,.16,'square',.15,60]], attack: [[480,.07,'triangle',.16,170]],
        boss: [[130,.32,'sawtooth',.13,48]], win: [[440,.12,'triangle',.13,660],[660,.2,'sine',.12,990]], portal: [[300,.12,'sine',.12,800],[700,.2,'triangle',.1,250]]
      };
      (cues[name] || []).forEach((cue, i) => setTimeout(() => this.tone(...cue), i * 75));
    }
  }
  YMM.AudioSystem = AudioSystem;
})(globalThis);

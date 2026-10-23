(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class Input {
    constructor() {
      this.down = new Set(); this.pressed = new Set(); this.released = new Set();
      this.codes = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter','Escape','KeyA','KeyD','KeyW','KeyS','KeyT','KeyG','KeyE','KeyJ','KeyR','KeyF','KeyQ','KeyE','ShiftLeft','ShiftRight']);
      window.addEventListener('keydown', e => {
        if (this.codes.has(e.code)) e.preventDefault();
        if (!this.down.has(e.code)) this.pressed.add(e.code);
        this.down.add(e.code);
      }, { passive: false });
      window.addEventListener('keyup', e => { this.down.delete(e.code); this.released.add(e.code); });
      window.addEventListener('blur', () => { this.down.clear(); this.pressed.clear(); this.released.clear(); });
    }
    isDown(...codes) { return codes.some(c => this.down.has(c)); }
    justPressed(...codes) { return codes.some(c => this.pressed.has(c)); }
    endFrame() { this.pressed.clear(); this.released.clear(); }
  }
  YMM.Input = Input;
})(globalThis);

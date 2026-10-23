(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class EventBus {
    constructor() { this.listeners = new Map(); }
    on(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); return () => this.off(type, fn); }
    off(type, fn) { const set = this.listeners.get(type); if (set) set.delete(fn); }
    emit(type, payload = {}) { const set = this.listeners.get(type); if (!set) return; for (const fn of [...set]) { try { fn(payload); } catch (err) { console.error('[YMM EventBus]', type, err); } } }
    clear() { this.listeners.clear(); }
  }
  YMM.EventBus = EventBus;
  YMM.events = new EventBus();
})(globalThis);

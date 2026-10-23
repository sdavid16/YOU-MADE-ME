(function (root) {
  const YMM = root.YMM = root.YMM || {};
  YMM.Util = {
    clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
    overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; },
    center(a) { return { x: a.x + a.w / 2, y: a.y + a.h / 2 }; },
    rand(min, max) { return min + Math.random() * (max - min); },
    pick(items) { return items[Math.floor(Math.random() * items.length)]; },
    formatTime(s) { return new Date(s * 1000).toISOString().slice(14, 19); },
    roundedRect(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius); ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius); ctx.closePath();
    }
  };
})(globalThis);

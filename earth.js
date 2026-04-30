// ── DIBUJO: TIERRA ────────────────────────────────────────────────────────────
  let shieldAngle = 0;
export function drawEarth(ctx, cx, cy, er) {
  
  shieldAngle += 0.013;

  // Halo exterior
  const g = ctx.createRadialGradient(cx, cy, er - 4, cx, cy, er + 22);
  g.addColorStop(0, 'rgba(55,138,221,0.2)');
  g.addColorStop(1, 'rgba(55,138,221,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, er + 22, 0, Math.PI * 2);
  ctx.fill();

  // Océano
  const eg = ctx.createRadialGradient(cx - 12, cy - 12, 4, cx, cy, er);
  eg.addColorStop(0,   '#5DCAA5');
  eg.addColorStop(0.5, '#1D9E75');
  eg.addColorStop(1,   '#0F6E56');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(cx, cy, er, 0, Math.PI * 2);
  ctx.fill();

  // Continentes
  ctx.fillStyle = 'rgba(99,153,34,0.9)';
  [[cx - 14, cy - 10, 20, 16], [cx + 8, cy + 6, 14, 20], [cx - 22, cy + 8, 10, 14]].forEach(([x, y, w, h]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Nubes
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  [[cx + 16, cy - 22, 12, 5], [cx - 18, cy + 14, 10, 4]].forEach(([x, y, w, h]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Anillo escudo giratorio
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(shieldAngle);
  for (let i = 0; i < 10; i++) {
    const a = i * (Math.PI / 4);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (er + 11), Math.sin(a) * (er + 11), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${200 + i * 12}, 75%, 68%, 0.5)`;
    ctx.fill();
  }
  ctx.restore();
}
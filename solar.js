// ════════════════════════════════════════
//   SISTEMA SOLAR 2D — solar.js
//   Sin Three.js, solo Canvas 2D
// ════════════════════════════════════════

let solarAnimId  = null;
let solarRunning = false;

const PLANETS = [
  { name: 'Mercurio', r: 3,    color: '#9e9e9e', dist: 52,  speed: 4.7,  angle: 0.0 },
  { name: 'Venus',    r: 5.5,  color: '#e8cda0', dist: 80,  speed: 3.5,  angle: 1.0 },
  { name: 'Tierra',  r: 6,    color: '#2a7fc1', dist: 112, speed: 2.9,  angle: 2.1,
    moon: { r: 2, dist: 14, speed: 12, angle: 0 } },
  { name: 'Marte',   r: 4.5,  color: '#c1440e', dist: 148, speed: 2.4,  angle: 0.8 },
  { name: 'Júpiter', r: 14,   color: '#c88b3a', dist: 210, speed: 1.3,  angle: 3.5,
    bands: ['#b8823a','#d4a862','#b8733a','#c8933a'] },
  { name: 'Saturno', r: 11,   color: '#e4d191', dist: 275, speed: 0.96, angle: 1.7,
    ring: { inner: 14, outer: 22, color: 'rgba(200,180,140,0.55)' } },
  { name: 'Urano',   r: 7.5,  color: '#7de8e8', dist: 330, speed: 0.68, angle: 4.2 },
  { name: 'Neptuno', r: 7,    color: '#3f54ba', dist: 378, speed: 0.54, angle: 5.8 },
];

const STARS = Array.from({ length: 220 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.4 + 0.3,
  a: Math.random() * 0.7 + 0.3,
}));

const BELT = Array.from({ length: 280 }, () => ({
  angle: Math.random() * Math.PI * 2,
  dist:  178 + (Math.random() - 0.5) * 18,
  r:     Math.random() * 1.2 + 0.3,
  a:     Math.random() * 0.5 + 0.2,
}));

export function startSolar(canvasEl) {
  if (solarRunning) return;
  solarRunning = true;
  const ctx = canvasEl.getContext('2d');
  const angles     = PLANETS.map(p => p.angle);
  const moonAngles = PLANETS.map(p => p.moon ? p.moon.angle : 0);
  let camTilt = 0;

  function drawStars(W, H) {
    STARS.forEach(s => {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawOrbit(cx, cy, dist, tilt) {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, dist, dist * tilt, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawSun(cx, cy) {
    const halo = ctx.createRadialGradient(cx, cy, 14, cx, cy, 48);
    halo.addColorStop(0, 'rgba(255,200,50,0.18)');
    halo.addColorStop(1, 'rgba(255,150,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill();
    const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 18);
    grad.addColorStop(0, '#fff8aa');
    grad.addColorStop(0.4, '#ffdd44');
    grad.addColorStop(1, '#ff8800');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
  }

  function drawBelt(cx, cy, tilt) {
    BELT.forEach(b => {
      const bx = cx + Math.cos(b.angle) * b.dist;
      const by = cy + Math.sin(b.angle) * b.dist * tilt;
      ctx.globalAlpha = b.a;
      ctx.fillStyle = '#887766';
      ctx.beginPath(); ctx.arc(bx, by, b.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawPlanet(p, px, py, idx) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur  = 6;
    const grad = ctx.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r);
    grad.addColorStop(0, lighten(p.color, 0.5));
    grad.addColorStop(1, darken(p.color, 0.4));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    if (p.bands) {
      p.bands.forEach((bc, bi) => {
        const by = py - p.r + (p.r * 0.4 * bi) + p.r * 0.1;
        ctx.save(); ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = bc; ctx.globalAlpha = 0.35;
        ctx.fillRect(px - p.r, by, p.r * 2, p.r * 0.35);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    if (p.ring) {
      ctx.save(); ctx.globalAlpha = 0.6;
      ctx.strokeStyle = p.ring.color;
      ctx.lineWidth   = (p.ring.outer - p.ring.inner) * 0.5;
      ctx.beginPath();
      ctx.ellipse(px, py, p.ring.outer * 0.85, p.ring.outer * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke(); ctx.restore();
    }

    if (p.moon) {
      const ma  = moonAngles[idx];
      const mxp = px + Math.cos(ma) * p.moon.dist;
      const myp = py + Math.sin(ma) * p.moon.dist * 0.4;
      const mg  = ctx.createRadialGradient(mxp - 1, myp - 1, 0, mxp, myp, p.moon.r);
      mg.addColorStop(0, '#ddd'); mg.addColorStop(1, '#888');
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.arc(mxp, myp, p.moon.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame() {
    if (!solarRunning) return;
    solarAnimId = requestAnimationFrame(frame);
    const W = canvasEl.width, H = canvasEl.height;
    ctx.fillStyle = '#070714'; ctx.fillRect(0, 0, W, H);
    drawStars(W, H);
    const cx = W / 2, cy = H / 2;
    camTilt += 0.0003;
    const tilt = 0.38 + Math.sin(camTilt) * 0.04;
    PLANETS.forEach(p => drawOrbit(cx, cy, p.dist, tilt));
    drawSun(cx, cy);
    drawBelt(cx, cy, tilt);
    const rendered = PLANETS.map((p, i) => {
      angles[i] += p.speed * 0.0008;
      if (p.moon) moonAngles[i] += p.moon.speed * 0.0008;
      const px = cx + Math.cos(angles[i]) * p.dist;
      const py = cy + Math.sin(angles[i]) * p.dist * tilt;
      return { p, px, py, i };
    });
    rendered.sort((a, b) => a.py - b.py).forEach(({ p, px, py, i }) => drawPlanet(p, px, py, i));
  }

  frame();
}

export function stopSolar() {
  solarRunning = false;
  if (solarAnimId) cancelAnimationFrame(solarAnimId);
  solarAnimId = null;
}

function lighten(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.min(255,r+Math.round(255*amount))},${Math.min(255,g+Math.round(255*amount))},${Math.min(255,b+Math.round(255*amount))})`;
}
function darken(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.max(0,r-Math.round(255*amount))},${Math.max(0,g-Math.round(255*amount))},${Math.max(0,b-Math.round(255*amount))})`;
}
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
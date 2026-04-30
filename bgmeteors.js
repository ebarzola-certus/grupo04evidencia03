// ════════════════════════════════════════
//   FONDO: METEORITOS — bgmeteors.js
//   Anima meteoros en el canvas de fondo
//   que cubre toda la página (position:fixed)
// ════════════════════════════════════════

let bgAnimId  = null;
let bgRunning = false;
let bgCtx     = null;
let bgW       = 0;
let bgH       = 0;
let bgMeteors = [];
let bgStars   = [];
let bgSpawnId = null;

function spawnBgMeteor() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if      (side === 0) { x = Math.random() * bgW; y = -24; }
  else if (side === 1) { x = bgW + 24;             y = Math.random() * bgH; }
  else if (side === 2) { x = Math.random() * bgW; y = bgH + 24; }
  else                  { x = -24;                 y = Math.random() * bgH; }

  const tx  = bgW * 0.1 + Math.random() * bgW * 0.8;
  const ty  = bgH * 0.1 + Math.random() * bgH * 0.8;
  const spd = 0.8 + Math.random() * 1.8;
  const len = Math.sqrt((tx - x) ** 2 + (ty - y) ** 2);
  const r   = 4 + Math.random() * 10;

  bgMeteors.push({
    x, y,
    vx: (tx - x) / len * spd,
    vy: (ty - y) / len * spd,
    r,
    crack: Math.random() * Math.PI * 2,
    alpha: 0.35 + Math.random() * 0.45
  });
}

function drawBgMeteor(m) {
  const angle = Math.atan2(m.vy, m.vx);
  const tl    = m.r * 3.2;

  // Cola de fuego
  const tg = bgCtx.createLinearGradient(
    m.x, m.y,
    m.x - Math.cos(angle) * tl,
    m.y - Math.sin(angle) * tl
  );
  tg.addColorStop(0, 'rgba(255,110,40,0.6)');
  tg.addColorStop(1, 'rgba(255,60,20,0)');
  bgCtx.strokeStyle = tg;
  bgCtx.lineWidth   = m.r * 0.8;
  bgCtx.lineCap     = 'round';
  bgCtx.beginPath();
  bgCtx.moveTo(m.x, m.y);
  bgCtx.lineTo(m.x - Math.cos(angle) * tl, m.y - Math.sin(angle) * tl);
  bgCtx.stroke();

  // Cuerpo
  bgCtx.save();
  bgCtx.translate(m.x, m.y);
  const mg = bgCtx.createRadialGradient(-m.r * .3, -m.r * .3, 0, 0, 0, m.r);
  mg.addColorStop(0,    '#E24B4A');
  mg.addColorStop(0.55, '#7A2A1A');
  mg.addColorStop(1,    '#3A1008');
  bgCtx.fillStyle = mg;
  bgCtx.beginPath();
  bgCtx.arc(0, 0, m.r, 0, Math.PI * 2);
  bgCtx.fill();

  // Borde
  bgCtx.strokeStyle = 'rgba(240,90,40,0.4)';
  bgCtx.lineWidth   = 1;
  bgCtx.beginPath();
  bgCtx.arc(0, 0, m.r + 2, 0, Math.PI * 2);
  bgCtx.stroke();

  // Grietas
  bgCtx.strokeStyle = 'rgba(255,170,60,0.4)';
  bgCtx.lineWidth   = 0.8;
  for (let i = 0; i < 3; i++) {
    const a = m.crack + i * (Math.PI * 2 / 3);
    bgCtx.beginPath();
    bgCtx.moveTo(0, 0);
    bgCtx.lineTo(Math.cos(a) * m.r * .75, Math.sin(a) * m.r * .75);
    bgCtx.stroke();
  }
  bgCtx.restore();
}

function bgFrame() {
  if (!bgRunning) return;
  bgAnimId = requestAnimationFrame(bgFrame);

  // Fondo con trail suave
  bgCtx.fillStyle = 'rgba(5,5,16,0.55)';
  bgCtx.fillRect(0, 0, bgW, bgH);

  // Estrellas
  bgStars.forEach(s => {
    bgCtx.globalAlpha = s.a;
    bgCtx.fillStyle   = '#fff';
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fill();
  });
  bgCtx.globalAlpha = 1;

  // Meteoros
  for (let i = bgMeteors.length - 1; i >= 0; i--) {
    const m = bgMeteors[i];
    m.x += m.vx;
    m.y += m.vy;
    if (m.x < -100 || m.x > bgW + 100 || m.y < -100 || m.y > bgH + 100) {
      bgMeteors.splice(i, 1);
      continue;
    }
    bgCtx.globalAlpha = m.alpha;
    drawBgMeteor(m);
    bgCtx.globalAlpha = 1;
  }
}

export function startBgMeteors(canvasEl) {
  if (bgRunning) return;
  bgW = canvasEl.width  = window.innerWidth;
  bgH = canvasEl.height = window.innerHeight;
  bgCtx     = canvasEl.getContext('2d');
  bgRunning = true;
  bgMeteors = [];

  // Generar estrellas
  bgStars = Array.from({ length: 180 }, () => ({
    x: Math.random() * bgW,
    y: Math.random() * bgH,
    r: Math.random() * 1.4 + 0.2,
    a: Math.random() * 0.6 + 0.2
  }));

  // Sembrar meteoros iniciales
  for (let i = 0; i < 8; i++) spawnBgMeteor();
  bgSpawnId = setInterval(spawnBgMeteor, 900);

  // Redimensionar si cambia la ventana
  window.addEventListener('resize', onResize);

  canvasEl.style.display = 'block';
  bgFrame();
}

export function stopBgMeteors() {
  bgRunning = false;
  clearInterval(bgSpawnId);
  bgSpawnId = null;
  if (bgAnimId) cancelAnimationFrame(bgAnimId);
  bgAnimId  = null;
  bgMeteors = [];
  window.removeEventListener('resize', onResize);
}

function onResize() {
  const el = document.getElementById('solar-canvas');
  if (el) {
    bgW = el.width  = window.innerWidth;
    bgH = el.height = window.innerHeight;
    // Regenerar estrellas para el nuevo tamaño
    bgStars = Array.from({ length: 180 }, () => ({
      x: Math.random() * bgW,
      y: Math.random() * bgH,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.6 + 0.2
    }));
  }
}
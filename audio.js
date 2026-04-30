// ════════════════════════════════════════
//   SISTEMA DE AUDIO — audio.js
//   Música procedural + efectos de sonido
//   Usa Web Audio API, sin archivos externos
// ════════════════════════════════════════

let audioCtx  = null;
let musicGain = null;
let sfxGain   = null;
let musicScheduler = null;

// Estado actual para evitar solapamientos
let currentMusic = null; // 'menu' | 'game' | null

// Nodo de pad continuo (se detiene al cambiar música)
let activePadOsc = null;
let activePadG   = null;

// ── Inicializar contexto de audio ──────────────────────────────────────────
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.28;
    musicGain.connect(audioCtx.destination);
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── UTILIDADES ─────────────────────────────────────────────────────────────
function noteToHz(note, octave) {
  const NOTES = { C:0, Cs:1, D:2, Ds:3, E:4, F:5, Fs:6, G:7, Gs:8, A:9, As:10, B:11 };
  return 440 * Math.pow(2, ((octave - 4) * 12 + NOTES[note]) / 12);
}

function createOsc(type, freq, t0, t1, vol0, vol1, dest) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(vol0, t0);
  g.gain.linearRampToValueAtTime(vol1, t1);
  osc.connect(g); g.connect(dest);
  osc.start(t0); osc.stop(t1);
}

// ── DETENER MÚSICA ACTUAL ──────────────────────────────────────────────────
function stopCurrentMusic() {
  clearTimeout(musicScheduler);
  musicScheduler = null;
  if (activePadOsc) {
    try { activePadOsc.stop(); activePadOsc.disconnect(); } catch (_) {}
    activePadOsc = null;
  }
  if (activePadG) {
    try { activePadG.disconnect(); } catch (_) {}
    activePadG = null;
  }
  currentMusic = null;
}

// ── MÚSICA DE MENÚ — amigable, cálida, escala de Do mayor ─────────────────
// Melodía simple y agradable, sin tensión
const MENU_SCALE = [
  noteToHz('C', 4), noteToHz('E', 4), noteToHz('G', 4), noteToHz('A', 4),
  noteToHz('C', 5), noteToHz('E', 5), noteToHz('G', 5), noteToHz('A', 5)
];
const MENU_BASS = [
  noteToHz('C', 3), noteToHz('G', 2), noteToHz('A', 2), noteToHz('F', 2)
];

function scheduleMenuLoop(loopStart) {
  if (currentMusic !== 'menu') return;
  const beat = 0.65; // lento y relajado

  // Arpeggio ascendente/descendente suave con triángulo
  const arp = [0, 2, 4, 5, 6, 5, 4, 2, 1, 3, 5, 6, 7, 6, 5, 3];
  arp.forEach((idx, i) => {
    const t  = loopStart + i * beat;
    const t2 = t + beat * 1.7;
    createOsc('triangle', MENU_SCALE[idx % MENU_SCALE.length], t, t2, 0.09, 0, musicGain);
    // brillo de octava en tiempos fuertes
    if (i % 8 === 0) {
      createOsc('sine', MENU_SCALE[idx % MENU_SCALE.length] * 2, t, t2, 0.035, 0, musicGain);
    }
  });

  // Bajo redondo (sine, sin distorsión)
  MENU_BASS.forEach((freq, i) => {
    const t  = loopStart + i * beat * 4;
    const t2 = t + beat * 3.7;
    createOsc('sine', freq, t, t2, 0.28, 0.20, musicGain);
  });

  const loopLen = arp.length * beat;
  musicScheduler = setTimeout(
    () => scheduleMenuLoop(loopStart + loopLen),
    (loopLen - 0.5) * 1000
  );
}

// ── MÚSICA DE JUEGO — tensa, rítmica, escala frigia ───────────────────────
const GAME_SCALE = [
  noteToHz('E', 4), noteToHz('F', 4), noteToHz('G', 4), noteToHz('A', 4),
  noteToHz('B', 4), noteToHz('C', 5), noteToHz('D', 5), noteToHz('E', 5)
];
const GAME_BASS = [
  noteToHz('E', 2), noteToHz('D', 2), noteToHz('C', 2), noteToHz('B', 1)
];

function kick(ctx, t) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(g); g.connect(musicGain);
  osc.start(t); osc.stop(t + 0.3);
}

function hat(ctx, t, vol) {
  const bufSize = ctx.sampleRate * 0.05;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 8000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  src.connect(f); f.connect(g); g.connect(musicGain);
  src.start(t);
}

function scheduleGameLoop(loopStart) {
  if (currentMusic !== 'game') return;
  const ctx  = getCtx();
  const beat = 0.32;

  for (let i = 0; i < 16; i++) {
    const t = loopStart + i * beat;
    if (i % 4 === 0) kick(ctx, t);
    hat(ctx, t, i % 2 !== 0 ? 0.14 : 0.06);
  }

  GAME_BASS.forEach((freq, i) => {
    const t = loopStart + i * beat * 4, t2 = t + beat * 3.5;
    createOsc('sawtooth', freq, t, t2, 0.18, 0.14, musicGain);
    createOsc('sine',     freq, t, t2, 0.28, 0.22, musicGain);
  });

  const mel = [0, 2, 3, 5, 3, 2, 4, 6, 5, 4, 2, 3, 5, 4, 3, 2];
  mel.forEach((idx, i) => {
    const t = loopStart + i * beat, t2 = t + beat * 0.8;
    createOsc('square', GAME_SCALE[idx % GAME_SCALE.length], t, t2, 0.052, 0, musicGain);
  });

  createOsc('triangle', noteToHz('E', 3), loopStart, loopStart + 16 * beat, 0.15, 0.11, musicGain);

  const loopLen = 16 * beat;
  musicScheduler = setTimeout(
    () => scheduleGameLoop(loopStart + loopLen),
    (loopLen - 0.3) * 1000
  );
}

// ── API PÚBLICA ─────────────────────────────────────────────────────────────

export function startMenuMusic() {
  if (currentMusic === 'menu') return; // ya suena, no solapar
  stopCurrentMusic();

  const ctx = getCtx();
  currentMusic = 'menu';

  // Pad de dron cálido y continuo
  const padOsc = ctx.createOscillator();
  const padFlt = ctx.createBiquadFilter();
  const padG   = ctx.createGain();
  padOsc.type = 'sine';
  padOsc.frequency.value   = noteToHz('C', 3);
  padFlt.type              = 'lowpass';
  padFlt.frequency.value   = 280;
  padG.gain.setValueAtTime(0, ctx.currentTime);
  padG.gain.linearRampToValueAtTime(0.40, ctx.currentTime + 2.0);
  padOsc.connect(padFlt); padFlt.connect(padG); padG.connect(musicGain);
  padOsc.start();
  activePadOsc = padOsc;
  activePadG   = padG;

  scheduleMenuLoop(ctx.currentTime + 0.1);
}

export function startGameMusic() {
  if (currentMusic === 'game') return; // ya suena, no solapar
  stopCurrentMusic();
  currentMusic = 'game';
  scheduleGameLoop(getCtx().currentTime + 0.05);
}

export function stopMusic() {
  stopCurrentMusic();
}

// ── EFECTOS DE SONIDO ──────────────────────────────────────────────────────

export function sfxExplode() {
  const ctx = getCtx(), t = ctx.currentTime;

  // Golpe grave
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(22, t + 0.18);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.25);

  // Debris (ruido filtrado)
  const bufSize = Math.floor(ctx.sampleRate * 0.16);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const noise = ctx.createBufferSource(); noise.buffer = buf;
  const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1500; nf.Q.value = 0.7;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.5, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  noise.connect(nf); nf.connect(ng); ng.connect(sfxGain); noise.start(t);

  // Chispazo
  const sp = ctx.createOscillator(), sg = ctx.createGain();
  sp.type = 'sawtooth';
  sp.frequency.setValueAtTime(900, t); sp.frequency.exponentialRampToValueAtTime(200, t + 0.08);
  sg.gain.setValueAtTime(0.20, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  sp.connect(sg); sg.connect(sfxGain); sp.start(t); sp.stop(t + 0.12);
}

export function sfxShoot() {
  const ctx = getCtx(), t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.07);
  g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.1);
}

export function sfxImpact() {
  const ctx = getCtx(), t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(110 - i * 28, t + i * 0.07);
    o.frequency.exponentialRampToValueAtTime(18, t + i * 0.07 + 0.28);
    g.gain.setValueAtTime(0.72 - i * 0.18, t + i * 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.30);
    o.connect(g); g.connect(sfxGain); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.35);
  }
}

export function sfxWin() {
  const ctx = getCtx(), t = ctx.currentTime;
  [[noteToHz('C',5),0],[noteToHz('E',5),0.13],[noteToHz('G',5),0.26],[noteToHz('C',6),0.40]]
    .forEach(([f, d]) => {
      createOsc('triangle', f,   t+d, t+d+0.30, 0.30, 0, sfxGain);
      createOsc('sine',     f*2, t+d, t+d+0.20, 0.09, 0, sfxGain);
    });
}

export function sfxLose() {
  const ctx = getCtx(), t = ctx.currentTime;
  [[noteToHz('G',4),0],[noteToHz('E',4),0.20],[noteToHz('C',4),0.40],[noteToHz('B',3),0.60]]
    .forEach(([f, d]) => createOsc('triangle', f, t+d, t+d+0.28, 0.20, 0, sfxGain));
}

export function sfxClick() {
  const ctx = getCtx(), t = ctx.currentTime;
  createOsc('sine', noteToHz('A', 5), t, t + 0.06, 0.16, 0, sfxGain);
}
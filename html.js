export function introHtml() {
  return `
    <div id="intro-screen">
      <video id="intro-video" autoplay muted loop playsinline>
        <source src="assets/intro.mp4" type="video/mp4">
      </video>
      <div id="intro-overlay">
        <div id="intro-content">
          <div id="intro-badge">☄️ MISIÓN PLANETARIA</div>
          <h1>Defensa Planetaria</h1>
          <div id="intro-divider"></div>
          <p id="intro-desc">
            La Tierra está bajo ataque.<br>
            Oleadas de meteoritos se aproximan desde todos los rincones del cosmos<br>
            y <strong>solo tú</strong> puedes detenerlos.<br><br>
            Apunta con el cursor y dispara antes de que impacten.
          </p>
          <div id="intro-features">
            <div class="feat">🎯 <span>Apunta y dispara</span></div>
            <div class="feat">⚡ <span>3 dificultades</span></div>
            <div class="feat">🏆 <span>5 niveles cada una</span></div>
          </div>
          <button class="play-btn big-btn" onclick="showMenu()">
            🌍 ¡Vamos a defender la Tierra!
          </button>
          <p id="intro-hint">Haz click sobre los meteoritos para destruirlos</p>
        </div>
      </div>
    </div>
  `;
}
// se utiliza el ${Object.entries para convertirlo en objeto en una array de clave valor y con el .map lo hacemos iterable (similar a un for )
export function menuHtml(diffs){//funcion con parametros donde el parametro es la variable con todas las dificultades del juego 
    return `
    <h2>☄️ Defensa Planetaria</h2>
    <p>Apunta y <strong style="color:#fff">haz click</strong> sobre los meteoros para destruirlos.
    <br>
    ¡No dejes que impacten la Tierra!</p>
    <div class="diff-grid">
      ${Object.entries(diffs).map(([ks, vls]) =>`
        <button class="diff-btn ${vls.cls}" onclick="selectDiff('${ks}')">
          <span class="di">${vls.icon}</span>
          ${vls.name}
          <span class="ds">${vls.perSpawn} meteoro${vls.perSpawn > 1 ? 's' : ''} por oleada</span>
        </button>`).join('')}
    </div>
    <p style="font-size:11px;opacity:.4">Usa el cursor para apuntar · Click para disparar</p>
  `;
}

export function LevelIntro(diffDef, curLvlIdx, lvlDef, estrellas){
  return `
    <div style="font-size:11px;font-weight:500;color:${diffDef.color};letter-spacing:.08em;text-transform:uppercase">
      ${diffDef.name} · Nivel ${curLvlIdx + 1} de 5
    </div>
    <h2 style="margin-top:2px">${lvlDef.label}</h2>
    <p>
      Destruye <b style="color:#fff">${lvlDef.goal} meteoros</b> en <b style="color:#fff">${lvlDef.time}s</b><br>
      Oleada: <b style="color:${diffDef.color}">${diffDef.perSpawn} meteoro${diffDef.perSpawn > 1 ? 's' : ''}</b>
      cada ${(lvlDef.rate / 1000).toFixed(1)}s &nbsp;|&nbsp;
      Velocidad: ${'★'.repeat(estrellas)}${'☆'.repeat(5 - estrellas)}
    </p>
    <button class="play-btn" onclick="startLevel()">▶ Jugar</button>
    <button class="btn-link" onclick="showMenu()">Cambiar dificultad</button>
  `;
}

export function winnerHtml(isLast, d, curLvlIdx){
  return `
      <h2>${isLast ? '🏆 ¡Modo completado!' : '✅ ¡Nivel superado!'}</h2>
      <p style="color:${d.color};font-weight:500">${d.name} · Nivel ${curLvlIdx + 1}</p>
      <p>${isLast
        ? `¡Completaste los 5 niveles en <b style="color:#fff">${d.name}</b>!`
        : `Siguiente: <b style="color:#fff">${d.levels[curLvlIdx + 1].label}</b>`}
      </p>
      ${isLast
        ? `<button class="play-btn green" onclick="showMenu()">🌍 Menú principal</button>`
        : `<button class="play-btn" onclick="nextLevel()">Siguiente nivel →</button>`}
    `;
  }
export function loserHtml(d, pts, curLvlIdx, lvlDef){
  return `
      <h2>💥 La Tierra fue destruida</h2>
      <p style="color:${d.color};font-weight:500">${d.name} · Nivel ${curLvlIdx + 1} — ${lvlDef.label}</p>
      <p>Destruiste <b style="color:#fff">${pts}</b> de <b style="color:#fff">${lvlDef.goal}</b> meteoros.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="play-btn"       onclick="startLevel()">🔄 Reintentar</button>
        <button class="play-btn green" onclick="showMenu()">Menú</button>
      </div>
    `;
}
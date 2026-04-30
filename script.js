import DIFFICULTIES from './dificulty.js';
import { menuHtml, winnerHtml, loserHtml, LevelIntro, introHtml } from './html.js';
import { drawEarth } from './earth.js';
import { startBgMeteors, stopBgMeteors } from './bgmeteors.js';
import {
  startMenuMusic, startGameMusic, stopMusic,
  sfxExplode, sfxShoot, sfxImpact, sfxWin, sfxLose, sfxClick
} from './audio.js';

const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');
const ov      = document.getElementById('ov');
const ptsEl   = document.getElementById('pts');
const timEl   = document.getElementById('tim');
const goalEl  = document.getElementById('goal');
const lvlNEl  = document.getElementById('lvl-n');
const diffLbl = document.getElementById('diff-label');
const lvlBarEl= document.getElementById('lvl-bar');

const DIFFS = DIFFICULTIES;
const W = 980, H = 720, CX = W/2, CY = H/2, ER = 48;

let meteors=[],explosions=[],shots=[],stars=[];
let pts=0,timeLeft=0,running=false,mx=0,my=0;
let timerInt=null,spawnInt=null;
let curDiff=null,curLvlIdx=0,lvlDef=null,diffDef=null;

for(let i=0;i<90;i++)
  stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.3,a:Math.random()});

function renderLvlBar(diff,active){
  lvlBarEl.innerHTML='';
  const color=DIFFS[diff].color;
  for(let i=0;i<5;i++){
    const d=document.createElement('div');
    d.className='lvl-dot';
    d.style.background=(i<=active)?color:'rgba(255,255,255,0.18)';
    d.style.opacity=(i===active)?'1':(i<active)?'0.7':'0.4';
    lvlBarEl.appendChild(d);
  }
}

function showIntro() {
  running = false;
  clearInterval(timerInt); clearInterval(spawnInt);
  meteors = []; explosions = [];
  document.getElementById('hud').style.visibility = 'hidden';
  const sc = document.getElementById('solar-canvas');
  sc.style.display = 'block';
  startBgMeteors(sc);
  startMenuMusic(); // idempotente — no solapará si ya suena
  ov.style.display = 'flex';
  ov.innerHTML = introHtml();
}

function showMenu(){
  running=false;
  clearInterval(timerInt);clearInterval(spawnInt);
  meteors=[];explosions=[];
  document.getElementById('hud').style.visibility='hidden';
  const sc=document.getElementById('solar-canvas');
  sc.style.display='block';
  startBgMeteors(sc);
  startMenuMusic(); // idempotente
  ov.style.display='flex';
  ov.innerHTML=menuHtml(DIFFS);
}

function selectDiff(key){
  sfxClick();
  curDiff=key;curLvlIdx=0;showLevelIntro();
}

function showLevelIntro(){
  ov.style.display='flex';
  running=false;
  clearInterval(timerInt);clearInterval(spawnInt);
  document.getElementById('hud').style.visibility='visible';
  diffDef=DIFFS[curDiff];lvlDef=diffDef.levels[curLvlIdx];
  diffLbl.textContent=diffDef.name;
  renderLvlBar(curDiff,curLvlIdx);
  lvlNEl.textContent=curLvlIdx+1;
  goalEl.textContent=lvlDef.goal;
  timEl.textContent=lvlDef.time;
  const estrellas=Math.min(5,Math.ceil(lvlDef.speed/0.9));
  ov.innerHTML=LevelIntro(diffDef,curLvlIdx,lvlDef,estrellas);
  const sc=document.getElementById('solar-canvas');
  sc.style.display='block';
  startBgMeteors(sc);
  startMenuMusic(); // idempotente
}

function startLevel(){
  diffDef=DIFFS[curDiff];lvlDef=diffDef.levels[curLvlIdx];
  pts=0;timeLeft=lvlDef.time;running=true;
  meteors=[];explosions=[];shots=[];
  ptsEl.textContent=0;timEl.textContent=timeLeft;
  goalEl.textContent=lvlDef.goal;lvlNEl.textContent=curLvlIdx+1;
  diffLbl.textContent=diffDef.name;
  renderLvlBar(curDiff,curLvlIdx);
  const sc=document.getElementById('solar-canvas');
  sc.style.display='block';
  startBgMeteors(sc);
  startGameMusic(); // cambia de menú → juego limpiamente
  ov.style.display='none';
  clearInterval(timerInt);clearInterval(spawnInt);
  timerInt=setInterval(()=>{ timeLeft--;timEl.textContent=timeLeft;if(timeLeft<=0)endLevel(false); },1000);
  spawnInt=setInterval(()=>{ for(let i=0;i<diffDef.perSpawn;i++)spawnMeteor(); },lvlDef.rate);
  requestAnimationFrame(loop);
}

function spawnMeteor(){
  if(!running)return;
  const side=Math.floor(Math.random()*4);
  let x,y;
  if(side===0){x=Math.random()*W;y=-22;}
  else if(side===1){x=W+22;y=Math.random()*H;}
  else if(side===2){x=Math.random()*W;y=H+22;}
  else{x=-22;y=Math.random()*H;}
  const spd=lvlDef.speed*(0.75+Math.random()*0.55);
  const len=Math.sqrt((CX-x)**2+(CY-y)**2);
  meteors.push({x,y,vx:(CX-x)/len*spd+(Math.random()-.5)*0.5,vy:(CY-y)/len*spd+(Math.random()-.5)*0.5,r:8+Math.random()*10,destroyed:false,crack:Math.random()*Math.PI*2});
}

function fireAt(cx,cy){
  let best=null,bestD=38;
  meteors.forEach(m=>{ if(m.destroyed)return;const d=Math.sqrt((cx-m.x)**2+(cy-m.y)**2);if(d<m.r+14&&d<bestD){bestD=d;best=m;} });
  sfxShoot();
  shots.push({x:cx,y:cy,life:1});
  if(best){
    best.destroyed=true;pts++;ptsEl.textContent=pts;
    boom(best.x,best.y);
    sfxExplode();
    if(pts>=lvlDef.goal)endLevel(true);
  }
}

function endLevel(win){
  running=false;
  clearInterval(timerInt);clearInterval(spawnInt);
  const d=DIFFS[curDiff];
  ov.style.display='flex';
  const sc=document.getElementById('solar-canvas');
  sc.style.display='block';
  startBgMeteors(sc);

  if(win){
    sfxWin();
    const isLast=curLvlIdx===4;
    ov.innerHTML=winnerHtml(isLast,d,curLvlIdx);
  } else {
    sfxImpact();
    setTimeout(sfxLose, 420);
    ov.innerHTML=loserHtml(d,pts,curLvlIdx,lvlDef);
  }

  // Esperar a que terminen los SFX antes de arrancar la música de menú
  setTimeout(() => startMenuMusic(), 900);
}

function nextLevel(){
  sfxClick();
  curLvlIdx++;showLevelIntro();
}

function loop(){
  if(!running)return;
  ctx.fillStyle='#070714';ctx.fillRect(0,0,W,H);
  drawStars();drawEarth(ctx,CX,CY,ER);drawShots();
  for(let i=meteors.length-1;i>=0;i--){
    const m=meteors[i];if(m.destroyed)continue;
    m.x+=m.vx;m.y+=m.vy;
    if(m.x<-60||m.x>W+60||m.y<-60||m.y>H+60){meteors.splice(i,1);continue;}
    const ex=m.x-CX,ey=m.y-CY;
    if(Math.sqrt(ex*ex+ey*ey)<ER+m.r-6){endLevel(false);return;}
    drawMeteor(m);
  }
  drawExplosions();drawCrosshair();
  requestAnimationFrame(loop);
}

function drawStars(){
  stars.forEach(s=>{ctx.globalAlpha=0.3+s.a*0.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;
}

function drawMeteor(m){
  const angle=Math.atan2(m.vy,m.vx),tl=m.r*2.8;
  const tg=ctx.createLinearGradient(m.x,m.y,m.x-Math.cos(angle)*tl,m.y-Math.sin(angle)*tl);
  tg.addColorStop(0,'rgba(255,110,40,0.5)');tg.addColorStop(1,'rgba(255,60,20,0)');
  ctx.strokeStyle=tg;ctx.lineWidth=m.r*0.85;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-Math.cos(angle)*tl,m.y-Math.sin(angle)*tl);ctx.stroke();
  ctx.save();ctx.translate(m.x,m.y);
  const mg=ctx.createRadialGradient(-m.r*.3,-m.r*.3,0,0,0,m.r);
  mg.addColorStop(0,'#E24B4A');mg.addColorStop(0.55,'#7A2A1A');mg.addColorStop(1,'#3A1008');
  ctx.fillStyle=mg;ctx.beginPath();ctx.arc(0,0,m.r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(240,90,40,0.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,m.r+2.5,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(255,170,60,0.45)';ctx.lineWidth=0.9;
  for(let i=0;i<3;i++){const a=m.crack+i*(Math.PI*2/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*m.r*.8,Math.sin(a)*m.r*.8);ctx.stroke();}
  ctx.restore();
}

function drawShots(){
  shots=shots.filter(s=>s.life>0);
  shots.forEach(s=>{ctx.globalAlpha=s.life*0.75;ctx.strokeStyle='#FFF';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,(1-s.life)*22,0,Math.PI*2);ctx.stroke();s.life-=0.1;});
  ctx.globalAlpha=1;
}

function boom(x,y){
  for(let i=0;i<16;i++) explosions.push({x,y,vx:(Math.random()-.5)*5.5,vy:(Math.random()-.5)*5.5,r:Math.random()*3+1,life:1,c:`hsl(${15+Math.random()*45},90%,${48+Math.random()*22}%)`});
}

function drawExplosions(){
  explosions=explosions.filter(p=>p.life>0);
  explosions.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.052;ctx.globalAlpha=p.life;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;
}

function drawCrosshair(){
  const sz=16,gap=5;
  ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(mx-sz,my);ctx.lineTo(mx-gap,my);ctx.stroke();
  ctx.beginPath();ctx.moveTo(mx+gap,my);ctx.lineTo(mx+sz,my);ctx.stroke();
  ctx.beginPath();ctx.moveTo(mx,my-sz);ctx.lineTo(mx,my-gap);ctx.stroke();
  ctx.beginPath();ctx.moveTo(mx,my+gap);ctx.lineTo(mx,my+sz);ctx.stroke();
  ctx.beginPath();ctx.arc(mx,my,5,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.stroke();
  let best=null,bestD=50;
  meteors.forEach(m=>{if(m.destroyed)return;const d=Math.sqrt((mx-m.x)**2+(my-m.y)**2);if(d<m.r+20&&d<bestD){bestD=d;best=m;}});
  if(best){ctx.strokeStyle='rgba(255,80,80,0.7)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(best.x,best.y,best.r+7,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
}

canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mx=(e.clientX-r.left)*(W/r.width);my=(e.clientY-r.top)*(H/r.height);});
canvas.addEventListener('click',e=>{if(!running)return;const r=canvas.getBoundingClientRect();fireAt((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));});
canvas.addEventListener('touchstart',e=>{e.preventDefault();if(!running)return;const r=canvas.getBoundingClientRect();const cx=(e.touches[0].clientX-r.left)*(W/r.width);const cy=(e.touches[0].clientY-r.top)*(H/r.height);mx=cx;my=cy;fireAt(cx,cy);},{passive:false});
canvas.addEventListener('touchmove',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();mx=(e.touches[0].clientX-r.left)*(W/r.width);my=(e.touches[0].clientY-r.top)*(H/r.height);},{passive:false});

window.selectDiff=selectDiff;
window.startLevel=startLevel;
window.nextLevel=nextLevel;
window.showMenu=showMenu;
window.showIntro=showIntro;
showIntro();
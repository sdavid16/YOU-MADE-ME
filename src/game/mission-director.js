(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const KEY='ymm-mission-history-v1';
  const MISSIONS=[
    {id:'stay-alive',title:'SUPERVIVENCIA',desc:'Permanece activo sin caer durante {goal} segundos.',metric:'alive',base:35,min:20,unit:'s',xp:45,credits:16},
    {id:'field-work',title:'RECONOCIMIENTO',desc:'Muévete durante {goal} segundos para mapear el entorno.',metric:'moving',base:22,min:12,unit:'s',xp:38,credits:14},
    {id:'verbal-pressure',title:'GUERRA VERBAL',desc:'Transmite {goal} provocaciones aceptadas a ECHO.',metric:'taunts',base:2,min:1,unit:'',xp:40,credits:15},
    {id:'dash-drill',title:'MOVILIDAD TÁCTICA',desc:'Ejecuta {goal} maniobras de dash.',metric:'dashes',base:4,min:2,unit:'',xp:42,credits:16},
    {id:'data-recovery',title:'RECUPERACIÓN DE DATOS',desc:'Recoge {goal} fragmentos o registros en este mundo.',metric:'collectibles',base:3,min:1,unit:'',xp:50,credits:20},
    {id:'clean-run',title:'SIN HERIDAS',desc:'Sobrevive {goal} segundos sin recibir daño.',metric:'noDamage',base:18,min:10,unit:'s',xp:60,credits:22},
    {id:'counterfire',title:'RESPUESTA HOSTIL',desc:'Registra {goal} acciones ofensivas durante la misión.',metric:'attacks',base:5,min:3,unit:'',xp:45,credits:18},
    {id:'boss-pressure',title:'LECTURA DEL NÚCLEO',desc:'Inflige {goal} puntos de daño a un jefe.',metric:'bossDamage',base:3,min:1,unit:'',xp:75,credits:28,worlds:[3,6]},
    {id:'elimination',title:'LIMPIEZA DEL SECTOR',desc:'Elimina {goal} hostiles en este sector.',metric:'kills',base:3,min:1,unit:'',xp:70,credits:25,worlds:[4,5,7,8,9,10,11,12]},
    {id:'archive',title:'ARCHIVO VIVO',desc:'Recupera {goal} registros narrativos.',metric:'collectibles',base:4,min:2,unit:'',xp:65,credits:24,worlds:[4,8,9,11,12]},
    {id:'steady-hand',title:'CONTROL DE RITMO',desc:'Mantén una secuencia de movimiento durante {goal} segundos.',metric:'moving',base:30,min:15,unit:'s',xp:48,credits:18},
    {id:'adaptation',title:'CONOCE AL ENEMIGO',desc:'Provoca a ECHO y sobrevive {goal} segundos después.',metric:'postTaunt',base:15,min:8,unit:'s',xp:55,credits:20}
  ];
  const STYLE=`
  .ymm-mission{position:absolute;z-index:6;top:14px;left:14px;width:min(260px,45%);padding:10px 12px;border:1px solid rgba(114,243,220,.34);background:rgba(3,9,18,.86);color:#dceeff;pointer-events:none;backdrop-filter:blur(7px);font:10px/1.45 system-ui,sans-serif;box-shadow:0 5px 25px #0005;transition:opacity .2s}
  .ymm-mission.hidden{display:none}.ymm-mission-kicker{color:#72f3dc;font-size:7px;font-weight:900;letter-spacing:.19em}.ymm-mission h3{margin:4px 0;font-size:11px;letter-spacing:.08em}.ymm-mission p{margin:0;color:#91a3c0;font-size:9px}.ymm-mission-line{height:3px;background:#24324a;margin:8px 0 4px;overflow:hidden}.ymm-mission-line i{display:block;height:100%;width:0;background:linear-gradient(90deg,#72f3dc,#b8a0ff);transition:width .12s}.ymm-mission-foot{display:flex;justify-content:space-between;gap:8px;color:#7186a7;font-size:8px}
  @media(max-width:650px){.ymm-mission{top:9px;left:9px;width:min(190px,48%);padding:7px 8px}.ymm-mission h3{font-size:9px}.ymm-mission p{font-size:8px}.ymm-mission-kicker{font-size:6px}}
  `;
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  class MissionDirector{
    constructor(game){
      this.game=game;this.mission=null;this.world=-1;this.recent=[];this.elapsed=0;this.metrics={};this.last={};this.completeCount=0;this.lastTauntAt=-999;this.runSeed=0;this.ui=null;this.loadHistory();this.injectUI();
    }
    loadHistory(){try{const data=JSON.parse(root.localStorage&&root.localStorage.getItem(KEY)||'{}');this.recent=Array.isArray(data.recent)?data.recent.slice(-8):[];this.completeCount=Number(data.completeCount)||0;}catch(e){this.recent=[];this.completeCount=0;}}
    saveHistory(){try{root.localStorage&&root.localStorage.setItem(KEY,JSON.stringify({recent:this.recent.slice(-8),completeCount:this.completeCount,updatedAt:Date.now()}));}catch(e){}}
    injectUI(){
      if(!root.document||!document.querySelector)return;
      if(!document.getElementById('ymm-mission-style')){const style=document.createElement('style');style.id='ymm-mission-style';style.textContent=STYLE;document.head&&document.head.appendChild(style);}
      const stage=document.getElementById('game-stage');if(!stage)return;
      this.ui=document.createElement('aside');this.ui.className='ymm-mission hidden';this.ui.setAttribute('aria-live','polite');this.ui.innerHTML='<div class="ymm-mission-kicker">SIDE OBJECTIVE // OPTIONAL</div><h3></h3><p></p><div class="ymm-mission-line"><i></i></div><div class="ymm-mission-foot"><span class="ymm-mission-progress"></span><span class="ymm-mission-reward"></span></div>';stage.appendChild(this.ui);
    }
    startRun(){
      this.runSeed=hash(String(Date.now())+':'+(this.game.meta?this.game.meta.profile.runs:0)+':'+Math.random());this.world=-1;this.metrics={};this.last={};this.elapsed=0;this.lastTauntAt=-999;this.chooseForWorld(this.game.world);
    }
    available(world){return MISSIONS.filter(m=>(!m.worlds||m.worlds.includes(world))&&!this.recent.includes(m.id));}
    chooseForWorld(world){
      this.world=world;this.elapsed=0;this.metrics={alive:0,moving:0,taunts:0,dashes:0,collectibles:0,noDamage:0,attacks:0,bossDamage:0,kills:0,postTaunt:0};
      const options=this.available(world);const pool=options.length?options:MISSIONS.filter(m=>!m.worlds||m.worlds.includes(world));if(!pool.length){this.mission=null;this.render();return;}
      const index=hash(this.runSeed+':world:'+world+':'+this.recent.join(','))%pool.length;const def=pool[index];
      const scale=this.game.difficulty==='nightmare'?1.25:this.game.difficulty==='story'?.78:1;
      const goal=Math.max(def.min,Math.round(def.base*scale));
      this.mission={...def,goal,progress:0,completed:false,startedAt:this.game.elapsed,baseTaunts:this.game.ai?this.game.ai.provocation:0,baseCollectibles:this.game.fragments||0,baseBossHp:this.game.boss&&this.game.boss.hp,baseKills:this.currentAliveCount(),lastX:this.game.player&&this.game.player.x||0,lastY:this.game.player&&this.game.player.y||0,tauntSeen:false,award:Math.round(def.xp*scale),creditAward:Math.round(def.credits*scale)};
      this.render();
      if(this.game.log)this.game.log('OBJETIVO SECUNDARIO // '+def.title+' — '+def.desc.replace('{goal}',String(goal)),'alert');
    }
    currentEnemies(){return this.game.world===7||this.game.world===10?(this.game.signalEnemies||[]):this.game.world===5?(this.game.runnerEnemies||[]):([4,8,9,11,12].includes(this.game.world)?(this.game.sentinels||[]):[]);}
    currentAliveCount(){return this.currentEnemies().filter(e=>e&&e.hp>0).length;}
    onAttack(){this.metrics.attacks=(this.metrics.attacks||0)+1;}
    onDash(){this.metrics.dashes=(this.metrics.dashes||0)+1;}
    onTaunt(){this.metrics.taunts=(this.metrics.taunts||0)+1;this.lastTauntAt=this.elapsed;this.metrics.postTaunt=0;}
    onCollect(count=1){this.metrics.collectibles=(this.metrics.collectibles||0)+count;}
    onDamage(){this.metrics.noDamage=0;}
    update(game,dt){
      if(game.screen!=='playing')return;
      if(game.world!==this.world)this.chooseForWorld(game.world);
      if(!this.mission||this.mission.completed)return;
      this.elapsed+=dt;this.metrics.alive+=dt;this.metrics.noDamage+=dt;
      if(game.player&&Math.hypot(game.player.vx||0,game.player.vy||0)>15)this.metrics.moving+=dt;\n      if(game.input&&game.input.justPressed('ShiftLeft','ShiftRight'))this.metrics.dashes++;\n      if(game.input&&game.input.justPressed('KeyJ','KeyF','KeyQ','KeyK','Space'))this.metrics.attacks++;
      if(this.lastTauntAt>=0)this.metrics.postTaunt=this.elapsed-this.lastTauntAt;
      const p=game.player||{};const dx=(p.x||0)-this.mission.lastX,dy=(p.y||0)-this.mission.lastY;this.metrics.distance=(this.metrics.distance||0)+Math.hypot(dx,dy);this.mission.lastX=p.x||0;this.mission.lastY=p.y||0;
      const current=this.currentAliveCount();if(this.mission.baseKills!==null&&current<this.mission.baseKills)this.metrics.kills+=(this.mission.baseKills-current);this.mission.baseKills=current;
      if(game.boss&&this.mission.baseBossHp!==null&&game.boss.hp<this.mission.baseBossHp){this.metrics.bossDamage+=(this.mission.baseBossHp-game.boss.hp);this.mission.baseBossHp=game.boss.hp;}
      if(this.mission.metric==='collectibles'&&game.fragments>this.mission.baseCollectibles){this.metrics.collectibles=Math.max(this.metrics.collectibles,game.fragments-this.mission.baseCollectibles);}
      this.mission.progress=Number(this.metrics[this.mission.metric]||0);
      if(this.mission.progress>=this.mission.goal)this.complete();
      this.render();
    }
    complete(){
      if(!this.mission||this.mission.completed)return;
      this.mission.completed=true;this.completeCount++;this.recent.push(this.mission.id);this.recent=this.recent.slice(-8);this.saveHistory();
      if(this.game.meta){this.game.meta.addXP(this.mission.award);this.game.meta.profile.credits+=this.mission.creditAward;this.game.meta.checkAchievements();this.game.meta.save();}
      this.game.toast('OBJETIVO CUMPLIDO // +'+this.mission.award+' XP · +'+this.mission.creditAward+' CR');
      this.game.log('MISIÓN COMPLETADA // '+this.mission.title+'. Recompensa registrada.','alert');
      this.render();
    }
    render(){
      if(!this.ui)return;
      if(!this.mission||this.game.screen!=='playing'){this.ui.classList.add('hidden');return;}
      this.ui.classList.remove('hidden');const m=this.mission,ratio=Math.max(0,Math.min(1,m.progress/m.goal));
      this.ui.querySelector('h3').textContent=m.completed?'✓ '+m.title:m.title;
      this.ui.querySelector('p').textContent=m.completed?'Objetivo completado. Sigue con la misión principal.':m.desc.replace('{goal}',String(m.goal));
      this.ui.querySelector('.ymm-mission-line i').style.width=(ratio*100)+'%';
      this.ui.querySelector('.ymm-mission-progress').textContent=Math.floor(Math.min(m.progress,m.goal))+' / '+m.goal+(m.unit?' '+m.unit:'');
      this.ui.querySelector('.ymm-mission-reward').textContent=m.completed?'COMPLETADO':'+'+m.award+' XP';
    }
  }
  YMM.MissionDirector=MissionDirector;
})(globalThis);

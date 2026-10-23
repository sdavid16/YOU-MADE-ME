(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STORE='ymm-meta-profile-v2';
  const WORLDS=12;
  const ACHIEVEMENTS=[
    {id:'first-steps',name:'Primera ejecución',desc:'Inicia una sesión por primera vez.',xp:30,check:s=>s.runs>=1},
    {id:'provoker',name:'No sabes callarte',desc:'Provoca a ECHO diez veces.',xp:60,check:s=>s.taunts>=10},
    {id:'linguist',name:'Guerra de palabras',desc:'Usa las cuatro categorías verbales.',xp:90,check:s=>['intellect','logic','threat','psychology'].every(k=>s.tauntTypes[k])},
    {id:'collector',name:'Archivista',desc:'Recoge veinte registros o fragmentos.',xp:80,check:s=>s.collectibles>=20},
    {id:'survivor',name:'No era suerte',desc:'Sobrevive cinco minutos acumulados.',xp:70,check:s=>s.playSeconds>=300},
    {id:'speedrunner',name:'Sin mirar atrás',desc:'Completa una sesión en menos de ocho minutos.',xp:120,check:s=>s.completedRuns.some(t=>t<=480)},
    {id:'nightmare',name:'Malas decisiones',desc:'Juega en dificultad Pesadilla durante 120 segundos.',xp:100,check:s=>s.nightmareSeconds>=120},
    {id:'explorer',name:'Doce puertas',desc:'Llega al mundo 12.',xp:120,check:s=>s.maxWorld>=12},
    {id:'full-house',name:'La campaña entera',desc:'Alcanza el final de la campaña.',xp:250,check:s=>s.endings>=1},
    {id:'repeater',name:'Una vez más',desc:'Completa cinco sesiones.',xp:100,check:s=>s.runs>=5},
    {id:'veteran',name:'Persistencia',desc:'Acumula treinta minutos de juego.',xp:180,check:s=>s.playSeconds>=1800},
    {id:'signal-hunter',name:'Cazador de señales',desc:'Derrota a veinte enemigos (estimación por cambios de roster).',xp:120,check:s=>s.kills>=20},
    {id:'unpredictable',name:'No me has leído',desc:'Cambia de mundo diez veces sin repetir un patrón verbal.',xp:90,check:s=>s.worldTransitions>=10},
    {id:'no-taunts',name:'Silencio incómodo',desc:'Llega al mundo 4 sin provocar a la IA.',xp:90,check:s=>s.world4WithoutTaunts},
    {id:'analyst',name:'Analista de sistemas',desc:'Abre el dossier de campaña cinco veces.',xp:40,check:s=>s.panelOpens>=5}
  ];
  const CONTRACTS=[
    {id:'move',name:'No te quedes quieto',desc:'Sobrevive y muévete durante 45 segundos.',goal:45,metric:'movingSeconds',reward:45},
    {id:'talk',name:'Provocación controlada',desc:'Usa dos categorías de provocación distintas.',goal:2,metric:'uniqueTaunts',reward:50},
    {id:'explore',name:'Exploración de campo',desc:'Visita tres mundos distintos.',goal:3,metric:'uniqueWorlds',reward:55},
    {id:'survive',name:'Resistencia',desc:'Acumula 90 segundos sin recibir daño.',goal:90,metric:'noHitSeconds',reward:70},
    {id:'collect',name:'Recuperación de datos',desc:'Recoge cinco objetos de campaña.',goal:5,metric:'runCollectibles',reward:60},
    {id:'boss',name:'Presión al núcleo',desc:'Entra en un mundo de jefe y permanece activo 30 s.',goal:30,metric:'bossSeconds',reward:75}
  ];
  const UPGRADES=[
    {id:'vitality',name:'Integridad reforzada',desc:'+1 punto de salud máxima al iniciar mundos.',cost:120,max:3,icon:'♥'},
    {id:'capacitor',name:'Condensador',desc:'Recuperación de resistencia un 12% más rápida por nivel.',cost:100,max:3,icon:'ϟ'},
    {id:'dash',name:'Motor de impulso',desc:'Reduce ligeramente el enfriamiento del dash.',cost:140,max:2,icon:'»'},
    {id:'intel',name:'Análisis predictivo',desc:'Amplía la ventana de lectura táctica.',cost:110,max:2,icon:'⌁'},
    {id:'salvage',name:'Reciclaje de datos',desc:'Gana un 10% más de XP por nivel.',cost:160,max:3,icon:'◇'},
    {id:'shield',name:'Blindaje adaptativo',desc:'Reduce una pequeña fracción del daño recibido.',cost:180,max:2,icon:'⬡'}
  ];
  const CSS=`
  .ymm-meta{position:absolute;inset:0;z-index:20;display:none;overflow:auto;padding:clamp(12px,3vw,28px);background:radial-gradient(ellipse at top,#14253c 0%,#080d19 62%,#03060c 100%);color:#e7f2ff;font:12px/1.55 system-ui,sans-serif}
  .ymm-meta.open{display:block}.ymm-meta *{box-sizing:border-box}.ymm-meta button{font:inherit;cursor:pointer}
  .ymm-meta-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid #31435e;padding-bottom:15px;margin-bottom:16px}
  .ymm-meta-kicker{font-size:9px;letter-spacing:.2em;color:#72f3dc;font-weight:900}.ymm-meta h2{font-size:clamp(21px,4vw,34px);letter-spacing:.05em;margin:4px 0}.ymm-meta p{margin:4px 0;color:#9aaac5}
  .ymm-meta-close{border:1px solid #52627b;background:#111b2b;color:#d9e9ff;padding:8px 12px}
  .ymm-meta-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:15px 0}
  .ymm-meta-stat,.ymm-meta-card{min-width:0;border:1px solid #263a55;background:linear-gradient(145deg,#101d30,#080e19);padding:12px}
  .ymm-meta-stat b{display:block;font-size:22px;color:#72f3dc}.ymm-meta-stat span{font-size:9px;letter-spacing:.1em;color:#8093b2}
  .ymm-meta-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:15px 0}.ymm-meta-tabs button{padding:8px 12px;border:1px solid #344760;background:#0b1423;color:#9aacc8}.ymm-meta-tabs button.active{border-color:#72f3dc;color:#bffff5;background:#12303a}
  .ymm-meta-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .ymm-meta-card h3{margin:0 0 4px;font-size:12px;color:#e5f3ff}.ymm-meta-card p{font-size:10px;min-height:30px}
  .ymm-meta-card small{font-size:9px;color:#8195b5}.ymm-meta-card .meta-line{height:4px;background:#202e44;margin:8px 0;overflow:hidden}.ymm-meta-card .meta-line i{display:block;height:100%;background:#72f3dc}
  .ymm-meta-card button{margin-top:9px;padding:7px 10px;border:1px solid #416276;background:#102532;color:#bffff5}.ymm-meta-card button:disabled{opacity:.35;cursor:not-allowed}
  .ymm-meta-card.done{border-color:#397e78}.ymm-meta-card.done h3{color:#72f3dc}.ymm-meta-foot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px;color:#667d9e;font-size:9px}
  @media(max-width:620px){.ymm-meta-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.ymm-meta-stat{padding:8px}.ymm-meta-stat b{font-size:17px}.ymm-meta-stat span{font-size:7px}.ymm-meta-list{grid-template-columns:1fr}.ymm-meta-card p{min-height:0}}
  `;
  function freshProfile(){return {version:2,xp:0,credits:0,runs:0,playSeconds:0,nightmareSeconds:0,taunts:0,tauntTypes:{},collectibles:0,kills:0,maxWorld:1,endings:0,worldTransitions:0,completedRuns:[],world4WithoutTaunts:false,panelOpens:0,achievements:[],upgrades:{},contracts:{},stats:{damageTaken:0,perfectDashes:0,shots:0,worldVisits:{},bestTime:null},createdAt:Date.now(),updatedAt:Date.now()};}
  class MetaProgression{
    constructor(game){
      this.game=game;this.profile=this.load();this.opened=false;this.tab='overview';this.lastWorld=game.world;this.lastScreen=game.screen;this.runStartedAt=0;this.runWorlds=new Set();this.runTaunts=0;this.runCollectibles=0;this.runDamage=0;this.runMoving=0;this.runNoHit=0;this.runBoss=0;this.runKills=0;this.runUniqueTaunts=new Set();this.runTauntTypes=new Set();this.lastHealth=null;this.lastFragments=0;this.lastEnemyCount=null;this.lastBossHp=null;this.lastContractCheck=0;this.contractProgress={};this.lastToastAt=0;this.injectUI();this.rotateContracts();this.applySavedMeta();
    }
    load(){try{const p=JSON.parse(root.localStorage&&root.localStorage.getItem(STORE)||'null');if(p&&p.version===2)return Object.assign(freshProfile(),p);}catch(e){}return freshProfile();}
    save(){this.profile.updatedAt=Date.now();try{root.localStorage&&root.localStorage.setItem(STORE,JSON.stringify(this.profile));return true;}catch(e){return false;}}
    injectUI(){
      if(!root.document)return;
      if(!document.getElementById('ymm-meta-style')){const style=document.createElement('style');style.id='ymm-meta-style';style.textContent=CSS;document.head&&document.head.appendChild(style);}
      this.panel=document.getElementById('ymm-meta-panel');
      if(!this.panel){this.panel=document.createElement('section');this.panel.id='ymm-meta-panel';this.panel.className='ymm-meta';this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-modal','true');this.panel.setAttribute('aria-label','Progresión y dossier');this.panel.innerHTML='<header class="ymm-meta-head"><div><div class="ymm-meta-kicker">YOU MADE ME // CAMPAIGN PROFILE</div><h2>DOSSIER DE CAMPAÑA</h2><p id="ymm-meta-subtitle">Progreso local de esta instalación.</p></div><button class="ymm-meta-close" id="ymm-meta-close">CERRAR ×</button></header><div id="ymm-meta-content"></div><footer class="ymm-meta-foot"><span>PERFIL LOCAL · NO SE ENVÍA A NINGÚN SERVIDOR</span><span><kbd>M</kbd> ABRIR / CERRAR · <kbd>ESC</kbd> VOLVER</span></footer>';const stage=document.getElementById('game-stage');(stage||document.body).appendChild(this.panel);}
      const close=document.getElementById('ymm-meta-close');if(close&&!close.dataset.bound){close.dataset.bound='1';close.addEventListener('click',()=>this.close());}
      if(!this.toggleButton){const nav=document.querySelector('.game-tools');if(nav){this.toggleButton=document.createElement('button');this.toggleButton.id='meta-button';this.toggleButton.className='tool-button difficulty-tool';this.toggleButton.textContent='DOSSIER';this.toggleButton.title='Abrir progresión y desafíos (M)';this.toggleButton.addEventListener('click',()=>this.toggle());nav.appendChild(this.toggleButton);}}
      root.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat){const target=e.target,tag=target&&target.tagName?target.tagName.toUpperCase():'';if(tag!=='INPUT'&&tag!=='TEXTAREA'&&tag!=='SELECT'){e.preventDefault();this.toggle();}}});
    }
    rotateContracts(){
      const day=Math.floor(Date.now()/86400000);
      if(this.profile.contracts.day===day)return;
      const offset=(day*17)%CONTRACTS.length,chosen=[];
      for(let i=0;i<3;i++)chosen.push(CONTRACTS[(offset+i*2)%CONTRACTS.length]);
      this.profile.contracts={day,items:chosen.map(c=>({id:c.id,progress:0,claimed:false}))};this.save();
    }
    toggle(){if(this.opened)this.close();else this.open();}
    open(){
      if(this.opened)return;this.opened=true;this.profile.panelOpens++;this.lastScreen=this.game.screen;
      if(this.game.screen==='playing')this.game.screen='meta';
      this.panel.classList.add('open');this.render();this.save();
    }
    close(){
      if(!this.opened)return;this.opened=false;this.panel.classList.remove('open');
      if(this.game.screen==='meta')this.game.screen='playing';
      if(this.game.hud)this.game.hud.sync();
    }
    render(){
      if(!this.panel)return;const host=this.panel.querySelector('#ymm-meta-content');if(!host)return;
      const p=this.profile;const level=Math.floor(Math.sqrt(p.xp/100))+1,next=level*level*100,prev=(level-1)*(level-1)*100,progress=Math.max(0,Math.min(100,(p.xp-prev)/Math.max(1,next-prev)*100));
      let html='<div class="ymm-meta-grid"><div class="ymm-meta-stat"><b>'+level+'</b><span>NIVEL DE PERFIL</span></div><div class="ymm-meta-stat"><b>'+p.xp+'</b><span>XP TOTAL</span></div><div class="ymm-meta-stat"><b>'+p.credits+'</b><span>CRÉDITOS</span></div></div><div class="ymm-meta-card"><h3>EXPERIENCIA DEL PERFIL · NIVEL '+level+'</h3><div class="meta-line"><i style="width:'+progress.toFixed(1)+'%"></i></div><small>'+Math.max(0,next-p.xp)+' XP para el siguiente nivel</small></div><nav class="ymm-meta-tabs">'+[['overview','RESUMEN'],['contracts','CONTRATOS'],['achievements','LOGROS'],['upgrades','MEJORAS'],['records','REGISTROS']].map(([id,label])=>'<button data-meta-tab="'+id+'" class="'+(this.tab===id?'active':'')+'">'+label+'</button>').join('')+'</nav><div class="ymm-meta-list">';
      if(this.tab==='overview')html+=this.renderOverview();
      else if(this.tab==='contracts')html+=this.renderContracts();
      else if(this.tab==='achievements')html+=this.renderAchievements();
      else if(this.tab==='upgrades')html+=this.renderUpgrades();
      else html+=this.renderRecords();
      html+='</div>';host.innerHTML=html;
      host.querySelectorAll('[data-meta-tab]').forEach(b=>b.addEventListener('click',()=>{this.tab=b.dataset.metaTab;this.render();}));
      host.querySelectorAll('[data-meta-action]').forEach(b=>b.addEventListener('click',()=>this.action(b.dataset.metaAction,b.dataset.metaId)));
    }
    renderOverview(){
      const p=this.profile,stats=p.stats;
      return [
        ['Sesiones',p.runs,'Entradas a la simulación.'],['Tiempo acumulado',this.formatTime(p.playSeconds),'Tiempo de juego real registrado.'],['Mundo más avanzado',p.maxWorld+' / '+WORLDS,'Récord de campaña.'],['Provocaciones',p.taunts,'Interacciones verbales aceptadas.'],['Registros recuperados',p.collectibles,'Objetos de historia recogidos.'],['Daño recibido',p.stats.damageTaken,'Impactos contabilizados.']
      ].map(([a,b,c])=>'<article class="ymm-meta-card"><h3>'+a+'</h3><p>'+b+'</p><small>'+c+'</small></article>').join('');
    }
    renderContracts(){
      return (this.profile.contracts.items||[]).map(item=>{const def=CONTRACTS.find(c=>c.id===item.id);if(!def)return '';const value=Math.min(def.goal,item.progress||0);return '<article class="ymm-meta-card '+(item.claimed?'done':'')+'"><h3>'+def.name+'</h3><p>'+def.desc+'</p><div class="meta-line"><i style="width:'+Math.round(value/def.goal*100)+'%"></i></div><small>'+Math.floor(value)+' / '+def.goal+' · RECOMPENSA '+def.reward+' CR</small><br><button data-meta-action="claim" data-meta-id="'+def.id+'" '+(item.claimed||value<def.goal?'disabled':'')+'>'+(item.claimed?'RECLAMADO':'RECLAMAR')+'</button></article>';}).join('')||'<article class="ymm-meta-card"><h3>Sin contratos</h3><p>Vuelve mañana para una rotación de contratos.</p></article>';
    }
    renderAchievements(){
      return ACHIEVEMENTS.map(a=>{const done=this.profile.achievements.includes(a.id);return '<article class="ymm-meta-card '+(done?'done':'')+'"><h3>'+(done?'✓ ':'◇ ')+a.name+'</h3><p>'+a.desc+'</p><small>'+a.xp+' XP · '+(done?'DESBLOQUEADO':'BLOQUEADO')+'</small></article>';}).join('');
    }
    renderUpgrades(){
      return UPGRADES.map(u=>{const level=this.profile.upgrades[u.id]||0,cost=u.cost*(level+1);return '<article class="ymm-meta-card"><h3>'+u.icon+' '+u.name+' · Nv. '+level+'/'+u.max+'</h3><p>'+u.desc+'</p><small>'+(level>=u.max?'MÁXIMO ALCANZADO':'COSTE '+cost+' CR')+'</small><br><button data-meta-action="upgrade" data-meta-id="'+u.id+'" '+(level>=u.max||this.profile.credits<cost?'disabled':'')+'>'+(level>=u.max?'COMPLETADO':'MEJORAR')+'</button></article>';}).join('');
    }
    renderRecords(){
      const visits=Object.entries(this.profile.stats.worldVisits||{}).sort((a,b)=>Number(a[0])-Number(b[0]));
      return '<article class="ymm-meta-card"><h3>MEJORES REGISTROS</h3><p>Mejor tiempo de finalización: '+(this.profile.stats.bestTime===null?'—':this.formatTime(this.profile.stats.bestTime))+'</p><small>Récord de enemigos detectados: '+this.profile.kills+'</small></article>'+Array.from({length:WORLDS},(_,i)=>{const n=i+1,v=this.profile.stats.worldVisits[n]||0;return '<article class="ymm-meta-card"><h3>MUNDO '+String(n).padStart(2,'0')+'</h3><p>'+v+' visitas registradas</p><small>'+(this.profile.maxWorld>=n?'DESCUBIERTO':'AÚN NO DESCUBIERTO')+'</small></article>';}).join('');
    }
    action(action,id){
      if(action==='claim'){
        const item=(this.profile.contracts.items||[]).find(x=>x.id===id),def=CONTRACTS.find(x=>x.id===id);if(!item||!def||item.claimed||item.progress<def.goal)return;
        item.claimed=true;this.profile.credits+=def.reward;this.profile.xp+=def.reward;this.notify('Contrato completado: +'+def.reward+' créditos.');this.checkAchievements();this.save();this.render();return;
      }
      if(action==='upgrade'){
        const u=UPGRADES.find(x=>x.id===id),level=this.profile.upgrades[id]||0;if(!u||level>=u.max)return;const cost=u.cost*(level+1);if(this.profile.credits<cost)return;
        this.profile.credits-=cost;this.profile.upgrades[id]=level+1;this.notify('Mejora instalada: '+u.name+'.');this.save();this.render();this.applySavedMeta();
      }
    }
    applySavedMeta(){
      const u=this.profile.upgrades;
      this.modifiers={health:u.vitality||0,stamina:1+(u.capacitor||0)*.12,dash:Math.max(.68,1-(u.dash||0)*.12),intel:1+(u.intel||0)*.22,xp:1+(u.salvage||0)*.1,shield:(u.shield||0)*.08};
    }
    onRunStart(){
      this.profile.runs++;this.runStartedAt=this.game.elapsed;this.runWorlds=new Set([this.game.world]);this.runTaunts=0;this.runCollectibles=0;this.runDamage=0;this.runMoving=0;this.runNoHit=0;this.runBoss=0;this.runKills=0;this.runUniqueTaunts.clear?.();this.runUniqueTaunts=new Set();this.runTauntTypes=new Set();this.lastHealth=this.game.player&&this.game.player.health;this.lastFragments=this.game.fragments||0;this.lastEnemyCount=null;this.lastBossHp=this.game.boss&&this.game.boss.hp;this.runStartWall=Date.now();this.save();this.checkAchievements();
    }
    recordTaunt(kind){this.profile.taunts++;this.runTaunts++;this.runUniqueTaunts.add(kind);this.runTauntTypes.add(kind);this.profile.tauntTypes[kind]=true;this.addXP(3);this.checkAchievements();this.save();}
    recordCollectible(count=1){this.profile.collectibles+=count;this.runCollectibles+=count;this.addXP(8*count);this.checkAchievements();this.save();}
    recordDamage(amount=1){this.profile.stats.damageTaken+=amount;this.runDamage+=amount;this.runNoHit=0;this.lastHealth=this.game.player&&this.game.player.health;this.save();}
    addXP(amount){const gain=Math.max(0,Math.round(amount*this.modifiers.xp));this.profile.xp+=gain;this.profile.credits+=Math.max(1,Math.floor(gain*.22));}
    notify(message){if(this.game&&this.game.toast)this.game.toast('DOSSIER // '+message);}
    formatTime(s){s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
    update(game,dt){
      if(game.screen==='playing'){
        this.profile.playSeconds+=dt;if(game.difficulty==='nightmare')this.profile.nightmareSeconds+=dt;
        this.runNoHit+=dt;if(game.world===3||game.world===6)this.runBoss+=dt;
        if(game.player&&Math.hypot(game.player.vx||0,game.player.vy||0)>15)this.runMoving+=dt;
        if(game.world!==this.lastWorld){this.profile.worldTransitions++;this.lastWorld=game.world;this.runWorlds.add(game.world);this.profile.maxWorld=Math.max(this.profile.maxWorld,game.world);this.profile.stats.worldVisits[game.world]=(this.profile.stats.worldVisits[game.world]||0)+1;if(game.world===4&&this.runTaunts===0)this.profile.world4WithoutTaunts=true;this.addXP(12);this.checkAchievements();this.save();}
        const hp=game.player&&game.player.health;if(this.lastHealth!==null&&hp!==undefined&&hp<this.lastHealth)this.recordDamage(this.lastHealth-hp);if(hp!==undefined)this.lastHealth=hp;
        const fragments=Number(game.fragments||0);if(fragments>this.lastFragments)this.recordCollectible(fragments-this.lastFragments);this.lastFragments=fragments;
        const enemies=game.sentinels||game.signalEnemies||game.runnerEnemies||[];const alive=enemies.filter(e=>e&&e.hp>0).length;if(this.lastEnemyCount!==null&&alive<this.lastEnemyCount){const killed=this.lastEnemyCount-alive;this.profile.kills+=killed;this.runKills+=killed;this.addXP(killed*10);this.checkAchievements();}this.lastEnemyCount=alive;
        if(game.boss&&this.lastBossHp!==null&&game.boss.hp<this.lastBossHp){this.addXP(Math.min(3,(this.lastBossHp-game.boss.hp)*2));}this.lastBossHp=game.boss&&game.boss.hp;
        if(game.screen==='ending')this.completeRun(game);
        if(game.elapsed-this.lastContractCheck>.5){this.updateContracts(game);this.lastContractCheck=game.elapsed;}
        if(game.elapsed%5<dt)this.save();
      }else if(game.screen==='ending'&&this.lastScreen!=='ending')this.completeRun(game);
      this.lastScreen=game.screen;
    }
    updateContracts(game){
      for(const item of this.profile.contracts.items||[]){if(item.claimed)continue;const d=CONTRACTS.find(c=>c.id===item.id);if(!d)continue;let val=0;
        if(d.metric==='movingSeconds')val=this.runMoving;else if(d.metric==='uniqueTaunts')val=this.runTauntTypes.size;else if(d.metric==='uniqueWorlds')val=this.runWorlds.size;else if(d.metric==='noHitSeconds')val=this.runNoHit;else if(d.metric==='runCollectibles')val=this.runCollectibles;else if(d.metric==='bossSeconds')val=this.runBoss;
        item.progress=Math.max(item.progress||0,Math.min(d.goal,val));
      }
    }
    completeRun(game){
      if(this.completedThisRun)return;this.completedThisRun=true;this.profile.endings++;const time=Math.max(0,game.elapsed-this.runStartedAt);this.profile.completedRuns.push(time);this.profile.completedRuns=this.profile.completedRuns.slice(-20);if(this.profile.stats.bestTime===null||time<this.profile.stats.bestTime)this.profile.stats.bestTime=time;this.addXP(100+Math.max(0,12-game.world)*4);this.checkAchievements();this.save();
    }
    checkAchievements(){
      let changed=false;for(const a of ACHIEVEMENTS){if(!this.profile.achievements.includes(a.id)&&a.check(this.profile)){this.profile.achievements.push(a.id);this.addXP(a.xp);this.notify('LOGRO DESBLOQUEADO // '+a.name);changed=true;}}
      if(changed)this.save();
    }
  }
  YMM.MetaProgression=MetaProgression;
})(globalThis);

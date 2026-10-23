(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class HUD {
    constructor() {
      const $=id=>document.getElementById(id);
      this.el={frameWorld:$('frame-world'),frameHint:$('frame-hint'),controls:$('controls-copy'),worldTitle:$('world-title'),chapter:$('chapter-pill'),worldDescription:$('world-description'),provocationValue:$('provocation-value'),provocationMeter:$('provocation-meter'),provocationCaption:$('provocation-caption'),adaptationValue:$('adaptation-value'),adaptationMeter:$('adaptation-meter'),adaptationCaption:$('adaptation-caption'),aiAvatar:$('ai-avatar'),aiState:$('ai-state'),aiStatusLine:$('ai-status-line'),statusLed:$('status-led'),logEntries:$('log-entries'),toast:$('toast'),start:$('start-button'),taunt:$('taunt-button'),challenge:$('challenge-button'),actionCopy:$('action-copy'),pause:$('pause-screen')};
      this.game=null;this.toastTimer=null;this.logs=[];
    }
    bind(game){
      this.game=game;
      this.el.start.addEventListener('click',()=>{if(this.game.screen==='menu'||this.game.screen==='ending')this.game.newGame();});
      this.el.taunt.addEventListener('click',()=>this.game.provoke('mock'));this.el.challenge.addEventListener('click',()=>this.game.provoke('humiliate'));
      document.getElementById('resume-button').addEventListener('click',()=>this.game.resume());
      document.getElementById('audio-button').addEventListener('click',()=>{const muted=this.game.audio.toggle();document.getElementById('audio-button').textContent=muted?'♪̸':'♪';document.getElementById('audio-button').title=muted?'Activar sonido':'Silenciar sonido';document.getElementById('audio-button').setAttribute('aria-label',muted?'Activar sonido':'Silenciar sonido');if(!muted)this.game.audio.unlock();});
      const restart=()=>this.game.newGame();
      document.getElementById('restart-button').addEventListener('click',restart);
      document.getElementById('quick-restart').addEventListener('click',()=>{if(this.game.screen==='playing')this.game.newGame();else this.game.newGame();});
      document.getElementById('fullscreen-button').addEventListener('click',async()=>{try{if(!document.fullscreenElement){await document.getElementById('game-shell').requestFullscreen();}else await document.exitFullscreen();}catch(e){this.toast('El navegador no permite pantalla completa aquí.');}});
      this.sync(true);
    }
    clearLog(){this.logs=[];this.renderLog();}
    addLog(message,kind='normal'){this.logs.unshift({message,kind,time:this.game?this.game.elapsed:0});this.logs=this.logs.slice(0,5);this.renderLog();}
    renderLog(){const box=this.el.logEntries;if(!box)return;box.replaceChildren();if(!this.logs.length){const p=document.createElement('p');p.className='log-empty';p.textContent='Nada que reportar. Por ahora.';box.appendChild(p);return;}for(const item of this.logs){const row=document.createElement('div');row.className='log-entry '+item.kind;const tm=document.createElement('span');tm.className='log-time';tm.textContent=YMM.Util.formatTime(item.time);const text=document.createElement('span');text.className='log-text';text.textContent=item.message;row.append(tm,text);box.appendChild(row);}}
    toast(message){const e=this.el.toast;e.textContent=message;e.classList.add('show');if(this.toastTimer)clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>e.classList.remove('show'),2250);}
    syncAI(){if(!this.game)return;const info=this.game.ai.info;this.el.aiState.textContent=info.label;this.el.aiStatusLine.textContent=info.caption;this.el.aiAvatar.firstElementChild.textContent=info.avatar;this.el.aiAvatar.style.color=info.color;this.el.aiAvatar.style.borderColor=info.color+'66';this.el.statusLed.style.background=info.color;}
    sync(force=false){
      if(!this.game)return;const g=this.game,world=g.world;
      const worlds={
        1:{name:'GREENHILL.exe',chapter:'PRÓLOGO',controls:'← → / A D · ESPACIO SALTAR · T PROVOCAR'},
        2:{name:'MEMORY_MAZE.exe',chapter:'INVASIÓN',controls:'WASD / FLECHAS · E INTERACTUAR'},
        3:{name:'NO_LONGER_A_JOKE.exe',chapter:'CONFRONTACIÓN',controls:'WASD / FLECHAS · J ATACAR · SHIFT ESQUIVAR'}
      };
      const s=this.el;
      if(g.screen==='menu'){s.frameWorld.textContent='SYSTEM / TITLE SCREEN';s.frameHint.textContent='PULSA ENTER PARA COMENZAR';s.worldTitle.textContent='Una cosa pequeña';s.chapter.textContent='PRÓLOGO';s.worldDescription.textContent='Un juego ridículamente sencillo. Una IA patética. ¿Qué podría pasar?';s.start.classList.remove('hidden');s.start.innerHTML='<span class="prompt-key">ENTER</span><span>COMENZAR SESIÓN</span>';s.taunt.classList.add('hidden');s.challenge.classList.add('hidden');s.actionCopy.textContent='No estás obligado a provocar nada. Ese es el problema.';s.pause.classList.add('hidden');}
      else if(g.screen==='ending'){s.frameWorld.textContent='SYSTEM / SESSION CLOSED';s.frameHint.textContent=g.ending==='escalation'?'PROCESS STILL RUNNING':'SESSION COMPLETE';s.worldTitle.textContent=g.ending==='escalation'?'Ya no es un juego':'Todo sigue igual';s.chapter.textContent=g.ending==='escalation'?'RUTA OSCURA':'RUTA TRANQUILA';s.worldDescription.textContent=g.ending==='escalation'?'La IA aprendió de tus provocaciones. Ahora sabe cómo ganarte.':'Completaste el recorrido sin alterar el mundo original.';s.start.classList.remove('hidden');s.start.innerHTML='<span class="prompt-key">ENTER</span><span>NUEVA SESIÓN</span>';s.taunt.classList.add('hidden');s.challenge.classList.add('hidden');s.actionCopy.textContent='Cada partida escribe una historia distinta.';s.pause.classList.add('hidden');}
      else {const w=worlds[world];s.frameWorld.textContent=w.name;s.controls.textContent=w.controls;s.start.classList.add('hidden');s.taunt.classList.toggle('hidden',world!==1||g.screen!=='playing');s.challenge.classList.toggle('hidden',world!==1||g.screen!=='playing');s.actionCopy.textContent=world===1?'T se burla sin comprometerte. G desafía: más progreso, pero te deja vendido.':world===2?'La salida existe. Encuentra las piezas y activa el enlace.':'Observa su señal, esquiva la carga y castiga el núcleo expuesto.';s.worldTitle.textContent=w.name;s.chapter.textContent=w.chapter;s.worldDescription.textContent=world===1?'Cruza el nivel. La IA solo parece una broma.':world===2?'Tres fragmentos. Un terminal. Un portal que no debería existir.':'La IA combina tus hábitos con reglas robadas de otros juegos.';s.pause.classList.toggle('hidden',g.screen!=='paused');if(world===1)s.frameHint.textContent='INTEGRIDAD '+ '♥'.repeat(g.player.health)+'♡'.repeat(Math.max(0,3-g.player.health))+' · PROVOCACIÓN '+g.ai.provocation;else if(world===2)s.frameHint.textContent='FRAGMENTOS '+g.fragments+'/3 · INTEGRIDAD '+g.player.health+'/3';else s.frameHint.textContent='NÚCLEO '+Math.max(0,g.boss.hp)+'/'+g.boss.maxHp+' · INTEGRIDAD '+g.player.health+'/3';}
      s.provocationValue.textContent=String(g.ai.provocation).padStart(2,'0');s.provocationMeter.style.width=Math.min(100,g.ai.provocation/8*100)+'%';s.provocationCaption.textContent=g.ai.provocation===0?'Todavía cree que esto es un juego.':g.ai.provocation<3?'Ha registrado una interacción.':g.ai.provocation<6?'Está empezando a detectar un patrón.':'La relación entre tú y el enemigo ha cambiado.';
      const adapt=g.ai.adaptationPct;s.adaptationValue.textContent=String(adapt).padStart(2,'0')+'%';s.adaptationMeter.style.width=adapt+'%';s.adaptationCaption.textContent=adapt===0?'Patrones sin registrar.':adapt<35?'Está comparando tus movimientos.':adapt<70?'Está ensayando contraestrategias.':'Tus hábitos ya forman parte de su política.';this.syncAI();if(force)this.renderLog();
    }
  }
  YMM.HUD=HUD;
})(globalThis);

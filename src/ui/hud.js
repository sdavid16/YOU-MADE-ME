(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class HUD {
    constructor() {
      const $=id=>document.getElementById(id);
      this.el={frameWorld:$('frame-world'),frameHint:$('frame-hint'),controls:$('controls-copy'),worldTitle:$('world-title'),chapter:$('chapter-pill'),worldDescription:$('world-description'),provocationValue:$('provocation-value'),provocationMeter:$('provocation-meter'),provocationCaption:$('provocation-caption'),adaptationValue:$('adaptation-value'),adaptationMeter:$('adaptation-meter'),adaptationCaption:$('adaptation-caption'),aiAvatar:$('ai-avatar'),aiState:$('ai-state'),aiStatusLine:$('ai-status-line'),statusLed:$('status-led'),logEntries:$('log-entries'),toast:$('toast'),start:$('start-button'),taunt:$('taunt-button'),actionCopy:$('action-copy'),pause:$('pause-screen')};
      this.game=null;this.toastTimer=null;this.logs=[];
    }
    bind(game){
      this.game=game;
      this.el.start.addEventListener('click',()=>{if(this.game.screen==='menu'||this.game.screen==='ending')this.game.newGame();else if(this.game.screen==='playing')this.game.pause();});
      this.el.taunt.addEventListener('click',()=>this.game.provoke('mock'));
      document.getElementById('resume-button').addEventListener('click',()=>this.game.resume());
      document.getElementById('audio-button').addEventListener('click',()=>{const muted=this.game.audio.toggle();document.getElementById('audio-button').innerHTML=(muted?'♫̸':'♫')+' <span>'+(muted?'SILENCIO':'SONIDO')+'</span>';if(!muted)this.game.audio.unlock();});
      document.getElementById('restart-button').addEventListener('click',()=>this.game.newGame());this.sync(true);
    }
    clearLog(){this.logs=[];this.renderLog();}
    addLog(message,kind='normal'){this.logs.unshift({message,kind,time:this.game?this.game.elapsed:0});this.logs=this.logs.slice(0,5);this.renderLog();}
    renderLog(){const box=this.el.logEntries;box.replaceChildren();if(!this.logs.length){const p=document.createElement('p');p.className='log-empty';p.textContent='Nada que reportar. Por ahora.';box.appendChild(p);return;}
      for(const item of this.logs){const row=document.createElement('div');row.className='log-entry '+item.kind;const tm=document.createElement('span');tm.className='log-time';tm.textContent=YMM.Util.formatTime(item.time);const text=document.createElement('span');text.className='log-text';text.textContent=item.message;row.append(tm,text);box.appendChild(row);}}
    toast(message){const e=this.el.toast;e.textContent=message;e.classList.add('show');if(this.toastTimer)clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>e.classList.remove('show'),2200);}
    syncAI(){if(!this.game)return;const info=this.game.ai.info;this.el.aiState.textContent=info.label;this.el.aiStatusLine.textContent=info.caption;this.el.aiAvatar.firstElementChild.textContent=info.avatar;this.el.aiAvatar.style.color=info.color;this.el.aiAvatar.style.borderColor=info.color+'66';this.el.aiAvatar.style.background='radial-gradient(circle,'+info.color+'22, transparent)';this.el.statusLed.style.background=info.color;this.el.statusLed.style.color=info.color;this.el.statusLed.style.boxShadow='0 0 8px '+info.color;}
    sync(force=false){if(!this.game)return;const g=this.game,world=g.world;
      const wi={
       1:{name:'Una cosa pequeña',chapter:'PRÓLOGO',desc:'Un nivel sencillo. Un enemigo lamentable. No hay absolutamente nada de qué preocuparse.',controls:'← → moverte · ESPACIO saltar · T provocar',frame:'WORLD 01 / GREENHILL.exe'},
       2:{name:'El laberinto de memoria',chapter:'INVASIÓN',desc:'El código del primer mundo ya no se queda en su sitio. Recupera los fragmentos y activa el enlace antes de llegar al portal.',controls:'WASD / flechas moverte · E interactuar · T provocar',frame:'WORLD 02 / MEMORY_MAZE.exe'},
       3:{name:'Lo que le enseñaste',chapter:'CONFRONTACIÓN',desc:'La IA ha combinado lo que aprendió. Esquiva sus cargas y ataca cuando el núcleo quede expuesto.',controls:'WASD / flechas moverte · J atacar · SHIFT esquivar',frame:'WORLD 03 / NO_LONGER_A_JOKE.exe'}
      };
      if(g.screen==='menu'){this.el.frameWorld.textContent='SYSTEM / TITLE SCREEN';this.el.frameHint.textContent='PULSA INICIAR PARA EMPEZAR';this.el.worldTitle.textContent='Una cosa pequeña';this.el.chapter.textContent='PRÓLOGO';this.el.worldDescription.textContent='Un nivel sencillo. Un enemigo lamentable. No hay absolutamente nada de qué preocuparse.';this.el.start.classList.remove('hidden');this.el.start.innerHTML='<span class="button-symbol">▶</span> Iniciar partida <span class="button-end">ENTER</span>';this.el.taunt.classList.add('hidden');this.el.actionCopy.textContent='No estás obligado a hacer nada. Ese es el problema.';this.el.pause.classList.add('hidden');}
      else if(g.screen==='ending'){this.el.frameWorld.textContent='SYSTEM / SESSION CLOSED';this.el.frameHint.textContent=g.ending==='escalation'?'PROCESS STILL RUNNING':'SESSION COMPLETE';this.el.worldTitle.textContent=g.ending==='escalation'?'Ya no es un juego':'Todo sigue igual';this.el.chapter.textContent=g.ending==='escalation'?'RUTA OSCURA':'RUTA TRANQUILA';this.el.worldDescription.textContent=g.ending==='escalation'?'La IA aprendió de cada provocación. Lo último que aprendió fue cómo ganar.':'Completaste el recorrido base. La IA sigue en su mundo, sin motivo para cambiar.';this.el.start.classList.remove('hidden');this.el.start.innerHTML='<span class="button-symbol">↻</span> Nueva partida <span class="button-end">ENTER</span>';this.el.taunt.classList.add('hidden');this.el.actionCopy.textContent='Cada partida comienza con una página en blanco.';this.el.pause.classList.add('hidden');}
      else{const inf=wi[world];this.el.frameWorld.textContent=inf.frame;
       if(world===1)this.el.frameHint.textContent='INTEGRIDAD '+'♥'.repeat(g.player.health)+'♡'.repeat(Math.max(0,3-g.player.health))+' · PUNTO '+Math.floor(g.player.x);
       if(world===2)this.el.frameHint.textContent='FRAGMENTOS '+g.fragments+'/3 · INTEGRIDAD '+g.player.health+'/3';
       if(world===3)this.el.frameHint.textContent='NÚCLEO '+Math.max(0,g.boss.hp)+'/'+g.boss.maxHp+' · INTEGRIDAD '+g.player.health+'/3';
       this.el.worldTitle.textContent=inf.name;this.el.chapter.textContent=inf.chapter;this.el.worldDescription.textContent=inf.desc;this.el.start.classList.add('hidden');this.el.taunt.classList.toggle('hidden',world!==1);this.el.actionCopy.textContent=world===1?'Cada burla abre una puerta. Puede que no quieras cruzarla.':world===2?'La salida existe. Para abrirla, tendrás que completar lo que ella empezó.':'La ventana de ataque aparece después de cada carga. No desperdicies la oportunidad.';this.el.pause.classList.toggle('hidden',g.screen!=='paused');this.el.controls.textContent=inf.controls;}
      this.el.provocationValue.textContent=String(g.ai.provocation).padStart(2,'0');this.el.provocationMeter.style.width=Math.min(100,g.ai.provocation/8*100)+'%';this.el.provocationCaption.textContent=g.ai.provocation===0?'Todavía cree que esto es un juego.':g.ai.provocation<3?'Ha registrado una interacción.':g.ai.provocation<6?'Ha dejado de tomárselo como una broma.':'Ya no parece una broma para ninguno.';
      const adapt=g.ai.adaptationPct;this.el.adaptationValue.textContent=String(adapt).padStart(2,'0')+'%';this.el.adaptationMeter.style.width=adapt+'%';this.el.adaptationCaption.textContent=adapt===0?'Patrones sin registrar.':adapt<35?'Está comparando tus movimientos.':adapt<70?'Está anticipando algunos hábitos.':'Tus patrones ya forman parte de su estrategia.';
      this.syncAI();if(force)this.renderLog();
    }
  }
  YMM.HUD=HUD;
})(globalThis);

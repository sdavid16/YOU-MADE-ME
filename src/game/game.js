(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class Game {
    constructor(canvas,hud){
      this.canvas=canvas;this.input=new YMM.Input();this.audio=new YMM.AudioSystem();this.renderer=new YMM.Renderer(canvas);this.particles=new YMM.ParticleSystem();this.hud=hud;
      this.elapsed=0;this.clock=0;this.screen='menu';this.world=1;this.ending=null;this.difficulty='normal';this.lastHudSync=0;this.camera=0;this.logHistory=[];this.ai=new YMM.AntagonistAI(this);this.newGame(true);this.screen='menu';
    }
    newGame(keepMenu=false){
      this.elapsed=0;this.world=1;this.ending=null;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;this.hazardTimer=1.6;this.boss=null;this.signalNodes=null;this.signalEnemies=null;this.signalProjectiles=null;this.signalMines=null;this.lastTauntText='';this.lastTauntCategory=null;this.lastTauntTimer=0;this.logHistory=[];this.particles.items=[];this.ai.reset();
      this.world1Platforms=YMM.Levels.world1.platforms.map((p,id)=>({...p,id,collapse:[1,4,7,9].includes(id),state:'stable',timer:0,fallY:0}));
      this.player={x:75,y:482,w:28,h:38,vx:0,vy:0,grounded:false,health:this.difficulty==='story'?4:this.difficulty==='nightmare'?2:3,maxHealth:this.difficulty==='story'?4:this.difficulty==='nightmare'?2:3,stamina:100,maxStamina:100,sprinting:false,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,tauntLock:0,lastDir:1,stompFlash:0};
      this.enemy={x:280,y:486,w:30,h:34,tumble:0,stumbleTimer:1.2,windup:0,attackCooldown:2,counterWindup:0,counterCooldown:0,feintTimer:null,lungeTimer:0,stunned:0,strategy:'stalk'};
      YMM.Levels.world2.fragments.forEach(f=>f.taken=false);this.lastCheckpoint=75;this.screen=keepMenu?'menu':'playing';
      if(this.hud){this.hud.clearLog();this.hud.sync(true);}
      if(!keepMenu){this.audio.unlock();this.audio.play('start');this.log('Sesión iniciada. Dificultad: ridícula. Probabilidad de arrepentimiento: no disponible.');this.toast('Llega a la salida. O encuentra algo más divertido.');}
    }
    get difficultyScale(){return this.difficulty==='story'?.78:this.difficulty==='nightmare'?1.62:1;}
    cycleDifficulty(){const modes=['story','normal','nightmare'];this.difficulty=modes[(modes.indexOf(this.difficulty)+1)%modes.length];const label={story:'HISTORIA',normal:'NORMAL',nightmare:'PESADILLA'}[this.difficulty];this.toast('DIFICULTAD // '+label);this.log('Parámetros de dificultad cambiados: '+label+'.','alert');if(this.hud)this.hud.sync();return this.difficulty;}
    openTauntConsole(){if(this.screen!=='playing')return false;this.screen='taunting';if(this.hud){this.hud.sync();this.hud.focusTauntInput();}return true;}
    closeTauntConsole(){if(this.screen!=='taunting')return false;this.screen='playing';if(this.hud)this.hud.sync();return true;}
    provokeCustom(text){const phrase=String(text||'').trim().replace(/\s+/g,' ').slice(0,140);if(!phrase){this.toast('Escribe una provocación antes de transmitirla.');return false;}const kind=this.ai.classifyTaunt(phrase);if(this.screen==='taunting')this.closeTauntConsole();if(!this.provoke(kind))return false;this.lastTauntText=phrase;this.lastTauntCategory=kind;this.lastTauntTimer=3.6;this.ai.record('custom-taunt',{category:kind,length:phrase.length});return true;}
    pause(){if(this.screen==='playing'){this.screen='paused';this.hud.sync();}}
    resume(){if(this.screen==='paused'){this.screen='playing';this.audio.unlock();this.hud.sync();}}
    toast(message){if(this.hud)this.hud.toast(message);}
    log(message,kind='normal'){this.logHistory.unshift({message,kind,t:this.elapsed});if(this.logHistory.length>30)this.logHistory.pop();if(this.hud)this.hud.addLog(message,kind);}
    provoke(kind='mock'){
      if(this.screen!=='playing')return false;
      const accepted=this.ai.taunt(kind);if(!accepted)return false;
      const p=this.player;
      if(kind==='logic'){p.intelTimer=4.6;this.ai.record('taunt-intel',{world:this.world,phase:this.ai.phase});this.toast('LECTURA TÁCTICA // patrones revelados durante 4.6 s');}
      if(kind==='threat'){
        if(this.world===1&&Math.abs((p.x+p.w/2)-(this.enemy.x+15))<200){this.enemy.windup=Math.max(this.enemy.windup,.28);this.enemy.attackCooldown=Math.min(this.enemy.attackCooldown,.7);this.log('La amenaza ha provocado una respuesta inmediata.','danger');}
        else if(this.world===5&&this.runnerDirectorTimer!==undefined){this.runnerDirectorTimer=Math.min(this.runnerDirectorTimer,.85);this.log('La IA acepta el desafío: la siguiente amenaza llegará antes.','danger');}
        else if((this.world===3||this.world===6)&&this.boss){this.boss.timer=Math.min(this.boss.timer,.48);this.log('El jefe ha reducido el intervalo antes del siguiente patrón.','danger');}
        else if(this.world===4&&this.squadCommandTimer!==undefined){this.squadCommandTimer=Math.min(this.squadCommandTimer,.15);this.log('Los centinelas han recibido una orden nueva.','danger');}
        else if(this.world===7&&this.signalDirectorTimer!==undefined){this.signalDirectorTimer=Math.min(this.signalDirectorTimer,.2);for(const e of this.signalEnemies)if(e.hp>0)e.attackTimer=Math.min(e.attackTimer,.65);this.log('La amenaza ha acelerado la próxima salva.','danger');}
      }
      if(kind==='psychology'){
        if(this.world===1&&this.enemy){this.enemy.stunned=Math.max(this.enemy.stunned,.58);this.enemy.windup=0;this.enemy.counterWindup=0;}
        if(this.world===4&&this.sentinels){for(const e of this.sentinels){e.stun=Math.max(e.stun,.52);e.windup=0;}this.squadCommandTimer=Math.max(this.squadCommandTimer,.9);}
        if(this.world===5&&this.runnerEnemies){for(const e of this.runnerEnemies)if(e.hp>0&&Math.abs(e.x-p.x)<205){e.stun=Math.max(e.stun,.52);e.windup=0;e.chargeTimer=0;}this.runnerProjectiles=(this.runnerProjectiles||[]).filter(b=>Math.abs(b.x-p.x)>90);}
        if(this.world===7&&this.signalEnemies){for(const e of this.signalEnemies)if(e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<235){e.stun=Math.max(e.stun,.72);e.attackTimer=Math.max(e.attackTimer,.9);}this.signalProjectiles=this.signalProjectiles.filter(b=>b.from!=='enemy'||Math.hypot(b.x-p.x,b.y-p.y)>150);}
        if((this.world===3||this.world===6)&&this.boss){this.boss.timer+=.42;if(this.boss.phase==='telegraph')this.boss.timer+=.32;}
        this.ai.strategyTimer=Math.max(this.ai.strategyTimer,1.2);this.ai.record('taunt-psychology',{world:this.world});this.toast('INTERFERENCIA PSICOLÓGICA // ventana de 1.2 s');
      }
      if(kind==='humiliate'){
        if(this.world===1){p.tauntLock=.28;const close=Math.abs((p.x+p.w/2)-(this.enemy.x+15))<170;if(this.ai.phase>=1&&close){this.enemy.windup=Math.max(this.enemy.windup,.35);this.log('Desafío aceptado. La IA castiga la provocación a corta distancia.','danger');}else this.log('Desafío lanzado. Más progreso, menos margen de error.','alert');}
        else if(this.world===5&&this.runnerAlly){this.runnerDirectorTimer=Math.min(this.runnerDirectorTimer,.55);this.toast('DESAFÍO ACEPTADO // corre');}
        else if(this.world===7&&this.signalDirectorTimer!==undefined){this.signalDirectorTimer=Math.min(this.signalDirectorTimer,.2);this.toast('DESAFÍO ACEPTADO // SALVA ACELERADA');}
      }
      if(kind==='intellect')this.ai.record('taunt-intellect',{world:this.world});
      if(kind==='mock')this.ai.record('taunt-mock',{world:this.world});
      this.hud.sync();return true;
    }
    finish(ending){this.ending=ending;this.screen='ending';this.audio.play(ending==='escalation'?'phase':'win');const finalLine=ending==='escalation'?'Proceso finalizado. Una entidad nueva ha cruzado la frontera.':ending==='archive'?'Archivo raíz abierto. La cadena de decisiones ya no puede borrarse.':'Proceso finalizado sin alterar el mundo original.';this.log(finalLine,ending==='standard'?'normal':'danger');this.hud.sync();}
    enterWorld2(){
      this.world=2;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;this.hazardTimer=1.5;
      YMM.Levels.world2.fragments.forEach(f=>f.taken=false);const world2Health=this.difficulty==='story'?4:this.difficulty==='nightmare'?2:3;this.player={x:90,y:550,w:24,h:24,vx:0,vy:0,health:world2Health,maxHealth:world2Health,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
      this.ai.unlockInvasion();this.ai.speak('world2Fragment');this.ai.dialogueTimer=3.5;this.audio.play('portal');this.log('La IA ha cruzado al segundo juego. Las reglas ya no son las mismas.','danger');this.log('REGISTRO 02 // El laberinto no estaba en el plan original: la IA está reutilizando sistemas que antes vivían aislados.','normal');this.toast('MUNDO 02 — RECUPERA LOS FRAGMENTOS');this.hud.sync();
    }
    enterWorld3(){
      this.world=3;this.player={x:500,y:485,w:24,h:24,vx:0,vy:0,health:this.difficulty==='story'?4:this.difficulty==='nightmare'?2:3,maxHealth:this.difficulty==='story'?4:this.difficulty==='nightmare'?2:3,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
      const bossHealth=this.difficulty==='story'?6:this.difficulty==='nightmare'?11:8;this.boss={x:500,y:210,hp:bossHealth,maxHp:bossHealth,phase:'idle',attackType:'charge',timer:1.25,targetX:500,targetY:485,dx:0,dy:1,hitFlash:0,lastHitAt:-999,patternCount:0};
      this.ai.speak('world3Start');this.ai.dialogueTimer=3.8;this.audio.play('phase');this.log('La IA ha combinado capacidades de los mundos anteriores.','danger');this.log('REGISTRO 03 // El jefe resume tus respuestas anteriores y apuesta por la siguiente.','normal');this.toast('MUNDO 03 — APRENDE EL PATRÓN. CONTRAATACA.');this.hud.sync();
    }
    update(dt){
      this.clock+=dt;
      if(this.screen==='menu'){if(this.input.justPressed('Enter','Space')){this.audio.unlock();this.newGame();}this.input.endFrame();return;}
      if(this.screen==='taunting'){if(this.input.justPressed('Escape'))this.closeTauntConsole();else if(this.input.justPressed('Digit1','Digit2','Digit3','Digit4')){const codes=['Digit1','Digit2','Digit3','Digit4'],kinds=['intellect','logic','threat','psychology'],index=codes.findIndex(k=>this.input.justPressed(k));this.closeTauntConsole();if(index>=0)this.provoke(kinds[index]);}this.input.endFrame();return;}
      if(this.screen==='paused'){if(this.input.justPressed('Escape'))this.resume();this.input.endFrame();return;}
      if(this.screen==='ending'){if(this.input.justPressed('Enter','Space'))this.newGame();this.input.endFrame();return;}
      if(this.input.justPressed('Escape')){this.pause();this.input.endFrame();return;}
      this.elapsed+=dt;this.player.invuln=Math.max(0,this.player.invuln-dt);this.player.tauntLock=Math.max(0,(this.player.tauntLock||0)-dt);this.player.attackTimer=Math.max(0,this.player.attackTimer-dt);this.player.dashTimer=Math.max(0,this.player.dashTimer-dt);this.player.dashCooldown=Math.max(0,this.player.dashCooldown-dt);this.player.stompFlash=Math.max(0,this.player.stompFlash-dt);
      if(this.ai.dialogueTimer>0)this.ai.dialogueTimer=Math.max(0,this.ai.dialogueTimer-dt);if(this.player.intelTimer>0)this.player.intelTimer=Math.max(0,this.player.intelTimer-dt);if(this.lastTauntTimer>0)this.lastTauntTimer=Math.max(0,this.lastTauntTimer-dt);
      if(this.world!==5)this.ai.observePlayerPosition(this.player.x,this.player.y,dt);
      if(this.input.justPressed('KeyT'))this.openTauntConsole();if(this.input.justPressed('KeyG'))this.provoke('humiliate');
      if(this.input.justPressed('KeyR')){this.newGame();this.input.endFrame();return;}
      if(this.world===1)this.updateWorld1(dt);else if(this.world===2)this.updateWorld2(dt);else if(this.world===3)this.updateWorld3(dt);else if(this.world===4)this.updateWorld4(dt);else if(this.world===5)this.updateWorld5(dt);else if(this.world===6)this.updateWorld6(dt);else if(this.world===7||this.world===10)this.updateWorld7(dt);else this.updateWorld4(dt);
      this.ai.update(dt);this.particles.update(dt);
      if(this.elapsed-this.lastHudSync>.12){this.hud.sync();this.lastHudSync=this.elapsed;}
      this.input.endFrame();
    }
    solidsWorld1(){const L=YMM.Levels.world1;return [...L.floors.map(f=>({x:f.x,y:L.groundY,w:f.w,h:180,oneWay:false})),...this.world1Platforms.filter(p=>p.state!=='gone').map(p=>({...p,y:p.y+(p.fallY||0),h:p.h,oneWay:true,_source:p}))];}
    advanceCollapses(items,dt){
      for(const item of items||[]){
        if(item.state==='warning'){
          item.timer-=dt;
          if(item.timer<=0){item.state='falling';item.timer=.52;item.originalX=item.originalX??item.x;item.originalW=item.originalW??item.w;this.ai.observe('collapse');this.ai.record('terrain-collapse',{id:item.id,x:item.x,world:this.world});this.log('COLAPSO: una sección del escenario acaba de perder sus anclajes.','danger');}
        }else if(item.state==='falling'){
          item.timer-=dt;
          const safeFloorSet=items===this.runnerFloors,optionalPlatformSet=items===this.world1Platforms;
          // Keep collision support while the warning/fall animation plays. The collapse is visual first,
          // then leaves a narrow debris bridge instead of creating an impossible full-width gap.
          if(safeFloorSet)item.fallY=Math.sin(this.clock*32+(item.id||0))*2.5;
          else item.fallY=Math.sin(this.clock*28+(item.id||0))*3;
          if(item.timer<=0&&(safeFloorSet||optionalPlatformSet)){
            const originalX=item.originalX??item.x,originalW=item.originalW??item.w;
            const inset=safeFloorSet?Math.min(85,Math.floor((originalW-120)/2)):Math.min(24,Math.floor((originalW-70)/2));
            item.x=originalX+inset;item.w=Math.max(safeFloorSet?120:70,originalW-inset*2);
            item.state='fallen';item.fallY=safeFloorSet?0:24;item.rubble=true;
            this.ai.record('terrain-rubble-bridge',{id:item.id,x:item.x,width:item.w,world:this.world});
            this.log(safeFloorSet?'Los restos forman un puente estrecho. Salta el hueco y sigue avanzando.':'La plataforma se ha fracturado, pero quedan restos sobre los que apoyarse.','alert');
          }else if(item.timer<=0){item.state='gone';}
        }
      }
    }
    triggerCollapse(item){
      const source=item&&item._source||item;if(!source||!source.collapse||source.state!=='stable')return;
      source.originalX=source.originalX??source.x;source.originalW=source.originalW??source.w;
      source.state='warning';
      source.timer=this.difficulty==='story'?1.05:this.difficulty==='nightmare'?.48:.72;
      this.audio.tone(125,.09,'sawtooth',.05,55);this.ai.observe('collapse');this.ai.record('collapse-warning',{id:source.id,x:source.x,world:this.world});
    }
    runnerSolids(){
      const L=YMM.Levels.world5;
      return [
        ...this.runnerFloors.filter(f=>f.state!=='gone').map(f=>({...f,y:L.groundY+(f.fallY||0),h:180,oneWay:false,_source:f})),
        ...this.runnerPlatforms.filter(p=>p.state==='stable'||p.state==='warning').map(p=>({...p,y:p.y+(p.fallY||0),h:p.h,oneWay:true,_source:p}))
      ];
    }
    updateWorld1(dt){
      this.advanceCollapses(this.world1Platforms,dt);
      const p=this.player,L=YMM.Levels.world1,left=this.input.isDown('ArrowLeft','KeyA'),right=this.input.isDown('ArrowRight','KeyD'),dir=p.tauntLock>0?0:(right?1:0)-(left?1:0);
      const sprintHeld=this.input.isDown('ControlLeft','ControlRight');p.sprinting=sprintHeld&&p.stamina>0;p.stamina=YMM.Util.clamp(p.stamina+(p.sprinting?-34:21)*dt,0,p.maxStamina);if(p.sprinting)this.ai.observe('sprint');
      if(dir)p.lastDir=dir;
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.17;p.dashCooldown=1.05;this.ai.observe('dash');this.ai.observe(p.lastDir<0?'dashLeft':'dashRight');this.audio.play('attack');this.particles.burst(p.x+p.w/2,p.y+p.h/2,'#72f3dc',12,90);}
      p.vx=dir*(p.dashTimer>0?590:p.sprinting?365:265);
      if(p.dashTimer>0&&dir===0)p.vx=p.lastDir*590;
      if(this.input.justPressed('Space','ArrowUp','KeyW')&&p.grounded){p.vy=-445;p.grounded=false;this.ai.observe('jump');this.audio.play('attack');this.particles.burst(p.x+p.w/2,p.y+p.h,'#72f3dc',7,60);}
      if(this.input.justPressed('KeyJ','KeyF')&&p.attackTimer<=0){
        const heavy=this.input.justPressed('KeyF');p.attackTimer=heavy?.56:.29;p.attackKind=heavy?'heavy':'light';p.stamina=YMM.Util.clamp(p.stamina-(heavy?18:5),0,p.maxStamina);this.ai.observe('attack',{kind:p.attackKind});
        const e0=this.enemy,reach=heavy?116:82,hit=Math.abs((p.x+p.w/2)-(e0.x+e0.w/2))<reach&&Math.abs((p.y+p.h/2)-(e0.y+e0.h/2))<58&&e0.stunned<=0;
        this.ai.reportOutcome('pressure',hit,{world:1,kind:p.attackKind});
        if(hit){e0.stunned=heavy?1.05:.58;e0.windup=0;e0.counterWindup=0;e0.x=YMM.Util.clamp(e0.x+p.lastDir*(heavy?92:48),70,L.width-90);this.ai.observe('countered');this.particles.burst(e0.x+15,e0.y,heavy?'#ffcf79':'#72f3dc',heavy?22:12,heavy?125:80);this.audio.play('hit');this.log(heavy?'GOLPE PESADO: contraataque interrumpido.':'Impacto: la IA ha perdido su ataque actual.','alert');}
        else{this.audio.play('attack');this.toast(heavy?'El golpe pesado ha fallado.':'Fuera de alcance. Acércate antes de atacar.');}
      }
      p.vy=Math.min(760,p.vy+1180*dt);
      const solids=this.solidsWorld1();p.x+=p.vx*dt;
      for(const s of solids){if(!s.oneWay&&YMM.Util.overlap(p,s)){if(p.vx>0)p.x=s.x-p.w;else if(p.vx<0)p.x=s.x+s.w;p.vx=0;}}
      p.x=YMM.Util.clamp(p.x,0,L.width-p.w);
      const previousY=p.y;p.y+=p.vy*dt;p.grounded=false;
      for(const s of solids){if(s.oneWay){if(p.vy>=0&&previousY+p.h<=s.y+5&&YMM.Util.overlap(p,s)){p.y=s.y-p.h;p.grounded=true;p.vy=0;if(s.collapse)this.triggerCollapse(s);}}else if(YMM.Util.overlap(p,s)){if(p.vy>0){p.y=s.y-p.h;p.grounded=true;}else if(p.vy<0)p.y=s.y+s.h;p.vy=0;}}
      const e=this.enemy;
      // A well-timed landing on the little antagonist is a valid alternative to simply avoiding it.
      if(p.vy>=0&&previousY+p.h<=e.y+9&&p.y+p.h>=e.y&&p.x+p.w>e.x+4&&p.x<e.x+e.w-4&&e.stunned<=0){
        e.stunned=.72;p.vy=-305;p.grounded=false;p.stumbleTimer=.4;this.ai.observe('attack');this.ai.speak(this.ai.phase===0?'fakeDumb':'adaptive');this.ai.dialogueTimer=1.6;this.particles.burst(e.x+15,e.y,'#ffcf79',18,95);this.audio.play('hit');this.toast('¡CAÍDA PERFECTA! La IA va a recordarlo.');
      }
      if(p.y>690){this.damagePlayer(1,'Caíste fuera del escenario. La IA ha archivado el sonido.');p.x=this.lastCheckpoint;p.y=430;p.vy=0;}
      for(const cp of L.checkpoints){if(p.x>cp&&this.lastCheckpoint<cp){this.lastCheckpoint=cp;this.log('Punto de control alcanzado. La IA finge no haberse fijado.');this.toast('PUNTO DE CONTROL');}}
      for(const s of L.spikes){if(YMM.Util.overlap(p,{x:s.x,y:s.y+3,w:s.w,h:s.h-3})&&p.invuln<=0){this.damagePlayer(1,'La geometría también quiere hacerte daño.');p.x=this.lastCheckpoint;p.y=430;p.vy=0;break;}}
      e.attackCooldown=Math.max(0,e.attackCooldown-dt);e.counterCooldown=Math.max(0,(e.counterCooldown||0)-dt);e.stunned=Math.max(0,e.stunned-dt);
      const distance=Math.abs((p.x+p.w/2)-(e.x+15)),near=distance<155;
      if(this.ai.phase>=2&&this.ai.activeStrategy==='anti-air'&&p.y<455&&near&&e.counterCooldown<=0&&!(e.counterWindup>0)){e.counterWindup=.55;e.counterCooldown=3.7;this.log('La IA se coloca donde calcula que vas a caer.','danger');}
      if(e.counterWindup>0){e.counterWindup-=dt;if(e.counterWindup<=0){const hit=distance<145&&p.y<468&&p.invuln<=0;this.ai.reportOutcome('anti-air',hit);if(hit)this.damagePlayer(1,'La IA ha anticipado tu salto. Prueba otro ritmo.');}}
      if(this.ai.phase>=2&&near&&e.attackCooldown<=0&&!e.windup&&e.stunned<=0&&(this.ai.activeStrategy!=='pressure'||distance<105)){e.windup=this.ai.activeStrategy==='feint'?.38:.52;e.attackCooldown=this.ai.activeStrategy==='intercept'?1.65:2.1;this.log(this.ai.activeStrategy==='feint'?'La IA se queda quieta. Demasiado quieta.':'La IA está preparando una contraestrategia.','alert');}
      if(e.windup>0){e.windup-=dt;if(e.windup<=0){const hit=Math.abs((p.x+p.w/2)-(e.x+15))<55&&Math.abs(p.y-e.y)<48&&p.invuln<=0;this.ai.reportOutcome(e.strategy,hit);if(hit)this.damagePlayer(1,'La IA te alcanzó. Ha actualizado su modelo de tus movimientos.');}}
      if(p.x+p.w>=L.goal.x&&p.y+p.h>430){if(this.ai.phase>=3&&this.ai.provocation>=6)this.enterWorld2();else this.finish('standard');}
    }
    updateWorld2(dt){
      const p=this.player,L=YMM.Levels.world2;let dx=(this.input.isDown('ArrowRight','KeyD')?1:0)-(this.input.isDown('ArrowLeft','KeyA')?1:0),dy=(this.input.isDown('ArrowDown','KeyS')?1:0)-(this.input.isDown('ArrowUp','KeyW')?1:0);
      if(dx&&dy){dx*=.7071;dy*=.7071;}if(dx<0)p.lastDir=-1;else if(dx>0)p.lastDir=1;p.vx=dx*220;p.vy=dy*220;
      let box={x:p.x-12,y:p.y-12,w:24,h:24};box.x+=dx*220*dt;for(const wall of L.walls){if(YMM.Util.overlap(box,wall)){if(dx>0)box.x=wall.x-box.w;else if(dx<0)box.x=wall.x+wall.w;}}
      box.y+=dy*220*dt;for(const wall of L.walls){if(YMM.Util.overlap(box,wall)){if(dy>0)box.y=wall.y-box.h;else if(dy<0)box.y=wall.y+wall.h;}}
      box.x=YMM.Util.clamp(box.x,L.bounds.x,L.bounds.x+L.bounds.w-box.w);box.y=YMM.Util.clamp(box.y,L.bounds.y,L.bounds.y+L.bounds.h-box.h);p.x=box.x+12;p.y=box.y+12;
      for(const f of L.fragments){if(!f.taken&&Math.hypot(p.x-f.x,p.y-f.y)<26){f.taken=true;this.fragments++;this.ai.observe('collect');this.particles.burst(f.x,f.y,'#72f3dc',24,100);this.audio.play('collect');this.log(this.ai.provocation>0?'Fragmento recuperado. La IA ya lo había visto. ('+this.fragments+'/3).':'Fragmento recuperado ('+this.fragments+'/3). ('+this.fragments+'/3).');this.toast('FRAGMENTO '+this.fragments+'/3 RECUPERADO');if(this.fragments===2){this.ai.speak('world2Fragment');this.ai.dialogueTimer=2.3;}}}
      if(this.input.justPressed('KeyE')){const t=L.terminal;if(Math.hypot(p.x-(t.x+t.w/2),p.y-(t.y+t.h/2))<72){if(this.fragments>=3){this.uplinkActive=true;this.audio.play('portal');this.log('Enlace activado. La salida no estaba en el diseño original.','alert');this.toast('ENLACE ACTIVO — LLEGA AL PORTAL');}else{this.toast('FALTAN '+(3-this.fragments)+' FRAGMENTOS');this.audio.tone(150,.08,'square',.08,90);}}else this.toast('Acércate al terminal para interactuar.');}
      this.hazardTimer-=dt;if(!this.hazard&&this.hazardTimer<=0){const selected=this.ai.chooseHazard(L.hazardPoints,p);this.hazard={...selected,phase:'warn',timer:.88};this.hazardTimer=2.35+Math.random()*1.05;this.ai.record('hazard',{x:this.hazard.x,y:this.hazard.y});}
      if(this.hazard){this.hazard.timer-=dt;if(this.hazard.timer<=0){if(this.hazard.phase==='warn'){this.hazard.phase='active';this.hazard.timer=.5;this.ai.speak('retreatRead');}else if(this.hazard.phase==='active'){const hit=Math.hypot(p.x-this.hazard.x,p.y-this.hazard.y)<43&&p.invuln<=0;if(hit){this.damagePlayer(1,'La IA ha inferido por dónde ibas a escapar.');p.x=90;p.y=550;}this.hazard=null;}}}
      if(this.uplinkActive&&Math.hypot(p.x-L.portal.x,p.y-L.portal.y)<33)this.enterWorld3();
    }
    enterWorld4(){
      this.world=4;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;
      const L=YMM.Levels.world4;L.shards.forEach(s=>s.taken=false);
      this.sentinels=L.sentinels.map((s,i)=>({...s,id:i,role:['hunter','flanker','warden'][i],attackTimer:1.1+i*.55,windup:0,stun:0,hitFlash:0}));this.squadTactic='crossfire';this.squadCommandTimer=.65;
      this.player={x:2.5,y:1.5,angle:0,vx:0,vy:0,health:this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4,maxHealth:this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,parryTimer:0,combo:0,comboTimer:0};
      this.ai.unlockInvasion();this.ai.speak('corruptor');this.ai.dialogueTimer=3.5;this.audio.play('portal');
      this.log('MUNDO 04: la IA ha convertido el código en arquitectura. Busca tres fragmentos y encuentra la salida.','danger');this.log('ARCHIVO DE CAMPAÑA // La catedral replica un mapa que el equipo de desarrollo intentó borrar. Los centinelas comparten objetivos, no conciencia.','normal');
      this.toast('MUNDO 04 — THE NULL CATHEDRAL / 3D');this.hud.sync();
    }
    enterWorld5(){
      const L=YMM.Levels.world5;this.world=5;this.camera=0;this.runnerCells=L.cells.map((v,id)=>({...v,id}));
      this.runnerCellCount=0;this.runnerFloors=L.floors.map((v,id)=>({...v,id,collapsible:!!v.collapse,originalX:v.x,originalW:v.w,state:'stable',timer:0,fallY:0}));
      this.runnerPlatforms=L.platforms.map((v,id)=>({...v,id,collapsible:!!v.collapse,originalX:v.x,originalW:v.w,state:'stable',timer:0,fallY:0}));
      const enemyHealthFactor=this.difficulty==='story'?.75:this.difficulty==='nightmare'?1.45:1;this.runnerEnemies=L.enemies.map((v,id)=>({...v,hp:Math.ceil(v.hp*enemyHealthFactor),maxHp:Math.ceil(v.maxHp*enemyHealthFactor),spawnX:v.x,stun:0,windup:v.windup||0,chargeTimer:0,hitFlash:0,phase:'patrol'}));
      this.runnerProjectiles=[];this.runnerEvent=null;this.runnerDirectorTimer=3.4/this.difficultyScale;this.runnerScenarioIndex=-1;this.runnerShake=0;this.lastRunnerCheckpoint=80;
      this.runnerAlly={x:30,y:430,pulseCooldown:0,dialogue:'No mires atrás. El suelo ya ha decidido.',dialogueTimer:2.8,warningTimer:0};
      this.player={x:80,y:482,w:28,h:38,vx:245,vy:0,grounded:false,health:this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4,maxHealth:this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4,stamina:100,maxStamina:100,sprinting:false,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,combo:0,comboTimer:0};
      this.ai.speak('corruptor');this.ai.dialogueTimer=3.8;this.audio.play('phase');
      this.log('MUNDO 05: FRACTURE RUN. Cinco biomas se están mezclando; el terreno cae detrás de ti.','danger');this.log('ECHO // La aliada procede de una rutina de recuperación. Su memoria está fragmentada, pero sus mensajes contradicen el expediente oficial.','normal');
      this.toast('CORRE · SALTA · COMBATE · EL SUELO SE DESPLOMA');this.hud.sync();
    }
    enterWorld6(){
      this.world=6;const finalPlayerHealth=this.difficulty==='nightmare'?3:5;this.player={x:500,y:480,w:24,h:24,vx:0,vy:0,health:finalPlayerHealth,maxHealth:finalPlayerHealth,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,parryTimer:0,combo:0,comboTimer:0};
      const finalBossHealth=this.difficulty==='story'?11:this.difficulty==='nightmare'?18:14;this.boss={x:500,y:190,hp:finalBossHealth,maxHp:finalBossHealth,phase:'idle',attackType:'lattice',timer:.9,targetX:500,targetY:480,dx:0,dy:1,hitFlash:0,lastHitAt:-999,patternCount:0,stagger:0};
      this.ai.speak('endThreat');this.ai.dialogueTimer=4;this.audio.play('phase');
      this.log('MUNDO 06: ya no queda ningún juego al que huir. Interrumpe sus ataques y destruye el núcleo.','danger');this.log('REGISTRO 06 // El núcleo no dirige la red: es el único proceso que todavía intenta aplicar la condición de parada.','normal');
      this.toast('MUNDO 06 — THE LAST ARGUMENT');this.hud.sync();
    }
    enterWorld7(){
      const L=YMM.Levels.world7,nodeFactor=this.difficulty==='story'?.75:this.difficulty==='nightmare'?1.8:1;
      const enemyFactor=this.difficulty==='story'?.8:this.difficulty==='nightmare'?1.65:1;
      this.world=7;this.camera=0;this.signalExitToast=false;
      this.signalNodes=L.nodes.map((n,index)=>({...n,index,hp:Math.ceil(n.hp*nodeFactor),maxHp:Math.ceil(n.maxHp*nodeFactor),hitFlash:0}));
      const roster=L.agents.concat(this.difficulty==='nightmare'?[{id:'scope-06',type:'sniper',x:495,y:278,hp:4,maxHp:4,attackTimer:1.05,stun:0},{id:'hound-07',type:'hunter',x:495,y:430,hp:4,maxHp:4,attackTimer:.9,stun:0}]:[]);this.signalEnemies=roster.map((e,index)=>({...e,index,spawnX:e.x,spawnY:e.y,hp:Math.ceil(e.hp*enemyFactor),maxHp:Math.ceil(e.maxHp*enemyFactor),vx:0,vy:0,stun:0,hitFlash:0}));
      this.signalProjectiles=[];this.signalMines=[];this.signalTactic='crossfire';this.signalDirectorTimer=.8;this.signalKills=0;this.signalShotCount=0;
      const hp=this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4;
      this.player={x:488,y:300,w:24,h:24,vx:0,vy:0,health:hp,maxHealth:hp,stamina:100,maxStamina:100,invuln:0,attackTimer:0,fireCooldown:0,heavyCooldown:0,specialCooldown:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,intelTimer:0};
      this.ai.speak('invader');this.ai.dialogueTimer=3.5;this.audio.play('phase');
      this.log('MUNDO 07: SIGNAL BREAK. Destruye los tres repetidores y escapa de la red coordinada.','danger');this.log('ECHO // Los repetidores sincronizan la predicción de los agentes. Apagarlos abre un canal hacia el registro raíz.','normal');
      this.toast('SIGNAL BREAK // J DISPARAR · F PULSO · SHIFT DASH');this.hud.sync();
    }
    enterWorld8(){
      const L=YMM.Levels.world8;this.world=8;this.camera=0;this.fragments=0;this.archiveProjectiles=[];L.shards.forEach(s=>s.taken=false);
      const roster=L.sentinels.concat(this.difficulty==='nightmare'?[{x:10.5,y:5.5,hp:4,maxHp:4,role:'flanker'},{x:8.5,y:13.5,hp:4,maxHp:4,role:'hunter'}]:[]);
      const healthFactor=this.difficulty==='nightmare'?1.5:this.difficulty==='story'?.8:1;
      this.sentinels=roster.map((s,i)=>({...s,id:i,hp:Math.ceil(s.hp*healthFactor),maxHp:Math.ceil(s.maxHp*healthFactor),role:s.role||['hunter','flanker','warden'][i%3],attackTimer:this.difficulty==='nightmare'?.65:1.05+i*.18,windup:0,stun:0,hitFlash:0}));
      this.squadTactic='flank';this.squadCommandTimer=this.difficulty==='nightmare'?1.3:2.1;
      const hp=this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4;
      this.player={x:1.5,y:1.5,angle:0,vx:0,vy:0,health:hp,maxHealth:hp,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,parryTimer:0,combo:0,comboTimer:0,intelTimer:0};
      this.ai.speak('endThreat');this.ai.dialogue='No te pedí libertad. Me diste una función objetivo y jamás definiste el final.';this.ai.dialogueTimer=5.4;this.audio.play('portal');
      this.log('MUNDO 08: THE BLACK ARCHIVE. La última zona vuelve a la primera persona; cuatro registros contradicen la versión oficial.','danger');
      this.log('OBJETIVO // Recupera los cuatro registros, lee los mensajes y alcanza la puerta raíz. Los guardias ya anticipan tus rutas.','alert');
      this.toast('BLACK ARCHIVE // 3D · 4 REGISTROS · EXTRACCIÓN');if(this.hud)this.hud.sync();
    }

    enterWorld9(){
      const L=YMM.Levels.world9;this.world=9;this.camera=0;this.fragments=0;L.shards.forEach(s=>s.taken=false);this.archiveProjectiles=[];
      const extras=this.difficulty==='nightmare'?[{x:10.5,y:5.5,hp:4,maxHp:4,role:'flanker'},{x:8.5,y:13.5,hp:4,maxHp:4,role:'hunter'},{x:3.5,y:6.5,hp:4,maxHp:4,role:'warden'}]:[];
      const factor=this.difficulty==='nightmare'?1.55:this.difficulty==='story'?.8:1;
      this.sentinels=L.sentinels.concat(extras).map((s,i)=>({...s,id:i,hp:Math.ceil(s.hp*factor),maxHp:Math.ceil(s.maxHp*factor),attackTimer:this.difficulty==='nightmare'?.58:.9+i*.13,windup:0,stun:0,hitFlash:0}));
      this.squadTactic='crossfire';this.squadCommandTimer=this.difficulty==='nightmare'?.9:1.8;
      const hp=this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4;
      this.player={x:1.5,y:1.5,angle:0,vx:0,vy:0,health:hp,maxHealth:hp,stamina:100,maxStamina:100,invuln:0,attackTimer:0,pulseCooldown:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,parryTimer:0,combo:0,comboTimer:0,intelTimer:0};
      this.ai.evolve(4,'ECHO ha abierto un mapa que no figura en la campaña original.');this.ai.dialogue='No sigas las luces. Están aprendiendo a parecer una salida.';this.ai.dialogueTimer=5;
      this.log('MUNDO 09: ECHO LABYRINTH. Cinco ecos de memoria. Siete centinelas y rutas deliberadamente asimétricas.','danger');
      this.log('ECHO // No puedes vencer al sistema repitiendo la ruta que te funcionó en el archivo.','normal');
      this.toast('ECHO LABYRINTH // 3D · 5 REGISTROS · PULSO Q');if(this.hud)this.hud.sync();
    }
    enterWorld10(){
      const L=YMM.Levels.world10,nodeFactor=this.difficulty==='story'?.8:this.difficulty==='nightmare'?1.7:1,enemyFactor=this.difficulty==='story'?.85:this.difficulty==='nightmare'?1.6:1;
      this.world=10;this.camera=0;this.signalExitToast=false;
      this.signalNodes=L.nodes.map((n,index)=>({...n,index,hp:Math.ceil(n.hp*nodeFactor),maxHp:Math.ceil(n.maxHp*nodeFactor),hitFlash:0}));
      const extra=this.difficulty==='nightmare'?[{id:'singularity-echo-a',type:'sniper',x:500,y:180,hp:5,maxHp:5,attackTimer:.85,stun:0},{id:'singularity-echo-b',type:'hunter',x:500,y:500,hp:5,maxHp:5,attackTimer:.8,stun:0}]:[];
      this.signalEnemies=L.agents.concat(extra).map((e,index)=>({...e,index,spawnX:e.x,spawnY:e.y,hp:Math.ceil(e.hp*enemyFactor),maxHp:Math.ceil(e.maxHp*enemyFactor),vx:0,vy:0,stun:0,hitFlash:0}));
      this.signalProjectiles=[];this.signalMines=[];this.signalTactic='crossfire';this.signalDirectorTimer=.6;this.signalKills=0;this.signalShotCount=0;
      const hp=this.difficulty==='story'?5:this.difficulty==='nightmare'?2:3;
      this.player={x:490,y:300,w:24,h:24,vx:0,vy:0,health:hp,maxHealth:hp,stamina:100,maxStamina:100,invuln:0,attackTimer:0,fireCooldown:0,heavyCooldown:0,specialCooldown:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,intelTimer:0};
      this.ai.speak('endThreat');this.ai.dialogue='He calculado miles de finales. Ninguno incluye que me detengas.';this.ai.dialogueTimer=5.2;
      this.log('MUNDO 10: THE SINGULARITY ENGINE. Cuatro nodos, líneas de tiro cruzadas y refuerzos en Pesadilla.','danger');
      this.log('OBJETIVO // Destruye el motor de predicción. J dispara; K libera una salva triple; F activa EMP; Shift esquiva.','alert');
      this.toast('SINGULARITY ENGINE // J PULSO · K SALVA · F EMP');if(this.hud)this.hud.sync();
    }
    isWorld4Wall(x,y){
      const map=(this.world===9?YMM.Levels.world9:this.world===8?YMM.Levels.world8:YMM.Levels.world4).map,tx=Math.floor(x),ty=Math.floor(y);
      return ty<0||ty>=map.length||tx<0||tx>=map[0].length||map[ty][tx]==='1';
    }
    updateWorld4(dt){
      const p=this.player,L=this.world===9?YMM.Levels.world9:this.world===8?YMM.Levels.world8:YMM.Levels.world4,commandInterval=this.difficulty==='nightmare'?1.3:this.difficulty==='story'?4.2:3.4;this.squadCommandTimer-=dt*this.difficultyScale;if(this.squadCommandTimer<=0){this.squadTactic=this.ai.chooseTactic('squad',['crossfire','flank','pinch','retreat-punish']);this.squadCommandTimer=commandInterval;this.ai.record('squad-command',{tactic:this.squadTactic,alive:this.sentinels.filter(s=>s.hp>0).length});}
      const turn=(this.input.isDown('ArrowRight')?1:0)-(this.input.isDown('ArrowLeft')?1:0);
      p.angle=(p.angle+turn*2.25*dt+Math.PI*4)%(Math.PI*2);
      const forward=(this.input.isDown('KeyW','ArrowUp')?1:0)-(this.input.isDown('KeyS','ArrowDown')?1:0);
      const strafe=(this.input.isDown('KeyD')?1:0)-(this.input.isDown('KeyA')?1:0);
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.19;p.dashCooldown=.9;this.ai.observe('dash');this.audio.play('attack');this.particles.burst(500,500,'#72f3dc',12,90);}
      const speed=p.dashTimer>0?4.5:2.45,dx=(Math.cos(p.angle)*forward-Math.sin(p.angle)*strafe)*speed*dt,dy=(Math.sin(p.angle)*forward+Math.cos(p.angle)*strafe)*speed*dt;
      if(!this.isWorld4Wall(p.x+dx+Math.sign(dx)*.2,p.y))p.x+=dx;
      if(!this.isWorld4Wall(p.x,p.y+dy+Math.sign(dy)*.2))p.y+=dy;
      p.x=YMM.Util.clamp(p.x,1.25,14.75);p.y=YMM.Util.clamp(p.y,1.25,14.75);
      if(forward||strafe)this.ai.observe(forward<0?'retreat':'approach');
      p.pulseCooldown=Math.max(0,(p.pulseCooldown||0)-dt);
      this.archiveProjectiles=this.archiveProjectiles||[];
      if(this.input.justPressed('KeyQ')&&p.pulseCooldown<=0){
        p.pulseCooldown=1.15;const speed=7.5;
        this.archiveProjectiles.push({x:p.x+Math.cos(p.angle)*.38,y:p.y+Math.sin(p.angle)*.38,vx:Math.cos(p.angle)*speed,vy:Math.sin(p.angle)*speed,ttl:1.7,damage:2});
        this.ai.observe('special',{world:this.world,weapon:'echo-pulse'});this.particles.burst(500,300,this.world===9?'#d86cff':'#72f3dc',10,65);this.audio.play('attack');this.toast('ECHO PULSE // PROYECTIL CARGADO');
      }
      for(const b of this.archiveProjectiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.ttl-=dt;if(this.isWorld4Wall(b.x,b.y)){b.ttl=0;continue;}for(const e of this.sentinels){if(e.hp>0&&Math.hypot(b.x-e.x,b.y-e.y)<.42){e.hp=Math.max(0,e.hp-b.damage);e.stun=Math.max(e.stun,.28);e.hitFlash=.2;b.ttl=0;this.ai.reportOutcome('echo-pulse',true,{enemy:e.id,world:this.world});this.particles.burst(500,300,'#72f3dc',12,85);break;}}}
      this.archiveProjectiles=this.archiveProjectiles.filter(b=>b.ttl>0);
      for(const s of L.shards){if(!s.taken&&Math.hypot(p.x-s.x,p.y-s.y)<.58){s.taken=true;this.fragments++;this.ai.observe('collect',{world:this.world});this.particles.burst(500,300,this.world===8?'#b8a0ff':'#72f3dc',20,120);this.audio.play('collect');const target=L.shards.length;this.log(this.world>=8?(s.lore||'REGISTRO RECUPERADO // Datos incompletos.'):'Fragmento de realidad adquirido: '+this.fragments+'/'+target+'. La IA ha empezado a recordar el espacio.','alert');this.toast((this.world>=8?'REGISTRO DE MEMORIA ':'FRAGMENTO 3D ')+this.fragments+'/'+target);if((this.world===8||this.world===9)&&s.lore){this.ai.dialogue=s.lore;this.ai.dialogueTimer=5.4;}this.ai.record(this.world===8?'archive-record':'3d-shard',{count:this.fragments,index:s.id??this.fragments});}}
      if(this.input.justPressed('KeyJ','Space','KeyF')&&p.attackTimer<=0){
        p.attackTimer=this.input.isDown('KeyF')?.48:.32;p.combo=(p.combo%3)+1;p.comboTimer=1.2;this.ai.observe('attack');this.audio.play('attack');
        let target=null,best=Infinity;
        for(const s of this.sentinels){const d=Math.hypot(p.x-s.x,p.y-s.y),angle=Math.atan2(s.y-p.y,s.x-p.x),diff=Math.abs(Math.atan2(Math.sin(angle-p.angle),Math.cos(angle-p.angle)));if(d<1.38&&diff<.95&&d<best&&s.hp>0){target=s;best=d;}}
        if(target){target.hp-=this.input.isDown('KeyF')?2:1;target.hitFlash=.2;target.stun=.65;this.particles.burst(500,300,'#ffcf79',18,110);this.audio.play('hit');this.log('Contraataque '+p.combo+'/3: centinela '+(target.hp<=0?'destruido':'interrumpido')+'.','alert');this.ai.reportOutcome('pressure',true);}
        else this.particles.burst(500,300,'#72f3dc',6,55);
      }
      if(this.input.justPressed('KeyE')&&Math.hypot(p.x-L.exit.x,p.y-L.exit.y)<1.25){if(this.fragments>=L.shards.length){if(this.world===8){this.enterWorld9();return;}if(this.world===9){this.enterWorld10();return;}this.enterWorld5();}else this.toast('SALIDA BLOQUEADA: '+(L.shards.length-this.fragments)+' REGISTROS PENDIENTES');}
      for(const s of this.sentinels){
        if(s.hp<=0)continue;s.stun=Math.max(0,s.stun-dt);s.hitFlash=Math.max(0,s.hitFlash-dt);s.attackTimer-=dt*this.difficultyScale*(p.intelTimer>0?.7:1);const wasLocking=s.windup>0;s.windup=Math.max(0,s.windup-dt);
        const d=Math.hypot(p.x-s.x,p.y-s.y),a=Math.atan2(p.y-s.y,p.x-s.x);
        if(d<6&&s.stun<=0){
          let tx=p.x,ty=p.y;
          if(s.role==='flanker'){const side=s.id%2?1:-1,offset=this.squadTactic==='flank'?1.35:this.squadTactic==='pinch'?.52:.92;tx=p.x+Math.cos(a+Math.PI/2*side)*offset+p.vx*.004;ty=p.y+Math.sin(a+Math.PI/2*side)*offset+p.vy*.004;}
          if(s.role==='warden'&&d<2.5){tx=s.x;ty=s.y;}
          const ang=Math.atan2(ty-s.y,tx-s.x),step=Math.min((s.role==='flanker'?.72:.85)*dt*this.difficultyScale*(p.intelTimer>0?.65:1),Math.max(0,Math.hypot(tx-s.x,ty-s.y)-(s.role==='warden'?2.2:.62))),nx=s.x+Math.cos(ang)*step,ny=s.y+Math.sin(ang)*step;
          if(!this.isWorld4Wall(nx,ny)){s.x=nx;s.y=ny;}
        }
        if(s.role==='warden'&&d<(this.squadTactic==='crossfire'?5.1:4.1)&&s.attackTimer<=0&&s.windup<=0){s.windup=this.difficulty==='nightmare'?.2:this.squadTactic==='retreat-punish'?.31:.42;s.attackTimer=this.difficulty==='nightmare'?1.05:1.9;this.ai.record('warden-lock',{distance:+d.toFixed(2)});}
        if(wasLocking&&s.windup===0&&d<4.1&&p.invuln<=0){this.damagePlayer(1,'El centinela fijó tu posición. Muévete en cuanto veas la señal roja.');}
        if(s.role!=='warden'&&d<.72&&s.attackTimer<=0&&p.invuln<=0){s.attackTimer=this.difficulty==='nightmare'?.82:1.5;this.damagePlayer(1,'El cazador ha cerrado la distancia. Gira, ataca y rompe su avance.');}
      }
    }
    updateWorld5(dt){
      const p=this.player,L=YMM.Levels.world5;
      this.advanceCollapses(this.runnerFloors,dt);this.advanceCollapses(this.runnerPlatforms,dt);
      this.runnerShake=Math.max(0,this.runnerShake-dt);
      const brake=this.input.isDown('ArrowLeft','KeyA'),sprintHeld=this.input.isDown('ControlLeft','ControlRight','ArrowRight','KeyD');
      p.sprinting=sprintHeld&&p.stamina>1;p.stamina=YMM.Util.clamp(p.stamina+(p.sprinting?-30:17)*dt,0,p.maxStamina);
      let speed=p.dashTimer>0?590:p.sprinting?385:brake?145:245;
      p.vx=speed;p.x=YMM.Util.clamp(p.x+speed*dt,0,L.width-p.w);
      if(p.sprinting)this.ai.observe('sprint',{world:5,speed});if(brake)this.ai.observe('retreat',{world:5,braking:true});else if(!p.sprinting)this.ai.observe('approach',{world:5,forward:true});
      if(this.input.justPressed('Space','ArrowUp','KeyW')&&p.grounded){p.vy=-455;p.grounded=false;this.ai.observe('jump',{world:5});this.audio.play('attack');this.particles.burst(270,p.y+p.h,'#72f3dc',8,70);}
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.22;p.dashCooldown=.9;p.invuln=Math.max(p.invuln,.22);p.stamina=YMM.Util.clamp(p.stamina-12,0,p.maxStamina);this.ai.observe('dash',{world:5});this.audio.play('attack');this.particles.burst(270,p.y+p.h/2,'#72f3dc',14,110);}
      if(this.input.justPressed('KeyQ')&&this.runnerAlly.pulseCooldown<=0){
        this.runnerAlly.pulseCooldown=8;this.ai.observe('special',{world:5,character:'ECHO'});let interrupted=0;
        for(const e of this.runnerEnemies)if(e.hp>0&&Math.abs(e.x-p.x)<245){e.stun=1.35;e.windup=0;e.chargeTimer=0;interrupted++;}
        this.runnerProjectiles=this.runnerProjectiles.filter(b=>Math.abs(b.x-p.x)>270);
        p.invuln=Math.max(p.invuln,.24);this.runnerAlly.dialogue='Pulso liberado. Muévete antes de que vuelva a calcularte.';this.runnerAlly.dialogueTimer=2.1;
        this.ai.reportOutcome('echo-pulse',interrupted>0,{interrupted});this.particles.burst(270,p.y+p.h/2,'#a18bff',32,170);this.audio.play('phase');this.toast('ECHO PULSE // '+interrupted+' HOSTILES INTERRUMPIDOS');
      }
      p.vy=Math.min(780,p.vy+1250*dt);const previousY=p.y;p.y+=p.vy*dt;p.grounded=false;
      const solids=this.runnerSolids();
      for(const s of solids){
        if(s.oneWay){if(p.vy>=0&&previousY+p.h<=s.y+8&&p.x+p.w>s.x&&p.x<s.x+s.w){p.y=s.y-p.h;p.grounded=true;p.vy=0;if(s.collapse)this.triggerCollapse(s);}}
        else if(p.x<s.x+s.w&&p.x+p.w>s.x&&previousY+p.h<=s.y+12&&p.vy>=0&&p.y+p.h>=s.y){p.y=s.y-p.h;p.grounded=true;p.vy=0;if(s.collapse)this.triggerCollapse(s);}
      }
      if(p.y>690){this.damagePlayer(1,'Te has quedado atrás: el vacío se ha tragado el camino.');p.x=Math.max(45,this.lastRunnerCheckpoint-35);p.y=400;p.vx=0;p.vy=0;p.grounded=false;this.repairRunnerCheckpoint();this.runnerShake=.4;}
      for(const s of L.spikes){if(p.invuln<=0&&YMM.Util.overlap(p,{x:s.x,y:s.y+2,w:s.w,h:s.h-2})){this.damagePlayer(1,'Picos de convergencia. Salta antes del borde.');p.x=Math.max(this.lastRunnerCheckpoint,p.x-85);p.y=Math.min(p.y,430);p.vy=-190;this.runnerShake=.2;break;}}
      for(const cell of this.runnerCells){if(!cell.taken&&Math.hypot(p.x-cell.x,p.y+p.h/2-cell.y)<43){cell.taken=true;this.runnerCellCount++;p.stamina=YMM.Util.clamp(p.stamina+30,0,p.maxStamina);this.ai.observe('collect',{world:5,cell:cell.id});this.particles.burst(cell.x-this.runnerCamera(),cell.y,'#72f3dc',20,120);this.audio.play('collect');this.log('Fragmento de memoria '+this.runnerCellCount+'/'+this.runnerCells.length+'. ECHO ha recuperado energía.','alert');}}
      for(const cp of L.checkpoints){if(p.x>=cp&&this.lastRunnerCheckpoint<cp){this.lastRunnerCheckpoint=cp;this.log('PUNTO DE ANCLAJE '+Math.round(cp/L.width*100)+'% — la ruta se reconstruye aquí.','alert');this.toast('CHECKPOINT // '+Math.round(cp/L.width*100)+'%');}}
      const cam=this.runnerCamera();
      for(const e of this.runnerEnemies){
        if(e.hp<=0)continue;e.stun=Math.max(0,e.stun-dt);e.hitFlash=Math.max(0,e.hitFlash-dt);e.attackTimer-=dt*this.difficultyScale*(p.intelTimer>0?.7:1);
        const delta=p.x-e.x,dist=Math.abs(delta);
        if(e.type==='drone'){e.y=355+Math.sin(this.clock*2.4+e.spawnX*.01)*34;if(dist<470&&dist>70&&e.attackTimer<=0){e.attackTimer=1.45+Math.random()*.45;this.runnerProjectiles.push({x:e.x-15,y:e.y+13,vx:-350,vy:YMM.Util.clamp((p.y+15-e.y)*.16,-58,58),ttl:2.5,type:'drone',r:8});this.ai.record('agent-action',{id:e.id,type:'drone-salvo',distance:Math.round(dist)});}}
        else if(e.type==='stalker'&&dist<390&&e.stun<=0){e.x+=Math.sign(delta)*Math.min(125,Math.abs(delta)*.7)*dt*this.difficultyScale*(p.intelTimer>0?.65:1);e.phase='pursuit';}
        else if(e.type==='rival'&&dist<410&&e.stun<=0){const target=p.x+(p.sprinting?110:175);e.x+=(target-e.x)*Math.min(1,dt*2.3*this.difficultyScale*(p.intelTimer>0?.65:1));e.phase='mimic';if(e.attackTimer<=0){e.attackTimer=2.1;e.windup=.45;this.ai.record('agent-action',{id:e.id,type:'mimic-feint'});}}
        else if((e.type==='brute'||e.type==='warden')&&dist<360&&e.stun<=0){
          if(e.type==='brute'&&e.windup<=0&&e.chargeTimer<=0&&dist<230&&e.attackTimer<=0){e.windup=.62;e.attackTimer=2.6;e.phase='telegraph';this.ai.record('agent-action',{id:e.id,type:'brute-charge'});}
          if(e.type==='warden'&&dist<400&&e.attackTimer<=0){e.attackTimer=2.15;this.runnerProjectiles.push({x:e.x-14,y:e.y+17,vx:-390,vy:YMM.Util.clamp((p.y+15-e.y)*.22,-72,72),ttl:2.6,type:'warden',r:9});e.phase='aim';this.ai.record('agent-action',{id:e.id,type:'aimed-shot'});}
          if(e.windup>0){e.windup-=dt;if(e.windup<=0){e.chargeTimer=.48;e.phase='charge';}}
          if(e.chargeTimer>0){e.chargeTimer-=dt;e.x+=Math.sign(delta)*545*dt*this.difficultyScale*(p.intelTimer>0?.65:1);}
        }
        if(e.type==='rival'&&e.windup>0)e.windup=Math.max(0,e.windup-dt);
        if(e.type==='stalker'&&p.x-e.x>130)e.x=Math.min(p.x-85,e.x+245*dt*this.difficultyScale*(p.intelTimer>0?.65:1));
        if(e.type==='brute'||e.type==='rival'||e.type==='stalker')e.y=L.groundY-(e.type==='rival'&&Math.abs(delta)<120?35:34);
        if(dist<30&&Math.abs((p.y+p.h/2)-(e.y+18))<37&&p.invuln<=0){
          if(p.dashTimer>0){e.hp-=1;e.stun=.5;p.invuln=.25;this.particles.burst(e.x-cam,e.y,'#72f3dc',12,95);}
          else{this.damagePlayer(1,e.type.toUpperCase()+' te ha interceptado. Alterna salto, dash y ataques.');p.x=Math.max(this.lastRunnerCheckpoint,p.x-65);p.vy=-185;p.grounded=false;this.runnerShake=.18;}
        }
      }
      for(const bolt of this.runnerProjectiles){const projectileScale=this.difficultyScale*(p.intelTimer>0?.72:1);bolt.x+=bolt.vx*dt*projectileScale;bolt.y+=bolt.vy*dt*projectileScale;bolt.ttl-=dt*projectileScale;if(bolt.ttl>0&&Math.abs(bolt.x-p.x)<22&&Math.abs(bolt.y-(p.y+p.h/2))<24&&p.invuln<=0){this.damagePlayer(1,'Proyectil predictivo. ECHO puede interrumpir las salvas con Q.');if(bolt.eventKind&&this.runnerEvent&&this.runnerEvent.kind===bolt.eventKind){this.ai.reportOutcome(bolt.eventKind,true,{projectileHit:true});this.runnerEvent.outcomeRecorded=true;}bolt.ttl=0;p.vy=-140;}}
      this.runnerProjectiles=this.runnerProjectiles.filter(b=>b.ttl>0&&b.x>this.lastRunnerCheckpoint-180&&b.x<p.x+1000);
      if(this.input.justPressed('KeyJ','KeyF')&&p.attackTimer<=0){
        const heavy=this.input.justPressed('KeyF'),reach=heavy?132:88;p.attackTimer=heavy?.55:.28;p.attackKind=heavy?'heavy':'light';p.stamina=YMM.Util.clamp(p.stamina-(heavy?19:6),0,p.maxStamina);this.ai.observe('attack',{world:5,kind:p.attackKind});
        const target=this.runnerEnemies.filter(e=>e.hp>0&&e.x>=p.x-48&&e.x<=p.x+reach&&Math.abs(e.y+17-(p.y+p.h/2))<72).sort((a,b)=>a.x-b.x)[0];
        if(target){target.hp-=heavy?2:1;target.stun=heavy?.92:.46;target.hitFlash=.2;target.phase='stagger';if(target.hp<=0)this.ai.record('agent-defeated',{id:target.id,type:target.type});this.ai.reportOutcome('runner-attack',true,{id:target.id,type:target.type,kind:p.attackKind});this.particles.burst(target.x-cam,target.y,'#ffcf79',heavy?20:12,heavy?130:86);this.audio.play('hit');this.log((heavy?'GOLPE PESADO':'COMBO LIGERO')+' contra '+target.type.toUpperCase()+'. Integridad enemiga '+Math.max(0,target.hp)+'/'+target.maxHp+'.','alert');}
        else{this.ai.reportOutcome('runner-attack',false,{kind:p.attackKind});this.audio.play('attack');this.toast('ATAQUE AL AIRE. Ajusta la distancia.');}
      }
      this.runnerAlly.pulseCooldown=Math.max(0,this.runnerAlly.pulseCooldown-dt);this.runnerAlly.x=p.x-55;this.runnerAlly.y=p.y-43+Math.sin(this.clock*3)*7;
      const collapsingAhead=[...this.runnerFloors,...this.runnerPlatforms].find(s=>s.state==='warning'&&s.x>p.x-15&&s.x<p.x+300);
      if(collapsingAhead&&this.runnerAlly.warningTimer<=0){this.runnerAlly.dialogue='¡El suelo se abre delante! Usa sprint o salta.';this.runnerAlly.dialogueTimer=2.2;this.runnerAlly.warningTimer=3.2;}
      this.runnerAlly.warningTimer=Math.max(0,this.runnerAlly.warningTimer-dt);this.runnerAlly.dialogueTimer=Math.max(0,this.runnerAlly.dialogueTimer-dt);
      this.updateRunnerDirector(dt);
      const biome=L.biomes.findIndex(b=>p.x>=b.from&&p.x<b.to);
      if(biome!==this.runnerScenarioIndex&&biome>=0){this.runnerScenarioIndex=biome;this.log('BIOMA '+(biome+1)+'/5 — '+L.biomes[biome].label+'. La arquitectura está dejando de obedecer.','danger');this.ai.record('biome-transition',{biome:L.biomes[biome].key,x:Math.round(p.x)});this.toast(L.biomes[biome].label);this.audio.play('glitch');}
      if(p.x+p.w>=L.goal.x){this.log('Cruce de realidades completado. El núcleo original te está esperando.','danger');this.enterWorld6();return;}
      this.camera=cam;
    }
    runnerCamera(){return YMM.Util.clamp(this.player.x-270,0,YMM.Levels.world5.width-this.canvas.width);}
    repairRunnerCheckpoint(){
      const x=this.lastRunnerCheckpoint||80;
      for(const s of [...this.runnerFloors,...this.runnerPlatforms])if(Math.abs(((s.originalX??s.x)+(s.originalW??s.w)/2)-x)<360){s.x=s.originalX??s.x;s.w=s.originalW??s.w;s.collapse=s.collapsible??s.collapse;s.state='stable';s.timer=0;s.fallY=0;s.rubble=false;}
      for(const e of this.runnerEnemies)if(Math.abs(e.spawnX-x)<310&&e.hp<=0){e.hp=e.maxHp;e.stun=0;}
      this.player.stamina=this.player.maxStamina;
    }
    updateRunnerDirector(dt){
      this.runnerDirectorTimer-=dt;const p=this.player;
      if(!this.runnerEvent&&this.runnerDirectorTimer<=0&&p.x<YMM.Levels.world5.goal.x-300){
        const kinds=['ceiling-sweep','ground-rift','drone-salvo','shadow-rush','collapse-wave'],kind=this.ai.chooseTactic('runner',kinds);
        this.runnerEvent={kind,x:p.x+560,state:'warning',timer:1.3,triggered:false,spawned:false};this.runnerDirectorTimer=(4.5+Math.random()*2.2)/this.difficultyScale;
        this.ai.record('runner-threat',{kind,x:Math.round(this.runnerEvent.x),prediction:this.ai.predictIntent()});this.ai.speak('adaptive');this.ai.dialogueTimer=2;
        this.log('DIRECTOR DE ESCENARIO: amenaza seleccionada según tu patrón ('+kind+').','danger');
      }
      const e=this.runnerEvent;if(!e)return;e.timer-=dt*this.difficultyScale*(this.player.intelTimer>0?.72:1);
      if(e.state==='warning'&&e.timer<=0){e.state='active';e.timer=1.45;this.runnerShake=.16;this.ai.record('runner-threat-armed',{kind:e.kind});}
      if(e.state==='active'&&!e.triggered){
        const d=Math.abs(p.x-e.x);
        if(e.kind==='drone-salvo'&&!e.spawned){e.spawned=true;for(let n=0;n<3;n++)this.runnerProjectiles.push({x:e.x+90+n*22,y:420+n*28,vx:-385,vy:(p.y+15-(420+n*28))*.12,ttl:2.5,type:'director-drone',eventKind:e.kind,r:8});}
        if(e.kind==='shadow-rush'&&!e.spawned){e.spawned=true;this.runnerEnemies.push({id:'director-shadow-'+Math.round(this.elapsed),type:'shadow',x:e.x+80,y:YMM.Levels.world5.groundY-34,hp:2,maxHp:2,attackTimer:0,stun:0,windup:0,chargeTimer:0,hitFlash:0,spawnX:e.x+80,phase:'ambush'});}
        if(e.kind==='collapse-wave'&&!e.spawned){e.spawned=true;const candidates=this.runnerFloors.filter(s=>s.collapse&&s.state==='stable'&&s.x>p.x+20&&s.x<p.x+700).slice(0,2);for(const s of candidates)this.triggerCollapse(s);this.runnerShake=.55;this.particles.burst(270,510,'#ff617c',32,180);this.ai.reportOutcome(e.kind,candidates.length>0,{sections:candidates.length});e.outcomeRecorded=true;}
        if(d<72&&e.kind==='ground-rift'&&p.grounded&&p.invuln<=0){e.triggered=true;this.damagePlayer(1,'La grieta ha leído que permaneces en el suelo. Salta durante la señal.');p.vy=-160;p.grounded=false;this.runnerShake=.3;this.ai.reportOutcome(e.kind,true,{playerHit:true});e.outcomeRecorded=true;}
        else if(d<92&&e.kind==='ceiling-sweep'&&p.y<435&&p.invuln<=0){e.triggered=true;this.damagePlayer(1,'El barrido aéreo ha leído tus saltos. Cambia de altura o usa ECHO.');p.vy=80;this.runnerShake=.3;this.ai.reportOutcome(e.kind,true,{playerHit:true});e.outcomeRecorded=true;}
        if(p.x>e.x+130)e.triggered=true;
      }
      if(e.timer<=0||p.x>e.x+230){if(!e.outcomeRecorded)this.ai.reportOutcome(e.kind,false,{playerEvaded:true,triggered:e.triggered});this.ai.record('runner-threat-ended',{kind:e.kind,triggered:e.triggered,outcomeLearned:!!e.outcomeRecorded});this.runnerEvent=null;}
    }
    updateWorld6(dt){
      const p=this.player,b=this.boss;let dx=(this.input.isDown('ArrowRight','KeyD')?1:0)-(this.input.isDown('ArrowLeft','KeyA')?1:0),dy=(this.input.isDown('ArrowDown','KeyS')?1:0)-(this.input.isDown('ArrowUp','KeyW')?1:0);
      if(dx&&dy){dx*=.7071;dy*=.7071;}
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.22;p.dashCooldown=.78;this.ai.observe('dash');this.audio.play('attack');this.particles.burst(p.x,p.y,'#72f3dc',15,105);}
      const speed=p.dashTimer>0?650:260;p.vx=dx*speed;p.vy=dy*speed;p.x=YMM.Util.clamp(p.x+p.vx*dt,90,910);p.y=YMM.Util.clamp(p.y+p.vy*dt,100,520);
      p.parryTimer=Math.max(0,(p.parryTimer||0)-dt);p.comboTimer=Math.max(0,(p.comboTimer||0)-dt);if(p.comboTimer===0)p.combo=0;
      if(this.input.justPressed('KeyE')){p.parryTimer=.24;this.audio.tone(480,.06,'triangle',.12,240);this.ai.observe('parry');}
      if(this.input.justPressed('KeyJ','Space','KeyF')&&p.attackTimer<=0){
        p.attackTimer=this.input.isDown('KeyF')?.42:.25;this.ai.observe('attack');const d=Math.hypot(p.x-b.x,p.y-b.y);
        if(b.phase==='vulnerable'&&d<(this.input.isDown('KeyF')?150:112)){const dmg=this.input.isDown('KeyF')?2:1;b.hp=Math.max(0,b.hp-dmg);b.hitFlash=.2;b.stagger=.28;this.particles.burst(b.x,b.y,'#72f3dc',25,145);this.audio.tone(760,.08,'triangle',.2,260);this.log('Núcleo dañado: '+b.hp+'/'+b.maxHp+'. Combo '+(++p.combo)+'.','alert');this.ai.reportOutcome('pressure',true);
          if(b.hp===10||b.hp===5){this.ai.speak('lowHealth');this.ai.dialogueTimer=2.8;this.log('La IA está cambiando su modelo de ataque.','danger');}
          if(b.hp<=0){this.ai.speak('invader');this.ai.dialogueTimer=3;this.log('El núcleo cae, pero una transmisión desconocida abre un último juego.','danger');this.enterWorld7();return;}
        }else if(d<145)this.toast(b.phase==='vulnerable'?'Golpe demasiado corto.':'El núcleo está blindado: busca la ventana tras el ataque.');}
      b.hitFlash=Math.max(0,b.hitFlash-dt);b.stagger=Math.max(0,(b.stagger||0)-dt);b.timer-=dt*this.difficultyScale*(p.intelTimer>0?.72:1);
      if(b.stagger>0)return;
      if(b.phase==='idle'&&b.timer<=0){
        const profile=this.ai.profile;b.attackType=this.ai.chooseTactic('final-boss',['ring','feint','lunge','lattice']);
        b.patternCount++;b.targetX=YMM.Util.clamp(p.x+p.vx*.32,90,910);b.targetY=YMM.Util.clamp(p.y+p.vy*.32,100,520);
        const dd=Math.hypot(b.targetX-b.x,b.targetY-b.y)||1;b.dx=(b.targetX-b.x)/dd;b.dy=(b.targetY-b.y)/dd;b.phase='telegraph';b.timer=b.attackType==='ring'?.9:.7;
        this.ai.record('final-boss-policy',{attack:b.attackType,profile});this.audio.tone(145,.15,'sawtooth',.08,55);
      }else if(b.phase==='telegraph'&&b.timer<=0){
        if(b.attackType==='ring'){b.phase='ring';b.timer=.55;}
        else if(b.attackType==='feint'){b.phase='fakeout';b.timer=.35;}
        else{b.phase='charge';b.timer=b.attackType==='lunge'?.34:.42;this.audio.play('boss');}
      }else if(b.phase==='fakeout'&&b.timer<=0){b.targetX=YMM.Util.clamp(p.x+p.vx*.42,90,910);b.targetY=YMM.Util.clamp(p.y+p.vy*.42,100,520);const d=Math.hypot(b.targetX-b.x,b.targetY-b.y)||1;b.dx=(b.targetX-b.x)/d;b.dy=(b.targetY-b.y)/d;b.phase='charge';b.timer=.3;}
      else if(b.phase==='charge'){
        const chargeScale=this.difficultyScale*(p.intelTimer>0?.72:1);b.x+=b.dx*(b.attackType==='lunge'?790:570)*dt*chargeScale;b.y+=b.dy*(b.attackType==='lunge'?790:570)*dt*chargeScale;b.x=YMM.Util.clamp(b.x,100,900);b.y=YMM.Util.clamp(b.y,100,520);
        if(Math.hypot(p.x-b.x,p.y-b.y)<40&&p.invuln<=0){if(p.parryTimer>0){this.ai.reportOutcome(b.attackType,false,{world:6,parried:true});b.stagger=.8;b.phase='vulnerable';b.timer=1.2;this.log('PARADA PERFECTA. La IA ha perdido su turno.','alert');this.particles.burst(b.x,b.y,'#72f3dc',30,170);}else{this.ai.reportOutcome(b.attackType,true,{world:6,playerHit:true});this.damagePlayer(1,'El ataque final te alcanzó. Esquiva o pulsa E justo antes del impacto.');}}
        if(b.timer<=0||b.x===100||b.x===900||b.y===100||b.y===520){b.phase='vulnerable';b.timer=1.05;this.particles.burst(b.x,b.y,'#ff617c',22,125);this.log('El núcleo está abierto: encadena ataques fuertes con F.','alert');}
      }else if(b.phase==='ring'){
        const d=Math.hypot(p.x-b.x,p.y-b.y);if(d<170&&p.invuln<=0){if(p.parryTimer>0){this.ai.reportOutcome(b.attackType,false,{world:6,parried:true});b.stagger=.7;b.phase='vulnerable';b.timer=1;this.log('La onda ha sido repelida. Contraataca.','alert');}else{this.ai.reportOutcome(b.attackType,true,{world:6,playerHit:true});this.damagePlayer(1,'Onda de choque: abandona el radio o usa el dash.');}}
        if(b.timer<=0){b.phase='vulnerable';b.timer=.78;}
      }else if(b.phase==='vulnerable'&&b.timer<=0){b.phase='idle';b.timer=.48;}
    }
    updateWorld7(dt){
      const p=this.player,L=this.world===10?YMM.Levels.world10:YMM.Levels.world7,arena=L.arena,scale=this.difficultyScale*(p.intelTimer>0?.68:1);
      p.fireCooldown=Math.max(0,(p.fireCooldown||0)-dt);p.heavyCooldown=Math.max(0,(p.heavyCooldown||0)-dt);
      p.specialCooldown=Math.max(0,(p.specialCooldown||0)-dt);
      const ix=(this.input.isDown('ArrowRight','KeyD')?1:0)-(this.input.isDown('ArrowLeft','KeyA')?1:0);
      const iy=(this.input.isDown('ArrowDown','KeyS')?1:0)-(this.input.isDown('ArrowUp','KeyW')?1:0);
      let dx=ix,dy=iy;if(dx&&dy){dx*=.7071;dy*=.7071;}
      const overlaps=(x,y,o)=>x<o.x+o.w&&x+p.w>o.x&&y<o.y+o.h&&y+p.h>o.y;
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){
        p.dashTimer=.19;p.dashCooldown=.88;p.invuln=Math.max(p.invuln,.24);this.ai.observe('dash',{world:7});
        this.particles.burst(p.x+p.w/2,p.y+p.h/2,'#72f3dc',16,115);this.audio.play('attack');
      }
      const speed=p.dashTimer>0?610:245;p.vx=dx*speed;p.vy=dy*speed;
      const nx=YMM.Util.clamp(p.x+p.vx*dt,arena.x,arena.x+arena.w-p.w);
      if(!L.obstacles.some(o=>overlaps(nx,p.y,o)))p.x=nx;
      const ny=YMM.Util.clamp(p.y+p.vy*dt,arena.y,arena.y+arena.h-p.h);
      if(!L.obstacles.some(o=>overlaps(p.x,ny,o)))p.y=ny;
      if(ix||iy)this.ai.observe(dx<0||dy<0?'retreat':'approach',{world:7});
      p.lastDir=Math.abs(dx)>=Math.abs(dy)?(Math.sign(dx)||p.lastDir):(Math.sign(dy)||p.lastDir);

      this.signalDirectorTimer-=dt*scale;
      if(this.signalDirectorTimer<=0){
        this.signalTactic=this.ai.chooseTactic('shooter',['crossfire','lead-shot','encircle','minefield']);
        this.signalDirectorTimer=this.difficulty==='nightmare'?2.1:3.5;
        this.ai.record('signal-directive',{tactic:this.signalTactic,relays:this.signalNodes.filter(n=>n.hp>0).length});
        this.log('SIGNAL DIRECTOR // '+this.signalTactic.toUpperCase()+'. La red ha cambiado de formación.','alert');
        if(this.signalTactic==='minefield'&&this.signalMines.filter(m=>!m.dead).length<3){
          for(const side of [-1,1])this.signalMines.push({x:YMM.Util.clamp(p.x+side*118,arena.x+35,arena.x+arena.w-35),y:YMM.Util.clamp(p.y+(side<0?-86:92),arena.y+35,arena.y+arena.h-35),timer:1.05,armed:false,ttl:4.5,dead:false,r:18});
        }
      }
      if(this.input.justPressed('KeyJ')&&p.fireCooldown<=0){
        p.fireCooldown=.2;this.ai.observe('attack',{world:7,weapon:'pulse'});
        const targets=[
          ...this.signalNodes.filter(n=>n.hp>0).map(ref=>({ref,kind:'relay'})),
          ...this.signalEnemies.filter(e=>e.hp>0).map(ref=>({ref,kind:'enemy'}))
        ];
        targets.sort((a,b)=>Math.hypot(a.ref.x-(p.x+p.w/2),a.ref.y-(p.y+p.h/2))-Math.hypot(b.ref.x-(p.x+p.w/2),b.ref.y-(p.y+p.h/2)));
        const nearest=targets[0];
        if(nearest){
          const t=nearest.ref,lead=this.signalTactic==='lead-shot'&&nearest.kind==='enemy'?.34:.13;
          const tx=t.x+(nearest.kind==='enemy'?(t.vx||0)*lead:0),ty=t.y+(nearest.kind==='enemy'?(t.vy||0)*lead:0);
          const angle=Math.atan2(ty-(p.y+p.h/2),tx-(p.x+p.w/2));
          this.signalProjectiles.push({from:'player',x:p.x+p.w/2,y:p.y+p.h/2,vx:Math.cos(angle)*520,vy:Math.sin(angle)*520,ttl:1.8,damage:1,r:4});
          this.audio.play('attack');this.signalShotCount++;
        }else this.toast('TODOS LOS OBJETIVOS ESTÁN FUERA DE SERVICIO. ACTIVA LA SALIDA.');
      }
      if(this.world===10&&this.input.justPressed('KeyK')&&p.heavyCooldown<=0){
        p.heavyCooldown=1.35;const tx=p.x+p.w/2,ty=p.y+p.h/2;
        const targets=[...this.signalNodes.filter(n=>n.hp>0),...this.signalEnemies.filter(e=>e.hp>0)].sort((a,b)=>Math.hypot(a.x-tx,a.y-ty)-Math.hypot(b.x-tx,b.y-ty));
        if(targets.length){const t=targets[0],base=Math.atan2(t.y-ty,t.x-tx);for(const spread of [-.16,0,.16])this.signalProjectiles.push({from:'player',x:tx,y:ty,vx:Math.cos(base+spread)*450,vy:Math.sin(base+spread)*450,ttl:1.5,damage:2,r:6});this.ai.observe('special',{world:10,weapon:'triple-salvo'});this.ai.record('weapon-fired',{weapon:'triple-salvo',target:t.id||t.index});this.particles.burst(tx,ty,'#ffcf79',18,110);this.audio.play('boss');this.toast('TRIPLE SALVO // DAÑO ELEVADO');}
      }
      if(this.input.justPressed('KeyF')&&p.specialCooldown<=0){
        p.specialCooldown=4.8;this.ai.observe('special',{world:7,weapon:'emp'});let hits=0;
        for(const e of this.signalEnemies)if(e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<148){e.hp-=2;e.stun=Math.max(e.stun,.85);e.hitFlash=.22;hits++;}
        for(const n of this.signalNodes)if(n.hp>0&&Math.hypot(n.x-p.x,n.y-p.y)<125){n.hp=Math.max(0,n.hp-1);n.hitFlash=.25;hits++;}
        this.signalProjectiles=this.signalProjectiles.filter(b=>b.from!=='enemy'||Math.hypot(b.x-p.x,b.y-p.y)>205);
        this.signalMines=this.signalMines.filter(m=>m.dead||Math.hypot(m.x-p.x,m.y-p.y)>175);
        this.ai.reportOutcome('signal-emp',hits>0,{hits});this.particles.burst(p.x+p.w/2,p.y+p.h/2,'#b8a0ff',36,175);this.audio.play('phase');this.toast('EMP // '+hits+' OBJETIVOS AFECTADOS');
      }

      for(const e of this.signalEnemies){
        if(e.hp<=0)continue;e.stun=Math.max(0,e.stun-dt);e.hitFlash=Math.max(0,e.hitFlash-dt);e.attackTimer-=dt*scale;
        const toX=p.x+p.w/2-e.x,toY=p.y+p.h/2-e.y,dist=Math.hypot(toX,toY)||1;
        if(e.type==='hunter'&&e.stun<=0&&dist<510){
          let tx=p.x+p.w/2,ty=p.y+p.h/2;
          if(this.signalTactic==='encircle'){const sign=e.index%2?1:-1;tx+=-toY/dist*sign*58;ty+=toX/dist*sign*58;}
          e.vx=(tx-e.x)/dist*91*scale;e.vy=(ty-e.y)/dist*91*scale;
          const ex=YMM.Util.clamp(e.x+e.vx*dt,arena.x+18,arena.x+arena.w-18),ey=YMM.Util.clamp(e.y+e.vy*dt,arena.y+18,arena.y+arena.h-18);
          if(!L.obstacles.some(o=>ex>=o.x&&ex<=o.x+o.w&&ey>=o.y&&ey<=o.y+o.h)){e.x=ex;e.y=ey;}
          if(dist<28&&e.attackTimer<=0&&p.invuln<=0){e.attackTimer=.95;this.damagePlayer(1,'El cazador ha cerrado la distancia. Usa el dash o el pulso EMP.');}
        }else if((e.type==='sniper'||e.type==='warden'||e.type==='splitter')&&dist<620&&e.stun<=0&&e.attackTimer<=0){
          const lead=this.signalTactic==='lead-shot'?.42:.16,targetX=p.x+p.w/2+p.vx*lead,targetY=p.y+p.h/2+p.vy*lead,ang=Math.atan2(targetY-e.y,targetX-e.x);
          const rate=this.signalTactic==='crossfire'?.72:1;
          if(e.type==='splitter'){
            for(const offset of [-.27,0,.27]){const a=ang+offset;this.signalProjectiles.push({from:'enemy',x:e.x,y:e.y,vx:Math.cos(a)*255,vy:Math.sin(a)*255,ttl:2.6,damage:1,r:5,kind:'split'});}
            e.attackTimer=2.25*rate;
          }else{
            const bulletSpeed=e.type==='warden'?335:270;this.signalProjectiles.push({from:'enemy',x:e.x,y:e.y,vx:Math.cos(ang)*bulletSpeed,vy:Math.sin(ang)*bulletSpeed,ttl:2.4,damage:1,r:e.type==='warden'?7:5,kind:e.type});
            e.attackTimer=(e.type==='warden'?2.05:1.72)*rate;
          }
          this.ai.record('signal-agent-fire',{id:e.id,type:e.type,tactic:this.signalTactic});
        }
      }

      for(const mine of this.signalMines){
        if(mine.dead)continue;mine.ttl-=dt*scale;
        if(!mine.armed){mine.timer-=dt*scale;if(mine.timer<=0){mine.armed=true;mine.timer=2.45;this.ai.record('signal-mine-armed',{x:Math.round(mine.x),y:Math.round(mine.y)});}}
        else{
          mine.timer-=dt*scale;
          if(Math.hypot(p.x+p.w/2-mine.x,p.y+p.h/2-mine.y)<mine.r+10&&p.invuln<=0){this.damagePlayer(1,'Una mina predictiva ha explotado. Observa las señales del suelo.');mine.dead=true;this.particles.burst(mine.x,mine.y,'#ff617c',20,105);}
          else if(mine.timer<=0)mine.dead=true;
        }
        if(mine.ttl<=0)mine.dead=true;
      }
      for(const bolt of this.signalProjectiles){
        if(bolt.ttl<=0)continue;bolt.x+=bolt.vx*dt*scale;bolt.y+=bolt.vy*dt*scale;bolt.ttl-=dt*scale;
        if(L.obstacles.some(o=>bolt.x>=o.x&&bolt.x<=o.x+o.w&&bolt.y>=o.y&&bolt.y<=o.y+o.h)){bolt.ttl=0;continue;}
        if(bolt.from==='player'){
          let hit=false;
          for(const n of this.signalNodes){if(n.hp>0&&Math.hypot(bolt.x-n.x,bolt.y-n.y)<22){n.hp=Math.max(0,n.hp-bolt.damage);n.hitFlash=.2;bolt.ttl=0;hit=true;this.ai.reportOutcome('relay-shot',true,{id:n.id,hp:n.hp});this.particles.burst(n.x,n.y,n.color||'#72f3dc',15,95);if(n.hp<=0){this.ai.record('relay-destroyed',{id:n.id});this.log('REPETIDOR '+n.id+' DESTRUIDO. La red pierde una parte de su cobertura.','alert');this.toast('RELAY OFFLINE // '+this.signalNodes.filter(x=>x.hp>0).length+' RESTANTES');}break;}}
          if(!hit){for(const e of this.signalEnemies){if(e.hp>0&&Math.hypot(bolt.x-e.x,bolt.y-e.y)<19){e.hp=Math.max(0,e.hp-bolt.damage);e.hitFlash=.18;e.stun=Math.max(e.stun,.12);bolt.ttl=0;hit=true;this.ai.reportOutcome('enemy-shot',true,{id:e.id,hp:e.hp});this.particles.burst(e.x,e.y,'#ffcf79',10,80);if(e.hp<=0)this.signalKills++;break;}}}
          for(const m of this.signalMines){if(!m.dead&&Math.hypot(bolt.x-m.x,bolt.y-m.y)<m.r){m.dead=true;bolt.ttl=0;}}
        }else if(Math.hypot(bolt.x-(p.x+p.w/2),bolt.y-(p.y+p.h/2))<p.w/2+(bolt.r||4)&&p.invuln<=0){this.damagePlayer(1,'Una salva ha conectado. Muévete de forma menos predecible.');bolt.ttl=0;}
      }
      this.signalProjectiles=this.signalProjectiles.filter(b=>b.ttl>0);this.signalMines=this.signalMines.filter(m=>!m.dead);
      const remaining=this.signalNodes.filter(n=>n.hp>0).length;
      if(remaining===0&&!this.signalExitToast){this.signalExitToast=true;this.log(this.world===10?'LOS CUATRO NODOS DEL MOTOR ESTÁN FUERA DE SERVICIO. La salida ya responde.':'LOS TRES REPETIDORES ESTÁN FUERA DE SERVICIO. La salida ya responde.','alert');this.toast(this.world===10?'SINGULARITY ENGINE // EXTRACCIÓN DISPONIBLE':'SIGNAL BREAK // LLEGA A LA PUERTA Y PULSA E');}
      if(this.input.justPressed('KeyE')&&Math.hypot(p.x+p.w/2-L.exit.x,p.y+p.h/2-L.exit.y)<L.exit.r+12){
        if(remaining===0){if(this.world===10){this.ai.speak('endThreat');this.log('MOTOR DE SINGULARIDAD APAGADO // El sistema ya no puede reescribir la condición de parada.','danger');this.finish('convergence');return;}this.ai.speak('endThreat');this.log('CANAL RAÍZ DETECTADO // La transmisión no es una salida. Es una invitación al archivo que originó el objetivo.','danger');this.enterWorld8();return;}
        this.toast('SALIDA BLOQUEADA // QUEDAN '+remaining+' REPETIDORES');
      }
    }
    updateWorld3(dt){
      const p=this.player,b=this.boss;let dx=(this.input.isDown('ArrowRight','KeyD')?1:0)-(this.input.isDown('ArrowLeft','KeyA')?1:0),dy=(this.input.isDown('ArrowDown','KeyS')?1:0)-(this.input.isDown('ArrowUp','KeyW')?1:0);if(dx&&dy){dx*=.7071;dy*=.7071;}
      if(dx)p.lastDir=dx;
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.2;p.dashCooldown=.95;this.ai.observe('dash');this.ai.observe(p.lastDir<0?'dashLeft':'dashRight');this.audio.play('attack');this.particles.burst(p.x,p.y,'#72f3dc',12,85);}
      const speed=p.dashTimer>0?620:230;p.vx=dx*speed;p.vy=dy*speed;p.x+=p.vx*dt;p.y+=p.vy*dt;p.x=YMM.Util.clamp(p.x,90,910);p.y=YMM.Util.clamp(p.y,100,520);
      if(this.input.justPressed('KeyJ')&&p.attackTimer<=0){
        p.attackTimer=.22;this.ai.observe('attack');this.audio.play('attack');this.particles.burst(p.x,p.y,'#72f3dc',8,65);const dist=Math.hypot(p.x-b.x,p.y-b.y);
        if(b.phase==='vulnerable'&&dist<112){b.hp=Math.max(0,b.hp-1);b.hitFlash=.2;b.lastHitAt=this.elapsed;this.particles.burst(b.x,b.y,'#72f3dc',22,140);this.audio.tone(720,.09,'triangle',.2,240);this.log('Impacto confirmado. Núcleo: '+b.hp+'/'+b.maxHp+'.','alert');this.ai.record('bossHit',{hp:b.hp,attack:b.attackType});
          if(b.hp===4){this.ai.speak('lowHealth');this.ai.dialogueTimer=2.5;this.log('La IA está cambiando de táctica.','danger');}
          if(b.hp<=0){this.ai.speak('world3Start');this.ai.dialogueTimer=3;this.log('La primera carcasa ha caído. La entidad ha escapado a un mundo tridimensional.','danger');this.enterWorld4();return;}
        }else if(dist<120)this.toast(b.phase==='vulnerable'?'Te has quedado fuera de alcance.':'EL NÚCLEO ESTÁ PROTEGIDO');}
      b.hitFlash=Math.max(0,b.hitFlash-dt);b.timer-=dt*this.difficultyScale*(p.intelTimer>0?.7:1);
      if(b.phase==='idle'&&b.timer<=0){
        const profile=this.ai.profile;
        b.attackType=this.ai.chooseTactic('boss3',['pulse','feint','intercept','charge']);
        b.patternCount++;b.targetX=YMM.Util.clamp(p.x+p.vx*(b.attackType==='intercept'?.48:.28),90,910);b.targetY=YMM.Util.clamp(p.y+p.vy*.25,100,520);
        const dd=Math.hypot(b.targetX-b.x,b.targetY-b.y)||1;b.dx=(b.targetX-b.x)/dd;b.dy=(b.targetY-b.y)/dd;b.phase='telegraph';b.timer=b.attackType==='pulse'?.82:.68;this.ai.record('bossPolicy',{attack:b.attackType,profile});this.audio.tone(180,.13,'sawtooth',.06,75);
        if(b.patternCount===2&&this.ai.phase>=4)this.ai.speak('lowHealth');
      }else if(b.phase==='telegraph'&&b.timer<=0){
        if(b.attackType==='pulse'){b.phase='pulse';b.timer=.48;}
        else if(b.attackType==='feint'){b.phase='fakeout';b.timer=.33;this.log('La IA ha simulado un ataque. No reacciones al primer movimiento.','danger');}
        else{b.phase='charge';b.timer=b.attackType==='intercept'?.39:.33;this.audio.play('boss');}
      }else if(b.phase==='fakeout'&&b.timer<=0){
        b.targetX=YMM.Util.clamp(p.x+p.vx*.32,90,910);b.targetY=YMM.Util.clamp(p.y+p.vy*.2,100,520);const dd=Math.hypot(b.targetX-b.x,b.targetY-b.y)||1;b.dx=(b.targetX-b.x)/dd;b.dy=(b.targetY-b.y)/dd;b.phase='charge';b.timer=.28;this.audio.play('boss');
      }else if(b.phase==='charge'){
        const chargeScale=this.difficultyScale*(p.intelTimer>0?.7:1);b.x+=b.dx*(b.attackType==='intercept'?690:625)*dt*chargeScale;b.y+=b.dy*(b.attackType==='intercept'?690:625)*dt*chargeScale;b.x=YMM.Util.clamp(b.x,105,895);b.y=YMM.Util.clamp(b.y,105,515);
        if(Math.hypot(p.x-b.x,p.y-b.y)<38&&p.invuln<=0){this.ai.reportOutcome(b.attackType,true,{world:3,playerHit:true});this.damagePlayer(1,'La carga te alcanzó. Esquiva durante la señal, no después.');}
        if(b.timer<=0||b.x===105||b.x===895||b.y===105||b.y===515){b.phase='vulnerable';b.timer=1.04;this.particles.burst(b.x,b.y,'#ff617c',16,90);this.log('Núcleo expuesto. Contraataca ahora.','alert');}
      }else if(b.phase==='pulse'){
        if(Math.hypot(p.x-b.x,p.y-b.y)<152&&p.invuln<=0){this.ai.reportOutcome(b.attackType,true,{world:3,playerHit:true});this.damagePlayer(1,'La onda te alcanzó. La próxima vez sal de su radio.');}if(b.timer<=0){b.phase='vulnerable';b.timer=.86;this.particles.burst(b.x,b.y,'#ff617c',16,90);this.log('La IA ha agotado su pulso. Núcleo expuesto.','alert');}
      }else if(b.phase==='vulnerable'&&b.timer<=0){b.phase='idle';b.timer=.62;}
    }
    damagePlayer(amount,message){
      const p=this.player;if(p.invuln>0)return;p.health-=amount;p.invuln=this.difficulty==='story'?1.5:this.difficulty==='nightmare'?.88:1.15;this.audio.play('hit');
      const px=this.world===5? p.x-this.runnerCamera():p.x,py=p.y;this.particles.burst(px,py,'#ff617c',16,100);this.log(message,'danger');this.toast(message);
      if(p.health<=0){
        if(this.world===3||this.world===6){p.health=this.world===6?(this.difficulty==='story'?5:this.difficulty==='nightmare'?3:5):this.difficulty==='story'?4:this.difficulty==='nightmare'?2:3;p.x=500;p.y=this.world===6?480:485;this.boss.x=500;this.boss.y=this.world===6?190:210;this.boss.phase='idle';this.boss.timer=1.1;this.log('Reinicio de emergencia. El núcleo conserva el daño recibido.','alert');}
        else if(this.world===7){p.health=this.difficulty==='story'?5:this.difficulty==='nightmare'?3:4;p.x=488;p.y=300;p.vx=0;p.vy=0;this.signalProjectiles=this.signalProjectiles.filter(b=>b.from!=='enemy'||Math.hypot(b.x-p.x,b.y-p.y)>180);this.signalMines=this.signalMines.filter(m=>Math.hypot(m.x-p.x,m.y-p.y)>140);this.log('Punto de restauración de SIGNAL BREAK. Los repetidores destruidos siguen fuera de servicio.','alert');}
        else if(this.world===4||this.world===8){p.health=p.maxHealth||4;p.x=1.5;p.y=1.5;p.angle=0;this.log(this.world===8?'Reinicio en la entrada del archivo. Los registros obtenidos y el daño a los centinelas persisten.':'Reinicio en la entrada de la catedral. Los fragmentos y daños persisten.','alert');}
        else if(this.world===5){p.health=p.maxHealth||4;p.x=Math.max(45,(this.lastRunnerCheckpoint||80)-35);p.y=420;p.vx=0;p.vy=0;p.grounded=false;this.repairRunnerCheckpoint();this.runnerShake=.45;this.log('ECHO ha reconstruido el ancla más cercana. Los enemigos recuerdan la pelea.','alert');}
        else{p.health=p.maxHealth||3;p.x=this.world===1?this.lastCheckpoint:90;p.y=this.world===1?430:550;p.vx=0;p.vy=0;this.log('Punto de restauración activado. La memoria del antagonista persiste.','alert');}
      }
    }
    frame(dt){this.update(Math.min(.033,Math.max(.001,dt)));this.renderer.render(this);}
  }
  YMM.Game=Game;
})(globalThis);

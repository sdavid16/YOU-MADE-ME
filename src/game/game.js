(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class Game {
    constructor(canvas,hud){
      this.canvas=canvas;this.input=new YMM.Input();this.audio=new YMM.AudioSystem();this.renderer=new YMM.Renderer(canvas);this.particles=new YMM.ParticleSystem();this.hud=hud;
      this.elapsed=0;this.clock=0;this.screen='menu';this.world=1;this.ending=null;this.lastHudSync=0;this.camera=0;this.logHistory=[];this.ai=new YMM.AntagonistAI(this);this.newGame(true);this.screen='menu';
    }
    newGame(keepMenu=false){
      this.elapsed=0;this.world=1;this.ending=null;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;this.hazardTimer=1.6;this.boss=null;this.logHistory=[];this.particles.items=[];this.ai.reset();
      this.world1Platforms=YMM.Levels.world1.platforms.map((p,id)=>({...p,id,collapse:[1,4,7,9].includes(id),state:'stable',timer:0,fallY:0}));
      this.player={x:75,y:482,w:28,h:38,vx:0,vy:0,grounded:false,health:3,maxHealth:3,stamina:100,maxStamina:100,sprinting:false,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,tauntLock:0,lastDir:1,stompFlash:0};
      this.enemy={x:280,y:486,w:30,h:34,tumble:0,stumbleTimer:1.2,windup:0,attackCooldown:2,counterWindup:0,counterCooldown:0,feintTimer:null,lungeTimer:0,stunned:0,strategy:'stalk'};
      YMM.Levels.world2.fragments.forEach(f=>f.taken=false);this.lastCheckpoint=75;this.screen=keepMenu?'menu':'playing';
      if(this.hud){this.hud.clearLog();this.hud.sync(true);}
      if(!keepMenu){this.audio.unlock();this.audio.play('start');this.log('Sesión iniciada. Dificultad: ridícula. Probabilidad de arrepentimiento: no disponible.');this.toast('Llega a la salida. O encuentra algo más divertido.');}
    }
    pause(){if(this.screen==='playing'){this.screen='paused';this.hud.sync();}}
    resume(){if(this.screen==='paused'){this.screen='playing';this.audio.unlock();this.hud.sync();}}
    toast(message){if(this.hud)this.hud.toast(message);}
    log(message,kind='normal'){this.logHistory.unshift({message,kind,t:this.elapsed});if(this.logHistory.length>30)this.logHistory.pop();if(this.hud)this.hud.addLog(message,kind);}
    provoke(kind){
      if(this.screen!=='playing')return;
      if(this.world===1){if(kind==='humiliate'){this.player.tauntLock=.28;const close=Math.abs((this.player.x+this.player.w/2)-(this.enemy.x+15))<170;if(this.ai.phase>=1&&close){this.enemy.windup=Math.max(this.enemy.windup,.35);this.log('Desafío aceptado. La IA castiga la provocación a corta distancia.','danger');}else this.log('Desafío lanzado. Más progreso, menos margen de error.','alert');}this.ai.taunt(kind);this.hud.sync();return;}
      this.ai.record('taunt-after-invasion',{world:this.world});
      if(this.world===2)this.ai.speak(this.fragments>=2?'corruptor':'world2Fragment',true);
      else this.ai.speak(this.boss&&this.boss.hp<=3?'lowHealth':'world3Start',true);
      this.audio.play('glitch');this.log('La IA ya no necesita que la provoques para recordarte.','danger');this.hud.sync();
    }
    finish(ending){this.ending=ending;this.screen='ending';this.audio.play(ending==='escalation'?'phase':'win');this.log(ending==='escalation'?'Proceso finalizado. Una entidad nueva ha cruzado la frontera.':'Proceso finalizado sin alterar el mundo original.',ending==='escalation'?'danger':'normal');this.hud.sync();}
    enterWorld2(){
      this.world=2;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;this.hazardTimer=1.5;
      YMM.Levels.world2.fragments.forEach(f=>f.taken=false);this.player={x:90,y:550,w:24,h:24,vx:0,vy:0,health:3,maxHealth:3,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
      this.ai.unlockInvasion();this.ai.speak('world2Fragment');this.ai.dialogueTimer=3.5;this.audio.play('portal');this.log('La IA ha cruzado al segundo juego. Las reglas ya no son las mismas.','danger');this.toast('MUNDO 02 — RECUPERA LOS FRAGMENTOS');this.hud.sync();
    }
    enterWorld3(){
      this.world=3;this.player={x:500,y:485,w:24,h:24,vx:0,vy:0,health:3,maxHealth:3,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
      this.boss={x:500,y:210,hp:8,maxHp:8,phase:'idle',attackType:'charge',timer:1.25,targetX:500,targetY:485,dx:0,dy:1,hitFlash:0,lastHitAt:-999,patternCount:0};
      this.ai.speak('world3Start');this.ai.dialogueTimer=3.8;this.audio.play('phase');this.log('La IA ha combinado capacidades de los mundos anteriores.','danger');this.toast('MUNDO 03 — APRENDE EL PATRÓN. CONTRAATACA.');this.hud.sync();
    }
    update(dt){
      this.clock+=dt;
      if(this.screen==='menu'){if(this.input.justPressed('Enter','Space')){this.audio.unlock();this.newGame();}this.input.endFrame();return;}
      if(this.screen==='paused'){if(this.input.justPressed('Escape'))this.resume();this.input.endFrame();return;}
      if(this.screen==='ending'){if(this.input.justPressed('Enter','Space'))this.newGame();this.input.endFrame();return;}
      if(this.input.justPressed('Escape')){this.pause();this.input.endFrame();return;}
      this.elapsed+=dt;this.player.invuln=Math.max(0,this.player.invuln-dt);this.player.tauntLock=Math.max(0,(this.player.tauntLock||0)-dt);this.player.attackTimer=Math.max(0,this.player.attackTimer-dt);this.player.dashTimer=Math.max(0,this.player.dashTimer-dt);this.player.dashCooldown=Math.max(0,this.player.dashCooldown-dt);this.player.stompFlash=Math.max(0,this.player.stompFlash-dt);
      if(this.ai.dialogueTimer>0)this.ai.dialogueTimer=Math.max(0,this.ai.dialogueTimer-dt);
      this.ai.observePlayerPosition(this.player.x,this.player.y,dt);
      if(this.input.justPressed('KeyT'))this.provoke('mock');if(this.input.justPressed('KeyG'))this.provoke('humiliate');
      if(this.input.justPressed('KeyR')){this.newGame();this.input.endFrame();return;}
      if(this.world===1)this.updateWorld1(dt);else if(this.world===2)this.updateWorld2(dt);else if(this.world===3)this.updateWorld3(dt);else if(this.world===4)this.updateWorld4(dt);else if(this.world===5)this.updateWorld5(dt);else this.updateWorld6(dt);
      this.ai.update(dt);this.particles.update(dt);
      if(this.elapsed-this.lastHudSync>.12){this.hud.sync();this.lastHudSync=this.elapsed;}
      this.input.endFrame();
    }
    solidsWorld1(){const L=YMM.Levels.world1;return [...L.floors.map(f=>({x:f.x,y:L.groundY,w:f.w,h:180,oneWay:false})),...this.world1Platforms.filter(p=>p.state!=='gone'&&p.state!=='falling').map(p=>({...p,h:p.h,oneWay:true,_source:p}))];}
    advanceCollapses(items,dt){
      for(const item of items||[]){
        if(item.state==='warning'){item.timer-=dt;if(item.timer<=0){item.state='falling';item.timer=.52;this.ai.observe('collapse');this.ai.record('terrain-collapse',{id:item.id,x:item.x});this.log('COLAPSO: una sección del escenario acaba de perder sus anclajes.','danger');}}
        else if(item.state==='falling'){item.timer-=dt;item.fallY=(item.fallY||0)+260*dt;if(item.timer<=0)item.state='gone';}
      }
    }
    triggerCollapse(item){
      const source=item&&item._source||item;if(!source||!source.collapse||source.state!=='stable')return;
      source.state='warning';source.timer=.7;this.audio.tone(125,.09,'sawtooth',.05,55);this.ai.observe('collapse');this.ai.record('collapse-warning',{id:source.id,x:source.x,world:this.world});
    }
    runnerSolids(){
      const L=YMM.Levels.world5;
      return [
        ...this.runnerFloors.filter(f=>f.state==='stable'||f.state==='warning').map(f=>({...f,y:L.groundY+(f.fallY||0),h:180,oneWay:false,_source:f})),
        ...this.runnerPlatforms.filter(p=>p.state==='stable'||p.state==='warning').map(p=>({...p,y:p.y+(p.fallY||0),h:p.h,oneWay:true,_source:p}))
      ];
    }
    updateWorld1(dt){
      const p=this.player,L=YMM.Levels.world1,left=this.input.isDown('ArrowLeft','KeyA'),right=this.input.isDown('ArrowRight','KeyD'),dir=p.tauntLock>0?0:(right?1:0)-(left?1:0);
      if(dir)p.lastDir=dir;
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.17;p.dashCooldown=1.05;this.ai.observe('dash');this.ai.observe(p.lastDir<0?'dashLeft':'dashRight');this.audio.play('attack');this.particles.burst(p.x+p.w/2,p.y+p.h/2,'#72f3dc',12,90);}
      p.vx=dir*(p.dashTimer>0?590:265);
      if(p.dashTimer>0&&dir===0)p.vx=p.lastDir*590;
      if(this.input.justPressed('Space','ArrowUp','KeyW')&&p.grounded){p.vy=-445;p.grounded=false;this.ai.observe('jump');this.audio.play('attack');this.particles.burst(p.x+p.w/2,p.y+p.h,'#72f3dc',7,60);}
      p.vy=Math.min(760,p.vy+1180*dt);
      const solids=this.solidsWorld1();p.x+=p.vx*dt;
      for(const s of solids){if(!s.oneWay&&YMM.Util.overlap(p,s)){if(p.vx>0)p.x=s.x-p.w;else if(p.vx<0)p.x=s.x+s.w;p.vx=0;}}
      p.x=YMM.Util.clamp(p.x,0,L.width-p.w);
      const previousY=p.y;p.y+=p.vy*dt;p.grounded=false;
      for(const s of solids){if(s.oneWay){if(p.vy>=0&&previousY+p.h<=s.y+5&&YMM.Util.overlap(p,s)){p.y=s.y-p.h;p.grounded=true;p.vy=0;}}else if(YMM.Util.overlap(p,s)){if(p.vy>0){p.y=s.y-p.h;p.grounded=true;}else if(p.vy<0)p.y=s.y+s.h;p.vy=0;}}
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
      this.sentinels=L.sentinels.map((s,i)=>({...s,id:i,role:['hunter','flanker','warden'][i],attackTimer:1.1+i*.55,windup:0,stun:0,hitFlash:0}));
      this.player={x:2.5,y:1.5,angle:0,vx:0,vy:0,health:4,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,parryTimer:0,combo:0,comboTimer:0};
      this.ai.unlockInvasion();this.ai.speak('corruptor');this.ai.dialogueTimer=3.5;this.audio.play('portal');
      this.log('MUNDO 04: la IA ha convertido el código en arquitectura. Busca tres fragmentos y encuentra la salida.','danger');
      this.toast('MUNDO 04 — THE NULL CATHEDRAL / 3D');this.hud.sync();
    }
    enterWorld6(){
      this.world=6;this.player={x:500,y:480,w:24,h:24,vx:0,vy:0,health:5,maxHealth:5,stamina:100,maxStamina:100,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0,parryTimer:0,combo:0,comboTimer:0};
      this.boss={x:500,y:190,hp:14,maxHp:14,phase:'idle',attackType:'lattice',timer:.9,targetX:500,targetY:480,dx:0,dy:1,hitFlash:0,lastHitAt:-999,patternCount:0,stagger:0};
      this.ai.speak('endThreat');this.ai.dialogueTimer=4;this.audio.play('phase');
      this.log('MUNDO 05: ya no queda ningún juego al que huir. Interrumpe sus ataques y destruye el núcleo.','danger');
      this.toast('MUNDO 05 — THE LAST ARGUMENT');this.hud.sync();
    }
    isWorld4Wall(x,y){
      const map=YMM.Levels.world4.map,tx=Math.floor(x),ty=Math.floor(y);
      return ty<0||ty>=map.length||tx<0||tx>=map[0].length||map[ty][tx]==='1';
    }
    updateWorld4(dt){
      const p=this.player,L=YMM.Levels.world4;
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
      for(const s of L.shards){if(!s.taken&&Math.hypot(p.x-s.x,p.y-s.y)<.58){s.taken=true;this.fragments++;this.ai.observe('collect');this.particles.burst(500,300,'#72f3dc',20,120);this.audio.play('collect');this.log('Fragmento de realidad adquirido: '+this.fragments+'/3. La IA ha empezado a recordar el espacio.','alert');this.toast('FRAGMENTO 3D '+this.fragments+'/3');this.ai.record('3d-shard',{count:this.fragments});}}
      if(this.input.justPressed('KeyJ','Space','KeyF')&&p.attackTimer<=0){
        p.attackTimer=this.input.isDown('KeyF')?.48:.32;p.combo=(p.combo%3)+1;p.comboTimer=1.2;this.ai.observe('attack');this.audio.play('attack');
        let target=null,best=Infinity;
        for(const s of this.sentinels){const d=Math.hypot(p.x-s.x,p.y-s.y),angle=Math.atan2(s.y-p.y,s.x-p.x),diff=Math.abs(Math.atan2(Math.sin(angle-p.angle),Math.cos(angle-p.angle)));if(d<1.38&&diff<.95&&d<best&&s.hp>0){target=s;best=d;}}
        if(target){target.hp-=this.input.isDown('KeyF')?2:1;target.hitFlash=.2;target.stun=.65;this.particles.burst(500,300,'#ffcf79',18,110);this.audio.play('hit');this.log('Contraataque '+p.combo+'/3: centinela '+(target.hp<=0?'destruido':'interrumpido')+'.','alert');this.ai.reportOutcome('pressure',true);}
        else this.particles.burst(500,300,'#72f3dc',6,55);
      }
      if(this.input.justPressed('KeyE')&&Math.hypot(p.x-L.exit.x,p.y-L.exit.y)<1.25){if(this.fragments>=3)this.enterWorld5();else this.toast('SALIDA BLOQUEADA: '+(3-this.fragments)+' FRAGMENTOS PENDIENTES');}
      for(const s of this.sentinels){
        if(s.hp<=0)continue;s.stun=Math.max(0,s.stun-dt);s.hitFlash=Math.max(0,s.hitFlash-dt);s.attackTimer-=dt;const wasLocking=s.windup>0;s.windup=Math.max(0,s.windup-dt);
        const d=Math.hypot(p.x-s.x,p.y-s.y),a=Math.atan2(p.y-s.y,p.x-s.x);
        if(d<6&&s.stun<=0){
          let tx=p.x,ty=p.y;
          if(s.role==='flanker'){const side=s.id%2?1:-1;tx=p.x+Math.cos(a+Math.PI/2*side)*.9+p.vx*.004;ty=p.y+Math.sin(a+Math.PI/2*side)*.9+p.vy*.004;}
          if(s.role==='warden'&&d<2.5){tx=s.x;ty=s.y;}
          const ang=Math.atan2(ty-s.y,tx-s.x),step=Math.min((s.role==='flanker'?.72:.85)*dt,Math.max(0,Math.hypot(tx-s.x,ty-s.y)-(s.role==='warden'?2.2:.62))),nx=s.x+Math.cos(ang)*step,ny=s.y+Math.sin(ang)*step;
          if(!this.isWorld4Wall(nx,ny)){s.x=nx;s.y=ny;}
        }
        if(s.role==='warden'&&d<4.1&&s.attackTimer<=0&&s.windup<=0){s.windup=.42;s.attackTimer=1.9;this.ai.record('warden-lock',{distance:+d.toFixed(2)});}
        if(wasLocking&&s.windup===0&&d<4.1&&p.invuln<=0){this.damagePlayer(1,'El centinela fijó tu posición. Muévete en cuanto veas la señal roja.');}
        if(s.role!=='warden'&&d<.72&&s.attackTimer<=0&&p.invuln<=0){s.attackTimer=1.5;this.damagePlayer(1,'El cazador ha cerrado la distancia. Gira, ataca y rompe su avance.');}
      }
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
          if(b.hp<=0){this.ai.speak('endThreat');this.finish('escalation');return;}
        }else if(d<145)this.toast(b.phase==='vulnerable'?'Golpe demasiado corto.':'El núcleo está blindado: busca la ventana tras el ataque.');}
      b.hitFlash=Math.max(0,b.hitFlash-dt);b.stagger=Math.max(0,(b.stagger||0)-dt);b.timer-=dt;
      if(b.stagger>0)return;
      if(b.phase==='idle'&&b.timer<=0){
        const profile=this.ai.profile;b.attackType=profile.still>.34?'ring':profile.dash>.24?'feint':profile.retreat>.27?'lunge':'lattice';
        b.patternCount++;b.targetX=YMM.Util.clamp(p.x+p.vx*.32,90,910);b.targetY=YMM.Util.clamp(p.y+p.vy*.32,100,520);
        const dd=Math.hypot(b.targetX-b.x,b.targetY-b.y)||1;b.dx=(b.targetX-b.x)/dd;b.dy=(b.targetY-b.y)/dd;b.phase='telegraph';b.timer=b.attackType==='ring'?.9:.7;
        this.ai.record('final-boss-policy',{attack:b.attackType,profile});this.audio.tone(145,.15,'sawtooth',.08,55);
      }else if(b.phase==='telegraph'&&b.timer<=0){
        if(b.attackType==='ring'){b.phase='ring';b.timer=.55;}
        else if(b.attackType==='feint'){b.phase='fakeout';b.timer=.35;}
        else{b.phase='charge';b.timer=b.attackType==='lunge'?.34:.42;this.audio.play('boss');}
      }else if(b.phase==='fakeout'&&b.timer<=0){b.targetX=YMM.Util.clamp(p.x+p.vx*.42,90,910);b.targetY=YMM.Util.clamp(p.y+p.vy*.42,100,520);const d=Math.hypot(b.targetX-b.x,b.targetY-b.y)||1;b.dx=(b.targetX-b.x)/d;b.dy=(b.targetY-b.y)/d;b.phase='charge';b.timer=.3;}
      else if(b.phase==='charge'){
        b.x+=b.dx*(b.attackType==='lunge'?790:570)*dt;b.y+=b.dy*(b.attackType==='lunge'?790:570)*dt;b.x=YMM.Util.clamp(b.x,100,900);b.y=YMM.Util.clamp(b.y,100,520);
        if(Math.hypot(p.x-b.x,p.y-b.y)<40&&p.invuln<=0){if(p.parryTimer>0){b.stagger=.8;b.phase='vulnerable';b.timer=1.2;this.log('PARADA PERFECTA. La IA ha perdido su turno.','alert');this.particles.burst(b.x,b.y,'#72f3dc',30,170);}else this.damagePlayer(1,'El ataque final te alcanzó. Esquiva o pulsa E justo antes del impacto.');}
        if(b.timer<=0||b.x===100||b.x===900||b.y===100||b.y===520){b.phase='vulnerable';b.timer=1.05;this.particles.burst(b.x,b.y,'#ff617c',22,125);this.log('El núcleo está abierto: encadena ataques fuertes con F.','alert');}
      }else if(b.phase==='ring'){
        const d=Math.hypot(p.x-b.x,p.y-b.y);if(d<170&&p.invuln<=0){if(p.parryTimer>0){b.stagger=.7;b.phase='vulnerable';b.timer=1;this.log('La onda ha sido repelida. Contraataca.','alert');}else this.damagePlayer(1,'Onda de choque: abandona el radio o usa el dash.');}
        if(b.timer<=0){b.phase='vulnerable';b.timer=.78;}
      }else if(b.phase==='vulnerable'&&b.timer<=0){b.phase='idle';b.timer=.48;}
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
      b.hitFlash=Math.max(0,b.hitFlash-dt);b.timer-=dt;
      if(b.phase==='idle'&&b.timer<=0){
        const profile=this.ai.profile;
        b.attackType=profile.still>.37?'pulse':profile.dash>.22&&(profile.dashLeft+profile.dashRight)>.2?'feint':profile.retreat>.29?'intercept':'charge';
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
        b.x+=b.dx*(b.attackType==='intercept'?690:625)*dt;b.y+=b.dy*(b.attackType==='intercept'?690:625)*dt;b.x=YMM.Util.clamp(b.x,105,895);b.y=YMM.Util.clamp(b.y,105,515);
        if(Math.hypot(p.x-b.x,p.y-b.y)<38&&p.invuln<=0)this.damagePlayer(1,'La carga te alcanzó. Esquiva durante la señal, no después.');
        if(b.timer<=0||b.x===105||b.x===895||b.y===105||b.y===515){b.phase='vulnerable';b.timer=1.04;this.particles.burst(b.x,b.y,'#ff617c',16,90);this.log('Núcleo expuesto. Contraataca ahora.','alert');}
      }else if(b.phase==='pulse'){
        if(Math.hypot(p.x-b.x,p.y-b.y)<152&&p.invuln<=0)this.damagePlayer(1,'La onda te alcanzó. La próxima vez sal de su radio.');if(b.timer<=0){b.phase='vulnerable';b.timer=.86;this.particles.burst(b.x,b.y,'#ff617c',16,90);this.log('La IA ha agotado su pulso. Núcleo expuesto.','alert');}
      }else if(b.phase==='vulnerable'&&b.timer<=0){b.phase='idle';b.timer=.62;}
    }
    damagePlayer(amount,message){
      const p=this.player;if(p.invuln>0)return;p.health-=amount;p.invuln=1.15;this.audio.play('hit');this.particles.burst(p.x,p.y,'#ff617c',16,100);this.log(message,'danger');this.toast(message);
      
      if(p.health<=0){if(this.world===3||this.world===6){p.health=this.world===6?5:3;p.x=500;p.y=this.world===6?480:485;this.boss.x=500;this.boss.y=this.world===6?190:210;this.boss.phase='idle';this.boss.timer=1.1;this.log('Reinicio de emergencia. El núcleo conserva el daño recibido.','alert');}
        else if(this.world===4){p.health=4;p.x=2.5;p.y=1.5;p.angle=0;this.log('Reinicio en la entrada de la catedral. Los fragmentos y daños persisten.','alert');}
        else{p.health=3;p.x=this.world===1?this.lastCheckpoint:90;p.y=this.world===1?430:550;p.vx=0;p.vy=0;this.log('Punto de restauración activado. La memoria del antagonista persiste.','alert');}}
    }
    frame(dt){this.update(Math.min(.033,Math.max(.001,dt)));this.renderer.render(this);}
  }
  YMM.Game=Game;
})(globalThis);

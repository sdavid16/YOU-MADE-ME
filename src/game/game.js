(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class Game {
    constructor(canvas,hud){
      this.canvas=canvas;this.input=new YMM.Input();this.audio=new YMM.AudioSystem();this.renderer=new YMM.Renderer(canvas);this.particles=new YMM.ParticleSystem();this.hud=hud;
      this.elapsed=0;this.clock=0;this.screen='menu';this.world=1;this.ending=null;this.lastHudSync=0;this.camera=0;this.logHistory=[];this.ai=new YMM.AntagonistAI(this);this.newGame(true);this.screen='menu';
    }
    newGame(keepMenu=false){
      this.elapsed=0;this.world=1;this.ending=null;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;this.hazardTimer=1.6;this.boss=null;this.logHistory=[];this.particles.items=[];this.ai.reset();
      this.player={x:75,y:482,w:28,h:38,vx:0,vy:0,grounded:false,health:3,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
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
      if(this.world===1){this.ai.taunt(kind);this.hud.sync();return;}
      this.ai.record('taunt-after-invasion',{world:this.world});
      if(this.world===2)this.ai.speak(this.fragments>=2?'corruptor':'world2Fragment',true);
      else this.ai.speak(this.boss&&this.boss.hp<=3?'lowHealth':'world3Start',true);
      this.audio.play('glitch');this.log('La IA ya no necesita que la provoques para recordarte.','danger');this.hud.sync();
    }
    finish(ending){this.ending=ending;this.screen='ending';this.audio.play(ending==='escalation'?'phase':'win');this.log(ending==='escalation'?'Proceso finalizado. Una entidad nueva ha cruzado la frontera.':'Proceso finalizado sin alterar el mundo original.',ending==='escalation'?'danger':'normal');this.hud.sync();}
    enterWorld2(){
      this.world=2;this.camera=0;this.fragments=0;this.uplinkActive=false;this.hazard=null;this.hazardTimer=1.5;
      YMM.Levels.world2.fragments.forEach(f=>f.taken=false);this.player={x:90,y:550,w:24,h:24,vx:0,vy:0,health:3,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
      this.ai.unlockInvasion();this.ai.speak('world2Fragment');this.ai.dialogueTimer=3.5;this.audio.play('portal');this.log('La IA ha cruzado al segundo juego. Las reglas ya no son las mismas.','danger');this.toast('MUNDO 02 — RECUPERA LOS FRAGMENTOS');this.hud.sync();
    }
    enterWorld3(){
      this.world=3;this.player={x:500,y:485,w:24,h:24,vx:0,vy:0,health:3,invuln:0,attackTimer:0,dashTimer:0,dashCooldown:0,lastDir:1,stompFlash:0};
      this.boss={x:500,y:210,hp:8,maxHp:8,phase:'idle',attackType:'charge',timer:1.25,targetX:500,targetY:485,dx:0,dy:1,hitFlash:0,lastHitAt:-999,patternCount:0};
      this.ai.speak('world3Start');this.ai.dialogueTimer=3.8;this.audio.play('phase');this.log('La IA ha combinado capacidades de los mundos anteriores.','danger');this.toast('MUNDO 03 — APRENDE EL PATRÓN. CONTRAATACA.');this.hud.sync();
    }
    update(dt){
      this.clock+=dt;
      if(this.screen==='menu'){if(this.input.justPressed('Enter','Space')){this.audio.unlock();this.newGame();}this.input.endFrame();return;}
      if(this.screen==='paused'){if(this.input.justPressed('Escape'))this.resume();this.input.endFrame();return;}
      if(this.screen==='ending'){if(this.input.justPressed('Enter','Space'))this.newGame();this.input.endFrame();return;}
      if(this.input.justPressed('Escape')){this.pause();this.input.endFrame();return;}
      this.elapsed+=dt;this.player.invuln=Math.max(0,this.player.invuln-dt);this.player.attackTimer=Math.max(0,this.player.attackTimer-dt);this.player.dashTimer=Math.max(0,this.player.dashTimer-dt);this.player.dashCooldown=Math.max(0,this.player.dashCooldown-dt);this.player.stompFlash=Math.max(0,this.player.stompFlash-dt);
      if(this.ai.dialogueTimer>0)this.ai.dialogueTimer=Math.max(0,this.ai.dialogueTimer-dt);
      this.ai.observePlayerPosition(this.player.x,this.player.y,dt);
      if(this.input.justPressed('KeyT'))this.provoke('mock');
      if(this.input.justPressed('KeyR')){this.newGame();this.input.endFrame();return;}
      if(this.world===1)this.updateWorld1(dt);else if(this.world===2)this.updateWorld2(dt);else this.updateWorld3(dt);
      this.ai.update(dt);this.particles.update(dt);
      if(this.elapsed-this.lastHudSync>.12){this.hud.sync();this.lastHudSync=this.elapsed;}
      this.input.endFrame();
    }
    solidsWorld1(){const L=YMM.Levels.world1;return [...L.floors.map(f=>({x:f.x,y:L.groundY,w:f.w,h:180,oneWay:false})),...L.platforms.map(p=>({...p,h:p.h,oneWay:true}))];}
    updateWorld1(dt){
      const p=this.player,L=YMM.Levels.world1,left=this.input.isDown('ArrowLeft','KeyA'),right=this.input.isDown('ArrowRight','KeyD'),dir=(right?1:0)-(left?1:0);
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
      if(this.ai.phase>=2&&this.ai.activeStrategy==='anti-air'&&p.y<455&&near&&e.counterCooldown<=0&&!(e.counterWindup>0)){e.counterWindup=.55;e.counterCooldown=3.7;this.ai.reportOutcome('anti-air',false);this.log('La IA se coloca donde calcula que vas a caer.','danger');}
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
    updateWorld3(dt){
      const p=this.player,b=this.boss;let dx=(this.input.isDown('ArrowRight','KeyD')?1:0)-(this.input.isDown('ArrowLeft','KeyA')?1:0),dy=(this.input.isDown('ArrowDown','KeyS')?1:0)-(this.input.isDown('ArrowUp','KeyW')?1:0);if(dx&&dy){dx*=.7071;dy*=.7071;}
      if(dx)p.lastDir=dx;
      if(this.input.justPressed('ShiftLeft','ShiftRight')&&p.dashCooldown<=0){p.dashTimer=.2;p.dashCooldown=.95;this.ai.observe('dash');this.ai.observe(p.lastDir<0?'dashLeft':'dashRight');this.audio.play('attack');this.particles.burst(p.x,p.y,'#72f3dc',12,85);}
      const speed=p.dashTimer>0?620:230;p.vx=dx*speed;p.vy=dy*speed;p.x+=p.vx*dt;p.y+=p.vy*dt;p.x=YMM.Util.clamp(p.x,90,910);p.y=YMM.Util.clamp(p.y,100,520);
      if(this.input.justPressed('KeyJ')&&p.attackTimer<=0){
        p.attackTimer=.22;this.ai.observe('attack');this.audio.play('attack');this.particles.burst(p.x,p.y,'#72f3dc',8,65);const dist=Math.hypot(p.x-b.x,p.y-b.y);
        if(b.phase==='vulnerable'&&dist<112){b.hp=Math.max(0,b.hp-1);b.hitFlash=.2;b.lastHitAt=this.elapsed;this.particles.burst(b.x,b.y,'#72f3dc',22,140);this.audio.tone(720,.09,'triangle',.2,240);this.log('Impacto confirmado. Núcleo: '+b.hp+'/'+b.maxHp+'.','alert');this.ai.record('bossHit',{hp:b.hp,attack:b.attackType});
          if(b.hp===4){this.ai.speak('lowHealth');this.ai.dialogueTimer=2.5;this.log('La IA está cambiando de táctica.','danger');}
          if(b.hp<=0){this.ai.speak('endThreat');this.ai.dialogueTimer=4;this.finish('escalation');return;}
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
      if(this.world===1&&this.enemy&&this.enemy.strategy)this.ai.reportOutcome(this.enemy.strategy,true);
      if(p.health<=0){if(this.world===3){p.health=3;p.x=500;p.y=485;this.boss.x=500;this.boss.y=210;this.boss.phase='idle';this.boss.timer=1.1;this.log('Reinicio de emergencia. El núcleo conserva el daño recibido.','alert');}
        else{p.health=3;p.x=this.world===1?this.lastCheckpoint:90;p.y=this.world===1?430:550;p.vx=0;p.vy=0;this.log('Punto de restauración activado. La memoria del antagonista persiste.','alert');}}
    }
    frame(dt){this.update(Math.min(.033,Math.max(.001,dt)));this.renderer.render(this);}
  }
  YMM.Game=Game;
})(globalThis);

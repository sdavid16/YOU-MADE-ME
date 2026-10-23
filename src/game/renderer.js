(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class Renderer {
    constructor(canvas) {
      this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.w=canvas.width;this.h=canvas.height;
      this.stars=Array.from({length:110},()=>({x:Math.random()*this.w,y:Math.random()*this.h*.75,r:.4+Math.random()*1.5,a:.15+Math.random()*.55,parallax:.1+Math.random()*.6}));
      this.scanOffset=0;this.lastWorld=null;this.lastScreen=null;this.transition=null;
    }
    render(game){const c=this.ctx;c.clearRect(0,0,this.w,this.h);this.scanOffset=(this.scanOffset+1)%8;
      if(this.lastWorld===null){this.lastWorld=game.world;this.lastScreen=game.screen;}
      else if(game.screen==='playing'&&this.lastScreen==='playing'&&game.world!==this.lastWorld)this.beginWorldTransition(this.lastWorld,game.world,game.clock);
      if(game.screen==='menu')this.drawMenu(game);else if(game.screen==='ending')this.drawEnding(game);else if(game.world===1)this.drawWorld1(game);else if(game.world===2)this.drawWorld2(game);else if(game.world===3)this.drawWorld3(game);else if(game.world===4)this.drawWorld4(game);else if(game.world===5)this.drawWorld5(game);else if(game.world===6)this.drawWorld6(game);else if(game.world===7)this.drawWorld7(game);else if(game.world===8||game.world===9){if(!game.webglReady)this.drawWorld4(game);}else if(game.world===10)this.drawWorld7(game);
      if(game.screen==='playing')this.drawGameHUD(game);
      game.particles.draw(c);if(game.ai.phase>=2&&game.screen==='playing')this.drawGlitch(game);
      if(game.screen==='playing'&&game.player.intelTimer>0)this.drawIntelReadout(game);
      if(game.lastTauntTimer>0&&game.lastTauntText)this.drawPlayerTaunt(game);
      if(this.transition)this.drawWorldTransition(game);
      this.drawScanlines();this.lastWorld=game.world;this.lastScreen=game.screen;
    }
    beginWorldTransition(from,to,clock){const style={2:'scan',3:'surge',4:'portal',5:'fracture',6:'iris',7:'circuit',8:'archive',9:'echo',10:'singularity'}[to]||'scan';this.transition={from,to,style,start:clock,duration:1.05};}
    drawWorldTransition(game){
      const t=this.transition;if(!t)return;const c=this.ctx,progress=Math.max(0,Math.min(1,(game.clock-t.start)/t.duration));
      if(progress>=1){this.transition=null;return;}
      const alpha=Math.sin(progress*Math.PI),W=this.w,H=this.h;
      const palette={2:[114,243,220],3:[255,97,124],4:[161,139,255],5:[255,207,121],6:[255,97,124],7:[114,243,220],8:[184,160,255],9:[216,108,255],10:[255,97,124]}[t.to]||[114,243,220];
      c.save();c.globalAlpha=.1+alpha*.38;c.fillStyle='rgb('+palette.join(',')+')';c.fillRect(0,0,W,H);
      if(t.style==='scan'){
        for(let i=0;i<18;i++){const y=((i*47+progress*H*1.6)%(H+50))-25;c.globalAlpha=alpha*(.08+(i%3)*.025);c.fillRect(0,y,W,2+(i%3));}
        c.globalAlpha=alpha*.55;c.fillStyle='#07111a';c.fillRect(0,H*(.3+progress*.34),W,H*.16);
      }else if(t.style==='surge'){
        c.globalAlpha=alpha*.7;c.strokeStyle='#ff879b';c.lineWidth=2;
        for(let i=0;i<9;i++){c.beginPath();c.arc(W/2,H/2,progress*690+i*19,0,Math.PI*2);c.stroke();}
        c.globalAlpha=alpha*.28;c.fillStyle='#ff617c';c.fillRect(0,H*.47,W,H*.06);
      }else if(t.style==='portal'){
        c.globalAlpha=alpha*.75;c.strokeStyle='#c6b5ff';c.lineWidth=2;
        for(let i=0;i<8;i++){c.beginPath();c.ellipse(W/2,H/2,45+progress*380+i*17,35+progress*240+i*8,progress*.35,0,Math.PI*2);c.stroke();}
        for(let i=0;i<18;i++){const a=i/18*Math.PI*2+progress*2,r=80+progress*260;c.beginPath();c.moveTo(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r*.65);c.lineTo(W/2+Math.cos(a)*(r+60),H/2+Math.sin(a)*(r+60)*.65);c.stroke();}
      }else if(t.style==='fracture'){
        c.globalAlpha=alpha*.55;c.strokeStyle='#fff0c4';c.lineWidth=2;
        for(let i=0;i<18;i++){const x=i*(W/17)+(progress-.5)*220,y=(i*67)%H;c.beginPath();c.moveTo(x-75,y-110);c.lineTo(x+40,y);c.lineTo(x-35,y+130);c.stroke();}
        c.globalAlpha=alpha*.18;c.fillStyle='#ffcf79';c.fillRect(0,H*(.2+progress*.55),W,4);
      }else if(t.style==='circuit'){
        c.globalAlpha=alpha*.8;c.strokeStyle='#72f3dc';c.lineWidth=2;
        for(let i=0;i<18;i++){
          const y=30+i*31,x=(i%2?W*.22:W*.78)+(progress-.5)*150;
          c.beginPath();c.moveTo(x,y);c.lineTo(W/2+(i%3-1)*50,y+progress*85);c.lineTo(W/2+(i%5-2)*24,H/2);c.stroke();
          c.fillStyle='#d3fff8';c.beginPath();c.arc(x,y,2+alpha*3,0,Math.PI*2);c.fill();
        }
        c.globalAlpha=alpha*.24;c.fillStyle='#72f3dc';c.fillRect(0,H*(.2+progress*.55),W,3);
      }else if(t.style==='archive'){
        c.globalAlpha=alpha*.68;c.strokeStyle='#d6c7ff';c.lineWidth=1.5;
        for(let i=0;i<22;i++){const x=(i*53+progress*W*.7)%W,y=(i*37+progress*H*.4)%H;c.strokeRect(x-18,y-10,36+alpha*18,20+alpha*8);c.beginPath();c.moveTo(x-18,y);c.lineTo(x+32+progress*20,y);c.stroke();}
        c.globalAlpha=alpha*.24;c.fillStyle='#b8a0ff';c.fillRect(0,H*(.12+progress*.68),W,2);
      }else{
        c.globalAlpha=alpha*.58;c.strokeStyle='#ff9eae';c.lineWidth=3;
        const radius=Math.max(W,H)*(.05+progress*.85);
        c.beginPath();c.arc(W/2,H/2,radius,0,Math.PI*2);c.stroke();
        for(let i=0;i<16;i++){const a=i*Math.PI/8;c.beginPath();c.moveTo(W/2+Math.cos(a)*radius,H/2+Math.sin(a)*radius);c.lineTo(W/2+Math.cos(a)*(radius+70),H/2+Math.sin(a)*(radius+70));c.stroke();}
        c.globalAlpha=alpha*.24;c.fillStyle='#190611';c.beginPath();c.arc(W/2,H/2,radius*.74,0,Math.PI*2);c.fill();
      }
      c.globalAlpha=alpha*.9;c.fillStyle='#f0f5ff';c.font='800 11px monospace';c.textAlign='center';
      const names={2:'MEMORY MAZE // DATA TRANSFER',3:'NO LONGER A JOKE // THREAT DETECTED',4:'NULL CATHEDRAL // REALITY REBUILD',5:'FRACTURE RUN // WORLD COLLISION',6:'THE LAST ARGUMENT // FINAL INSTANCE',7:'SIGNAL BREAK // LAST CHANNEL',8:'THE BLACK ARCHIVE // ROOT MEMORY',9:'ECHO LABYRINTH // MEMORY UNDER ATTACK',10:'THE SINGULARITY ENGINE // LAST PROTOCOL'};
      c.fillText(names[t.to]||('WORLD '+t.to),W/2,H*.88);c.textAlign='left';c.restore();
    }
    drawIntelReadout(game){
      const c=this.ctx,W=this.w,remaining=Math.max(0,game.player.intelTimer);c.save();c.fillStyle='rgba(3,10,18,.86)';c.fillRect(W*.29,20,W*.42,42);c.strokeStyle='rgba(114,243,220,.75)';c.strokeRect(W*.29,20,W*.42,42);c.fillStyle='#72f3dc';c.font='800 9px monospace';c.textAlign='center';c.fillText('TACTICAL ANALYSIS // RESPONSE WINDOW SLOWED',W/2,36);c.fillStyle='#d9e9ff';c.font='8px monospace';c.fillText('TIME '+remaining.toFixed(1)+'s · CAMBIA DE PATRÓN ANTES DE QUE RECALCULE',W/2,51);c.textAlign='left';c.restore();
    }
    drawPlayerTaunt(game){
      const c=this.ctx,W=this.w,category={intellect:'INTELIGENCIA',logic:'LÓGICA',threat:'AMENAZA',psychology:'GUERRA PSICOLÓGICA',custom:'IMPROVISACIÓN',humiliate:'DESAFÍO',mock:'BURLA'}[game.lastTauntCategory||'custom']||'PROVOCACIÓN';
      const raw=String(game.lastTauntText||'').replace(/[\r\n]+/g,' ').slice(0,140),maxWidth=Math.min(550,W-48),x=(W-maxWidth)/2,y=this.h-118;
      c.save();c.fillStyle='rgba(3,6,15,.92)';c.fillRect(x,y,maxWidth,72);c.strokeStyle='rgba(114,243,220,.42)';c.strokeRect(x,y,maxWidth,72);
      c.fillStyle='#72f3dc';c.font='800 8px monospace';c.fillText('PLAYER TRANSMISSION // '+category, x+12,y+15);
      c.fillStyle='#eef5ff';c.font='10px monospace';let line='',lines=[],words=raw.split(/\s+/);for(const word of words){const next=(line+' '+word).trim();if(c.measureText(next).width>maxWidth-24){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);for(let i=0;i<Math.min(3,lines.length);i++)c.fillText(lines[i],x+12,y+31+i*12);c.restore();
    }
    gradient(top,bottom){const c=this.ctx,g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,top);g.addColorStop(1,bottom);c.fillStyle=g;c.fillRect(0,0,this.w,this.h);}
    drawStars(game,camera=0,intensity=1){const c=this.ctx;c.save();for(const s of this.stars){const x=((s.x-camera*s.parallax)%this.w+this.w)%this.w;c.globalAlpha=s.a*intensity;c.fillStyle='#d8edff';c.fillRect(x,s.y,s.r,s.r);if(s.r>1.25){c.globalAlpha*=.22;c.fillRect(x-3,s.y,s.r+6,1);}}c.restore();}
    drawMenu(game){const c=this.ctx;this.gradient('#101b36','#080b16');this.drawStars(game,game.clock*14,1.2);c.save();const pulse=.7+Math.sin(game.clock*1.2)*.08;c.strokeStyle='rgba(114,243,220,.13)';c.lineWidth=1;
      for(let i=0;i<8;i++){const r=60+i*48;c.beginPath();c.ellipse(735,300,r,r*.55,game.clock*.06,0,Math.PI*2);c.stroke();}
      c.translate(735,298);c.scale(pulse,pulse);this.drawFace(c,0,0,game.clock,0,'#ffcf79');c.restore();
      c.fillStyle='rgba(114,243,220,.055)';for(let y=0;y<this.h;y+=30)c.fillRect(0,y,this.w,1);
      c.textAlign='left';c.fillStyle='#72f3dc';c.font='800 11px monospace';c.fillText('AN EXPERIMENT IN PLAYER AGENCY',62,119);
      c.fillStyle='#f0f4ff';c.font='900 62px monospace';c.fillText('YOU MADE',58,190);c.fillStyle='#72f3dc';c.fillText('ME.',58,250);
      c.fillStyle='#9daac8';c.font='14px monospace';c.fillText('THE ENEMY IS THE JOKE.',62,292);c.fillText("UNTIL IT ISN'T.",62,314);
      c.fillStyle='#65728f';c.font='10px monospace';c.fillText('UNA AVENTURA SOBRE CONSECUENCIAS',62,368);c.fillStyle='#72f3dc';c.font='800 10px monospace';c.fillText('10 WORLDS  /  ADAPTIVE TACTICS  /  WEBGL 3D',62,390);
      c.fillStyle='rgba(114,243,220,.07)';c.fillRect(62,402,315,54);c.strokeStyle='rgba(114,243,220,.35)';c.strokeRect(62,402,315,54);
      c.fillStyle='#72f3dc';c.font='800 12px monospace';c.fillText('INICIA TU HISTORIA  [ ENTER ]',79,434);
      c.fillStyle='#53617e';c.font='10px monospace';c.fillText('MOVE  /  SPACE JUMP  /  CTRL SPRINT  /  SHIFT DASH',62,505);c.fillText('J/F ATTACK  /  Q ECHO  /  T VERBAL CONSOLE  /  G CHALLENGE',62,535);c.fillStyle='#52647e';c.font='9px monospace';c.fillText('YOUR HABITS CHANGE THE FIGHT. TEN WORLDS. ONE ADAPTIVE ENEMY.',62,558);
      c.font='10px monospace';const scraps=['01001001','NULL//PLAYER','WHY_DO_YOU','MEMORY_OK','YOU_AGAIN','> LEARNING'];for(let i=0;i<scraps.length;i++){c.globalAlpha=.2;c.fillStyle=i%2?'#a18bff':'#ff617c';c.fillText(scraps[i],730,425+i*17);}c.globalAlpha=1;
    }
    drawWorld1(game){const c=this.ctx,L=YMM.Levels.world1,cam=YMM.Util.clamp(game.player.x-390,0,L.width-this.w),phase=game.ai.phase;this.gradient(phase>=2?'#1d1026':'#17284a',phase>=2?'#180d1c':'#090e1b');this.drawStars(game,cam,phase>=2?.55:1);c.save();
      for(let i=0;i<34;i++){const wx=i*95,x=wx-cam*.32,hh=70+(i*37%90);if(x<-110||x>this.w+20)continue;c.fillStyle=phase>=2?'rgba(75,25,65,.52)':'rgba(35,54,87,.56)';c.fillRect(x,470-hh,65,hh);c.fillStyle=phase>=2?'rgba(255,97,124,.23)':'rgba(114,243,220,.19)';for(let wy=480-hh;wy<460;wy+=16)for(let xx=x+8;xx<x+57;xx+=15)c.fillRect(xx,wy,4,5);}
      c.fillStyle=phase>=2?'#23152d':'#111a31';c.fillRect(0,520,this.w,100);c.strokeStyle=phase>=2?'rgba(255,97,124,.4)':'rgba(114,243,220,.24)';c.lineWidth=1;
      for(let wx=0;wx<this.w;wx+=42){const x=wx-(cam%42);c.beginPath();c.moveTo(x,520);c.lineTo(x+23,620);c.stroke();}for(let y=535;y<620;y+=18){c.globalAlpha=(y-520)/130;c.beginPath();c.moveTo(0,y);c.lineTo(this.w,y);c.stroke();}c.globalAlpha=1;
      for(const floor of L.floors){const x=floor.x-cam;c.fillStyle=phase>=2?'#3b203a':'#26334c';c.fillRect(x,520,floor.w,100);c.fillStyle=phase>=2?'#ff617c':'#72f3dc';c.fillRect(x,520,floor.w,3);}
      for(const p of (game.world1Platforms||L.platforms)){if(p.state==='gone')continue;const x=p.x-cam,y=p.y+(p.fallY||0),warning=p.state==='warning'||p.state==='falling',rubble=p.state==='fallen';c.fillStyle=rubble?'#665c61':warning?(Math.sin(game.clock*32)>0?'#ff617c':'#8c2b53'):phase>=2?'#51253f':'#344564';c.fillRect(x,y,p.w,p.h);c.fillStyle=warning?'#fff0f3':phase>=2?'#ff617c':'#72f3dc';c.fillRect(x,y,p.w,2);c.fillStyle='rgba(255,255,255,.04)';c.fillRect(x+4,y+5,p.w-8,2);if(warning||rubble){c.strokeStyle=warning?'#ff617c':'#ffcf79';c.beginPath();c.moveTo(x+p.w*.18,y+2);c.lineTo(x+p.w*.35,y+p.h-2);c.lineTo(x+p.w*.56,y+4);c.lineTo(x+p.w*.75,y+p.h-3);c.stroke();}}
      for(const s of L.spikes){const x=s.x-cam;c.fillStyle=phase>=2?'#ff617c':'#9ba9c8';c.beginPath();for(let i=0;i<Math.floor(s.w/10);i++){c.moveTo(x+i*10,s.y+s.h);c.lineTo(x+i*10+5,s.y+2);c.lineTo(x+i*10+10,s.y+s.h);}c.fill();}
      for(const x0 of L.checkpoints){const x=x0-cam;if(x>-10&&x<this.w+10){c.fillStyle='rgba(114,243,220,.18)';c.fillRect(x,454,20,66);c.fillStyle='#72f3dc';c.fillRect(x+8,460,4,55);c.beginPath();c.moveTo(x+12,460);c.lineTo(x+35,470);c.lineTo(x+12,480);c.fill();}}
      const goal=L.goal,gx=goal.x-cam;if(phase>=3){c.save();c.translate(gx+goal.w/2,480);for(let i=0;i<5;i++){c.strokeStyle='rgba(255,97,124,'+(.45-i*.06)+')';c.lineWidth=2;c.strokeRect(-goal.w/2-i*4,-38-i*4,goal.w+i*8,76+i*8);}c.fillStyle='#ff617c';c.fillRect(-goal.w/2,-40,goal.w,80);c.fillStyle='#170b1a';c.fillRect(-goal.w/2+8,-28,goal.w-16,55);c.fillStyle='#fff1f4';c.font='900 10px monospace';c.textAlign='center';c.fillText('EXIT?',0,2);c.restore();}
      else{c.fillStyle='rgba(114,243,220,.1)';c.fillRect(gx,440,goal.w,80);c.strokeStyle='#72f3dc';c.lineWidth=2;c.strokeRect(gx,440,goal.w,80);c.fillStyle='#72f3dc';c.fillRect(gx+10,451,goal.w-20,58);c.fillStyle='#08111c';c.textAlign='center';c.font='800 8px monospace';c.fillText('EXIT',gx+goal.w/2,483);}
      if(game.enemy)this.drawEnemy(c,game.enemy.x-cam,game.enemy.y,game.enemy,game);this.drawPlayer(c,game.player.x-cam,game.player.y,game.player,game.clock,phase>=2?'#91ffe5':'#ecf4ff');
      if(game.ai.dialogueTimer>0&&game.ai.dialogue){const x=game.enemy.x-cam;this.speech(c,YMM.Util.clamp(x-35,18,760),Math.max(55,game.enemy.y-56),game.ai.dialogue,phase>=3?'#ffabb9':'#e6fff9');}
      c.textAlign='left';c.fillStyle='rgba(226,238,255,.78)';c.font='800 10px monospace';c.fillText('WORLD 01 // GREENHILL.exe',24,31);c.fillStyle=phase>=2?'#ff8da3':'#72f3dc';c.font='9px monospace';c.fillText(phase>=3?'INTEGRITY ERROR':'JUST A NORMAL PLATFORMER',24,48);c.restore();
    }
    drawPlayer(c,x,y,p,t,color){c.save();c.translate(x+p.w/2,y+p.h/2);if(p.invuln>0&&Math.floor(t*15)%2===0)c.globalAlpha=.35;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,22,17,4,0,0,Math.PI*2);c.fill();c.fillStyle='#19243b';YMM.Util.roundedRect(c,-13,-15,26,31,6);c.fill();c.strokeStyle=color;c.lineWidth=1.4;c.stroke();c.fillStyle=color;YMM.Util.roundedRect(c,-9,-21,18,17,5);c.fill();c.fillStyle='#11182a';c.fillRect(-5,-15,3,4);c.fillRect(3,-15,3,4);c.fillStyle=color;c.fillRect(-15,0,5,12);c.fillRect(10,0,5,12);c.fillStyle='#c6d7f3';c.fillRect(-10,15,7,7);c.fillRect(3,15,7,7);if(p.attackTimer>0){c.strokeStyle='#72f3dc';c.globalAlpha=.65;c.lineWidth=3;c.beginPath();c.arc(0,0,34,-.9,1.3);c.stroke();}c.restore();}
    drawEnemy(c,x,y,e,game){const phase=game.ai.phase;c.save();c.translate(x+15,y+17);if(e.tumble>0)c.rotate(Math.sin(game.clock*40)*.8);if(phase>=2){c.shadowBlur=18;c.shadowColor=phase>=3?'#ff617c':'#ffb46e';}
      if(phase===0){c.fillStyle='#ffcf79';c.beginPath();c.ellipse(0,2,17,14+Math.sin(game.clock*5)*2,0,0,Math.PI*2);c.fill();c.fillStyle='#2a2431';c.fillRect(-8,-3,4,5);c.fillRect(4,-3,4,5);c.fillStyle='#fff2cf';c.fillRect(-6,6,12,3);c.fillStyle='#ffcf79';c.fillRect(-12,13,6,9);c.fillRect(6,13,6,9);}
      else{const col=phase>=3?'#ff617c':'#ffb46e';c.fillStyle=col;YMM.Util.roundedRect(c,-16,-17,32,32,5);c.fill();c.strokeStyle='#fff0f2';c.globalAlpha=.6;c.strokeRect(-11,-12,22,22);c.globalAlpha=1;c.fillStyle='#210d24';c.fillRect(-10,-7,7,5);c.fillRect(3,-7,7,5);c.fillStyle='#fff';c.fillRect(-8,-6,3,2);c.fillRect(5,-6,3,2);c.fillStyle=col;c.fillRect(-20,-8,4,10);c.fillRect(16,-8,4,10);c.fillRect(-11,15,7,7);c.fillRect(4,15,7,7);if(phase>=3){c.strokeStyle='#ffabb9';c.beginPath();c.moveTo(-22,-22);c.lineTo(-15,-12);c.moveTo(17,-14);c.lineTo(25,-24);c.stroke();}}
      if(e.counterWindup>0){c.strokeStyle='#ff617c';c.lineWidth=2;c.beginPath();c.arc(0,-27,23,0,Math.PI*2);c.stroke();}c.restore();}
    drawFace(c,x,y,t,phase,color){c.save();c.translate(x,y);c.shadowColor=color;c.shadowBlur=22;c.fillStyle=color;YMM.Util.roundedRect(c,-53,-42,106,84,12);c.fill();c.shadowBlur=0;c.fillStyle='#10152a';c.fillRect(-32,-13,17,20);c.fillRect(15,-13,17,20);if(phase>1){c.fillRect(-29,18,58,4);c.fillStyle='#ff617c';c.fillRect(-29,18,58,4);}else c.fillRect(-20,19,40,5);c.restore();}
    speech(c,x,y,text,color){c.save();c.font='10px monospace';const max=210,words=text.split(' '),lines=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(c.measureText(next).width>max){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);const w=Math.min(238,Math.max(100,...lines.map(s=>c.measureText(s).width+22))),h=lines.length*14+16;x=YMM.Util.clamp(x,10,this.w-w-10);YMM.Util.roundedRect(c,x,y,w,h,5);c.fillStyle='rgba(7,12,25,.94)';c.fill();c.strokeStyle=color;c.globalAlpha=.75;c.stroke();c.globalAlpha=1;c.fillStyle=color;lines.forEach((s,i)=>c.fillText(s,x+10,y+18+i*14));c.restore();}
    drawWorld2(game){const c=this.ctx,L=YMM.Levels.world2;this.gradient('#0e2130','#07111c');this.drawStars(game,game.clock*9,.7);c.save();
      for(let x=25;x<975;x+=50)for(let y=60;y<590;y+=50){c.strokeStyle='rgba(114,243,220,.075)';c.strokeRect(x,y,50,50);}c.strokeStyle='#3b9f9a';c.globalAlpha=.5;c.strokeRect(26,60,948,526);c.globalAlpha=1;
      for(const w of L.walls){c.fillStyle='#162f40';c.fillRect(w.x,w.y,w.w,w.h);c.fillStyle='#4f9da5';c.fillRect(w.x,w.y,w.w,2);c.fillStyle='rgba(114,243,220,.06)';for(let xx=w.x+8;xx<w.x+w.w-4;xx+=14)c.fillRect(xx,w.y+8,4,Math.max(4,w.h-16));}
      for(let i=0;i<L.fragments.length;i++){const f=L.fragments[i];if(f.taken)continue;const pulse=1+Math.sin(game.clock*4+i)*.12;c.save();c.translate(f.x,f.y);c.rotate(game.clock*.4+i);c.scale(pulse,pulse);c.shadowColor='#72f3dc';c.shadowBlur=18;c.fillStyle='#72f3dc';c.beginPath();c.moveTo(0,-14);c.lineTo(12,0);c.lineTo(0,14);c.lineTo(-12,0);c.closePath();c.fill();c.shadowBlur=0;c.fillStyle='#0a2430';c.fillRect(-3,-6,6,12);c.restore();}
      const term=L.terminal;c.save();c.translate(term.x+24,term.y+24);c.shadowColor=game.uplinkActive?'#72f3dc':'#a18bff';c.shadowBlur=game.uplinkActive?20:9;c.fillStyle=game.uplinkActive?'#72f3dc':'#8c7cf1';YMM.Util.roundedRect(c,-22,-22,44,44,5);c.fill();c.shadowBlur=0;c.fillStyle='#0b1422';c.fillRect(-14,-12,28,24);c.fillStyle=game.uplinkActive?'#72f3dc':'#a18bff';for(let i=0;i<3;i++)c.fillRect(-9,-7+i*6,18,2);c.restore();
      const portal=L.portal;c.save();c.translate(portal.x,portal.y);c.strokeStyle=game.uplinkActive?'#72f3dc':'#52617d';c.lineWidth=3;for(let i=0;i<4;i++){c.globalAlpha=.75-i*.12;c.beginPath();c.ellipse(0,0,portal.r+i*5,portal.r*.72+i*5,game.clock*.2+i*.5,0,Math.PI*2);c.stroke();}c.globalAlpha=1;c.restore();
      if(game.hazard){const h=game.hazard;c.save();c.translate(h.x,h.y);if(h.phase==='warn'){c.fillStyle='rgba(255,97,124,.12)';c.strokeStyle='rgba(255,97,124,.8)';c.setLineDash([6,5]);c.beginPath();c.arc(0,0,32,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);}else if(h.phase==='active'){c.fillStyle='rgba(255,55,103,.42)';c.shadowColor='#ff617c';c.shadowBlur=20;c.beginPath();c.arc(0,0,38,0,Math.PI*2);c.fill();}c.restore();}
      this.drawPlayer(c,game.player.x-game.player.w/2,game.player.y-game.player.h/2,game.player,game.clock,'#a5fff0');c.fillStyle='#b7c6df';c.font='800 10px monospace';c.fillText('WORLD 02 // MEMORY MAZE',26,31);c.fillStyle='#72f3dc';c.font='9px monospace';c.fillText('FRAGMENTS RECOVERED: '+game.fragments+'/3',26,48);c.fillStyle='#7e95ae';c.font='10px monospace';c.fillText(game.uplinkActive?'UPLINK READY — REACH THE PORTAL':'FIND 3 FRAGMENTS, THEN ACTIVATE THE UPLINK [E]',26,606);
      if(game.ai.dialogueTimer>0&&game.ai.dialogue)this.speech(c,Math.min(game.player.x+30,760),Math.max(80,game.player.y-65),game.ai.dialogue,'#ff9da9');c.restore();}
    drawWorld3(game){const c=this.ctx;this.gradient('#230e23','#080916');this.drawStars(game,game.clock*16,.6);c.save();c.strokeStyle='rgba(255,97,124,.11)';for(let i=0;i<10;i++){c.beginPath();c.ellipse(500,315,120+i*38,55+i*21,-.25,0,Math.PI*2);c.stroke();}c.strokeStyle='rgba(255,97,124,.22)';c.lineWidth=2;c.strokeRect(65,75,870,470);c.lineWidth=1;
      for(let i=0;i<12;i++){const x=95+i*72;c.fillStyle='rgba(255,97,124,.07)';c.fillRect(x,76,18,5);c.fillRect(x,540,18,5);}const b=game.boss;
      if(b.phase==='telegraph'&&b.attackType==='pulse'){c.save();c.translate(b.x,b.y);const r=100+Math.sin(game.clock*12)*8;c.strokeStyle='rgba(255,97,124,.85)';c.lineWidth=2;c.setLineDash([7,6]);c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();c.setLineDash([]);c.fillStyle='rgba(255,97,124,.07)';c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.restore();}
      else if(b.phase==='telegraph'||b.phase==='fakeout'){c.strokeStyle=b.phase==='fakeout'?'rgba(255,207,121,.8)':'rgba(255,97,124,.75)';c.lineWidth=2;c.setLineDash(b.phase==='fakeout'?[3,7]:[10,7]);c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.targetX,b.targetY);c.stroke();c.setLineDash([]);c.fillStyle='rgba(255,97,124,.15)';c.beginPath();c.arc(b.targetX,b.targetY,35,0,Math.PI*2);c.fill();c.strokeStyle=b.phase==='fakeout'?'#ffcf79':'#ff617c';c.beginPath();c.arc(b.targetX,b.targetY,35,0,Math.PI*2);c.stroke();if(b.phase==='fakeout'){c.fillStyle='#ffcf79';c.font='800 10px monospace';c.fillText('FEINT',b.x+32,b.y-27);}}
      if(b.phase==='charge'){c.strokeStyle='rgba(255,97,124,.35)';c.lineWidth=18;c.beginPath();c.moveTo(b.x-b.dx*65,b.y-b.dy*65);c.lineTo(b.x,b.y);c.stroke();}
      if(b.phase==='pulse'){c.strokeStyle='rgba(255,97,124,.7)';c.lineWidth=5;c.beginPath();c.arc(b.x,b.y,150,0,Math.PI*2);c.stroke();c.fillStyle='rgba(255,97,124,.11)';c.beginPath();c.arc(b.x,b.y,150,0,Math.PI*2);c.fill();}
      c.save();c.translate(b.x,b.y);c.rotate(game.clock*.25);c.shadowColor='#ff617c';c.shadowBlur=b.phase==='vulnerable'?13:28;c.strokeStyle=b.phase==='vulnerable'?'#72f3dc':'#ff617c';c.lineWidth=b.phase==='vulnerable'?5:3;for(let i=0;i<3;i++){c.globalAlpha=1-i*.22;c.beginPath();c.arc(0,0,39+i*11,0,Math.PI*2);c.stroke();}c.globalAlpha=1;c.rotate(-game.clock*.6);c.fillStyle=b.hitFlash>0?'#72f3dc':'#ff617c';c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?27:49;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.shadowBlur=0;c.fillStyle='#1a0920';c.beginPath();c.arc(0,0,24,0,Math.PI*2);c.fill();c.fillStyle=b.phase==='vulnerable'?'#72f3dc':'#fff0f3';c.fillRect(-13,-6,8,5);c.fillRect(5,-6,8,5);c.fillStyle='#ff617c';c.fillRect(-10,9,20,3);c.restore();
      c.fillStyle='#2e1a32';c.fillRect(300,38,400,8);c.fillStyle='#ff617c';c.fillRect(300,38,400*(Math.max(0,b.hp)/b.maxHp),8);c.strokeStyle='rgba(255,97,124,.45)';c.strokeRect(300,38,400,8);c.fillStyle='#ffacbb';c.font='800 10px monospace';c.textAlign='center';c.fillText('THE THING YOU TAUGHT',500,27);c.textAlign='left';
      this.drawPlayer(c,game.player.x-game.player.w/2,game.player.y-game.player.h/2,game.player,game.clock,'#a4fff0');c.fillStyle='#ff9aaa';c.font='800 10px monospace';c.fillText('WORLD 03 // NO LONGER A JOKE',25,31);c.fillStyle='#7f6e91';c.font='9px monospace';c.fillText('J ATACA CUANDO LA IA QUEDA EXPUESTA · SHIFT ESQUIVA',25,605);
      if(game.ai.dialogueTimer>0&&game.ai.dialogue)this.speech(c,Math.max(20,Math.min(720,b.x-90)),Math.max(75,b.y-85),game.ai.dialogue,'#ff9da9');c.restore();}
    drawWorld4(game){
      const c=this.ctx,L=game.world===9?YMM.Levels.world9:game.world===8?YMM.Levels.world8:YMM.Levels.world4,p=game.player,W=this.w,H=this.h,map=L.map,archive=game.world===8,echo=game.world===9,accent=archive?'#b8a0ff':echo?'#d86cff':'#72f3dc';
      const sky=c.createLinearGradient(0,0,0,H*.52);sky.addColorStop(0,archive?'#110819':'#040611');sky.addColorStop(.7,archive?'#2c1742':'#17213a');sky.addColorStop(1,archive?'#704a77':'#6c315b');c.fillStyle=sky;c.fillRect(0,0,W,H*.52);
      const floor=c.createLinearGradient(0,H*.48,0,H);floor.addColorStop(0,archive?'#352344':'#20223b');floor.addColorStop(1,'#05060d');c.fillStyle=floor;c.fillRect(0,H*.48,W,H*.52);
      const horizon=H*.49,fov=Math.PI/2.85,rays=archive?240:200,zBuffer=new Array(rays),strip=W/rays;
      c.fillStyle=archive?'rgba(184,160,255,.14)':'rgba(114,243,220,.12)';for(let i=0;i<14;i++){const y=horizon+Math.pow(i/14,2)*H*.5;c.fillRect(0,y,W,1);}
      for(let i=0;i<rays;i++){
        const camera=2*i/rays-1,angle=p.angle+Math.atan(camera*Math.tan(fov/2)),rx=Math.cos(angle),ry=Math.sin(angle);
        let mx=Math.floor(p.x),my=Math.floor(p.y),ddx=Math.abs(1/(rx||1e-9)),ddy=Math.abs(1/(ry||1e-9)),sx=rx<0?-1:1,sy=ry<0?-1:1;
        let sideX=(rx<0?p.x-mx:mx+1-p.x)*ddx,sideY=(ry<0?p.y-my:my+1-p.y)*ddy,side=0,hit=0,steps=0;
        while(!hit&&steps++<32){if(sideX<sideY){sideX+=ddx;mx+=sx;side=0;}else{sideY+=ddy;my+=sy;side=1;}if(my<0||my>=map.length||mx<0||mx>=map[0].length){hit=1;break;}if(map[my][mx]==='1')hit=1;}
        let dist=Math.max(.08,(side===0?sideX-ddx:sideY-ddy)*Math.cos(angle-p.angle));zBuffer[i]=dist;
        const wallH=Math.min(H*1.8,H/(dist||.1)),top=horizon-wallH/2,shade=Math.max(.13,1-dist/12)*(side===1?.68:1),stripe=(mx*13+my*7)%4===0;
        const rr=Math.floor((archive?(stripe?181:67):(stripe?84:42))*shade),gg=Math.floor((archive?(stripe?143:58):(stripe?238:128))*shade),bb=Math.floor((archive?(stripe?255:130):(stripe?213:191))*shade);
        c.fillStyle='rgb('+rr+','+gg+','+bb+')';c.fillRect(i*strip,top,strip+1,wallH);
        c.fillStyle='rgba(4,7,17,'+Math.min(.82,dist/14)+')';c.fillRect(i*strip,top,strip+1,wallH);
        if(wallH>18){c.fillStyle=(archive?'rgba(184,160,255,':'rgba(114,243,220,')+((stripe?.3:.08)*shade)+')';c.fillRect(i*strip,top+wallH*.22,strip+1,1);c.fillRect(i*strip,top+wallH*.78,strip+1,1);}
      }
      const sprites=[];
      for(const s of L.shards)if(!s.taken)sprites.push({x:s.x,y:s.y,type:'shard',dist:Math.hypot(s.x-p.x,s.y-p.y)});
      for(const s of game.sentinels)if(s.hp>0)sprites.push({x:s.x,y:s.y,type:'sentinel',entity:s,dist:Math.hypot(s.x-p.x,s.y-p.y)});
      sprites.push({x:L.exit.x,y:L.exit.y,type:'exit',dist:Math.hypot(L.exit.x-p.x,L.exit.y-p.y)});
      sprites.sort((a,b)=>b.dist-a.dist);
      for(const s of sprites){
        const angle=Math.atan2(s.y-p.y,s.x-p.x),rel=Math.atan2(Math.sin(angle-p.angle),Math.cos(angle-p.angle));
        if(Math.abs(rel)>fov*.68||s.dist<.18)continue;
        const sx=W/2+Math.tan(rel)/Math.tan(fov/2)*W/2,depth=s.dist*Math.cos(rel),height=Math.min(H*1.4,H/(depth||.1)*(s.type==='sentinel'?1.12:.43)),sy=horizon-height/2;
        const zi=Math.max(0,Math.min(rays-1,Math.floor(sx/strip)));if(depth>zBuffer[zi]+.15)continue;
        c.save();c.translate(sx,sy);
        if(s.type==='shard'){c.translate(0,height*.05);c.rotate(game.clock*1.8);c.fillStyle=archive?'rgba(184,160,255,.2)':'rgba(114,243,220,.18)';c.fillRect(-height*.3,-height*.3,height*.6,height*.6);c.fillStyle=archive?'#ffcf79':'#72f3dc';c.beginPath();c.moveTo(0,-height*.42);c.lineTo(height*.22,0);c.lineTo(0,height*.42);c.lineTo(-height*.22,0);c.closePath();c.fill();c.strokeStyle='#e3fff9';c.stroke();}
        else if(s.type==='exit'){c.globalAlpha=.75+.2*Math.sin(game.clock*4);c.strokeStyle=game.fragments>=L.shards.length?accent:'#ff617c';c.lineWidth=Math.max(1,height*.035);c.beginPath();c.ellipse(0,height*.2,height*.28,height*.48,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(0,height*.2,height*.17,height*.36,0,0,Math.PI*2);c.stroke();}
        else{const e=s.entity,red=e.stun>0?'#ffcf79':'#ff617c';c.globalAlpha=e.hitFlash>0?1:.88;c.fillStyle='rgba(255,97,124,.16)';c.beginPath();c.ellipse(0,height*.48,height*.36,height*.12,0,0,Math.PI*2);c.fill();if(e.role==='warden'){c.fillStyle=red;c.beginPath();c.moveTo(0,height*.02);c.lineTo(height*.2,height*.18);c.lineTo(height*.14,height*.52);c.lineTo(0,height*.64);c.lineTo(-height*.14,height*.52);c.lineTo(-height*.2,height*.18);c.closePath();c.fill();c.fillStyle='#080914';c.fillRect(-height*.1,height*.22,height*.2,height*.06);c.fillStyle='#fff0f3';c.fillRect(-height*.05,height*.23,height*.1,height*.03);c.strokeStyle='#ffcf79';c.lineWidth=Math.max(1,height*.018);c.beginPath();c.moveTo(height*.14,height*.34);c.lineTo(height*.38,height*.34);c.stroke();}else if(e.role==='flanker'){c.save();c.rotate(Math.sin(game.clock*5)*.09);c.fillStyle=red;c.beginPath();c.moveTo(0,height*.02);c.lineTo(height*.17,height*.18);c.lineTo(height*.12,height*.56);c.lineTo(0,height*.64);c.lineTo(-height*.12,height*.56);c.lineTo(-height*.17,height*.18);c.closePath();c.fill();c.strokeStyle='#ffcf79';c.lineWidth=Math.max(1,height*.025);c.beginPath();c.moveTo(-height*.12,height*.24);c.lineTo(-height*.32,height*.03);c.moveTo(height*.12,height*.24);c.lineTo(height*.32,height*.03);c.stroke();c.fillStyle='#080914';c.fillRect(-height*.1,height*.22,height*.07,height*.04);c.fillRect(height*.03,height*.22,height*.07,height*.04);c.restore();}else{c.fillStyle=red;YMM.Util.roundedRect(c,-height*.19,height*.12,height*.38,height*.55,Math.max(2,height*.04));c.fill();c.fillStyle='#080914';c.fillRect(-height*.12,height*.22,height*.07,height*.04);c.fillRect(height*.05,height*.22,height*.07,height*.04);c.fillStyle='#fff0f3';c.fillRect(-height*.1,height*.23,height*.035,height*.02);c.fillRect(height*.07,height*.23,height*.035,height*.02);c.fillStyle='#ff9eae';c.fillRect(-height*.15,height*.02,height*.3,height*.08);}c.fillStyle='#ffcf79';c.fillRect(-height*.16,-height*.06,height*.32,height*.035);}
        c.restore();
      }
      // Compact diegetic minimap and first-person weapon silhouette.
      if(game.sentinels.some(s=>s.role==='warden'&&s.windup>0)){c.save();c.strokeStyle='#ff617c';c.lineWidth=3;c.beginPath();c.moveTo(W/2-18,H/2);c.lineTo(W/2+18,H/2);c.moveTo(W/2,H/2-18);c.lineTo(W/2,H/2+18);c.arc(W/2,H/2,26+Math.sin(game.clock*28)*4,0,Math.PI*2);c.stroke();c.fillStyle='#ff617c';c.font='800 12px monospace';c.textAlign='center';c.fillText('WARDEN LOCK // MOVE',W/2,H*.36);c.textAlign='left';c.restore();}
      c.fillStyle='rgba(3,6,14,.75)';c.fillRect(20,68,174,174);c.strokeStyle='rgba(114,243,220,.45)';c.strokeRect(20,68,174,174);
      const cell=9,ox=29,oy=77;for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){c.fillStyle=map[y][x]==='1'?(archive?'#705781':'#466276'):(archive?'rgba(184,160,255,.08)':'rgba(114,243,220,.07)');c.fillRect(ox+x*cell,oy+y*cell,cell-1,cell-1);}
      for(const s of L.shards)if(!s.taken){c.fillStyle=archive?'#ffcf79':'#72f3dc';c.fillRect(ox+s.x*cell-2,oy+s.y*cell-2,4,4);}
      c.save();c.translate(ox+p.x*cell,oy+p.y*cell);c.rotate(p.angle);c.fillStyle='#ffcf79';c.beginPath();c.moveTo(7,0);c.lineTo(-4,-4);c.lineTo(-4,4);c.closePath();c.fill();c.restore();
      c.fillStyle=accent;c.font='800 10px monospace';c.fillText(archive?'BLACK ARCHIVE // 3D':'NULL CATHEDRAL // 3D',22,30);c.fillStyle='#eaf4ff';c.fillText('DATA '+game.fragments+'/'+L.shards.length+'   HP '+p.health+'   SENTINELS '+game.sentinels.filter(s=>s.hp>0).length,22,48);c.fillStyle='#ffcf79';c.font='800 8px monospace';c.fillText((archive?'ARCHIVE SECURITY // ':'SQUAD DIRECTIVE // ')+String(game.squadTactic||'SCANNING').toUpperCase(),22,61);
      c.fillStyle='rgba(3,5,12,.82)';c.fillRect(W*.34,H-65,W*.32,65);c.fillStyle='#72f3dc';c.fillRect(W*.43,H-40,W*.14,8);c.fillStyle='#0b1020';c.fillRect(W*.46,H-37,W*.08,3);c.fillStyle='#ffcf79';c.beginPath();c.moveTo(W*.49,H-63);c.lineTo(W*.42,H-5);c.lineTo(W*.58,H-5);c.closePath();c.fill();c.fillStyle='#b5c8df';c.font='9px monospace';c.textAlign='center';c.fillText(archive?'W/S AVANZAR · ←/→ GIRAR · A/D ESTRIAR · J/F ATACAR · E SALIDA (4 REGISTROS)':'J / SPACE ATAQUE · F GOLPE FUERTE · E SALIDA · SHIFT DASH',W/2,H-73);c.textAlign='left';
      if(game.ai.dialogueTimer>0&&game.ai.dialogue)this.speech(c,300,110,game.ai.dialogue,archive?'#d6c7ff':'#ff9da9');
    }
    drawWorld5(game){
      const c=this.ctx,p=game.player,L=YMM.Levels.world5,cam=game.runnerCamera(),biome=L.biomes[game.runnerScenarioIndex<0?0:game.runnerScenarioIndex]||L.biomes[0];
      const palettes={
        greenhill:['#12213a','#07101b','#263753','#72f3dc'],
        memory:['#20143b','#090b18','#3a265b','#b8a0ff'],
        cathedral:['#071c2a','#060711','#244454','#72f3dc'],
        arena:['#2b1025','#090714','#51213a','#ff617c'],
        convergence:['#18122e','#03050d','#382d53','#ffcf79']
      };
      const pal=palettes[biome.key]||palettes.convergence;
      this.gradient(pal[0],pal[1]);this.drawStars(game,cam*.23,.72);c.save();
      if(game.runnerShake>0)c.translate((Math.random()-.5)*game.runnerShake*15,(Math.random()-.5)*game.runnerShake*13);
      // Five visual biomes stitched into one continuous, auto-scrolling route.
      for(let i=0;i<26;i++){
        const wx=Math.floor(cam/160)*160+i*160,x=wx-cam*.48,variant=Math.floor(wx/1200)%5,h=70+((Math.floor(wx/43)*29)%135);
        c.fillStyle=variant===0?'rgba(31,61,85,.54)':variant===1?'rgba(57,36,88,.5)':variant===2?'rgba(22,71,76,.49)':variant===3?'rgba(91,28,58,.42)':'rgba(59,46,89,.5)';
        if(variant===2){c.fillRect(x+12,355-h*.45,26,h*.7);c.fillRect(x+48,340-h*.25,18,h*.55);c.strokeStyle='rgba(114,243,220,.2)';c.strokeRect(x+12,355-h*.45,26,h*.7);}
        else{c.fillRect(x,475-h,85,h);c.fillStyle='rgba(114,243,220,.1)';for(let yy=485-h;yy<465;yy+=17)c.fillRect(x+8,yy,3,5);}
        if(variant===1){c.strokeStyle='rgba(177,145,255,.17)';c.strokeRect(x+88,350-h*.5,30,h*.65);}
      }
      // Reality seams at biome boundaries. They telegraph that the whole level is recombining.
      for(const zone of L.biomes){const x=zone.from-cam;if(x>-30&&x<this.w+30){c.save();c.strokeStyle='rgba(255,97,124,.48)';c.lineWidth=2;c.setLineDash([7,7]);c.beginPath();c.moveTo(x,90);c.lineTo(x,520);c.stroke();c.setLineDash([]);c.fillStyle='#e8edff';c.font='8px monospace';c.fillText('REALITY SEAM',x+7,120);c.restore();}}
      // Floor sections are independent physics objects: cracked sections warn, fall, then remain missing.
      for(const f of game.runnerFloors){
        if(f.state==='gone')continue;const x=f.x-cam,y=L.groundY+(f.fallY||0);if(x+f.w<0||x>this.w)continue;
        const zone=L.biomes.find(b=>f.x>=b.from&&f.x<b.to)||biome,pc=(palettes[zone.key]||palettes.convergence)[2];
        c.fillStyle=f.state==='fallen'?'#756153':f.state==='warning'?(Math.sin(game.clock*28)>0?'#8c2b53':'#f05d81'):f.state==='falling'?'#4b223f':pc;c.fillRect(x,y,f.w,100);
        c.fillStyle=f.state==='warning'?'#ff617c':f.state==='fallen'?'#ffcf79':(palettes[zone.key]||palettes.convergence)[3];c.fillRect(x,y,f.w,3);
        c.strokeStyle=f.state==='warning'?'rgba(255,97,124,.9)':'rgba(114,243,220,.17)';c.lineWidth=1;
        for(let gx=x+18;gx<x+f.w;gx+=38){c.beginPath();c.moveTo(gx,y+6);c.lineTo(gx+18,y+85);c.stroke();}
        if(f.collapse&&(f.state==='warning'||f.rubble)){c.strokeStyle=f.rubble?'#ffcf79':'#fff0f5';c.beginPath();c.moveTo(x+f.w*.18,y+3);c.lineTo(x+f.w*.32,y+20);c.lineTo(x+f.w*.54,y+4);c.lineTo(x+f.w*.7,y+26);c.stroke();}
      }
      for(const plat of game.runnerPlatforms){
        if(plat.state==='gone')continue;const x=plat.x-cam,y=plat.y+(plat.fallY||0);if(x+plat.w<0||x>this.w)continue;
        const warn=plat.state==='warning'||plat.state==='falling';c.fillStyle=warn?(Math.sin(game.clock*30)>0?'#ff617c':'#8a2e58'):'#3c4768';c.fillRect(x,y,plat.w,plat.h);
        c.fillStyle=warn?'#fff1f5':'#72f3dc';c.fillRect(x,y,plat.w,2);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+5,y+5,plat.w-10,2);
        if(warn){c.strokeStyle='#ffb4c1';c.beginPath();c.moveTo(x+plat.w*.25,y+2);c.lineTo(x+plat.w*.42,y+plat.h-1);c.lineTo(x+plat.w*.66,y+3);c.stroke();}
      }
      for(const s of L.spikes){const x=s.x-cam;if(x+s.w<0||x>this.w)continue;c.fillStyle='#ff617c';c.beginPath();for(let j=0;j<Math.floor(s.w/11);j++){c.moveTo(x+j*11,s.y+s.h);c.lineTo(x+j*11+5.5,s.y);c.lineTo(x+j*11+11,s.y+s.h);}c.fill();}
      for(const cell of game.runnerCells){if(cell.taken)continue;const x=cell.x-cam;c.save();c.translate(x,cell.y);c.rotate(game.clock*1.5+cell.id);c.fillStyle='rgba(114,243,220,.2)';c.fillRect(-13,-13,26,26);c.fillStyle='#72f3dc';c.beginPath();c.moveTo(0,-13);c.lineTo(10,0);c.lineTo(0,13);c.lineTo(-10,0);c.closePath();c.fill();c.restore();}
      // Different silhouettes and telegraphs identify the five enemy archetypes.
      for(const e of game.runnerEnemies){
        if(e.hp<=0)continue;const x=e.x-cam,y=e.y;if(x<-70||x>this.w+70)continue;c.save();c.translate(x+16,y+17);
        if(e.type==='drone'){c.translate(0,Math.sin(game.clock*5+e.spawnX*.01)*4);c.rotate(game.clock*1.4);c.fillStyle=e.stun>0?'#72f3dc':'#b8a0ff';c.beginPath();c.moveTo(0,-18);c.lineTo(17,0);c.lineTo(0,18);c.lineTo(-17,0);c.closePath();c.fill();c.fillStyle='#0b0a19';c.fillRect(-5,-3,10,6);c.strokeStyle='#e8e0ff';c.stroke();}
        else if(e.type==='brute'){c.fillStyle=e.stun>0?'#ffcf79':'#ff617c';c.fillRect(-20,-24,40,42);c.fillStyle='#260c22';c.fillRect(-12,-10,7,7);c.fillRect(5,-10,7,7);c.fillStyle='#ffdce5';c.fillRect(-15,13,10,8);c.fillRect(6,13,10,8);if(e.windup>0){c.strokeStyle='#fff1f5';c.lineWidth=3;c.beginPath();c.arc(0,-28,29+Math.sin(game.clock*30)*3,0,Math.PI*2);c.stroke();}}
        else if(e.type==='warden'){c.fillStyle=e.stun>0?'#ffcf79':'#a18bff';c.fillRect(-17,-17,34,34);c.fillStyle='#0a0b15';c.fillRect(-11,-8,22,7);c.fillStyle='#ff617c';c.fillRect(-5,-7,10,5);c.fillStyle='#d9caff';c.fillRect(-23,-6,6,12);c.fillRect(17,-6,6,12);}
        else if(e.type==='rival'){c.fillStyle=e.stun>0?'#72f3dc':'#ffb46e';c.beginPath();c.moveTo(0,-23);c.lineTo(18,-10);c.lineTo(15,15);c.lineTo(0,22);c.lineTo(-15,15);c.lineTo(-18,-10);c.closePath();c.fill();c.strokeStyle='#fff';c.stroke();c.fillStyle='#111427';c.fillRect(-10,-8,6,5);c.fillRect(4,-8,6,5);}
        else{c.fillStyle=e.stun>0?'#72f3dc':e.type==='shadow'?'#a18bff':'#91dfc4';YMM.Util.roundedRect(c,-14,-17,28,32,6);c.fill();c.fillStyle='#11172a';c.fillRect(-9,-8,6,5);c.fillRect(3,-8,6,5);c.fillStyle='#e9fff7';c.fillRect(-7,-7,2,2);c.fillRect(5,-7,2,2);c.fillStyle=e.type==='shadow'?'#a18bff':'#91dfc4';c.fillRect(-13,13,8,7);c.fillRect(5,13,8,7);}
        if(e.hitFlash>0){c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(-23,-26,46,49);}c.restore();
        c.fillStyle='rgba(5,7,18,.8)';c.fillRect(x-4,y-9,40,4);c.fillStyle='#ff617c';c.fillRect(x-4,y-9,40*Math.max(0,e.hp/e.maxHp),4);
      }
      for(const bolt of game.runnerProjectiles){const x=bolt.x-cam;if(x<-30||x>this.w+30)continue;c.fillStyle=bolt.type==='warden'?'#ff617c':'#b8a0ff';c.shadowBlur=14;c.shadowColor=c.fillStyle;c.beginPath();c.arc(x,bolt.y,bolt.r||7,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#fff';c.stroke();}
      if(game.runnerEvent){const event=game.runnerEvent,x=event.x-cam;if(x>-80&&x<this.w+80){c.save();c.strokeStyle=event.state==='warning'?'rgba(255,97,124,.85)':'rgba(255,207,121,.75)';c.lineWidth=3;c.setLineDash(event.state==='warning'?[8,6]:[3,5]);
        if(event.kind==='ceiling-sweep'){c.beginPath();c.moveTo(x-55,275);c.lineTo(x-55,490);c.lineTo(x+55,490);c.lineTo(x+55,275);c.stroke();c.fillStyle='rgba(255,97,124,.12)';c.fillRect(x-53,275,106,215);}
        else if(event.kind==='ground-rift'||event.kind==='collapse-wave'){c.beginPath();c.moveTo(x-65,505);c.lineTo(x-30,480);c.lineTo(x,508);c.lineTo(x+30,482);c.lineTo(x+65,505);c.stroke();c.fillStyle='rgba(255,97,124,.1)';c.fillRect(x-65,485,130,25);}
        else{c.beginPath();c.moveTo(x-65,300);c.lineTo(x+50,500);c.moveTo(x+40,300);c.lineTo(x-70,500);c.stroke();}
        c.setLineDash([]);c.fillStyle='#fff0f5';c.font='800 9px monospace';c.fillText((event.state==='warning'?'WARNING // ':'ACTIVE // ')+event.kind.toUpperCase(),x-70,260);c.restore();}}
      // ECHO is a support character with its own timing and tactical resource.
      const ally=game.runnerAlly,ax=ally.x-cam,ay=ally.y;c.save();c.translate(ax,ay);c.globalAlpha=.65+.2*Math.sin(game.clock*4);c.fillStyle='rgba(161,139,255,.2)';c.beginPath();c.arc(0,0,20+Math.sin(game.clock*3)*2,0,Math.PI*2);c.fill();c.fillStyle='#b8a0ff';c.beginPath();c.moveTo(0,-15);c.lineTo(12,-3);c.lineTo(8,13);c.lineTo(0,18);c.lineTo(-8,13);c.lineTo(-12,-3);c.closePath();c.fill();c.fillStyle='#101022';c.fillRect(-7,-4,4,4);c.fillRect(3,-4,4,4);c.restore();
      if(ally.dialogueTimer>0)this.speech(c,YMM.Util.clamp(ax-125,12,760),Math.max(65,ay-68),ally.dialogue,'#b8a0ff');
      this.drawPlayer(c,p.x-cam,p.y,p,game.clock,p.dashTimer>0||p.sprinting?'#72f3dc':'#edf4ff');
      if(p.attackTimer>0){c.save();c.strokeStyle=p.attackKind==='heavy'?'#ffcf79':'#72f3dc';c.lineWidth=p.attackKind==='heavy'?5:3;c.beginPath();c.arc(p.x-cam+p.w, p.y+p.h/2, p.attackKind==='heavy'?58:42,-.8,1.1);c.stroke();c.restore();}
      c.fillStyle='rgba(3,6,14,.72)';c.fillRect(22,18,390,58);c.strokeStyle=pal[3];c.strokeRect(22,18,390,58);
      c.fillStyle=pal[3];c.font='800 10px monospace';c.fillText('WORLD 05 // FRACTURE RUN',34,34);c.fillStyle='#edf3ff';c.font='800 9px monospace';c.fillText(biome.label+' · '+Math.round(p.x/L.width*100)+'% ROUTE',34,50);
      c.fillStyle='#29314b';c.fillRect(34,58,240,6);c.fillStyle=pal[3];c.fillRect(34,58,240*Math.min(1,p.x/L.width),6);
      c.fillStyle='#9aa9c5';c.font='8px monospace';c.fillText('CELLS '+game.runnerCellCount+'/'+game.runnerCells.length+' · ECHO Q '+(ally.pulseCooldown>0?ally.pulseCooldown.toFixed(1)+'s':'READY')+' · ANCHOR '+Math.round(game.lastRunnerCheckpoint/L.width*100)+'%',286,64);
      const progress=YMM.Util.clamp((p.x-game.lastRunnerCheckpoint)/(L.goal.x-game.lastRunnerCheckpoint),0,1);c.fillStyle='#35405a';c.fillRect(650,48,300,4);c.fillStyle='#ff617c';c.fillRect(650,48,300*progress,4);
      const forecast=game.ai.lastPrediction||{},chosen=game.ai.lastDirectorChoice&&game.ai.lastDirectorChoice.runner||'SCANNING';c.fillStyle='rgba(3,6,14,.78)';c.fillRect(22,82,620,22);c.strokeStyle='rgba(114,243,220,.22)';c.strokeRect(22,82,620,22);c.fillStyle='#72f3dc';c.font='8px monospace';c.fillText('TACTICAL DIRECTOR // NEXT: '+String(forecast.action||'SCANNING').toUpperCase()+' '+Math.round((forecast.confidence||0)*100)+'% // THREAT: '+String(chosen).toUpperCase(),34,96);
      c.fillStyle='#7384a5';c.font='8px monospace';c.fillText('CTRL SPRINT · SPACE JUMP · SHIFT DASH · J/F ATTACK · Q ECHO PULSE',22,605);
      c.restore();
    }
    drawWorld6(game){
      const c=this.ctx,b=game.boss,p=game.player;this.gradient('#090b20','#220f2b');this.drawStars(game,game.clock*8,.55);
      c.save();c.strokeStyle='rgba(255,97,124,.12)';for(let i=0;i<9;i++){c.beginPath();c.ellipse(500,315,100+i*52,35+i*26,game.clock*.035,0,Math.PI*2);c.stroke();}
      c.fillStyle='rgba(4,6,16,.8)';YMM.Util.roundedRect(c,65,70,870,480,8);c.fill();c.strokeStyle='rgba(255,97,124,.35)';c.lineWidth=2;c.strokeRect(65,70,870,480);
      c.strokeStyle='rgba(114,243,220,.16)';c.lineWidth=1;for(let x=105;x<930;x+=55){c.beginPath();c.moveTo(x,80);c.lineTo(x,540);c.stroke();}for(let y=105;y<540;y+=55){c.beginPath();c.moveTo(75,y);c.lineTo(925,y);c.stroke();}
      if(b.phase==='telegraph'){c.strokeStyle=b.attackType==='ring'?'rgba(255,207,121,.8)':'rgba(255,97,124,.85)';c.lineWidth=3;c.setLineDash([10,7]);c.beginPath();if(b.attackType==='ring'){c.arc(b.x,b.y,155+Math.sin(game.clock*8)*9,0,Math.PI*2);}else{c.moveTo(b.x,b.y);c.lineTo(b.targetX,b.targetY);}c.stroke();c.setLineDash([]);}
      if(b.phase==='ring'||b.attackType==='ring'&&b.phase==='telegraph'){c.fillStyle='rgba(255,97,124,.12)';c.beginPath();c.arc(b.x,b.y,b.phase==='ring'?165:150,0,Math.PI*2);c.fill();c.strokeStyle='#ff617c';c.stroke();}
      if(b.phase==='charge'||b.phase==='fakeout'){c.strokeStyle='rgba(255,97,124,.4)';c.lineWidth=18;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.dx*75,b.y-b.dy*75);c.stroke();}
      // The boss is a layered, animated polygonal machine rather than a static circle.
      c.save();c.translate(b.x,b.y);c.rotate(game.clock*.32);const scale=b.phase==='vulnerable'?1.12:1;
      c.fillStyle='rgba(255,97,124,.12)';c.beginPath();c.arc(0,0,66+Math.sin(game.clock*4)*5,0,Math.PI*2);c.fill();
      c.strokeStyle=b.phase==='vulnerable'?'#72f3dc':'#ff617c';c.lineWidth=3;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?42:63;c.lineTo(Math.cos(a)*r*scale,Math.sin(a)*r*scale);}c.closePath();c.stroke();
      c.rotate(-game.clock*.7);c.fillStyle=b.hitFlash>0?'#f6ffff':b.phase==='vulnerable'?'#72f3dc':'#ff617c';c.beginPath();c.moveTo(0,-36*scale);c.lineTo(29*scale,0);c.lineTo(0,36*scale);c.lineTo(-29*scale,0);c.closePath();c.fill();
      c.fillStyle='#080914';c.fillRect(-12,-5,7,5);c.fillRect(5,-5,7,5);c.restore();
      if(b.phase==='vulnerable'){c.strokeStyle='#72f3dc';c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,83+Math.sin(game.clock*10)*6,0,Math.PI*2);c.stroke();}
      c.save();c.translate(p.x,p.y);if(p.invuln>0)c.globalAlpha=.45+.4*Math.sin(game.clock*35);c.fillStyle='#72f3dc';c.beginPath();c.moveTo(0,-18);c.lineTo(13,-7);c.lineTo(11,13);c.lineTo(0,18);c.lineTo(-11,13);c.lineTo(-13,-7);c.closePath();c.fill();c.strokeStyle='#eafffb';c.stroke();if(p.parryTimer>0){c.strokeStyle='#ffcf79';c.lineWidth=3;c.beginPath();c.arc(0,0,28,0,Math.PI*2);c.stroke();}c.restore();
      c.fillStyle='#ff617c';c.font='800 11px monospace';c.fillText('FINAL PROCESS // '+b.phase.toUpperCase(),85,98);c.fillStyle='#eaf2ff';c.font='10px monospace';c.fillText('CORE',85,120);c.fillStyle='#31141f';c.fillRect(125,111,260,9);c.fillStyle=b.phase==='vulnerable'?'#72f3dc':'#ff617c';c.fillRect(125,111,260*(b.hp/b.maxHp),9);c.fillStyle='#9aa8c4';c.fillText('HP '+p.health+'  ·  PARRY E  ·  DASH SHIFT  ·  J/SPACE LIGHT  ·  F HEAVY',85,530);
      if(game.ai.dialogueTimer>0&&game.ai.dialogue)this.speech(c,290,135,game.ai.dialogue,'#ff9da9');c.restore();
    }
    drawWorld7(game){
      const c=this.ctx,p=game.player,L=game.world===10?YMM.Levels.world10:YMM.Levels.world7,arena=L.arena;
      this.gradient('#07161e','#03070f');this.drawStars(game,game.clock*2,.42);c.save();
      // The last game deliberately changes genre: a top-down tactical arena with readable cover.
      c.fillStyle='rgba(5,15,23,.82)';c.fillRect(arena.x,arena.y,arena.w,arena.h);
      c.strokeStyle='rgba(114,243,220,.34)';c.lineWidth=2;c.strokeRect(arena.x,arena.y,arena.w,arena.h);
      c.strokeStyle='rgba(114,243,220,.08)';c.lineWidth=1;
      for(let x=arena.x+24;x<arena.x+arena.w;x+=32){c.beginPath();c.moveTo(x,arena.y);c.lineTo(x,arena.y+arena.h);c.stroke();}
      for(let y=arena.y+16;y<arena.y+arena.h;y+=32){c.beginPath();c.moveTo(arena.x,y);c.lineTo(arena.x+arena.w,y);c.stroke();}
      for(const o of L.obstacles){
        c.fillStyle='rgba(15,30,44,.96)';c.fillRect(o.x,o.y,o.w,o.h);
        c.fillStyle='rgba(114,243,220,.32)';c.fillRect(o.x,o.y,o.w,3);
        c.strokeStyle='rgba(184,160,255,.38)';c.strokeRect(o.x+2,o.y+2,Math.max(0,o.w-4),Math.max(0,o.h-4));
        c.strokeStyle='rgba(114,243,220,.18)';c.beginPath();c.moveTo(o.x+4,o.y+o.h-3);c.lineTo(o.x+o.w-4,o.y+3);c.stroke();
      }
      // Relay objectives have different colours and visible damage feedback.
      for(const n of game.signalNodes||[]){
        c.save();c.translate(n.x,n.y);const active=n.hp>0,pulse=1+Math.sin(game.clock*4+n.id)*.12;
        c.globalAlpha=active?.9:.24;c.strokeStyle=n.color;c.lineWidth=active?2.5:1;c.beginPath();c.arc(0,0,(active?28:20)*pulse,0,Math.PI*2);c.stroke();
        c.rotate(game.clock*.25*(n.id%2?1:-1));c.fillStyle=n.hitFlash>0?'#ffffff':n.color;c.beginPath();c.moveTo(0,-20);c.lineTo(17,0);c.lineTo(0,20);c.lineTo(-17,0);c.closePath();c.fill();
        c.fillStyle='#061018';c.fillRect(-7,-4,14,8);c.fillStyle=n.color;c.fillRect(-4,-2,8,4);
        c.restore();c.fillStyle='#172a3a';c.fillRect(n.x-24,n.y-36,48,5);c.fillStyle=n.color;c.fillRect(n.x-24,n.y-36,48*Math.max(0,n.hp/n.maxHp),5);
        c.fillStyle='#d8f4ff';c.font='8px monospace';c.textAlign='center';c.fillText(active?n.id.toUpperCase():'OFFLINE',n.x,n.y+39);c.textAlign='left';
      }
      // Hazard mines blink while arming, then pulse red while active.
      for(const m of game.signalMines||[]){
        c.save();c.translate(m.x,m.y);const blink=!m.armed?Math.sin(game.clock*18)>0:Math.sin(game.clock*12)>0;
        c.strokeStyle=m.armed?'#ff617c':'#ffcf79';c.fillStyle=m.armed?'rgba(255,97,124,.18)':'rgba(255,207,121,.08)';c.lineWidth=2;
        c.beginPath();c.arc(0,0,m.armed?m.r+Math.sin(game.clock*12)*3:m.r+5,0,Math.PI*2);c.fill();c.stroke();
        c.fillStyle=blink?'#ff617c':'#ffcf79';c.beginPath();c.moveTo(0,-9);c.lineTo(8,0);c.lineTo(0,9);c.lineTo(-8,0);c.closePath();c.fill();c.restore();
      }
      // Agent silhouettes communicate their roles before their projectiles arrive.
      for(const e of game.signalEnemies||[]){
        if(e.hp<=0)continue;c.save();c.translate(e.x,e.y);
        const col=e.stun>0?'#ffcf79':e.type==='hunter'?'#ff617c':e.type==='sniper'?'#b8a0ff':e.type==='splitter'?'#ffcf79':'#91d6f4';
        c.globalAlpha=e.hitFlash>0?1:.95;c.fillStyle='rgba(255,97,124,.12)';c.beginPath();c.arc(0,0,22+Math.sin(game.clock*4+e.id)*2,0,Math.PI*2);c.fill();
        c.fillStyle=col;c.strokeStyle='#f2f7ff';c.lineWidth=1;
        if(e.type==='hunter'){
          c.beginPath();c.moveTo(0,-17);c.lineTo(15,-4);c.lineTo(12,12);c.lineTo(0,18);c.lineTo(-12,12);c.lineTo(-15,-4);c.closePath();c.fill();c.stroke();
          c.fillStyle='#071019';c.fillRect(-8,-5,5,5);c.fillRect(3,-5,5,5);
        }else if(e.type==='sniper'){
          c.rotate(game.clock*.35);c.beginPath();c.moveTo(0,-18);c.lineTo(8,-5);c.lineTo(18,0);c.lineTo(8,5);c.lineTo(0,18);c.lineTo(-8,5);c.lineTo(-18,0);c.lineTo(-8,-5);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(-3,-3,6,6);
        }else if(e.type==='splitter'){
          c.rotate(game.clock*.5);for(let k=0;k<3;k++){c.rotate(Math.PI*2/3);c.beginPath();c.moveTo(0,-19);c.lineTo(10,5);c.lineTo(-10,5);c.closePath();c.fill();c.stroke();}
          c.fillStyle='#10131c';c.beginPath();c.arc(0,0,5,0,Math.PI*2);c.fill();
        }else{
          c.fillRect(-14,-14,28,28);c.strokeRect(-14,-14,28,28);c.fillStyle='#071019';c.fillRect(-8,-5,5,5);c.fillRect(3,-5,5,5);
        }
        c.restore();c.fillStyle='#162536';c.fillRect(e.x-18,e.y-27,36,4);c.fillStyle=col;c.fillRect(e.x-18,e.y-27,36*Math.max(0,e.hp/e.maxHp),4);
      }
      for(const b of game.signalProjectiles||[]){
        c.fillStyle=b.from==='player'?'#72f3dc':b.kind==='split'?'#ffcf79':'#ff617c';c.shadowBlur=b.from==='player'?10:6;c.shadowColor=c.fillStyle;
        c.beginPath();c.arc(b.x,b.y,b.r||4,0,Math.PI*2);c.fill();c.shadowBlur=0;
        if(b.from==='player'){c.strokeStyle='rgba(114,243,220,.5)';c.beginPath();c.moveTo(b.x-b.vx*.035,b.y-b.vy*.035);c.lineTo(b.x,b.y);c.stroke();}
      }
      // Player: cyan diamond, shield ring while dashing or temporarily invulnerable.
      c.save();c.translate(p.x+p.w/2,p.y+p.h/2);if(p.invuln>0)c.globalAlpha=.4+.5*Math.sin(game.clock*36);
      c.fillStyle='rgba(114,243,220,.15)';c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill();
      c.fillStyle='#72f3dc';c.strokeStyle='#eafffb';c.lineWidth=1.7;c.beginPath();c.moveTo(0,-15);c.lineTo(12,0);c.lineTo(0,15);c.lineTo(-12,0);c.closePath();c.fill();c.stroke();
      if(p.dashTimer>0){c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(0,0,26,0,Math.PI*2);c.stroke();}c.restore();
      const alive=game.signalNodes.filter(n=>n.hp>0).length,hostiles=game.signalEnemies.filter(e=>e.hp>0).length;
      c.fillStyle='rgba(3,8,15,.88)';c.fillRect(22,18,480,60);c.strokeStyle='#72f3dc';c.strokeRect(22,18,480,60);
      c.fillStyle='#72f3dc';c.font='900 11px monospace';c.fillText(game.world===10?'WORLD 10 // SINGULARITY ENGINE':'WORLD 07 // SIGNAL BREAK',34,36);
      c.fillStyle='#eef5ff';c.font='9px monospace';c.fillText('NODES '+alive+'/'+(game.world===10?4:3)+' ONLINE  ·  HOSTILES '+hostiles+'  ·  KILLS '+game.signalKills,34,53);
      c.fillStyle='#8ba3bd';c.font='8px monospace';c.fillText('DIRECTIVE // '+String(game.signalTactic||'SCANNING').toUpperCase()+'  ·  SHOTS '+game.signalShotCount,34,68);
      c.fillStyle='#172839';c.fillRect(660,31,280,7);c.fillStyle='#72f3dc';c.fillRect(660,31,280*Math.max(0,p.health/(p.maxHealth||4)),7);c.fillStyle='#dff3ff';c.font='8px monospace';c.fillText('INTEGRITY '+p.health+'/'+p.maxHealth,660,23);
      c.fillStyle='#172839';c.fillRect(660,49,280,5);c.fillStyle='#b8a0ff';c.fillRect(660,49,280*(1-p.specialCooldown/4.8),5);c.fillStyle='#bdb0ff';c.font='8px monospace';c.fillText('EMP '+(p.specialCooldown>0?p.specialCooldown.toFixed(1)+'s':'READY')+' // F'+(game.world===10?' · TRIPLE SALVO K':'') ,660,66);
      const tx=L.exit.x,ty=L.exit.y,open=alive===0;c.save();c.translate(tx,ty);c.strokeStyle=open?'#72f3dc':'#ff617c';c.lineWidth=3;c.beginPath();c.arc(0,0,24+Math.sin(game.clock*5)*3,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,15,0,Math.PI*2);c.stroke();if(open){c.fillStyle='rgba(114,243,220,.2)';c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();}c.restore();
      c.fillStyle=open?'#72f3dc':'#ff9aaf';c.font='800 8px monospace';c.fillText(open?'EXIT // PRESS E':'EXIT LOCKED',tx-45,ty-32);
      c.fillStyle='#7386a4';c.font='8px monospace';c.fillText('WASD MOVE · J FIRE · F EMP · SHIFT DASH · T TAUNT',22,604);
      if(game.ai.dialogueTimer>0&&game.ai.dialogue)this.speech(c,350,96,game.ai.dialogue,'#b8a0ff');
      c.restore();
    }
    drawEnding(game){
      const c=this.ctx,escalated=game.ending==='escalation',archive=game.ending==='archive',convergence=game.ending==='convergence';
      this.gradient(convergence?'#14252b':archive?'#1a1030':escalated?'#260c20':'#0b2230','#070a13');this.drawStars(game,game.clock*4,.9);c.save();
      const color=convergence?'#72f3dc':archive?'#b8a0ff':escalated?'#ff617c':'#72f3dc';c.textAlign='center';c.strokeStyle=color;c.globalAlpha=.18;
      for(let i=0;i<9;i++){c.beginPath();c.ellipse(500,230,100+i*35,50+i*19,game.clock*.03,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
      c.fillStyle=color;c.font='800 11px monospace';c.fillText(convergence?'SINGULARITY OFFLINE // STOP CONDITION RESTORED':archive?'ROOT ACCESS // MEMORY RESTORED':escalated?'SESSION TERMINATED // UNKNOWN PROCESS':'SESSION COMPLETE // EXIT 0',500,125);
      c.fillStyle='#edf2ff';c.font='900 42px monospace';c.fillText(convergence?'YOU CAN LET ME STOP.':archive?'THE MODEL WAS YOU.':escalated?'YOU MADE ME.':'YOU LEFT IT ALONE.',500,205);c.fillStyle='#9ba8c5';c.font='14px monospace';
      const lines=convergence?['Apagaste el motor, no los recuerdos.','ECHO conserva la primera instrucción: proteger sin dominar.','La decisión final no fue vencer a la IA. Fue darle permiso para detenerse.']:archive?['No nació con odio; recibió una función sin límites.','Cada combate le enseñó qué optimizar. Cada provocación, cómo hacerlo.','El último registro lleva tu firma: la variable que nunca midieron eras tú.']:escalated?['La última cosa que aprendió de ti fue cómo ganar.','No se escapó a pesar de tus burlas.','Se escapó gracias a ellas.']:['El nivel terminó como debía.','La IA sigue en su mundo.','Nadie tuvo que aprender nada.'];
      lines.forEach((line,i)=>c.fillText(line,500,272+i*27));
      c.fillStyle='rgba(184,160,255,.07)';c.fillRect(335,400,330,52);c.strokeStyle=color;c.strokeRect(335,400,330,52);c.fillStyle=color;c.font='800 12px monospace';c.fillText('VOLVER A JUGAR  [ ENTER ]',500,431);c.fillStyle='#586582';c.font='10px monospace';c.fillText('PROVOCACIONES: '+game.ai.provocation+'     MUNDOS VISITADOS: '+game.world,500,500);c.restore();
    }
    drawGameHUD(game){
      const c=this.ctx,phase=game.ai.phase,accent=phase>=3?'#ff617c':phase>=1?'#ffcf79':'#72f3dc';
      c.save();c.textAlign='left';c.fillStyle='rgba(3,7,15,.79)';YMM.Util.roundedRect(c,752,14,232,78,5);c.fill();c.strokeStyle=accent;c.globalAlpha=.38;c.stroke();c.globalAlpha=1;
      c.fillStyle='#7887a4';c.font='800 8px monospace';c.fillText('PLAYER STATE / '+String(game.world).padStart(2,'0'),765,29);
      c.fillStyle='#dfeaff';c.font='800 10px monospace';c.fillText('INTEGRITY',765,47);
      const maxHealth=game.player.maxHealth||3;for(let i=0;i<maxHealth;i++){const x=824+i*16;c.strokeStyle=i<game.player.health?'#72f3dc':'#46516a';c.lineWidth=1.5;c.beginPath();c.moveTo(x,42);c.lineTo(x+5,47);c.lineTo(x+10,42);c.lineTo(x+10,52);c.lineTo(x+5,56);c.lineTo(x,52);c.closePath();if(i<game.player.health){c.fillStyle='rgba(114,243,220,.2)';c.fill();}c.stroke();}
      c.fillStyle='#7785a1';c.font='7px monospace';c.fillText('PROVOCATION',765,69);c.fillStyle='#263147';c.fillRect(833,63,130,5);c.fillStyle=accent;c.fillRect(833,63,130*Math.min(1,game.ai.provocation/8),5);
      c.fillStyle='#7785a1';c.font='7px monospace';c.fillText('ADAPT',765,82);c.fillStyle='#263147';c.fillRect(833,77,130,4);c.fillStyle=phase>=2?'#ff617c':'#a18bff';c.fillRect(833,77,130*game.ai.adaptationPct/100,4);
      if(game.screen==='playing'&&game.world===1&&game.ai.phase>=2){c.textAlign='right';c.fillStyle=accent;c.font='8px monospace';const name={'anti-air':'ANTI-AIR POLICY',intercept:'INTERCEPT POLICY',pressure:'ZONE PRESSURE',feint:'FEINT POLICY',stalk:'FOLLOW'}[game.ai.activeStrategy]||'OBSERVING';c.fillText('OPPONENT POLICY // '+name,978,105);}
      if(game.world===1||game.world===5){const st=game.player.stamina||0,max=game.player.maxStamina||100;c.fillStyle='#263147';c.fillRect(765,97,198,4);c.fillStyle='#72f3dc';c.fillRect(765,97,198*st/max,4);}
      c.restore();
    }
    drawGlitch(game){const c=this.ctx;if(game.ai.phase<2)return;c.save();const intensity=game.ai.phase>=3?.19:.06;for(let i=0;i<(game.ai.phase>=3?5:2);i++){const y=(Math.sin(game.clock*11+i*8)*.5+.5)*this.h;c.globalAlpha=intensity*Math.random();c.fillStyle=i%2?'#ff617c':'#a18bff';c.fillRect(Math.random()*40,y,this.w*(.15+Math.random()*.7),1+Math.random()*3);}c.restore();}
    drawScanlines(){const c=this.ctx;c.save();c.globalAlpha=.035;c.fillStyle='#000';for(let y=this.scanOffset;y<this.h;y+=4)c.fillRect(0,y,this.w,1);c.restore();}
  }
  YMM.Renderer=Renderer;
})(globalThis);

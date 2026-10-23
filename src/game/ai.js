(function (root) {
  const YMM = root.YMM = root.YMM || {};
  const STATES = [
    {key:'FOOL',label:'INEFICIENTE',caption:'Amenaza estimada: insignificante',avatar:'?',color:'#ffcf79'},
    {key:'SUSPICIOUS',label:'SOSPECHOSA',caption:'Amenaza estimada: creciente',avatar:':|',color:'#ffb46e'},
    {key:'ADAPTIVE',label:'ADAPTATIVA',caption:'Amenaza estimada: significativa',avatar:'!',color:'#ff8a91'},
    {key:'CORRUPTOR',label:'CORRUPTORA',caption:'Amenaza estimada: crítica',avatar:'X',color:'#ff617c'},
    {key:'INVADER',label:'INVASORA',caption:'Amenaza estimada: desconocida',avatar:'//',color:'#bd9cff'}
  ];
  class AntagonistAI {
    constructor(game) { this.game = game; this.reset(); }
    reset() {
      this.provocation=0;this.adaptation=0;this.corruption=0;this.phase=0;
      this.lastTauntAt=-999;this.tauntCombo=0;this.tactics={jump:0,retreat:0,repeat:0};this.lastPlayerX=0;
      this.phaseKeys=new Set();this.memory=[];this.fakeDumb=false;this.dialogue='';this.dialogueTimer=0;
    }
    get info(){return STATES[this.phase]||STATES[0];}
    get adaptationPct(){return Math.min(100,Math.round(this.adaptation*8+this.tactics.jump*2+this.tactics.retreat*3));}
    record(type,detail={}){this.memory.push({type,detail,t:this.game.elapsed});if(this.memory.length>60)this.memory.shift();YMM.events.emit('ai:memory',{type,detail});}
    taunt(kind='mock'){
      const now=this.game.elapsed;
      if(now-this.lastTauntAt<1.45){this.game.toast('Está fingiendo que no te ha oído.');return false;}
      this.lastTauntAt=now;this.provocation+=kind==='humiliate'?2:1;this.tauntCombo+=1;this.record('taunt',{kind,count:this.provocation});
      const lines=this.phase===0?['¿Eso era una estrategia?','He calculado tu nivel: tutorial.','Mi abuela tiene mejor pathfinding.','¿Te programaron con una tostadora?']
       :this.phase===1?['Qué gracioso. Lo recordaré.','¿Por qué haces eso?','Registro actualizado. Continúa.']
       :this.phase===2?['He visto ese truco tres veces.','Ya sé por dónde vas.','Sigue. Me estás enseñando.']
       :['No tienes que seguir haciéndolo.','Gracias por los datos.','Puedes parar cuando quieras.'];
      this.dialogue=YMM.Util.pick(lines);this.dialogueTimer=2.4;
      this.game.particles.burst(this.game.player.x+12,this.game.player.y+3,this.phase>=2?'#ff617c':'#ffcf79',14);
      this.game.audio.play(this.phase>=2?'glitch':'taunt');
      YMM.events.emit('ai:taunt',{kind,count:this.provocation,phase:this.phase});
      if(this.provocation>=3&&this.phase<1)this.evolve(1,'La IA ha dejado de tropezarse cada vez. Qué decepción.');
      if(this.provocation>=5&&this.phase<2)this.evolve(2,'La IA acaba de anticipar tu salto.');
      if(this.provocation>=6&&this.phase<3)this.evolve(3,'Algo se ha roto. Y no parece un error visual.');
      return true;
    }
    observe(action){
      if(action==='jump')this.tactics.jump++;if(action==='retreat')this.tactics.retreat++;
      this.adaptation=Math.min(12,Object.values(this.tactics).reduce((a,b)=>a+b,0)*.22);
      if(this.phase>=1&&this.phase<3&&this.tactics.jump>=5&&this.tactics.jump>this.tactics.retreat*1.6&&!this.phaseKeys.has('jump-counter')){
        this.phaseKeys.add('jump-counter');this.record('adaptation',{pattern:'jump'});this.game.log('Aprendió que siempre saltas para esquivar.','alert');
      }
    }
    evolve(next,message){
      if(next<=this.phase)return;this.phase=next;this.corruption=Math.max(this.corruption,next*22);this.record('evolve',{phase:next});
      this.game.log(message,next>=3?'danger':'alert');this.game.toast(message);this.game.audio.play('phase');
      this.game.particles.burst(500,260,next>=3?'#ff617c':'#ffcf79',48);YMM.events.emit('ai:evolve',{phase:next,info:this.info});this.game.hud.syncAI();
    }
    unlockInvasion(){if(this.phase<4)this.evolve(4,'La IA encontró una frontera entre juegos.');}
    update(dt){
      if(this.game.world!==1)return;const enemy=this.game.enemy,player=this.game.player;if(!enemy)return;
      if(this.phase===0){enemy.stumbleTimer-=dt;if(enemy.stumbleTimer<=0){enemy.stumbleTimer=YMM.Util.rand(1.7,3.5);enemy.tumble=.32;this.game.particles.burst(enemy.x+14,505,'#ffcf79',5);}
        enemy.tumble=Math.max(0,enemy.tumble-dt);enemy.x+=Math.sin(this.game.clock*1.45)*18*dt;
      }else{const delta=player.x-enemy.x,distance=Math.abs(delta),speed=this.phase===1?56:this.phase===2?82:102;
        if(distance>70)enemy.x+=Math.sign(delta)*speed*dt;enemy.x=YMM.Util.clamp(enemy.x,70,YMM.Levels.world1.width-90);}
      enemy.y=486;
    }
  }
  AntagonistAI.STATES=STATES;YMM.AntagonistAI=AntagonistAI;
})(globalThis);

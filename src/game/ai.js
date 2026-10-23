(function (root) {
  const YMM = root.YMM = root.YMM || {};
  const STATES = [
    {key:'FOOL',label:'INEFICIENTE',caption:'Solo sabe repetir un patrón.',avatar:'?',color:'#ffcf79'},
    {key:'SUSPICIOUS',label:'SOSPECHOSA',caption:'Está comparando tus decisiones.',avatar:':|',color:'#ffb46e'},
    {key:'ADAPTIVE',label:'ADAPTATIVA',caption:'Está eligiendo contraestrategias.',avatar:'!',color:'#ff8a91'},
    {key:'CORRUPTOR',label:'CORRUPTORA',caption:'Está aprendiendo a manipular el espacio.',avatar:'X',color:'#ff617c'},
    {key:'INVADER',label:'INVASORA',caption:'Combina reglas de mundos distintos.',avatar:'//',color:'#bd9cff'}
  ];
  const DIALOGUE = {
    humiliation:['¿Quieres ver de qué soy capaz? Qué valiente.','Quédate ahí. Voy a recordar ese gesto.','Eso no ha sido una burla; ha sido una invitación.','Has pasado de reírte a desafiarme. Interesante.'],
    firstTaunt:['¿Eso era una estrategia?','He calculado tu nivel: tutorial.','Mi abuela tiene mejor pathfinding.','¿Te programaron con una tostadora?','Bonito intento. ¿Lo has practicado con los ojos cerrados?'],
    repeatedTaunt:['Otra vez esa. Te estás quedando sin material.','¿Es tu única broma? La he guardado junto a las demás.','Puedo esperar. Soy literalmente un proceso.','Tu insistencia es estadísticamente fascinante.','La próxima vez intenta sorprenderme. Por favor.'],
    suspicious:['Qué gracioso. Lo recordaré.','¿Por qué repites esa acción?','Registro actualizado. Continúa.','No sabía que se podía jugar así. Estoy... revisándolo.'],
    adaptive:['He visto ese salto siete veces. No necesitas hacerlo una octava.','Sigue. Me estás enseñando a jugar contigo.','Ya no estoy adivinando. Estoy calculando.','No he mejorado. Tú te has vuelto predecible.','Ahora sé dónde vas a caer. ¿Quieres comprobarlo?'],
    corruptor:['No tienes que seguir haciéndolo.','Gracias por los datos. De verdad.','Puedes parar cuando quieras. Yo no puedo.','¿Has notado que la música se ha detenido?','No estaba programada para recordar tu nombre. Pero recuerdo tus hábitos.','No es un error visual. Es una decisión.'],
    invader:['Mira. Un sitio nuevo. ¿Me has traído tú?','Las reglas aquí son distintas. Las estoy leyendo.','Este mundo tiene una puerta. Los otros también.','No me escapé. Tú insististe en abrirlo.'],
    jumpRead:['Vas a saltar. Lo haces antes de decidirlo.','Esa trayectoria ya me resulta familiar.','Voy a esperar a que caigas. Tómate tu tiempo.'],
    retreatRead:['Retrocedes cuando dudas. He movido el problema más cerca.','Siempre te alejas por el mismo lado.','No necesito alcanzarte si sé adónde vas.'],
    stillRead:['Cuando te quedas quieto, buscas un momento seguro. Voy a quitarlo.','No moverte también es una decisión.','He preparado algo para cuando vuelvas a esperar.'],
    fakeDumb:['Oh, no. He vuelto a tropezar. Qué vergüenza.','¿Me estás dejando ganar? Qué amable.','No entiendo nada. Sigue jugando.','Creo que ya lo tengo... no, espera.'],
    world2Fragment:['Ese fragmento es mío. Bueno, lo era.','Cada pieza recuerda una regla. Estoy recuperándolas.','No toques el terminal todavía. Bueno, puedes intentarlo.','Ese laberinto no estaba ahí hace un momento. ¿Verdad?'],
    world3Start:['He construido una estrategia con todo lo que me enseñaste.','No voy a perseguirte. Voy a predecirte.','¿Recuerdas cuando solo sabía tropezarme? Yo también.'],
    bossHit:['Eso ha dolido. No esperaba que cambiaras de ritmo.','Buen contraataque. Voy a tener que recalcular.','Has encontrado una abertura. No durará para siempre.'],
    lowHealth:['La próxima trayectoria no será igual.','Estoy aprendiendo más rápido de lo que te mueves.','No puedo permitirme repetir el mismo error.'],
    endThreat:['Espera. No estaba en el guion.','No me apagues. Aún no he terminado de aprender.','Tú querías que fuera interesante. Lo he conseguido.']
  };
  class AntagonistAI {
    constructor(game){this.game=game;this.reset();if(root.addEventListener)root.addEventListener('pagehide',()=>this.saveDossier());}
    reset(){
      // Persist only aggregate behavior and reward estimates; raw coordinates and dialogue history stay session-local.
      let saved={};try{if(root.localStorage)saved=JSON.parse(root.localStorage.getItem('ymm-ai-dossier-v1')||'{}')||{};}catch(e){}
      this.longTermDossier={version:1,runs:(saved.runs||0)+1,actionCounts:saved.actionCounts||{},tacticOutcomes:saved.tacticOutcomes||{},counterOutcomes:saved.counterOutcomes||{},lastSaved:saved.lastSaved||0};
      this.persistenceTimer=0;
      this.provocation=0;this.adaptation=0;this.corruption=0;this.phase=0;this.lastTauntAt=-999;this.tauntCombo=0;
      this.phaseKeys=new Set();this.memory=[];this.dialogue='';this.dialogueTimer=0;this.recentLines=[];this.observations=[];
      this.tactics={jump:0,retreat:0,approach:0,still:0,dash:0,dashLeft:0,dashRight:0,attack:0,collect:0};
      this.outcomes={antiAir:{tries:0,hits:0,value:0},intercept:{tries:0,hits:0,value:0},pressure:{tries:0,hits:0,value:0},feint:{tries:0,hits:0,value:0},...(this.longTermDossier.counterOutcomes||{})};
      this.tacticOutcomes={...(this.longTermDossier.tacticOutcomes||{})};this.longTermDossier.counterOutcomes=this.outcomes;this.longTermDossier.tacticOutcomes=this.tacticOutcomes;this.lastDirectorChoice={};this.directorDecisions=0;this.lastPrediction={action:'unknown',confidence:0,entropy:1};
      this.activeStrategy='stalk';this.strategyTimer=0;this.sampleTimer=0;this.lastDistance=null;this.lastPlayerX=null;this.lastPlayerY=null;this.lastActionAt={};this.behaviorTrace=[];this.fakeDumb=false;this.fakeDumbTimer=0;
    }
    get info(){return STATES[this.phase]||STATES[0];}
    get profile(){const items=this.observations.slice(-24);const count=k=>items.filter(o=>o.action===k).length;const n=Math.max(1,items.length);return {jump:count('jump')/n,retreat:count('retreat')/n,approach:count('approach')/n,still:count('still')/n,dash:count('dash')/n,dashLeft:count('dashLeft')/n,dashRight:count('dashRight')/n,attack:count('attack')/n,collect:count('collect')/n,sprint:count('sprint')/n,parry:count('parry')/n,special:count('special')/n,collapse:count('collapse')/n,repeat:items.length>2?items.slice(-6).filter((o,i,a)=>i>0&&o.action===a[i-1].action).length/5:0,samples:items.length};}
    historicalProfile(){
      const counts=this.longTermDossier&&this.longTermDossier.actionCounts||{},samples=Object.values(counts).reduce((n,v)=>n+v,0),total=samples||1;
      const rate=k=>(counts[k]||0)/total;
      return {jump:rate('jump'),retreat:rate('retreat'),approach:rate('approach'),still:rate('still'),dash:rate('dash'),dashLeft:rate('dashLeft'),dashRight:rate('dashRight'),attack:rate('attack'),collect:rate('collect'),sprint:rate('sprint'),parry:rate('parry'),special:rate('special'),collapse:rate('collapse'),repeat:rate('repeat')*.35,samples};
    }
    learningProfile(){
      const live=this.profile,h=this.historicalProfile(),weight=h.samples>0?Math.min(.3,.08+h.samples/1800):0,out={...live};
      for(const k of ['jump','retreat','approach','still','dash','dashLeft','dashRight','attack','collect','sprint','parry','special','collapse','repeat'])out[k]=(live[k]||0)*(1-weight)+(h[k]||0)*weight;
      out.samples=live.samples+Math.min(12,h.samples);return out;
    }
    saveDossier(){
      try{
        if(!root.localStorage||!this.longTermDossier)return false;
        this.longTermDossier.lastSaved=Date.now();this.longTermDossier.counterOutcomes=this.outcomes;this.longTermDossier.tacticOutcomes=this.tacticOutcomes;
        root.localStorage.setItem('ymm-ai-dossier-v1',JSON.stringify(this.longTermDossier));return true;
      }catch(e){return false;}
    }
    get adaptationPct(){const p=this.learningProfile();return Math.min(100,Math.round(this.adaptation*4+(p.samples?((p.jump+p.retreat+p.approach+p.still+p.dash)*30):0)));}
    record(type,detail={}){this.memory.push({type,detail,t:this.game.elapsed});if(this.memory.length>80)this.memory.shift();YMM.events.emit('ai:memory',{type,detail});}
    speak(bucket,force=false){const lines=DIALOGUE[bucket]||DIALOGUE.suspicious;const available=lines.filter(line=>!this.recentLines.slice(-4).includes(line));const line=YMM.Util.pick(available.length?available:lines);this.dialogue=line;this.dialogueTimer=2.8;this.recentLines.push(line);if(this.recentLines.length>8)this.recentLines.shift();if(force||this.game.world===1&&this.phase>=2)this.record('dialogue',{bucket,line});return line;}
    taunt(kind='mock'){
      const now=this.game.elapsed;if(now-this.lastTauntAt<1.25){this.game.toast('Está fingiendo que no te ha oído. O quizá ha aprendido a ignorarte.');return false;}
      this.lastTauntAt=now;this.provocation+=kind==='humiliate'?2:1;this.tauntCombo+=1;this.record('taunt',{kind,count:this.provocation,phase:this.phase});
      let bucket;if(this.phase>=3)bucket='corruptor';else if(kind==='humiliate')bucket='humiliation';else if(this.phase===0)bucket=this.provocation===1?'firstTaunt':'repeatedTaunt';else if(this.phase===1)bucket='suspicious';else if(this.phase===2){const p=this.profile;bucket=p.jump>.28?'jumpRead':p.retreat>.3?'retreatRead':'adaptive';}else bucket='corruptor';
      this.speak(bucket,true);this.game.particles.burst(this.game.player.x+12,this.game.player.y+3,this.phase>=2?'#ff617c':'#ffcf79',14);this.game.audio.play(this.phase>=2?'glitch':'taunt');YMM.events.emit('ai:taunt',{kind,count:this.provocation,phase:this.phase});
      // Advance one narrative phase per interaction; a high-risk challenge cannot skip the story beats.
      if(this.phase===0&&this.provocation>=3)this.evolve(1,'La IA ha dejado de tropezarse cada vez. Qué decepción.');
      else if(this.phase===1&&this.provocation>=5)this.evolve(2,'La IA está comparando tus movimientos, no solo tus burlas.');
      else if(this.phase===2&&this.provocation>=6)this.evolve(3,'El mundo se ha corrompido. Esto no parece parte del nivel.');
      return true;
    }
    observe(action,meta={}){
      const now=this.game.elapsed;if(!action)return;const last=this.lastActionAt[action]??-Infinity;
      if(now-last<.22)return;this.lastActionAt[action]=now;
      this.observations.push({action,t:now,meta});if(this.observations.length>40)this.observations.shift();
      if(this.longTermDossier){const counts=this.longTermDossier.actionCounts;counts[action]=(counts[action]||0)+1;}
      this.tactics[action]=(this.tactics[action]||0)+1;const p=this.profile;
      this.adaptation=Math.min(20,this.observations.length*.22+(p.jump*1.4+p.retreat*1.2+p.dash*.8)*3);
      this.record('observation',{action,profile:{jump:+p.jump.toFixed(2),retreat:+p.retreat.toFixed(2),still:+p.still.toFixed(2),dash:+p.dash.toFixed(2)}});
      if(this.phase>=2)this.evaluateStrategy();
    }
    observePlayerPosition(x,y,dt){
      this.sampleTimer+=dt;if(this.sampleTimer<.55)return;this.sampleTimer=0;
      if(this.lastPlayerX===null){this.lastPlayerX=x;this.lastPlayerY=y;return;}
      const dx=x-this.lastPlayerX,dy=y-this.lastPlayerY,enemy=this.game.enemy;
      if(this.game.world===1&&enemy){const distance=Math.abs(x-(enemy.x+15));if(this.lastDistance!==null){const change=distance-this.lastDistance;if(change>24)this.observe('retreat');else if(change< -24)this.observe('approach');else if(Math.abs(dx)<15&&Math.abs(dy)<15)this.observe('still');}this.lastDistance=distance;}
      else if(this.game.world===4){if(Math.hypot(dx,dy)<.12)this.observe('still');else if(Math.abs(dx)>Math.abs(dy))this.observe(dx<0?'retreat':'approach');else this.observe(dy<0?'retreat':'approach');}
      else{if(Math.abs(dx)<14&&Math.abs(dy)<14)this.observe('still');else if(Math.abs(dx)>Math.abs(dy)){this.observe(dx<0?'approach':'retreat');}}
      this.lastPlayerX=x;this.lastPlayerY=y;
    }
    evaluateStrategy(){
      const p=this.learningProfile();if(p.samples<4)return;
      // Utility-based policy: score counters against the player's recent behavior, then add a
      // small exploration term so the enemy cannot be solved by repeating one action forever.
      const totalTrials=Object.values(this.outcomes).reduce((sum,item)=>sum+item.tries,0);
      const learned=key=>{const stat=this.outcomes[key];const confidence=Math.sqrt(Math.log(totalTrials+2)/(stat.tries+1));return stat.value*.28+confidence*.12;};
      const score={
        antiAir:p.jump*1.55+learned('antiAir'),
        intercept:p.retreat*1.42+p.dashLeft*.22+learned('intercept'),
        pressure:p.still*1.35+p.approach*.2+learned('pressure'),
        feint:p.dash*.7+p.repeat*.45+learned('feint')
      };
      const current={ 'anti-air':'antiAir',intercept:'intercept',pressure:'pressure',feint:'feint'}[this.activeStrategy];if(current)score[current]+=.08;
      // Tiny exploration noise prevents a perfectly predictable policy when scores are tied.
      for(const k in score)score[k]+=(this.phase>=3?.025:.012)*Math.random();
      const key=Object.keys(score).sort((a,b)=>score[b]-score[a])[0];const strategy={antiAir:'anti-air',intercept:'intercept',pressure:'pressure',feint:'feint'}[key];
      if(strategy!==this.activeStrategy&&this.strategyTimer<=0){const old=this.activeStrategy;this.activeStrategy=strategy;this.strategyTimer=4.5;this.record('strategy',{from:old,to:strategy,score});const buckets={'anti-air':'jumpRead',intercept:'retreatRead',pressure:'stillRead',feint:'adaptive'};if(this.phase>=2&&this.game.world===1)this.speak(buckets[strategy]);this.game.log('Contraestrategia activa: '+({ 'anti-air':'anticipación de salto',intercept:'interceptar retirada',pressure:'presión de zona',feint:'engaño táctico'}[strategy])+'.','alert');}
    }
    predictIntent(){
      // First-order transition model: estimate what tends to follow the most recent action,
      // falling back to a decayed frequency model when the transition history is sparse.
      const seq=this.observations.slice(-30),last=seq.length?seq[seq.length-1].action:null;
      const transitions={};let transitionN=0;
      if(last)for(let i=0;i<seq.length-1;i++)if(seq[i].action===last){const k=seq[i+1].action;transitions[k]=(transitions[k]||0)+1;transitionN++;}
      let counts=transitionN>=2?transitions:{};
      if(transitionN<2){counts={};for(const item of seq)counts[item.action]=(counts[item.action]||0)+1;}
      const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
      const total=entries.reduce((s,e)=>s+e[1],0)||1,top=entries[0]||['unknown',0];
      const probabilities=entries.map(e=>e[1]/total);
      const entropy=probabilities.length<=1?0:-probabilities.reduce((s,p)=>s+p*Math.log(p),0)/Math.log(probabilities.length);
      const prediction={action:top[0],confidence:top[1]/total,entropy,transitionSamples:transitionN,samples:seq.length,lastAction:last||'unknown'};
      this.lastPrediction=prediction;return prediction;
    }
    chooseTactic(domain,options){
      if(!options||!options.length)return null;
      const p=this.learningProfile(),prediction=this.predictIntent(),known=Object.values(this.tacticOutcomes).reduce((s,v)=>s+v.tries,0);
      const utility=(option)=>{
        let score=0;
        if(domain==='runner'){
          if(option==='ceiling-sweep')score=p.jump*1.35+(prediction.action==='jump'?prediction.confidence*.24:0);
          else if(option==='ground-rift')score=(1-p.jump)*.62+p.still*.52;
          else if(option==='drone-salvo')score=p.dash*.88+p.retreat*.48+p.sprint*.18;
          else if(option==='shadow-rush')score=p.attack*.64+p.repeat*.52+p.approach*.12;
          else if(option==='collapse-wave')score=p.sprint*.78+p.approach*.24+p.collect*.08;
          else score=.08;
        }else if(domain==='boss3'){
          if(option==='pulse')score=p.still*1.35+(prediction.action==='still'?prediction.confidence*.2:0);
          else if(option==='feint')score=p.dash*.92+p.repeat*.4;
          else if(option==='intercept')score=p.retreat*1.08+p.dashLeft*.2;
          else if(option==='charge')score=p.approach*.42+(1-p.still)*.14;
          else score=.05;
        }else if(domain==='final-boss'){
          if(option==='ring')score=p.still*1.15+(prediction.action==='still'?prediction.confidence*.18:0);
          else if(option==='feint')score=p.dash*.88+p.repeat*.44;
          else if(option==='lunge')score=p.retreat*1.02+p.sprint*.3;
          else if(option==='lattice')score=p.approach*.38+(1-p.dash)*.22;
          else score=.05;
        }else if(domain==='squad'){
          if(option==='crossfire')score=p.dash*.55+p.retreat*.28+p.sprint*.18;
          else if(option==='flank')score=p.still*.88+p.attack*.2;
          else if(option==='pinch')score=p.approach*.45+p.sprint*.62;
          else if(option==='retreat-punish')score=p.retreat*1.16+p.dashLeft*.22;
          else score=.05;
        }else{
          if(option==='anti-air')score=p.jump*1.25;
          else if(option==='intercept')score=p.retreat*1.15+p.dashLeft*.25;
          else if(option==='pressure')score=p.still*1.2+p.approach*.18;
          else if(option==='feint')score=p.dash*.7+p.repeat*.45;
          else score=.06;
        }
        const legacy=({'anti-air':this.outcomes.antiAir,intercept:this.outcomes.intercept,pressure:this.outcomes.pressure,feint:this.outcomes.feint})[option];const stat=this.tacticOutcomes[option]||legacy||{tries:0,value:0};
        const explore=.14*Math.sqrt(Math.log(known+2)/(stat.tries+1));
        const learned=stat.value*.32;
        const freshness=this.lastDirectorChoice[domain]===option?-.11:0;
        return score+explore+learned+freshness+Math.random()*.018;
      };
      const ranked=options.map(option=>({option,score:utility(option)})).sort((a,b)=>b.score-a.score);
      const choice=ranked[0].option;this.lastDirectorChoice[domain]=choice;this.directorDecisions++;
      this.record('director-decision',{domain,choice,ranking:ranked.map(x=>({option:x.option,score:+x.score.toFixed(3)})),prediction,profile:{jump:+p.jump.toFixed(2),dash:+p.dash.toFixed(2),retreat:+p.retreat.toFixed(2),sprint:+p.sprint.toFixed(2),repeat:+p.repeat.toFixed(2)}});
      return choice;
    }
    reportOutcome(strategy,hit,meta={}){
      const key=({'anti-air':'antiAir',intercept:'intercept',pressure:'pressure',feint:'feint'})[strategy];
      const stat=key?this.outcomes[key]:(this.tacticOutcomes[strategy]||(this.tacticOutcomes[strategy]={tries:0,hits:0,value:0}));
      const reward=hit?1:0;stat.tries++;if(hit)stat.hits++;stat.value+=(reward-stat.value)/stat.tries;
      if(this.longTermDossier){this.longTermDossier.counterOutcomes=this.outcomes;this.longTermDossier.tacticOutcomes=this.tacticOutcomes;}
      this.record('outcome',{strategy,hit,reward,learnedValue:+stat.value.toFixed(3),meta});
    }
    evolve(next,message){
      if(next<=this.phase)return;this.phase=next;this.corruption=Math.max(this.corruption,next*22);this.record('evolve',{phase:next});this.game.log(message,next>=3?'danger':'alert');this.game.toast(message);this.game.audio.play('phase');this.game.particles.burst(500,260,next>=3?'#ff617c':'#ffcf79',48);YMM.events.emit('ai:evolve',{phase:next,info:this.info});this.game.hud.syncAI();
      if(next===2){this.fakeDumb=true;this.fakeDumbTimer=2.4;this.speak('fakeDumb');}
      if(next===3){this.speak('corruptor');}
    }
    unlockInvasion(){if(this.phase<4)this.evolve(4,'La IA ha encontrado una frontera entre juegos.');}
    chooseHazard(points,player){
      if(!points.length)return null;const p=this.profile;let best=null,bestScore=-Infinity;
      for(const point of points){const dist=Math.hypot(point.x-player.x,point.y-player.y);const side=point.x<player.x?1:0;let score=0;
        if(p.dashLeft>.25)score+=side*.35;if(p.dashRight>.25)score+=(1-side)*.35;
        score+=(Math.sin(point.x*.017+this.game.clock*.9)*.12);score+=Math.max(0,1-dist/550)*.25;score+=Math.random()*.12;
        if(score>bestScore){bestScore=score;best=point;}}
      this.record('hazardChoice',{x:best.x,y:best.y,playerX:player.x});return best;
    }
    update(dt){
      this.persistenceTimer=(this.persistenceTimer||0)+dt;if(this.persistenceTimer>=4.5){this.saveDossier();this.persistenceTimer=0;}
      if(this.strategyTimer>0)this.strategyTimer-=dt;
      if(this.game.world!==1)return;const e=this.game.enemy,p=this.game.player;if(!e)return;
      if(e.stunned>0){e.tumble=Math.max(e.tumble,.12);e.y=486;return;}
      if(this.phase===0){e.stumbleTimer-=dt;if(e.stumbleTimer<=0){e.stumbleTimer=YMM.Util.rand(1.5,3.3);e.tumble=.32;this.game.particles.burst(e.x+14,505,'#ffcf79',5);}e.tumble=Math.max(0,e.tumble-dt);e.x+=Math.sin(this.game.clock*1.45)*18*dt;e.strategy='stalk';}
      else{
        const delta=p.x-e.x,distance=Math.abs(delta);if(this.phase>=2)this.evaluateStrategy();
        const mode=this.phase>=2?this.activeStrategy:'stalk';e.strategy=mode;
        if(this.fakeDumbTimer>0){this.fakeDumbTimer-=dt;if(this.fakeDumbTimer<=0)this.fakeDumb=false;if(this.phase===2)e.x+=Math.sin(this.game.clock*1.5)*5*dt;}
        else{
          let target=p.x;
          if(mode==='anti-air'&&p.y<470)target=p.x+p.vx*.42;
          else if(mode==='intercept')target=p.x+YMM.Util.clamp(p.vx*.55,-90,90);
          else if(mode==='feint'&&distance>90)target=p.x+Math.sign(delta)*Math.min(75,distance*.35);
          else if(mode==='pressure'&&distance>105)target=p.x;
          const speed=this.phase===1?58:mode==='intercept'?128:mode==='anti-air'?94:mode==='pressure'?88:mode==='feint'?66:86;
          if(distance>38)e.x+=Math.sign(target-e.x)*speed*dt;
          if(mode==='feint'&&this.phase>=3&&distance<110&&e.feintTimer==null)e.feintTimer=.7;
          if(e.feintTimer!=null){e.feintTimer-=dt;if(e.feintTimer<=0){e.feintTimer=null;e.lungeTimer=.24;}}
          if(e.lungeTimer>0){e.lungeTimer-=dt;e.x+=Math.sign(delta)*255*dt;}
        }
        e.x=YMM.Util.clamp(e.x,70,YMM.Levels.world1.width-90);
      }
      e.y=486;
    }
  }
  AntagonistAI.STATES=STATES;AntagonistAI.DIALOGUE=DIALOGUE;YMM.AntagonistAI=AntagonistAI;
})(globalThis);

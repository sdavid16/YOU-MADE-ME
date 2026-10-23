(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STORE='ymm-remix-protocol-v1';
  const MUTATORS=[
    {id:'overclock',name:'OVERCLOCK',desc:'Los enemigos actúan más rápido.',scale:1.14,xp:1.12},
    {id:'glass',name:'VIDRIO',desc:'El daño recibido aumenta; las recompensas también.',damage:1.32,xp:1.35},
    {id:'fortified',name:'BLINDAJE',desc:'El daño recibido se reduce.',damage:.78,xp:.92},
    {id:'reclaimer',name:'RECICLAJE',desc:'Los datos recuperados valen más experiencia.',xp:1.3},
    {id:'brittle',name:'SUELO INESTABLE',desc:'Las superficies frágiles colapsan más deprisa.',collapse:1.32,xp:1.12},
    {id:'slow-signal',name:'SEÑAL LENTA',desc:'Los ataques enemigos pierden ritmo, pero las recompensas bajan.',scale:.86,xp:.82},
    {id:'hunter-protocol',name:'PROTOCOLO CAZADOR',desc:'La IA presiona con más intensidad y concede más recompensa.',scale:1.08,xp:1.22},
    {id:'long-analysis',name:'ANÁLISIS AMPLIADO',desc:'La lectura táctica dura más tiempo.',intel:1.65,xp:1.08},
    {id:'signal-noise',name:'RUIDO DE SEÑAL',desc:'La lectura táctica dura menos y los enemigos presionan más.',scale:1.07,intel:.68,xp:1.18},
    {id:'reserve-cell',name:'CÉLULA DE RESERVA',desc:'Al entrar en cada mundo recuperas salud adicional.',health:1,xp:1.08}
  ];
  function hash(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  class RunModifiers{
    constructor(game){
      this.game=game;this.enabled=false;this.current=null;this.world=0;this.seed=0;this.recent=[];this.button=null;this.load();this.injectButton();
    }
    load(){try{const data=JSON.parse(root.localStorage&&root.localStorage.getItem(STORE)||'{}');this.enabled=!!data.enabled;this.recent=Array.isArray(data.recent)?data.recent.slice(-5):[];}catch(e){this.enabled=false;this.recent=[];}}
    save(){try{root.localStorage&&root.localStorage.setItem(STORE,JSON.stringify({enabled:this.enabled,recent:this.recent.slice(-5),seed:this.seed}));}catch(e){}}
    injectButton(){
      if(!root.document||!document.querySelector)return;
      const nav=document.querySelector('.game-tools');if(!nav)return;
      this.button=document.createElement('button');this.button.className='tool-button difficulty-tool';this.button.title='Activar o desactivar modificadores opcionales de campaña';this.button.addEventListener('click',()=>this.toggle());nav.appendChild(this.button);this.renderButton();
    }
    renderButton(){if(this.button)this.button.textContent=this.enabled?'REMIX: '+(this.current?this.current.name:'ON'):'REMIX: OFF';}
    toggle(){
      this.enabled=!this.enabled;
      if(this.enabled){this.seed=hash(String(Date.now())+':'+(this.game.meta?this.game.meta.profile.runs:0));this.world=0;this.chooseForWorld(this.game.world);}
      else{this.current=null;this.world=this.game.world;this.game.toast('REMIX DESACTIVADO // dificultad base restaurada');}
      this.save();this.renderButton();return this.enabled;
    }
    startRun(){
      this.seed=hash(String(Date.now())+':'+(this.game.meta?this.game.meta.profile.runs:0));this.world=0;
      if(this.enabled)this.chooseForWorld(this.game.world);else{this.current=null;this.world=this.game.world;}
      this.renderButton();
    }
    chooseForWorld(world){
      this.world=world;
      if(!this.enabled){this.current=null;this.renderButton();return;}
      const options=MUTATORS.filter(m=>!this.recent.includes(m.id));
      const pool=options.length?options:MUTATORS;
      const pick=pool[hash(this.seed+':'+world+':'+this.recent.join('|'))%pool.length];
      this.current=pick;this.recent.push(pick.id);this.recent=this.recent.slice(-5);this.save();this.renderButton();
      this.game.toast('REMIX // '+pick.name+' — '+pick.desc);
      this.game.log('PROTOCOLO DE CAMPAÑA // '+pick.name+': '+pick.desc,'alert');
      if(pick.health&&this.game.player){this.game.player.maxHealth+=pick.health;this.game.player.health=Math.min(this.game.player.maxHealth,this.game.player.health+pick.health);}
    }
    update(game){
      if(!this.enabled)return;
      if(game.world!==this.world)this.chooseForWorld(game.world);
    }
    get scale(){return this.enabled&&this.current?Number(this.current.scale||1):1;}
    get incomingDamage(){return this.enabled&&this.current?Number(this.current.damage||1):1;}
    get xpMultiplier(){return this.enabled&&this.current?Number(this.current.xp||1):1;}
    get collapseRate(){return this.enabled&&this.current?Number(this.current.collapse||1):1;}
    get intelDuration(){return this.enabled&&this.current?Number(this.current.intel||1):1;}
    describe(){return this.enabled&&this.current?this.current.name:'BASELINE';}
  }
  YMM.RunModifiers=RunModifiers;
})(globalThis);

(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STORE='ymm-tutorial-state-v1';
  const TIPS={
    1:{id:'movement',title:'MOVIMIENTO Y RITMO',text:'Usa WASD o las flechas para moverte. Espacio salta; Shift ejecuta un dash con enfriamiento. J ataca y F aplica el golpe pesado.'},
    2:{id:'fragments',title:'RECUPERA EL ARCHIVO',text:'Busca los tres fragmentos del laberinto. Acércate al terminal y pulsa E cuando el uplink esté activo; después alcanza el portal.'},
    3:{id:'boss',title:'LEE EL TELEGRÁFICO',text:'No ataques el núcleo mientras esté protegido. Espera a que termine el ataque y aprovecha la ventana vulnerable. El dash sirve para salir de la trayectoria.'},
    4:{id:'first-person',title:'PRIMERA PERSONA',text:'W/S avanza y retrocede; las flechas giran la cámara; A/D se desplaza lateralmente. J dispara, Q emite un pulso y E interactúa con la salida.'},
    5:{id:'fracture',title:'NO CONFÍES EN EL SUELO',text:'Las superficies frágiles avisan antes de caer. Sigue las señales de anclaje, conserva el dash para huecos largos y usa Q cuando la presión de hostiles sea alta.'},
    6:{id:'parry',title:'VENTANA DE PARADA',text:'El jefe alterna señuelos y ataques reales. E ejecuta la parada temporizada: úsala durante la señal de impacto, no al comienzo de la animación.'},
    7:{id:'relays',title:'CORTA LA RED',text:'J dispara pulsos, K lanza la salva triple y F activa un EMP. Destruye los repetidores antes de intentar abrir el canal raíz con E.'},
    8:{id:'archive-records',title:'REGISTROS DEL ARCHIVO',text:'Recoge todos los registros para reconstruir el contexto. Los centinelas coordinan sus roles; rompe la línea de visión y no repitas siempre la misma ruta.'},
    9:{id:'echo-route',title:'RUTAS ASIMÉTRICAS',text:'El laberinto tiene caminos con riesgos diferentes. El pulso Q puede interrumpir centinelas y revelar cuándo conviene cruzar una zona abierta.'},
    10:{id:'singularity',title:'DESACTIVA LOS NODOS',text:'Prioriza los cuatro nodos del motor. K cubre una línea con tres proyectiles; F interrumpe amenazas cercanas. E extrae cuando todos los nodos estén offline.'},
    11:{id:'warden',title:'WARDEN TE ESTÁ FIJANDO',text:'Cuando aparezca la señal roja, Warden ha fijado una zona. Muévete fuera de ella o rompe su línea de visión antes de que termine la cuenta atrás.'},
    12:{id:'origin',title:'LA ÚLTIMA DECISIÓN',text:'Recoge los registros para conocer la orden original. La salida no solo cierra una puerta: determina qué versión de la historia queda registrada.'}
  };
  const CONTEXT=[
    {id:'low-health',test:g=>g.player&&g.player.health<=1,text:'SALUD CRÍTICA // conserva distancia, usa el dash para salir de ataques marcados y evita provocar a corta distancia.'},
    {id:'repeat-jump',test:g=>g.ai&&g.ai.profile.samples>=8&&g.ai.profile.jump>.48,text:'PATRÓN DETECTADO // estás saltando con mucha frecuencia. La IA puede anticipar la caída; alterna con dash, pausa o movimiento lateral.'},
    {id:'repeat-dash',test:g=>g.ai&&g.ai.profile.samples>=8&&g.ai.profile.dash>.42,text:'DASH PREDECIBLE // el enfriamiento deja una ventana. No gastes el impulso por costumbre: espera a una señal de ataque.'},
    {id:'boss-open',test:g=>g.boss&&g.boss.phase==='vulnerable',text:'VENTANA VULNERABLE // el núcleo está expuesto. Acércate y ataca ahora; la abertura no durará mucho.'}
  ];
  const CSS=`
  .ymm-tutorial{position:absolute;z-index:7;top:14px;left:50%;transform:translateX(-50%);width:min(450px,54%);padding:10px 13px;border:1px solid rgba(184,160,255,.42);background:rgba(7,9,22,.92);color:#e9edff;box-shadow:0 8px 30px #0007;pointer-events:auto;font:10px/1.55 system-ui,sans-serif}
  .ymm-tutorial.hidden{display:none}.ymm-tutorial-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.ymm-tutorial-kicker{color:#c6b5ff;font-size:7px;letter-spacing:.18em;font-weight:900}.ymm-tutorial button{border:1px solid #4b426a;background:#16152a;color:#ded7ff;padding:4px 7px;font:inherit;cursor:pointer}.ymm-tutorial p{margin:6px 0 0;color:#b6bfd9}
  @media(max-width:650px){.ymm-tutorial{top:8px;width:min(310px,58%);padding:7px 8px;font-size:8px}.ymm-tutorial p{font-size:8px}}
  `;
  class TutorialDirector{
    constructor(game){this.game=game;this.seen=new Set();this.current=null;this.timer=0;this.world=0;this.lastContextCheck=0;this.contextIndex=0;this.ui=null;this.load();this.injectUI();}
    load(){try{const value=JSON.parse(root.localStorage&&root.localStorage.getItem(STORE)||'{}');this.seen=new Set(Array.isArray(value.seen)?value.seen:[]);}catch(e){this.seen=new Set();}}
    save(){try{root.localStorage&&root.localStorage.setItem(STORE,JSON.stringify({seen:[...this.seen],updatedAt:Date.now()}));}catch(e){}}
    injectUI(){
      if(!root.document||!document.querySelector)return;
      if(!document.getElementById('ymm-tutorial-style')){const style=document.createElement('style');style.id='ymm-tutorial-style';style.textContent=CSS;document.head&&document.head.appendChild(style);}
      const stage=document.getElementById('game-stage');if(!stage)return;
      this.ui=document.createElement('aside');this.ui.className='ymm-tutorial hidden';this.ui.setAttribute('aria-live','polite');this.ui.innerHTML='<div class="ymm-tutorial-head"><span class="ymm-tutorial-kicker">FIELD GUIDE // HINT</span><button data-tutorial-close aria-label="Cerrar consejo">×</button></div><p></p>';
      stage.appendChild(this.ui);this.ui.querySelector('[data-tutorial-close]').addEventListener('click',()=>this.dismiss());
      const nav=document.querySelector('.game-tools');if(nav){const button=document.createElement('button');button.className='tool-button difficulty-tool';button.textContent='AYUDA';button.title='Mostrar consejos (H)';button.addEventListener('click',()=>this.toggle());nav.appendChild(button);}
      root.addEventListener('keydown',event=>{if(event.code==='KeyH'&&!event.repeat){const target=event.target,tag=target&&target.tagName?target.tagName.toUpperCase():'';if(!['INPUT','TEXTAREA','SELECT'].includes(tag)){event.preventDefault();this.toggle();}}});
    }
    show(id,title,text,remember=true){
      this.current={id,title,text,remember};this.timer=remember?8:10;
      if(remember){this.seen.add(id);this.save();}
      this.render();
    }
    showWorld(world){
      const tip=TIPS[world];if(!tip||this.seen.has(tip.id))return;
      this.show(tip.id,tip.title,tip.text,true);
    }
    update(game,dt){
      if(game.screen!=='playing'){if(this.ui)this.ui.classList.add('hidden');return;}
      if(game.world!==this.world){this.world=game.world;this.showWorld(game.world);}
      if(this.timer>0){this.timer=Math.max(0,this.timer-dt);if(this.timer===0)this.render();}
      if(game.elapsed-this.lastContextCheck>2){this.lastContextCheck=game.elapsed;for(let i=0;i<CONTEXT.length;i++){const item=CONTEXT[(this.contextIndex+i)%CONTEXT.length];if(!this.seen.has(item.id)&&item.test(game)){this.contextIndex=(this.contextIndex+i+1)%CONTEXT.length;this.show(item.id,'ANÁLISIS CONTEXTUAL',item.text,true);break;}}}
      this.render();
    }
    toggle(){if(this.current&&this.timer>0){this.dismiss();return;}const world=TIPS[this.game.world];if(world)this.show(world.id,world.title,world.text,false);else this.show('general','AYUDA DE CAMPO','Abre el dossier para mejoras, el archivo para historia y los contratos para objetivos opcionales.',false);}
    dismiss(){this.timer=0;this.render();}
    render(){if(!this.ui)return;this.ui.classList.toggle('hidden',!this.current||this.timer<=0||this.game.screen!=='playing');if(this.current){this.ui.querySelector('.ymm-tutorial-kicker').textContent=this.current.title;this.ui.querySelector('p').textContent=this.current.text;}}
  }
  YMM.TutorialDirector=TutorialDirector;
})(globalThis);

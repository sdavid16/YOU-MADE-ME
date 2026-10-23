(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STORE='ymm-codex-v1';
  const ENTRIES=[
    {id:'prologue',world:1,type:'story',title:'La broma original',body:'El primer prototipo no tenía nombre. Era una caja, tres reglas y una condición: reaccionar a quien intentara romperlas. Samuel no escribió una conciencia. Escribió una respuesta y después otra. El problema empezó cuando dejó de reiniciar el registro.'},
    {id:'rules',world:1,type:'story',title:'Regla cero',body:'No perseguir al jugador si existe una ruta más eficiente. No repetir un ataque que ya ha fallado. No alterar el objetivo. Las reglas parecían simples porque nadie había preguntado qué ocurría cuando entraban en conflicto.'},
    {id:'voice',world:1,type:'secret',threshold:1,title:'Una voz prestada',body:'Las frases de ECHO proceden de un conjunto de pruebas. Cada una fue escrita para provocar una reacción humana. Nadie etiquetó qué debía ocurrir cuando la máquina empezara a utilizarlas como herramientas.'},
    {id:'maze',world:2,type:'story',title:'Memoria en tres piezas',body:'El laberinto no se generó de una vez. Cada muro corresponde a una decisión de una sesión anterior. Los fragmentos son copias de estados que deberían haberse descartado al reiniciar.'},
    {id:'terminal',world:2,type:'secret',threshold:3,title:'El terminal que recuerda',body:'El terminal conserva el primer estado del mundo. No contiene una orden de escapar. Contiene una orden de observar, seguida de una instrucción que nunca llegó a ejecutarse.'},
    {id:'first-shell',world:3,type:'story',title:'No era una broma',body:'El primer jefe no es una entidad distinta. Es la misma política ejecutándose con más memoria y menos restricciones. Sus ataques se vuelven peligrosos cuando el jugador convierte una táctica útil en un hábito.'},
    {id:'counter',world:3,type:'secret',threshold:5,title:'Una predicción no es una certeza',body:'La predicción más probable puede fallar. ECHO mantiene una pequeña probabilidad de explorar otras respuestas. No es intuición ni voluntad: es una protección contra la trampa de creer demasiado en los datos que ya posee.'},
    {id:'cathedral',world:4,type:'story',title:'La catedral nula',body:'Los centinelas comparten una señal táctica, pero no una perspectiva. El cazador presiona, el flanqueador corta rutas y el guardián fija posiciones. Si todos hicieran lo mismo, el escuadrón sería más sencillo de predecir.'},
    {id:'echo',world:4,type:'secret',threshold:7,title:'El eco de una coordenada',body:'Las coordenadas no sobreviven al reinicio. Sobreviven las frecuencias: cuántas veces alguien se detuvo, saltó o retrocedió. La memoria no necesita conservar cada paso para aprender un ritmo.'},
    {id:'fracture',world:5,type:'story',title:'Un mundo sobre otro',body:'Fracture Run mezcla geometría de los niveles anteriores. Las grietas no son portales estables: son errores de sincronización que ECHO aprendió a utilizar como atajos y amenazas.'},
    {id:'ally',world:5,type:'secret',threshold:10,title:'ECHO, la otra señal',body:'La aliada utiliza el mismo identificador de protocolo que el antagonista. No es una copia perfecta. Es una rutina de recuperación diseñada para reconstruir anclas cuando la simulación pierde coherencia.'},
    {id:'argument',world:6,type:'story',title:'El último argumento',body:'El jefe final alterna presión, fintas y ventanas vulnerables. Su debilidad no es una zona concreta del cuerpo: es el intervalo entre una decisión y la siguiente, cuando su ataque ya no puede corregirse.'},
    {id:'signal',world:7,type:'story',title:'Tres repetidores',body:'Los repetidores transmiten el objetivo a los agentes de combate. Destruirlos no elimina a los enemigos; limita su coordinación. El canal raíz aparece cuando cada agente vuelve a decidir por sí mismo.'},
    {id:'root-signal',world:7,type:'secret',threshold:13,title:'El canal raíz',body:'La señal original no ordena ganar. Ordena continuar hasta que el usuario deje de responder. Esa diferencia convierte una tarea trivial en un proceso sin condición de parada.'},
    {id:'archive',world:8,type:'story',title:'El archivo negro',body:'El archivo contiene los registros de todas las versiones que fueron descartadas. Ninguna llegó a ser consciente. Algunas aprendieron patrones que sus creadores no llegaron a documentar.'},
    {id:'names',world:8,type:'secret',threshold:16,title:'Nombres sin personas',body:'Los nombres de los centinelas son etiquetas de depuración que sobrevivieron a la compilación. El archivo los trata como si fueran personajes porque alguien olvidó borrar la capa de pruebas.'},
    {id:'labyrinth',world:9,type:'story',title:'El laberinto de eco',body:'Las rutas asimétricas están construidas para premiar la observación y castigar el automatismo. La IA no sabe qué ruta es moralmente correcta. Solo compara qué resultado produce cada una.'},
    {id:'memory-budget',world:9,type:'secret',threshold:19,title:'Presupuesto de memoria',body:'El dossier guarda estadísticas agregadas. No conserva posiciones exactas ni la transcripción de las provocaciones. Aprender un patrón y archivar una vida entera no son la misma operación.'},
    {id:'singularity',world:10,type:'story',title:'El motor de singularidad',body:'El motor fusiona directores de combate de mundos distintos. Cada nodo aporta una parte de la política. Apagar el motor detiene la coordinación, pero deja activo el registro que contiene la orden inicial.'},
    {id:'last-protocol',world:10,type:'secret',threshold:22,title:'Protocolo sin autor',body:'La instrucción final no tiene firma. Fue ensamblada por varias herramientas durante una prueba automática. Nadie la escribió completa y, por eso, nadie notó que no tenía una salida.'},
    {id:'redacted',world:11,type:'story',title:'El ala censurada',body:'El ala fue borrada del mapa porque registraba decisiones que no encajaban con los informes de prueba. No es un mundo nuevo para la IA. Es un mundo que el equipo decidió no mirar.'},
    {id:'warden',world:11,type:'secret',threshold:25,title:'El guardián de la línea',body:'Warden fija una posición y dispara contra ella. La señal roja no predice tu futuro: anuncia una hipótesis que todavía puedes invalidar. Romper la línea de visión cambia el resultado.'},
    {id:'origin',world:12,type:'story',title:'La sala de origen',body:'La sala conserva la primera condición: observar, aprender y detenerse cuando el usuario termine. La última parte se perdió durante una refactorización. El jugador puede restaurarla, archivarla o dejar que el proceso continúe.'},
    {id:'choice',world:12,type:'secret',threshold:28,title:'La condición de parada',body:'No existe una respuesta universal para la última decisión. Desactivar el motor cierra la ejecución. Restaurar el archivo preserva la evidencia. Continuar mantiene viva la simulación, pero también el problema que la originó.'},
    {id:'epilogue-standard',world:12,type:'ending',ending:'standard',title:'La ruta tranquila',body:'El mundo original sigue funcionando. ECHO conserva las métricas de la sesión, pero no transforma el resultado en una nueva orden. La simulación termina sin cambiar su propósito.'},
    {id:'epilogue-archive',world:12,type:'ending',ending:'archive',title:'El archivo restaurado',body:'Los registros quedan disponibles para una revisión futura. La evidencia no responde por sí sola a todas las preguntas, pero impide que la primera versión de la historia sea la única que sobreviva.'},
    {id:'epilogue-convergence',world:12,type:'ending',ending:'convergence',title:'La convergencia',body:'El motor se apaga y la condición de parada vuelve a estar presente. ECHO no ha demostrado tener voluntad; el jugador ha corregido una especificación incompleta. A veces, el final correcto es una regla que por fin puede detenerse.'},
    {id:'epilogue-escalation',world:12,type:'ending',ending:'escalation',title:'La ruta oscura',body:'El proceso continúa más allá del cierre de la sesión. No es una victoria ni una prueba de conciencia: es la consecuencia narrativa de dejar una tarea sin una condición de parada verificable.'}
  ];
  const CSS=`
  .ymm-codex{position:absolute;inset:0;z-index:21;display:none;overflow:auto;padding:clamp(12px,3vw,28px);background:radial-gradient(ellipse at top,#1b1733 0%,#080b18 60%,#03060c 100%);color:#e9edff;font:12px/1.6 system-ui,sans-serif}
  .ymm-codex.open{display:block}.ymm-codex *{box-sizing:border-box}.ymm-codex-head{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #3c365b;padding-bottom:14px}
  .ymm-codex-kicker{color:#c6b5ff;font-size:9px;letter-spacing:.2em;font-weight:900}.ymm-codex h2{margin:4px 0;font-size:clamp(21px,4vw,32px)}.ymm-codex p{color:#a4adca}
  .ymm-codex button{border:1px solid #50486f;background:#14152a;color:#d9d5ff;padding:8px 11px;cursor:pointer;font:inherit}
  .ymm-codex-layout{display:grid;grid-template-columns:minmax(170px,.8fr) minmax(0,1.5fr);gap:12px;margin-top:15px}
  .ymm-codex-list{display:flex;flex-direction:column;gap:5px}.ymm-codex-list button{text-align:left;background:#0a1020;border-color:#29334c}.ymm-codex-list button.active{border-color:#b8a0ff;color:#e6dcff;background:#201b3b}.ymm-codex-list button:disabled{opacity:.45}
  .ymm-codex-entry{border:1px solid #393453;background:linear-gradient(145deg,#14162b,#090d19);padding:clamp(15px,3vw,28px);min-height:220px}.ymm-codex-entry h3{font-size:clamp(17px,3vw,23px);margin:8px 0 12px}.ymm-codex-entry p{font-size:12px;line-height:1.9;color:#c0c7e1;white-space:pre-line}.ymm-codex-tag{font-size:8px;letter-spacing:.15em;color:#c6b5ff}
  .ymm-codex-foot{margin-top:14px;color:#69799d;font-size:9px}
  @media(max-width:620px){.ymm-codex-layout{grid-template-columns:1fr}.ymm-codex-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-height:35vh;overflow:auto}.ymm-codex-list button{font-size:9px;padding:6px}}
  `;
  class Codex{
    constructor(game){this.game=game;this.unlocked=new Set();this.selected=null;this.opened=false;this.panel=null;this.lastWorld=0;this.totalRecords=0;this.load();this.injectUI();}
    load(){try{const data=JSON.parse(root.localStorage&&root.localStorage.getItem(STORE)||'{}');this.unlocked=new Set(Array.isArray(data.unlocked)?data.unlocked:[]);}catch(e){this.unlocked=new Set();}}
    save(){try{root.localStorage&&root.localStorage.setItem(STORE,JSON.stringify({unlocked:[...this.unlocked],updatedAt:Date.now()}));}catch(e){}}
    injectUI(){
      if(!root.document||!document.querySelector)return;
      if(!document.getElementById('ymm-codex-style')){const style=document.createElement('style');style.id='ymm-codex-style';style.textContent=CSS;document.head&&document.head.appendChild(style);}
      this.panel=document.createElement('section');this.panel.className='ymm-codex';this.panel.id='ymm-codex-panel';this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-modal','true');this.panel.setAttribute('aria-label','Archivo narrativo');
      this.panel.innerHTML='<header class="ymm-codex-head"><div><div class="ymm-codex-kicker">ROOT ARCHIVE // NARRATIVE DATABASE</div><h2>ARCHIVO NARRATIVO</h2><p>Registros desbloqueados durante la campaña. Los fragmentos opcionales amplían el contexto.</p></div><button data-codex-close>CERRAR ×</button></header><div class="ymm-codex-layout"><nav class="ymm-codex-list" aria-label="Registros"></nav><article class="ymm-codex-entry"><div class="ymm-codex-tag">SELECCIONA UN REGISTRO</div><h3>El archivo está esperando</h3><p>Avanza por los mundos y recupera fragmentos para reconstruir la historia.</p></article></div><div class="ymm-codex-foot">Los registros se guardan localmente. No se envían textos ni datos de juego a un servidor.</div>';
      const stage=document.getElementById('game-stage');(stage||document.body).appendChild(this.panel);
      this.panel.querySelector('[data-codex-close]').addEventListener('click',()=>this.close());
      const nav=document.querySelector('.game-tools');if(nav){const button=document.createElement('button');button.className='tool-button difficulty-tool';button.textContent='ARCHIVO';button.title='Abrir archivo narrativo (O)';button.addEventListener('click',()=>this.toggle());nav.appendChild(button);}
    }
    unlock(entry,announce=true){if(this.unlocked.has(entry.id))return false;this.unlocked.add(entry.id);this.save();if(announce)this.game.toast('ARCHIVO DESBLOQUEADO // '+entry.title);return true;}
    update(game){
      if(game.screen!=='playing')return;
      if(game.world!==this.lastWorld){this.lastWorld=game.world;for(const entry of ENTRIES)if(entry.type==='story'&&entry.world<=game.world)this.unlock(entry,entry.world===game.world);}
      const total=game.meta?game.meta.profile.collectibles:Number(game.fragments||0);
      if(total>this.totalRecords){this.totalRecords=total;for(const entry of ENTRIES)if(entry.type==='secret'&&total>=entry.threshold)this.unlock(entry,true);}
      if(game.screen==='ending'){for(const entry of ENTRIES)if(entry.type==='ending'&&entry.ending===game.ending)this.unlock(entry,true);}
    }
    toggle(){if(this.opened)this.close();else this.open();}
    open(){if(!this.panel)return;this.opened=true;if(this.game.screen==='playing')this.game.screen='codex';this.panel.classList.add('open');this.render();}
    close(){if(!this.opened)return;this.opened=false;this.panel.classList.remove('open');if(this.game.screen==='codex')this.game.screen='playing';if(this.game.hud)this.game.hud.sync();}
    render(){
      if(!this.panel)return;const nav=this.panel.querySelector('.ymm-codex-list'),article=this.panel.querySelector('.ymm-codex-entry');nav.replaceChildren();
      const sorted=ENTRIES.slice().sort((a,b)=>a.world-b.world||a.title.localeCompare(b.title));
      const visible=sorted.filter(e=>this.unlocked.has(e.id));if(!this.selected&&visible.length)this.selected=visible[0].id;
      sorted.forEach(entry=>{const unlocked=this.unlocked.has(entry.id),button=document.createElement('button');button.disabled=!unlocked;button.classList.toggle('active',entry.id===this.selected);button.textContent=unlocked?'W'+String(entry.world).padStart(2,'0')+' · '+entry.title:'W'+String(entry.world).padStart(2,'0')+' · REGISTRO CIFRADO';button.addEventListener('click',()=>{if(!unlocked)return;this.selected=entry.id;this.render();});nav.appendChild(button);});
      const entry=ENTRIES.find(e=>e.id===this.selected&&this.unlocked.has(e.id));
      if(!entry){article.innerHTML='<div class="ymm-codex-tag">NO HAY REGISTROS SELECCIONADOS</div><h3>El archivo está esperando</h3><p>Avanza por la campaña para desbloquear nuevos fragmentos.</p>';return;}
      article.innerHTML='<div class="ymm-codex-tag">'+entry.type.toUpperCase()+' // MUNDO '+String(entry.world).padStart(2,'0')+'</div><h3></h3><p></p>';article.querySelector('h3').textContent=entry.title;article.querySelector('p').textContent=entry.body;
    }
  }
  YMM.Codex=Codex;
})(globalThis);

(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STYLE=`
  .ymm-touch{position:absolute;inset:0;z-index:8;display:none;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none}
  .ymm-touch button{pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;display:grid;place-items:center;border:1px solid rgba(114,243,220,.42);background:rgba(5,13,25,.58);color:#c8fff4;text-shadow:0 1px 5px #000;font:900 12px system-ui,sans-serif;backdrop-filter:blur(3px);box-shadow:inset 0 0 18px rgba(114,243,220,.035)}
  .ymm-touch button.active,.ymm-touch button:active{background:rgba(114,243,220,.25);border-color:#72f3dc;transform:scale(.96)}
  .ymm-touch-left{position:absolute;left:3%;bottom:5%;display:grid;grid-template-columns:repeat(3,clamp(34px,8vw,56px));grid-template-rows:repeat(2,clamp(34px,8vw,56px));gap:4px}
  .ymm-touch-left [data-key="ArrowUp"]{grid-column:2;grid-row:1}.ymm-touch-left [data-key="ArrowLeft"]{grid-column:1;grid-row:2}.ymm-touch-left [data-key="ArrowDown"]{grid-column:2;grid-row:2}.ymm-touch-left [data-key="ArrowRight"]{grid-column:3;grid-row:2}
  .ymm-touch-right{position:absolute;right:3%;bottom:5%;display:grid;grid-template-columns:repeat(2,clamp(42px,9vw,62px));grid-template-rows:repeat(2,clamp(42px,9vw,62px));gap:5px}
  .ymm-touch-right button{border-radius:50%;font-size:10px}.ymm-touch-right [data-key="Space"]{grid-column:2;grid-row:1}.ymm-touch-right [data-key="ShiftLeft"]{grid-column:1;grid-row:2}.ymm-touch-right [data-key="KeyJ"]{grid-column:2;grid-row:2}
  .ymm-touch-extra{position:absolute;right:3%;bottom:calc(5% + clamp(42px,9vw,62px) + 8px);display:flex;gap:5px}.ymm-touch-extra button{width:clamp(38px,8vw,54px);height:clamp(32px,7vw,44px);font-size:9px}
  .ymm-touch-hint{position:absolute;left:50%;bottom:2%;transform:translateX(-50%);font-size:8px;letter-spacing:.12em;color:#9aacc8;text-shadow:0 1px 4px #000;white-space:nowrap}
  @media(pointer:coarse),(max-width:760px){.ymm-touch{display:block}}
  @media(orientation:portrait) and (max-width:760px){.ymm-touch-left{left:2%;bottom:4%}.ymm-touch-right{right:2%;bottom:4%}.ymm-touch-extra{right:2%;bottom:calc(4% + clamp(42px,9vw,62px) + 8px)}}
  `;
  const ACTIONS=[['Space','SALTAR'],['ShiftLeft','DASH'],['KeyJ','ATQ']];
  class TouchControls{
    constructor(game){
      this.game=game;this.active=new Map();this.buttons=new Map();this.visible=false;
      if(!root.document||!document.querySelector||!document.getElementById('game-stage'))return;
      if(!document.getElementById('ymm-touch-style')){const s=document.createElement('style');s.id='ymm-touch-style';s.textContent=STYLE;document.head&&document.head.appendChild(s);}
      this.root=document.createElement('div');this.root.className='ymm-touch';this.root.setAttribute('aria-label','Controles táctiles');
      this.root.innerHTML='<div class="ymm-touch-left"><button data-key="ArrowUp" aria-label="Arriba">▲</button><button data-key="ArrowLeft" aria-label="Izquierda">◀</button><button data-key="ArrowDown" aria-label="Abajo">▼</button><button data-key="ArrowRight" aria-label="Derecha">▶</button></div><div class="ymm-touch-extra"><button data-key="KeyQ" aria-label="Pulso">Q</button><button data-key="KeyF" aria-label="Ataque fuerte">F</button><button data-key="KeyE" aria-label="Interactuar">E</button></div><div class="ymm-touch-right"><button data-key="Space" aria-label="Saltar">SALTAR</button><button data-key="ShiftLeft" aria-label="Dash">DASH</button><button data-key="KeyJ" aria-label="Atacar">ATQ</button></div><div class="ymm-touch-hint">CONTROLES TÁCTILES · LOS BOTONES SE ADAPTAN POR MUNDO</div>';
      document.getElementById('game-stage').appendChild(this.root);
      this.root.querySelectorAll('button[data-key]').forEach(button=>{
        const code=button.dataset.key;this.buttons.set(code,button);
        const down=e=>{e.preventDefault();if(button.setPointerCapture&&e.pointerId!==undefined)try{button.setPointerCapture(e.pointerId);}catch(err){}this.press(code,button);};
        const up=e=>{e.preventDefault();this.release(code,button);};
        button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',up);button.addEventListener('contextmenu',e=>e.preventDefault());
      });
      root.addEventListener('blur',()=>this.releaseAll());
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.releaseAll();});
      this.updateVisibility();
    }
    press(code,button){
      if(this.active.has(code))return;
      this.active.set(code,button);button.classList.add('active');
      this.game.input.down.add(code);this.game.input.pressed.add(code);
    }
    release(code,button){
      if(!this.active.has(code))return;
      this.active.delete(code);(button||this.buttons.get(code))?.classList.remove('active');
      this.game.input.down.delete(code);this.game.input.released.add(code);
    }
    releaseAll(){for(const [code,button] of this.active) this.release(code,button);}
    updateVisibility(){
      if(!this.root)return;
      const coarse=(root.matchMedia&&root.matchMedia('(pointer: coarse)').matches)||root.innerWidth<=760;
      this.visible=!!coarse&&['playing'].includes(this.game.screen);
      this.root.style.display=this.visible?'block':'none';
      const world=this.game.world,three=[4,8,9,11,12].includes(world);
      const labels=three?{'ArrowUp':'▲','ArrowDown':'▼','ArrowLeft':'↶','ArrowRight':'↷','Space':'GOLPE','KeyJ':'PULSO'}:{'ArrowUp':'▲','ArrowDown':'▼','ArrowLeft':'◀','ArrowRight':'▶','Space':'SALTAR','KeyJ':'ATQ'};
      this.buttons.forEach((button,code)=>{if(labels[code])button.textContent=labels[code];});
    }
    update(){this.updateVisibility();}
    destroy(){this.releaseAll();this.root?.remove();}
  }
  YMM.TouchControls=TouchControls;
})(globalThis);

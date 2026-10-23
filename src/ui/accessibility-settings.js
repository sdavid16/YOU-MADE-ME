(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STORE='ymm-accessibility-v1';
  const DEFAULTS={reducedMotion:false,highContrast:false,particles:true,screenShake:false,volume:.12,largeText:false};
  const CSS=`
  .ymm-settings{position:absolute;inset:0;z-index:22;display:none;overflow:auto;padding:clamp(14px,3vw,30px);background:rgba(3,7,15,.97);color:#e6f0ff;font:12px/1.6 system-ui,sans-serif}
  .ymm-settings.open{display:block}.ymm-settings *{box-sizing:border-box}.ymm-settings-head{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #34435b;padding-bottom:14px}
  .ymm-settings-kicker{font-size:9px;letter-spacing:.2em;color:#72f3dc;font-weight:900}.ymm-settings h2{font-size:clamp(21px,4vw,32px);margin:4px 0}.ymm-settings p{color:#9eacc6}
  .ymm-settings button{font:inherit;cursor:pointer}.ymm-settings-close{border:1px solid #52627b;background:#111b2b;color:#d9e9ff;padding:8px 12px}
  .ymm-settings-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:17px 0}
  .ymm-settings-item{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #283951;background:linear-gradient(145deg,#101d30,#080e19);padding:14px}
  .ymm-settings-item strong{display:block;font-size:11px}.ymm-settings-item small{display:block;color:#8192af;font-size:9px;margin-top:3px}
  .ymm-settings-item input[type=checkbox]{width:20px;height:20px;accent-color:#72f3dc;flex-shrink:0}.ymm-settings-item input[type=range]{width:110px;accent-color:#72f3dc}
  .ymm-settings-actions{display:flex;flex-wrap:wrap;gap:8px}.ymm-settings-actions button{border:1px solid #416276;background:#102532;color:#bffff5;padding:9px 12px}
  .ymm-settings-note{margin-top:16px;font-size:9px;color:#6e809e}
  body.ymm-high-contrast .game-stage{outline:2px solid #fff;box-shadow:0 0 0 3px #000,0 0 0 5px #fff}
  body.ymm-high-contrast .game-toast{border-width:2px;color:#fff;background:#000}
  body.ymm-large-text .game-toast{font-size:14px;max-width:90%}
  body.ymm-large-text .corner-title{font-size:12px}
  body.ymm-reduced-motion .stage-grain{display:none}
  @media(max-width:620px){.ymm-settings-list{grid-template-columns:1fr}.ymm-settings-item{padding:11px}}
  `;
  class AccessibilitySettings{
    constructor(game){this.game=game;this.settings=this.load();this.opened=false;this.panel=null;this.injectUI();this.apply();}
    load(){try{return Object.assign({},DEFAULTS,JSON.parse(root.localStorage&&root.localStorage.getItem(STORE)||'{}'));}catch(e){return {...DEFAULTS};}}
    save(){try{root.localStorage&&root.localStorage.setItem(STORE,JSON.stringify(this.settings));}catch(e){}}
    injectUI(){
      if(!root.document||!document.querySelector)return;
      if(!document.getElementById('ymm-settings-style')){const style=document.createElement('style');style.id='ymm-settings-style';style.textContent=CSS;document.head&&document.head.appendChild(style);}
      const stage=document.getElementById('game-stage');if(!stage)return;
      this.panel=document.createElement('section');this.panel.className='ymm-settings';this.panel.id='ymm-settings-panel';this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-modal','true');this.panel.setAttribute('aria-label','Ajustes de accesibilidad');
      this.panel.innerHTML='<header class="ymm-settings-head"><div><div class="ymm-settings-kicker">SYSTEM CONFIGURATION // ACCESSIBILITY</div><h2>AJUSTES</h2><p>Opciones visuales y de sonido. Se guardan en este navegador.</p></div><button class="ymm-settings-close" data-settings-close>CERRAR ×</button></header><div class="ymm-settings-list"><label class="ymm-settings-item"><span><strong>Reducir movimiento</strong><small>Desactiva glitch y líneas animadas.</small></span><input type="checkbox" data-setting="reducedMotion"></label><label class="ymm-settings-item"><span><strong>Alto contraste</strong><small>Refuerza los límites de la interfaz.</small></span><input type="checkbox" data-setting="highContrast"></label><label class="ymm-settings-item"><span><strong>Partículas</strong><small>Reduce carga gráfica si se desactivan.</small></span><input type="checkbox" data-setting="particles"></label><label class="ymm-settings-item"><span><strong>Vibración visual</strong><small>Permite el movimiento de cámara por impactos.</small></span><input type="checkbox" data-setting="screenShake"></label><label class="ymm-settings-item"><span><strong>Texto ampliado</strong><small>Mejora la lectura de avisos.</small></span><input type="checkbox" data-setting="largeText"></label><label class="ymm-settings-item"><span><strong>Volumen maestro</strong><small>Ajusta el volumen de los efectos.</small></span><input type="range" min="0" max="0.3" step="0.01" data-setting="volume"></label></div><div class="ymm-settings-actions"><button data-settings-reset>RESTAURAR AJUSTES</button><button data-settings-close>VOLVER AL JUEGO</button></div><p class="ymm-settings-note">Los ajustes no requieren una cuenta. El juego no transmite tu configuración ni el historial de juego a un servidor.</p>';
      stage.appendChild(this.panel);
      this.panel.querySelectorAll('[data-setting]').forEach(input=>{const key=input.dataset.setting;input.addEventListener('change',()=>{this.settings[key]=input.type==='checkbox'?input.checked:Number(input.value);this.save();this.apply();});input.addEventListener('input',()=>{if(key==='volume'){this.settings.volume=Number(input.value);this.applyVolume();}});});
      this.panel.querySelectorAll('[data-settings-close]').forEach(button=>button.addEventListener('click',()=>this.close()));
      this.panel.querySelector('[data-settings-reset]').addEventListener('click',()=>{this.settings={...DEFAULTS};this.save();this.apply();this.renderInputs();});
      const nav=document.querySelector('.game-tools');if(nav){const button=document.createElement('button');button.className='tool-button difficulty-tool';button.textContent='AJUSTES';button.title='Ajustes de accesibilidad (P)';button.addEventListener('click',()=>this.toggle());nav.appendChild(button);}
      root.addEventListener('keydown',event=>{if(event.code==='KeyP'&&!event.repeat){const target=event.target,tag=target&&target.tagName?target.tagName.toUpperCase():'';if(!['INPUT','TEXTAREA','SELECT'].includes(tag)){event.preventDefault();this.toggle();}}});
      this.renderInputs();
    }
    renderInputs(){if(!this.panel)return;this.panel.querySelectorAll('[data-setting]').forEach(input=>{const key=input.dataset.setting;if(input.type==='checkbox')input.checked=!!this.settings[key];else input.value=String(this.settings[key]);});}
    apply(){if(root.document&&document.body){document.body.classList.toggle('ymm-high-contrast',!!this.settings.highContrast);document.body.classList.toggle('ymm-large-text',!!this.settings.largeText);document.body.classList.toggle('ymm-reduced-motion',!!this.settings.reducedMotion);}if(this.game.renderer)this.game.renderer.accessibility=this.settings;this.applyVolume();this.renderInputs();}
    applyVolume(){if(this.game.audio&&typeof this.game.audio.setVolume==='function')this.game.audio.setVolume(Number(this.settings.volume));}
    toggle(){if(this.opened)this.close();else this.open();}
    open(){if(!this.panel)return;this.opened=true;if(this.game.screen==='playing')this.game.screen='settings';this.panel.classList.add('open');this.renderInputs();}
    close(){if(!this.opened)return;this.opened=false;this.panel.classList.remove('open');if(this.game.screen==='settings')this.game.screen='playing';if(this.game.hud)this.game.hud.sync();}
  }
  YMM.AccessibilitySettings=AccessibilitySettings;
})(globalThis);

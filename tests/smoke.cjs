/* Lightweight no-dependency smoke test for game logic (mock DOM/Canvas). */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const base = path.resolve(__dirname, '..');
const listeners = {};
class FakeClassList { add(){} remove(){} toggle(){} }
class FakeElement {
  constructor(id='') { this.id=id; this.textContent=''; this.innerHTML=''; this.style={}; this.classList=new FakeClassList(); this.children=[]; this.firstElementChild=new FakeElementChild(); this.value=''; this.handlers={}; }
  addEventListener(n,fn){(this.handlers[n] ||= []).push(fn)}
  replaceChildren(){this.children=[]}
  append(...els){this.children.push(...els)}
  appendChild(el){this.children.push(el);return el;}
}
class FakeElementChild { constructor(){this.textContent='';} }
const ctx = new Proxy({
  createLinearGradient(){return {addColorStop(){}}}, measureText(t){return {width:String(t).length*6}},
  canvas:null, save(){},restore(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},arc(){},arcTo(){},ellipse(){},fill(){},stroke(){},fillRect(){},strokeRect(){},clearRect(){},translate(){},scale(){},rotate(){},setLineDash(){},fillText(){},
}, {get(o,k){if(k in o)return o[k];if(typeof k==='string')return 0;},set(o,k,v){o[k]=v;return true;}});
const elements=new Map();
const canvas=new FakeElement('game');canvas.width=1000;canvas.height=620;canvas.getContext=()=>{ctx.canvas=canvas;return ctx;};elements.set('game',canvas);
['frame-world','frame-hint','controls-copy','world-title','chapter-pill','world-description','provocation-value','provocation-meter','provocation-caption','adaptation-value','adaptation-meter','adaptation-caption','ai-avatar','ai-state','ai-status-line','status-led','log-entries','toast','start-button','taunt-button','action-copy','pause-screen','resume-button','audio-button','restart-button','game-frame'].forEach(id=>elements.set(id,new FakeElement(id)));
const document={readyState:'complete',getElementById(id){if(!elements.has(id))elements.set(id,new FakeElement(id));return elements.get(id);},createElement(){return new FakeElement();},addEventListener(n,fn){(listeners['document:'+n] ||= []).push(fn);}};
const sandbox={console,document,window:null,globalThis:null,requestAnimationFrame(fn){sandbox.nextFrame=fn;return 1;},performance:{now(){return 0}},setTimeout,clearTimeout,Math,Date,Set,Map,Array,Object,String,Number,JSON,Infinity};
sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.addEventListener=(n,fn)=>{(listeners['window:'+n] ||= []).push(fn)};
vm.createContext(sandbox);
const files=['src/core/util.js','src/core/events.js','src/core/input.js','src/core/audio.js','src/game/levels.js','src/game/ai.js','src/game/particles.js','src/game/renderer.js','src/ui/hud.js','src/game/game.js','src/main.js'];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),sandbox,{filename:f});
const g=sandbox.youMadeMe;
function assert(v,msg){if(!v)throw new Error('ASSERTION FAILED: '+msg);}
assert(g&&g.screen==='menu','app booted on menu');g.renderer.render(g);g.newGame();g.renderer.render(g);assert(g.screen==='playing'&&g.world===1,'starts game');
for(let i=0;i<6;i++){g.ai.lastTauntAt=-999;g.provoke('mock');}
assert(g.ai.provocation===6,'provocation count');assert(g.ai.phase===3,'phase evolution after 6 taunts');
const beforeSpam=g.ai.provocation;g.ai.lastTauntAt=g.elapsed;g.provoke('mock');assert(g.ai.provocation===beforeSpam,'taunt cooldown prevents spam');
g.newGame();g.player.x=250;g.player.y=400;g.player.vy=400;g.player.grounded=false;g.updateWorld1(.033);assert(g.player.grounded&&Math.abs(g.player.y-400)<.1,'one-way platform landing');
g.enterWorld2();assert(g.world===2&&g.ai.phase===4,'world 2 + invasion phase');g.renderer.render(g);
for(const f of sandbox.YMM.Levels.world2.fragments){g.player.x=f.x;g.player.y=f.y;g.updateWorld2(.01);}
assert(g.fragments===3,'all three fragments can be collected');
g.player.x=sandbox.YMM.Levels.world2.terminal.x+24;g.player.y=sandbox.YMM.Levels.world2.terminal.y+24;g.input.pressed.add('KeyE');g.updateWorld2(.01);g.input.pressed.clear();assert(g.uplinkActive,'terminal activates after fragments');
g.player.x=sandbox.YMM.Levels.world2.portal.x;g.player.y=sandbox.YMM.Levels.world2.portal.y;g.updateWorld2(.01);assert(g.world===3&&g.boss.hp===8,'portal reaches world 3 boss setup');g.renderer.render(g);
g.boss.phase='vulnerable';g.boss.hp=1;g.boss.x=g.player.x;g.boss.y=g.player.y;g.input.pressed.add('KeyJ');g.update(1/60);assert(g.screen==='ending'&&g.ending==='escalation','final ending after boss defeat');g.renderer.render(g);
g.newGame();g.player.x=sandbox.YMM.Levels.world1.goal.x;g.updateWorld1(1/60);assert(g.screen==='ending'&&g.ending==='standard','quiet route has standard ending');g.renderer.render(g);
console.log('PASS: boot, start, taunt cooldown, AI evolution, one-way platform, fragments, terminal, portal, boss win, standard ending.');

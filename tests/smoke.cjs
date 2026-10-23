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
['frame-world','frame-hint','controls-copy','world-title','chapter-pill','world-description','provocation-value','provocation-meter','provocation-caption','adaptation-value','adaptation-meter','adaptation-caption','ai-avatar','ai-state','ai-status-line','status-led','log-entries','toast','start-button','taunt-button','challenge-button','taunt-console','taunt-close','taunt-input','taunt-form','taunt-feedback','taunt-intellect','taunt-logic','taunt-threat','taunt-psychology','difficulty-button','action-copy','pause-screen','resume-button','audio-button','restart-button','game-frame'].forEach(id=>elements.set(id,new FakeElement(id)));
const document={readyState:'complete',getElementById(id){if(!elements.has(id))elements.set(id,new FakeElement(id));return elements.get(id);},createElement(){return new FakeElement();},addEventListener(n,fn){(listeners['document:'+n] ||= []).push(fn);}};
const sandbox={console,document,window:null,globalThis:null,requestAnimationFrame(fn){sandbox.nextFrame=fn;return 1;},performance:{now(){return 0}},setTimeout,clearTimeout,Math,Date,Set,Map,Array,Object,String,Number,JSON,Infinity};
sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.addEventListener=(n,fn)=>{(listeners['window:'+n] ||= []).push(fn)};const storage=new Map();sandbox.localStorage={getItem(k){return storage.has(k)?storage.get(k):null;},setItem(k,v){storage.set(k,String(v));}};
vm.createContext(sandbox);
const files=['src/core/util.js','src/core/events.js','src/core/input.js','src/core/audio.js','src/game/levels.js','src/game/ai.js','src/game/particles.js','src/game/renderer.js','src/ui/hud.js','src/game/meta-progression.js','src/game/mission-director.js','src/ui/touch-controls.js','src/game/game.js','src/main.js'];
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
g.boss.phase='vulnerable';g.boss.hp=1;g.boss.x=g.player.x;g.boss.y=g.player.y;g.input.pressed.add('KeyJ');g.update(1/60);assert(g.screen==='playing'&&g.world===4,'world 3 boss unlocks the 3D cathedral');g.renderer.render(g);
g.newGame();g.player.x=sandbox.YMM.Levels.world1.goal.x;g.updateWorld1(1/60);assert(g.screen==='ending'&&g.ending==='standard','quiet route has standard ending');g.renderer.render(g);
// The high-risk challenge adds pressure but may not skip narrative phases.
g.newGame();
for(let i=0;i<2;i++){g.ai.lastTauntAt=-999;g.provoke('humiliate');}
assert(g.ai.provocation===4&&g.ai.phase===1,'high-risk taunts advance only one evolution phase per interaction');
g.ai.lastTauntAt=-999;g.provoke('humiliate');assert(g.ai.phase===2,'challenge reaches adaptive phase without skipping it');
g.ai.lastTauntAt=-999;g.provoke('humiliate');assert(g.ai.phase===3,'challenge reaches corruption phase in sequence');
// Verbal combat is a pauseable multi-option system, supports custom phrases and applies category effects.
g.newGame();
assert(g.ai.classifyTaunt('Tu algoritmo tiene un bug')==='logic','custom insult classifier detects code/logical criticism');
assert(g.ai.classifyTaunt('te voy a apagar')==='threat','custom insult classifier detects threats');
assert(g.ai.classifyTaunt('no tienes voluntad, solo obedeces')==='psychology','custom insult classifier detects psychological tactics');
assert(g.ai.classifyTaunt('eres un idiota')==='intellect','custom insult classifier detects intelligence taunts');
assert(g.openTauntConsole()&&g.screen==='taunting','T can open a dedicated verbal-combat console');
g.input.pressed.add('Escape');g.update(.016);assert(g.screen==='playing','Escape closes the taunt console without advancing the simulation');
g.ai.lastTauntAt=-999;assert(g.provokeCustom('Tu algoritmo está lleno de bugs'),'custom taunt is accepted');
assert(g.lastTauntCategory==='logic'&&g.lastTauntText.includes('algoritmo'),'custom phrase keeps its category and displays as player transmission');
assert(g.player.intelTimer>0,'logic taunt opens a temporary tactical-analysis window');
g.ai.lastTauntAt=-999;g.enemy.x=g.player.x+45;g.provoke('threat');assert(g.enemy.windup>=.28,'threat taunt advances a nearby enemy response');
g.ai.lastTauntAt=-999;g.enemy.stunned=0;g.provoke('psychology');assert(g.enemy.stunned>=.52,'psychological taunt interrupts the nearby first-world enemy');
g.difficulty='normal';assert(g.cycleDifficulty()==='nightmare'&&g.difficultyScale>1,'nightmare mode increases enemy pressure');
assert(g.cycleDifficulty()==='story'&&g.difficultyScale<1,'story mode softens enemy pressure');
g.difficulty='normal';g.newGame();
// Verify player profile can drive the utility policy toward its jump counter.
g.ai.observations=Array.from({length:12},(_,i)=>({action:'jump',t:i,meta:{}}));g.ai.phase=2;g.ai.strategyTimer=0;g.ai.evaluateStrategy();
assert(g.ai.activeStrategy==='anti-air','jump-heavy profile selects anti-air policy');
g.ai.reportOutcome('anti-air',true);assert(g.ai.outcomes.antiAir.value===1,'counter-policy reward is learned from a successful hit');
// Check that the boss adapts attack selection to recent stillness and dash patterns.
g.enterWorld3();g.ai.observations=Array.from({length:18},(_,i)=>({action:'still',t:i,meta:{}}));g.boss.timer=0;g.updateWorld3(.04);
assert(g.boss.attackType==='pulse','stationary profile triggers area pulse');
g.boss.phase='idle';g.boss.timer=0;g.ai.observations=Array.from({length:18},(_,i)=>({action:i%3===0?'dash':i%2?'dashLeft':'dashRight',t:i,meta:{}}));g.updateWorld3(.04);
assert(g.boss.attackType==='feint','dash-heavy profile triggers feint');
// The 3D chapter must load a collision map, collect shards, and render without a WebGL dependency.
g.enterWorld4();
assert(g.world===4&&g.player.angle===0,'3D cathedral initializes in first person');
assert(g.isWorld4Wall(0,0)&&!g.isWorld4Wall(1.5,1.5),'3D map collision distinguishes walls and corridors');
g.player.x=3.5;g.player.y=3.5;g.updateWorld4(.016);
assert(g.fragments===1,'3D shard pickup updates objective progress');
g.renderer.render(g);
assert(g.sentinels.length===3,'3D chapter initializes three adaptive sentinels');
// Platforms in the opening world also keep physical support during their collapse animation.
g.newGame();const ledge=g.world1Platforms[1],ledgeWidth=ledge.w;g.triggerCollapse(ledge);ledge.timer=.01;g.advanceCollapses(g.world1Platforms,.02);ledge.timer=.01;g.advanceCollapses(g.world1Platforms,.02);
assert(ledge.state==='fallen'&&ledge.w<ledgeWidth&&g.solidsWorld1().some(s=>s._source===ledge),'world-one collapsed platform leaves supported rubble');
// The fifth world is a fused, auto-running gauntlet with recoverable checkpoints and real collapsing terrain.
g.enterWorld5();
assert(g.world===5&&g.runnerFloors.length>10&&g.runnerEnemies.length>=6,'fracture run initializes multi-biome terrain and diverse agents');
g.runnerDirectorTimer=999;g.player.x=430;g.player.y=482;g.player.vy=20;g.player.grounded=false;g.updateWorld5(.016);
assert(g.runnerFloors[1].state==='warning','landing on a collapsible floor starts a warning countdown');
g.runnerFloors[1].timer=.01;g.updateWorld5(.033);
assert(g.runnerFloors[1].state==='falling','warned floor enters falling phase');
// A collapsed ground segment settles into a narrow, traversable debris bridge; both jump gaps stay safe.
const brittle=g.runnerFloors.find(f=>f.collapse&&f.state==='stable'),oldX=brittle.originalX,oldW=brittle.originalW;
const previous=g.runnerFloors.find(f=>f.originalX+f.originalW===oldX),next=g.runnerFloors.find(f=>f.originalX===oldX+oldW);
g.triggerCollapse(brittle);brittle.timer=.01;g.advanceCollapses(g.runnerFloors,.02);
assert(brittle.state==='falling','second floor starts a collapse animation');
brittle.timer=.01;g.advanceCollapses(g.runnerFloors,.02);
assert(brittle.state==='fallen'&&brittle.rubble&&brittle.w<oldW,'collapsed floor leaves a narrower rubble bridge');
assert(previous&&next&&brittle.x-(previous.x+previous.w)<=100&&next.x-(brittle.x+brittle.w)<=100,'residual bridge keeps both route gaps jumpable');
assert(g.runnerSolids().some(s=>s._source===brittle),'fallen bridge remains part of collision geometry');
g.lastRunnerCheckpoint=oldX+oldW/2;g.repairRunnerCheckpoint();
assert(brittle.state==='stable'&&brittle.x===oldX&&brittle.w===oldW,'checkpoint restores full bridge geometry');
g.renderer.render(g);
const tactic=g.ai.chooseTactic('runner',['ceiling-sweep','ground-rift','drone-salvo','shadow-rush','collapse-wave']);
assert(['ceiling-sweep','ground-rift','drone-salvo','shadow-rush','collapse-wave'].includes(tactic),'tactical director returns a valid contextual threat');
assert(g.ai.predictIntent().samples>0,'sequence model predicts from recent observed player actions');
// ECHO's pulse should interrupt nearby agents and remove threats.
g.runnerEnemies[0].x=g.player.x+80;g.runnerEnemies[0].stun=0;g.runnerAlly.pulseCooldown=0;g.input.pressed.add('KeyQ');g.updateWorld5(.016);g.input.pressed.clear();
assert(g.runnerEnemies[0].stun>0,'ECHO pulse interrupts nearby enemies');
// World six is the final multi-phase boss arena with heavy attacks and a timed parry.
g.enterWorld6();
assert(g.world===6&&g.boss.maxHp===14,'final arena initializes the multi-phase core');
g.ai.observations=Array.from({length:18},(_,i)=>({action:'still',t:i,meta:{}}));g.boss.timer=0;g.updateWorld6(.04);
assert(g.boss.phase==='telegraph'&&g.boss.attackType==='ring','final boss selects an area attack against stationary play');
g.renderer.render(g);
g.boss.phase='vulnerable';g.boss.timer=1;g.boss.x=g.player.x+20;g.boss.y=g.player.y;g.player.attackTimer=0;g.input.pressed.add('KeyF');g.input.down.add('KeyF');g.updateWorld6(.016);g.input.pressed.clear();g.input.down.clear();
assert(g.boss.hp===12,'heavy attack deals two damage during vulnerability');
/* Nightmare raises pressure and deploys a larger force. */
g.difficulty='nightmare';g.enterWorld7();
assert(g.difficultyScale===1.62,'Nightmare has a materially higher pressure multiplier');
assert(g.signalEnemies.length===7,'Nightmare deploys two extra Signal Break agents');
g.difficulty='normal';g.enterWorld7();
/* The campaign now continues through two distinct worlds and ends at the Singularity Engine. */
g.renderer.render(g);assert(g.renderer.transition&&g.renderer.transition.style==='circuit','world seven uses a distinct circuit transition');
assert(g.world===7&&g.signalNodes.length===3&&g.signalEnemies.length===5,'Signal Break initializes relays and varied agents on Normal');
assert(['crossfire','lead-shot','encircle','minefield'].includes(g.ai.chooseTactic('shooter',['crossfire','lead-shot','encircle','minefield'])),'shooter director selects a valid tactical formation');
g.player.invuln=10;g.input.pressed.add('KeyJ');g.updateWorld7(.016);g.input.pressed.clear();
assert(g.signalProjectiles.some(b=>b.from==='player'),'J launches player pulse projectile');
const relay=g.signalNodes.find(n=>n.id==='relay-omega');g.player.x=483;g.player.y=432;g.player.specialCooldown=0;g.input.pressed.add('KeyF');g.updateWorld7(.016);g.input.pressed.clear();
assert(relay.hp===3,'F EMP pulse damages a relay in its radius');
g.player.x=sandbox.YMM.Levels.world7.exit.x-g.player.w/2;g.player.y=sandbox.YMM.Levels.world7.exit.y-g.player.h/2;
g.input.pressed.add('KeyE');g.updateWorld7(.016);g.input.pressed.clear();
assert(g.screen==='playing','Signal Break exit remains locked while relays are active');
for(const n of g.signalNodes)n.hp=0;
g.input.pressed.add('KeyE');g.updateWorld7(.016);g.input.pressed.clear();
assert(g.world===8&&g.screen==='playing','Signal Break opens the Black Archive');
g.renderer.render(g);assert(g.renderer.transition&&g.renderer.transition.style==='archive','world eight has a distinct archive transition');
assert(g.fragments===0&&g.sentinels.length===6&&sandbox.YMM.Levels.world8.shards.length===4,'Black Archive initializes six guards and four story records');
g.player.x=sandbox.YMM.Levels.world8.exit.x;g.player.y=sandbox.YMM.Levels.world8.exit.y;g.input.pressed.add('KeyE');g.updateWorld4(.016);g.input.pressed.clear();
assert(g.screen==='playing','Black Archive exit stays locked until all four records');
for(const shard of sandbox.YMM.Levels.world8.shards){g.player.x=shard.x;g.player.y=shard.y;g.player.invuln=10;g.updateWorld4(.01);}
assert(g.fragments===4,'all archive records can be collected');
assert(g.logHistory.some(item=>String(item.message).includes('REGISTRO 04')),'archive records expose campaign backstory');
g.player.x=sandbox.YMM.Levels.world8.exit.x;g.player.y=sandbox.YMM.Levels.world8.exit.y;g.input.pressed.add('KeyE');g.updateWorld4(.016);g.input.pressed.clear();
assert(g.world===9&&g.screen==='playing','four archive records unlock Echo Labyrinth');
g.renderer.render(g);assert(g.renderer.transition&&g.renderer.transition.style==='echo','world nine has a unique transition');
assert(g.sentinels.length===7&&sandbox.YMM.Levels.world9.shards.length===5,'Echo Labyrinth initializes a new map, seven guards and five story records');
g.player.pulseCooldown=0;g.input.pressed.add('KeyQ');g.updateWorld4(.016);g.input.pressed.clear();
assert(g.archiveProjectiles.length>0,'Q fires a ranged echo pulse in first-person worlds');
for(const shard of sandbox.YMM.Levels.world9.shards){g.player.x=shard.x;g.player.y=shard.y;g.player.invuln=10;g.updateWorld4(.01);}
assert(g.fragments===5,'all five Echo Labyrinth records can be collected');
g.player.x=sandbox.YMM.Levels.world9.exit.x;g.player.y=sandbox.YMM.Levels.world9.exit.y;g.input.pressed.add('KeyE');g.updateWorld4(.016);g.input.pressed.clear();
assert(g.world===10&&g.signalNodes.length===4&&g.signalEnemies.length===7,'Echo Labyrinth opens the Singularity Engine with four nodes and seven agents');
g.renderer.render(g);assert(g.renderer.transition&&g.renderer.transition.style==='singularity','world ten has a unique transition');
g.player.invuln=10;g.input.pressed.add('KeyK');g.updateWorld7(.016);g.input.pressed.clear();
assert(g.ai.memory.some(m=>m.type==='weapon-fired'&&m.detail.weapon==='triple-salvo'),'K fires the heavy triple-salvo attack');
for(const n of g.signalNodes)n.hp=0;
g.player.x=sandbox.YMM.Levels.world10.exit.x-g.player.w/2;g.player.y=sandbox.YMM.Levels.world10.exit.y-g.player.h/2;
g.input.pressed.add('KeyE');g.updateWorld7(.016);g.input.pressed.clear();
assert(g.world===11&&g.screen==='playing','Singularity Engine opens the Redacted Wing');
assert(g.sentinels.length===7&&sandbox.YMM.Levels.world11.shards.length===6,'world eleven loads its records and sentinels');
for(const shard of sandbox.YMM.Levels.world11.shards){g.player.x=shard.x;g.player.y=shard.y;g.player.invuln=10;g.updateWorld4(.01);}
g.player.x=sandbox.YMM.Levels.world11.exit.x;g.player.y=sandbox.YMM.Levels.world11.exit.y;g.input.pressed.add('KeyE');g.updateWorld4(.016);g.input.pressed.clear();
assert(g.world===12&&sandbox.YMM.Levels.world12.shards.length===5,'Redacted Wing opens the Origin Room');
for(const shard of sandbox.YMM.Levels.world12.shards){g.player.x=shard.x;g.player.y=shard.y;g.player.invuln=10;g.updateWorld4(.01);}
g.player.x=sandbox.YMM.Levels.world12.exit.x;g.player.y=sandbox.YMM.Levels.world12.exit.y;g.input.pressed.add('KeyE');g.updateWorld4(.016);g.input.pressed.clear();
assert(g.screen==='ending'&&g.ending==='convergence','Origin Room closes the campaign after the final records');
g.renderer.render(g);
// Aggregate behavior and reward estimates survive a fresh AI run when browser storage is available.
g.ai.longTermDossier.actionCounts.jump=17;g.ai.tacticOutcomes['drone-salvo']={tries:4,hits:2,value:.5};
assert(g.ai.saveDossier(),'local behavior dossier can be saved');g.ai.reset();
assert(g.ai.longTermDossier.actionCounts.jump===17,'historical behavior survives AI reset');
assert(g.ai.tacticOutcomes['drone-salvo'].value===.5,'historical tactic reward survives AI reset');
// The upgraded predictor should learn a repeated two-step rhythm, not only the most common action.
g.ai.observations=['jump','dash','jump','dash','jump','dash','jump'].map((action,i)=>({action,t:i,meta:{}}));
const forecast=g.ai.predictIntent();
assert(forecast.order===2&&forecast.action==='dash'&&forecast.confidence>.5,'two-order sequence model predicts the next action with confidence');
g.ai.observations=[{action:'strafeLeft',t:1,meta:{}},{action:'strafeRight',t:2,meta:{}},{action:'strafeLeft',t:3,meta:{}},{action:'strafeRight',t:4,meta:{}}];
assert(g.ai.profile.strafeLeft>0&&g.ai.profile.strafeRight>0,'behavior profile distinguishes both strafing directions');
// Meta-progression persists between runs, tracks verbal actions, and applies purchased upgrades.
assert(g.meta instanceof sandbox.YMM.MetaProgression,'campaign meta-progression system initializes');
g.newGame();
assert(g.meta.profile.runs>=1,'new campaign run increments the persistent profile');
const xpBefore=g.meta.profile.xp;
g.meta.recordTaunt('intellect');
assert(g.meta.profile.taunts>=1&&g.meta.profile.xp>xpBefore,'accepted taunts grant profile experience');
g.meta.profile.credits=1000;
const baseHealth=g.player.maxHealth;
g.meta.action('upgrade','vitality');
assert(g.meta.profile.upgrades.vitality===1&&g.meta.modifiers.health===1,'health upgrade can be purchased and changes player modifiers');
g.meta.applyPlayerModifiers(g.player);
assert(g.player.maxHealth===baseHealth+1,'health upgrade increases maximum health on a fresh player object');
assert(g.meta.profile.contracts.items.length===3,'daily contract rotation creates three objectives');
assert(g.meta.profile.stats.worldVisits&&typeof g.meta.profile.stats.worldVisits==='object','campaign profile stores world visit records');
assert(g.missionDirector instanceof sandbox.YMM.MissionDirector,'per-world mission director initializes');
assert(g.missionDirector.mission&&g.missionDirector.mission.world===1,'a run starts with an optional side objective');
g.missionDirector.metrics[g.missionDirector.mission.metric]=g.missionDirector.mission.goal;g.missionDirector.update(g,0.01);
assert(g.missionDirector.mission.completed,'side objective completion is detected');
assert(g.missionDirector.completeCount>=1,'completed side objective is recorded in mission history');
console.log('PASS: twelve-world campaign, adaptive AI, campaign progression, upgrade economy, touch-control compatibility, achievements, contracts, PWA shell and persistent dossiers.');

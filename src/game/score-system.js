(function(root){
  'use strict';
  const YMM=root.YMM=root.YMM||{};
  const STORE='ymm-score-records-v1';
  const STYLE=`
  .ymm-score{position:absolute;z-index:5;left:14px;bottom:14px;min-width:150px;padding:8px 11px;border:1px solid rgba(114,243,220,.27);background:rgba(3,8,17,.82);color:#dceeff;font:9px/1.45 system-ui,sans-serif;pointer-events:none}
  .ymm-score.hidden{display:none}.ymm-score-label{font-size:7px;letter-spacing:.17em;color:#8295b5}.ymm-score-value{font-size:18px;font-weight:900;letter-spacing:.06em;color:#72f3dc;font-variant-numeric:tabular-nums}.ymm-score-row{display:flex;justify-content:space-between;gap:12px;color:#8fa2c0}.ymm-score-combo{color:#c6b5ff}
  @media(max-width:650px){.ymm-score{left:8px;bottom:calc(5% + 105px);min-width:115px;padding:6px 8px}.ymm-score-value{font-size:15px}.ymm-score-label{font-size:6px}}
  `;
  class ScoreSystem{
    constructor(game){this.game=game;this.records=[];this.bestScore=0;this.load();this.resetRun();this.lastScreen=game.screen;this.lastWorld=game.world;this.ui=null;this.injectUI();}
    load(){try{const data=JSON.parse(root.localStorage&&root.localStorage.getItem(STORE)||'{}');this.records=Array.isArray(data.records)?data.records.slice(0,10):[];this.bestScore=this.records.reduce((best,r)=>Math.max(best,Number(r.score)||0),0);}catch(e){this.records=[];this.bestScore=0;}}
    save(){try{root.localStorage&&root.localStorage.setItem(STORE,JSON.stringify({records:this.records.slice(0,10),updatedAt:Date.now()}));}catch(e){}}
    injectUI(){
      if(!root.document||!document.querySelector)return;
      if(!document.getElementById('ymm-score-style')){const style=document.createElement('style');style.id='ymm-score-style';style.textContent=STYLE;document.head&&document.head.appendChild(style);}
      const stage=document.getElementById('game-stage');if(!stage)return;
      this.ui=document.createElement('aside');this.ui.className='ymm-score hidden';this.ui.setAttribute('aria-live','polite');this.ui.innerHTML='<div class="ymm-score-label">RUN SCORE // LOCAL RECORD</div><div class="ymm-score-value">000000</div><div class="ymm-score-row"><span class="ymm-score-combo">COMBO ×1.0</span><span class="ymm-score-best">BEST 0</span></div>';stage.appendChild(this.ui);
    }
    resetRun(){
      this.score=0;this.combo=1;this.comboTimer=0;this.elapsed=0;this.runStartedAt=this.game.elapsed||0;this.runSaved=false;this.lastWorld=this.game.world;this.lastFragments=Number(this.game.fragments||0);this.lastTaunts=this.game.ai?this.game.ai.provocation:0;this.lastHealth=this.game.player&&this.game.player.health;this.lastBossHp=this.game.boss&&this.game.boss.hp;this.lastEnemyCount=null;this.lastMissionCount=this.game.missionDirector?this.game.missionDirector.completeCount:0;this.lastAction=null;this.actionStreak=0;this.cleanSeconds=0;this.lastScoreTick=0;this.worldScore={};this.reasonCounts={};
    }
    startRun(){this.resetRun();this.lastWorld=this.game.world;this.lastFragments=Number(this.game.fragments||0);this.lastTaunts=this.game.ai?this.game.ai.provocation:0;this.lastHealth=this.game.player&&this.game.player.health;this.render();}
    award(points,reason='event'){
      const amount=Math.max(0,Math.round(Number(points||0)*this.combo));if(!amount)return 0;
      this.score+=amount;this.worldScore[this.game.world]=(this.worldScore[this.game.world]||0)+amount;this.reasonCounts[reason]=(this.reasonCounts[reason]||0)+1;this.comboTimer=5;this.render();return amount;
    }
    styleAction(action){
      if(!action)return;
      if(action!==this.lastAction){this.actionStreak=Math.min(8,this.actionStreak+1);this.combo=Math.min(3,1+this.actionStreak*.25);this.lastAction=action;this.comboTimer=5;this.award(4,'style');}
      else{this.actionStreak=Math.max(0,this.actionStreak-1);this.combo=Math.max(1,this.combo-.08);}
    }
    currentEnemies(){return this.game.world===7||this.game.world===10?(this.game.signalEnemies||[]):this.game.world===5?(this.game.runnerEnemies||[]):([4,8,9,11,12].includes(this.game.world)?(this.game.sentinels||[]):[]);}
    update(game,dt){
      if(game.screen==='ending'){this.finishRun(game);this.render();return;}
      if(game.screen!=='playing'){if(this.ui)this.ui.classList.add('hidden');this.lastScreen=game.screen;return;}
      this.elapsed+=dt;this.cleanSeconds+=dt;this.comboTimer=Math.max(0,this.comboTimer-dt);if(this.comboTimer===0){this.combo=Math.max(1,this.combo-dt*.12);this.actionStreak=0;}
      if(this.elapsed-this.lastScoreTick>=1){const seconds=Math.floor(this.elapsed-this.lastScoreTick);this.award(seconds*2,'survival');this.lastScoreTick+=seconds;}
      if(game.world!==this.lastWorld){this.award(250,'world');this.lastWorld=game.world;this.lastEnemyCount=null;this.lastBossHp=game.boss&&game.boss.hp;this.lastFragments=Number(game.fragments||0);this.lastHealth=game.player&&game.player.health;}
      const fragments=Number(game.fragments||0);if(fragments>this.lastFragments)this.award((fragments-this.lastFragments)*100,'collectible');this.lastFragments=fragments;
      const taunts=game.ai?game.ai.provocation:0;if(taunts>this.lastTaunts)this.award((taunts-this.lastTaunts)*30,'taunt');this.lastTaunts=taunts;
      const health=game.player&&game.player.health;if(this.lastHealth!==null&&health!==undefined&&health<this.lastHealth){this.score=Math.max(0,this.score-25);this.combo=1;this.actionStreak=0;this.cleanSeconds=0;}if(health!==undefined)this.lastHealth=health;
      const enemies=this.currentEnemies(),alive=enemies.filter(e=>e&&e.hp>0).length;if(this.lastEnemyCount!==null&&alive<this.lastEnemyCount)this.award((this.lastEnemyCount-alive)*80,'enemy');this.lastEnemyCount=alive;
      if(game.boss&&this.lastBossHp!==null&&game.boss.hp<this.lastBossHp)this.award(Math.round((this.lastBossHp-game.boss.hp)*65),'boss');this.lastBossHp=game.boss&&game.boss.hp;
      const missions=game.missionDirector?game.missionDirector.completeCount:0;if(missions>this.lastMissionCount)this.award((missions-this.lastMissionCount)*150,'mission');this.lastMissionCount=missions;
      if(game.input&&game.input.justPressed('KeyJ','KeyF','KeyQ','KeyK','Space'))this.styleAction('attack');
      else if(game.input&&game.input.justPressed('ShiftLeft','ShiftRight'))this.styleAction('dash');
      else if(game.input&&game.input.justPressed('ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD'))this.styleAction('move');
      this.render();this.lastScreen=game.screen;
    }
    finishRun(game){
      if(this.runSaved)return;this.runSaved=true;
      const record={score:this.score,world:game.world,time:Math.round(this.elapsed),difficulty:game.difficulty,ending:game.ending||'unknown',date:new Date().toISOString(),version:1};
      this.records.push(record);this.records.sort((a,b)=>b.score-a.score||a.time-b.time);this.records=this.records.slice(0,10);
      const old=this.bestScore;this.bestScore=this.records.reduce((best,r)=>Math.max(best,r.score),0);this.save();
      if(this.score>old&&this.game.toast)this.game.toast('NUEVO RÉCORD LOCAL // '+this.score.toLocaleString());
    }
    render(){
      if(!this.ui)return;
      this.ui.classList.toggle('hidden',this.game.screen==='menu'||this.game.screen==='paused'||this.game.screen==='meta'||this.game.screen==='settings'||this.game.screen==='codex'||this.game.screen==='taunting');
      this.ui.querySelector('.ymm-score-value').textContent=String(this.score).padStart(6,'0');
      this.ui.querySelector('.ymm-score-combo').textContent='COMBO ×'+this.combo.toFixed(1);
      this.ui.querySelector('.ymm-score-best').textContent='BEST '+this.bestScore.toLocaleString();
    }
  }
  YMM.ScoreSystem=ScoreSystem;
})(globalThis);

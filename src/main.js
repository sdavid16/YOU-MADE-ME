(function (root) {
  const YMM=root.YMM=root.YMM||{};
  function boot(){
    const canvas=document.getElementById('game');
    if(!canvas||!YMM.Game||!YMM.HUD){console.error('YOU MADE ME failed to initialize: required scripts are missing.');return;}
    const hud=new YMM.HUD();const game=new YMM.Game(canvas,hud);hud.bind(game);root.youMadeMe=game;
    let last=performance.now();
    function tick(now){const dt=(now-last)/1000;last=now;game.frame(dt);requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
    window.addEventListener('keydown',e=>{if(e.code==='Enter'&&game.screen==='menu')game.audio.unlock();},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(globalThis);

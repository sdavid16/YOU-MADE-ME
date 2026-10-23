(function (root) {
  const YMM=root.YMM=root.YMM||{};
  function boot(){
    const canvas=document.getElementById('game');
    if(!canvas||!YMM.Game||!YMM.HUD){console.error('YOU MADE ME failed to initialize: required scripts are missing.');return;}
    const hud=new YMM.HUD();const game=new YMM.Game(canvas,hud);hud.bind(game);root.youMadeMe=game;
    const webglCanvas=document.getElementById('webgl-game');
    if(webglCanvas&&YMM.ThreeStage){game.webglStage=new YMM.ThreeStage(webglCanvas);game.webglStage.readyPromise.then(ready=>{game.webglReady=!!ready;});}
    let last=performance.now();
    function tick(now){const dt=(now-last)/1000;last=now;game.frame(dt);if(game.webglStage)game.webglStage.render(game);requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
    if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('YOU MADE ME: offline cache unavailable.',error));
    window.addEventListener('keydown',e=>{if(e.code==='Enter'&&game.screen==='menu')game.audio.unlock();},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(globalThis);

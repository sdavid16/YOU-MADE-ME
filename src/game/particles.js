(function (root) {
  const YMM = root.YMM = root.YMM || {};
  class ParticleSystem {
    constructor() { this.items = []; }
    burst(x, y, color = '#72f3dc', count = 10, speed = 150) {
      for (let i=0;i<count;i++) { const a = Math.random()*Math.PI*2, s = 24+Math.random()*speed, life=.25+Math.random()*.55;
        this.items.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,maxLife:life,size:1.5+Math.random()*3,color,gravity:Math.random()*90}); }
      if (this.items.length > 650) this.items.splice(0, this.items.length - 650);
    }
    trail(x,y,color='#72f3dc') { this.items.push({x,y,vx:YMM.Util.rand(-16,16),vy:YMM.Util.rand(-12,12),life:.18,maxLife:.18,size:YMM.Util.rand(1,3),color,gravity:0}); }
    update(dt) { for (const p of this.items) { p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=p.gravity*dt; p.vx*=Math.max(0,1-dt*.8); } this.items=this.items.filter(p=>p.life>0); }
    draw(ctx) { ctx.save(); for(const p of this.items){ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.restore(); }
  }
  YMM.ParticleSystem = ParticleSystem;
})(globalThis);

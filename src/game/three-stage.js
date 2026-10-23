(function(root){
  const YMM=root.YMM=root.YMM||{};
  class ThreeStage{
    constructor(canvas){
      this.canvas=canvas;this.ready=false;this.failed=false;this.scene=null;this.camera=null;this.renderer=null;this.world=-1;this.entities={walls:[],shards:[],enemies:[],projectiles:[]};this.lastResize=0;
      this.readyPromise=this.boot();
    }
    async boot(){
      try{
        const THREE=await import('https://esm.sh/three@0.180.0');
        this.THREE=THREE;
        this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
        this.renderer.setPixelRatio(Math.min(root.devicePixelRatio||1,1.75));
        this.renderer.setSize(1000,620,false);
        this.renderer.outputColorSpace=THREE.SRGBColorSpace;
        this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure=1.15;
        this.scene=new THREE.Scene();
        this.camera=new THREE.PerspectiveCamera(76,1000/620,.05,80);
        this.scene.fog=new THREE.FogExp2(0x080b17,.055);
        this.scene.add(new THREE.HemisphereLight(0x9aaaff,0x11101e,1.7));
        const key=new THREE.PointLight(0x72f3dc,22,18);key.position.set(8,4,8);this.scene.add(key);
        const fill=new THREE.PointLight(0xb8a0ff,18,15);fill.position.set(2,3,13);this.scene.add(fill);
        this.ready=true;this.canvas.dataset.ready='true';
        root.dispatchEvent(new Event('ymm:webgl-ready'));
      }catch(error){
        this.failed=true;this.canvas.dataset.failed='true';
        const status=document.getElementById('webgl-status');if(status)status.textContent='WebGL 3D no disponible; se usa el renderizador compatible.';
        console.warn('YOU MADE ME: WebGL unavailable; raycast fallback remains active.',error);
      }
      return this.ready;
    }
    material(color,roughness=.48,metalness=.22,emissive=0){
      return new this.THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity:emissive?1.2:0});
    }
    rebuild(game){
      const T=this.THREE,L=game.world===9?YMM.Levels.world9:YMM.Levels.world8;
      this.world=game.world;this.scene.background=new T.Color(game.world===9?0x110b20:0x080b17);
      this.scene.fog.color.set(game.world===9?0x110b20:0x080b17);
      for(const child of [...this.scene.children])if(child.userData.ymmWorldObject)this.scene.remove(child);
      this.entities={walls:[],shards:[],enemies:[],projectiles:[]};
      const floor=new T.Mesh(new T.PlaneGeometry(16,16),this.material(game.world===9?0x1c1530:0x10182a,.86,.12));
      floor.rotation.x=-Math.PI/2;floor.position.set(8,0,8);floor.userData.ymmWorldObject=true;this.scene.add(floor);
      const grid=new T.GridHelper(16,32,game.world===9?0x9b65df:0x286c83,0x273047);grid.position.set(8,.012,8);grid.userData.ymmWorldObject=true;this.scene.add(grid);
      const wallMat=this.material(game.world===9?0x38244d:0x202c46,.38,.55,game.world===9?0x5d2b8d:0x122b48);
      const edgeMat=this.material(game.world===9?0xdb83ff:0x72f3dc,.32,.3,game.world===9?0x8c38c8:0x167d89);
      for(let y=0;y<L.map.length;y++)for(let x=0;x<L.map[y].length;x++)if(L.map[y][x]==='1'){
        const wall=new T.Mesh(new T.BoxGeometry(1,1.8,1),wallMat);wall.position.set(x+.5,.9,y+.5);wall.userData.ymmWorldObject=true;this.scene.add(wall);this.entities.walls.push(wall);
        const edge=new T.Mesh(new T.BoxGeometry(.94,.025,.94),edgeMat);edge.position.set(x+.5,1.82,y+.5);edge.userData.ymmWorldObject=true;this.scene.add(edge);
      }
      const shardMat=this.material(game.world===9?0xe2a0ff:0x72f3dc,.22,.4,game.world===9?0x922bdb:0x1d9eaa);
      for(const shard of L.shards){
        const gem=new T.Mesh(new T.OctahedronGeometry(.19,0),shardMat);gem.position.set(shard.x,.65,shard.y);gem.userData.ymmWorldObject=true;this.scene.add(gem);this.entities.shards.push({mesh:gem,source:shard});
        const light=new T.PointLight(game.world===9?0xd86cff:0x72f3dc,1.2,2.5);light.position.set(shard.x,.8,shard.y);light.userData.ymmWorldObject=true;this.scene.add(light);
      }
      const roster=game.sentinels||[];
      roster.forEach((e,i)=>{
        const group=new T.Group(),color=e.role==='warden'?0xff617c:e.role==='flanker'?0xb8a0ff:0xffcf79;
        const body=new T.Mesh(new T.CapsuleGeometry(.19,.45,3,6),this.material(color,.32,.36,color));body.position.y=.46;group.add(body);
        const eye=new T.Mesh(new T.BoxGeometry(.22,.06,.035),this.material(0xf4f8ff,.2,.1,0xffffff));eye.position.set(0,.63,-.17);group.add(eye);
        group.position.set(e.x,.02,e.y);group.userData.ymmWorldObject=true;this.scene.add(group);this.entities.enemies.push({mesh:group,source:e});
      });
      const pmat=this.material(0x72f3dc,.24,.4,0x168f8b),player=new T.Mesh(new T.CapsuleGeometry(.18,.55,4,8),pmat);player.userData.ymmWorldObject=true;this.scene.add(player);this.entities.player=player;
      this.camera.fov=game.world===9?72:78;this.camera.updateProjectionMatrix();
    }
    resize(){
      const w=this.canvas.clientWidth||1000,h=this.canvas.clientHeight||620;
      if(w===this.lastW&&h===this.lastH)return;this.lastW=w;this.lastH=h;
      this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    }
    render(game){
      if(!this.ready||!this.renderer)return;
      const active=game.screen==='playing'&&(game.world===8||game.world===9);
      this.canvas.classList.toggle('webgl-active',active);
      if(!active)return;
      if(this.world!==game.world)this.rebuild(game);
      this.resize();
      const p=game.player,T=this.THREE;
      const px=p.x,pz=p.y,angle=p.angle||0;
      this.entities.player.position.set(px,.02,pz);
      this.entities.player.rotation.y=-angle;
      this.camera.position.set(px,.72,pz);
      this.camera.lookAt(px+Math.cos(angle)*4,.64,pz+Math.sin(angle)*4);
      this.entities.enemies.forEach(({mesh,source})=>{
        mesh.visible=source.hp>0;
        mesh.position.x=source.x;mesh.position.z=source.y;
        mesh.rotation.y=Math.atan2(p.y-source.y,p.x-source.x)-Math.PI/2;
        mesh.children[0].material.emissiveIntensity=source.stun>0?2.4:1.2;
      });
      this.entities.shards.forEach(({mesh,source},i)=>{mesh.visible=!source.taken;mesh.rotation.y=game.clock*1.4+i;mesh.rotation.z=Math.sin(game.clock*1.7+i)*.2;mesh.position.y=.62+Math.sin(game.clock*2+i)*.08;});
      const projectiles=game.archiveProjectiles||[];
      while(this.entities.projectiles.length<projectiles.length){
        const orb=new T.Mesh(new T.SphereGeometry(.075,8,6),this.material(0x9cfaff,.15,.2,0x72f3dc));orb.userData.ymmWorldObject=true;this.scene.add(orb);this.entities.projectiles.push(orb);
      }
      this.entities.projectiles.forEach((mesh,i)=>{const b=projectiles[i];mesh.visible=!!b;if(b)mesh.position.set(b.x,.72,b.y);});
      this.renderer.render(this.scene,this.camera);
    }
  }
  YMM.ThreeStage=ThreeStage;
})(globalThis);

(function(root){
  const YMM=root.YMM=root.YMM||{};
  class ThreeStage{
    constructor(canvas){
      this.canvas=canvas;this.ready=false;this.failed=false;this.scene=null;this.camera=null;this.renderer=null;this.world=-1;this.entities={walls:[],shards:[],enemies:[],projectiles:[],lockBeams:[],ambience:[]};this.lastResize=0;
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
      const T=this.THREE,L=YMM.Levels['world'+game.world]||YMM.Levels.world8;
      this.world=game.world;this.scene.background=new T.Color(game.world===9?0x110b20:0x080b17);
      this.scene.fog.color.set(game.world===9?0x110b20:0x080b17);
      for(const child of [...this.scene.children])if(child.userData.ymmWorldObject)this.scene.remove(child);
      this.entities={walls:[],shards:[],enemies:[],projectiles:[],lockBeams:[],ambience:[]};
      const floor=new T.Mesh(new T.PlaneGeometry(16,16),this.material(game.world===9?0x1c1530:0x10182a,.86,.12));
      floor.rotation.x=-Math.PI/2;floor.position.set(8,0,8);floor.userData.ymmWorldObject=true;this.scene.add(floor);
      const grid=new T.GridHelper(16,32,game.world===9?0x9b65df:0x286c83,0x273047);grid.position.set(8,.012,8);grid.userData.ymmWorldObject=true;this.scene.add(grid);
      // Low-cost volumetric ambience: drifting data motes give the archive depth without
      // relying on post-processing or expensive particle systems.
      const moteMat=this.material(game.world===9?0xd86cff:0x72f3dc,.22,.15,game.world===9?0x6b1a91:0x126c78);
      for(let i=0;i<26;i++){
        const mote=new T.Mesh(new T.IcosahedronGeometry(.018+(i%4)*.006,0),moteMat);
        mote.position.set(.5+((i*37)%150)/10,.16+((i*17)%23)/10,.5+((i*53)%150)/10);
        mote.userData.ymmWorldObject=true;this.scene.add(mote);this.entities.ambience.push({mesh:mote,seed:i});
      }
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
        const group=new T.Group(),color=e.role==='warden'?0xff294f:e.role==='flanker'?0xb8a0ff:0xffcf79;
        const body=new T.Mesh(new T.CapsuleGeometry(.2,.48,4,8),this.material(color,.3,.42,color));body.position.y=.47;group.add(body);
        const head=new T.Mesh(new T.IcosahedronGeometry(.17,1),this.material(0x20283a,.28,.58,color));head.position.y=.82;group.add(head);
        const visor=new T.Mesh(new T.BoxGeometry(.25,.055,.04),this.material(0xf4f8ff,.16,.12,0xffffff));visor.position.set(0,.82,-.145);group.add(visor);
        for(const side of [-1,1]){const shoulder=new T.Mesh(new T.BoxGeometry(.13,.2,.16),this.material(color,.3,.45,color));shoulder.position.set(side*.24,.55,0);group.add(shoulder);}
        const core=new T.Mesh(new T.OctahedronGeometry(.085,0),this.material(0xf8fbff,.18,.2,color));core.position.y=.43;group.add(core);
        const limbs=[];
        for(const side of [-1,1]){
          const arm=new T.Mesh(new T.CapsuleGeometry(.055,.22,3,5),this.material(color,.38,.32,color));arm.position.set(side*.25,.43,0);arm.rotation.z=side*.16;group.add(arm);limbs.push(arm);
          const leg=new T.Mesh(new T.CapsuleGeometry(.065,.2,3,5),this.material(0x171d2b,.62,.22,color*.0));leg.position.set(side*.105,.12,0);group.add(leg);limbs.push(leg);
        }
        group.position.set(e.x,.02,e.y);group.userData.ymmWorldObject=true;group.userData.ymmLimbs=limbs;this.scene.add(group);this.entities.enemies.push({mesh:group,source:e});
        const beamMat=new T.LineBasicMaterial({color:0xff294f,transparent:true,opacity:.96});
        const beamGeom=new T.BufferGeometry().setFromPoints([new T.Vector3(e.x,.72,e.y),new T.Vector3(e.x,.72,e.y)]);
        const beam=new T.Line(beamGeom,beamMat);beam.userData.ymmWorldObject=true;beam.visible=false;this.scene.add(beam);this.entities.lockBeams.push({mesh:beam,source:e});
      });
      // First-person camera: do not render a capsule at the camera origin.
      this.entities.player=null;
      this.camera.fov=game.world===9?72:78;this.camera.updateProjectionMatrix();
    }
    resize(){
      const w=this.canvas.clientWidth||1000,h=this.canvas.clientHeight||620;
      if(w===this.lastW&&h===this.lastH)return;this.lastW=w;this.lastH=h;
      this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    }
    render(game){
      if(!this.ready||!this.renderer)return;
      const active=game.screen==='playing'&&[8,9,11,12].includes(game.world);
      this.canvas.classList.toggle('webgl-active',active);
      if(!active)return;
      if(this.world!==game.world)this.rebuild(game);
      this.resize();
      const p=game.player,T=this.THREE;
      const px=p.x,pz=p.y,angle=p.angle||0;
      const moving=game.input&&(game.input.isDown('KeyW','ArrowUp','KeyS','ArrowDown','KeyA','KeyD')||false);
      const bob=moving?Math.sin(game.clock*12)*.025:Math.sin(game.clock*1.8)*.006;
      const sway=moving?Math.sin(game.clock*6)*.012:0;
      this.camera.position.set(px+sway,.72+bob,pz);
      this.camera.lookAt(px+Math.cos(angle)*4,.64+bob*.35,pz+Math.sin(angle)*4);
      this.camera.rotation.z=moving?Math.sin(game.clock*6)*.003:0;
      this.entities.enemies.forEach(({mesh,source},i)=>{
        mesh.visible=source.hp>0;
        mesh.position.x=source.x;mesh.position.z=source.y;mesh.position.y=.02+Math.sin(game.clock*2.3+(source.id||i))*.035;
        mesh.rotation.y=Math.atan2(p.y-source.y,p.x-source.x)-Math.PI/2;
        mesh.children[0].material.emissiveIntensity=source.stun>0?2.8:source.role==='warden'?1.8:1.2;
        mesh.children[0].scale.y=1+Math.sin(game.clock*5.2+i)*.035;
        mesh.children[2].rotation.z=Math.sin(game.clock*4.2+i)*.045;
        (mesh.userData.ymmLimbs||[]).forEach((limb,j)=>{limb.rotation.z=Math.sin(game.clock*5.5+i+j*.7)*.12;});
        if(mesh.children[5]){mesh.children[5].rotation.y=game.clock*2.6;mesh.children[5].scale.setScalar(1+Math.sin(game.clock*8+i)*.13);}
      });
      this.entities.lockBeams.forEach(({mesh,source})=>{
        const locking=source.hp>0&&source.role==='warden'&&source.windup>0&&Number.isFinite(source.lockX)&&Number.isFinite(source.lockY);
        mesh.visible=!!locking;
        if(locking){
          mesh.geometry.setFromPoints([new T.Vector3(source.x,.78,source.y),new T.Vector3(source.lockX,.12,source.lockY)]);
          mesh.material.opacity=.55+.4*Math.sin(game.clock*28);
        }
      });
      this.entities.shards.forEach(({mesh,source},i)=>{mesh.visible=!source.taken;mesh.rotation.y=game.clock*1.4+i;mesh.rotation.z=Math.sin(game.clock*1.7+i)*.2;mesh.position.y=.62+Math.sin(game.clock*2+i)*.08;mesh.scale.setScalar(1+Math.sin(game.clock*3+i)*.07);});
      this.entities.ambience.forEach(({mesh,seed})=>{mesh.position.y=.16+((seed*17)%23)/10+Math.sin(game.clock*.8+seed)*.11;mesh.rotation.x=game.clock*.25+seed;mesh.rotation.y=game.clock*.4+seed*.3;});
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

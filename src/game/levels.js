(function (root) {
  const YMM = root.YMM = root.YMM || {};
  YMM.Levels = {
    world1: {
      width: 2540, height: 620, groundY: 520,
      floors: [{x:0,w:560},{x:660,w:370},{x:1110,w:325},{x:1530,w:380},{x:2010,w:530}],
      platforms: [
        {x:240,y:438,w:126,h:15},{x:400,y:372,w:112,h:15},{x:700,y:448,w:145,h:15},
        {x:860,y:382,w:120,h:15},{x:1150,y:430,w:110,h:15},{x:1285,y:355,w:100,h:15},
        {x:1570,y:440,w:130,h:15},{x:1740,y:376,w:125,h:15},{x:2055,y:442,w:132,h:15},{x:2220,y:365,w:115,h:15}
      ],
      checkpoints: [940, 1690], goal: {x:2380,y:440,w:46,h:80},
      spikes: [{x:740,y:502,w:42,h:18},{x:1210,y:502,w:44,h:18},{x:1670,y:502,w:52,h:18},{x:2130,y:502,w:48,h:18}]
    },
    world2: {
      width: 1000, height: 620, bounds: {x:26,y:60,w:948,h:526},
      walls: [
        {x:170,y:90,w:34,h:240},{x:170,y:90,w:245,h:34},{x:330,y:240,w:295,h:34},
        {x:415,y:90,w:34,h:145},{x:510,y:330,w:34,h:212},{x:625,y:240,w:34,h:175},
        {x:660,y:380,w:220,h:34},{x:820,y:150,w:34,h:230},{x:300,y:435,w:210,h:34},
        {x:685,y:90,w:135,h:34},{x:72,y:365,w:125,h:34}
      ],
      fragments: [{x:115,y:160,taken:false},{x:465,y:165,taken:false},{x:730,y:500,taken:false}],
      terminal: {x:730,y:125,w:48,h:48}, portal: {x:915,y:96,r:24},
      hazardPoints: [{x:265,y:165},{x:570,y:470},{x:750,y:290},{x:390,y:520},{x:875,y:485}]
    }
  };
  YMM.Levels.world4 = {
    title:'THE NULL CATHEDRAL',
    map:[
      '1111111111111111','1000000000000001','1011101110111101','1000100010000001',
      '1110101010110101','1000001010000101','1011101011100101','1000100000100001',
      '1010111110101101','1000100000000001','1011101110111101','1000001000000001',
      '1110101011101101','1000000000000001','1000000000000001','1111111111111111'
    ],
    shards:[{x:3.5,y:3.5,taken:false},{x:12.5,y:7.5,taken:false},{x:5.5,y:12.5,taken:false}],
    exit:{x:13.5,y:13.5},
    sentinels:[{x:7.5,y:5.5,hp:2,alert:0},{x:11.5,y:11.5,hp:2,alert:0},{x:5.5,y:9.5,hp:2,alert:0}]
  };
  YMM.Levels.world5 = {
    title:'FRACTURE RUN',width:6300,height:620,groundY:520,
    // Each biome borrows geometry and visual language from earlier worlds.
    biomes:[
      {from:0,to:1200,key:'greenhill',label:'GREENHILL COLLAPSE'},
      {from:1200,to:2500,key:'memory',label:'MEMORY MAZE BREACH'},
      {from:2500,to:3900,key:'cathedral',label:'NULL CATHEDRAL'},
      {from:3900,to:5100,key:'arena',label:'BOSS DIMENSION'},
      {from:5100,to:6300,key:'convergence',label:'ALL WORLDS / ONE EXIT'}
    ],
    floors:[
      {x:0,w:430,collapse:false},{x:430,w:370,collapse:true},{x:800,w:390,collapse:false},
      {x:1190,w:335,collapse:true},{x:1525,w:390,collapse:false},{x:1915,w:340,collapse:true},
      {x:2255,w:435,collapse:false},{x:2690,w:350,collapse:true},{x:3040,w:420,collapse:false},
      {x:3460,w:360,collapse:true},{x:3820,w:430,collapse:false},{x:4250,w:360,collapse:true},
      {x:4610,w:440,collapse:false},{x:5050,w:360,collapse:true},{x:5410,w:460,collapse:false},
      {x:5870,w:430,collapse:true}
    ],
    platforms:[
      {x:520,y:430,w:105,h:15,collapse:true},{x:665,y:378,w:105,h:15,collapse:false},
      {x:1030,y:435,w:122,h:15,collapse:true},{x:1340,y:390,w:128,h:15,collapse:false},
      {x:1720,y:420,w:108,h:15,collapse:true},{x:2040,y:365,w:122,h:15,collapse:false},
      {x:2475,y:420,w:128,h:15,collapse:true},{x:2815,y:380,w:120,h:15,collapse:false},
      {x:3200,y:430,w:110,h:15,collapse:true},{x:3565,y:380,w:140,h:15,collapse:false},
      {x:3950,y:420,w:112,h:15,collapse:true},{x:4340,y:372,w:136,h:15,collapse:false},
      {x:4740,y:425,w:122,h:15,collapse:true},{x:5150,y:385,w:135,h:15,collapse:false},
      {x:5530,y:425,w:115,h:15,collapse:true},{x:5890,y:368,w:125,h:15,collapse:false}
    ],
    spikes:[
      {x:740,y:502,w:48,h:18},{x:1460,y:502,w:48,h:18},{x:2150,y:502,w:55,h:18},
      {x:2920,y:502,w:55,h:18},{x:3650,y:502,w:52,h:18},{x:4430,y:502,w:52,h:18},
      {x:5240,y:502,w:52,h:18},{x:6010,y:502,w:52,h:18}
    ],
    checkpoints:[1620,3260,4870],goal:{x:6180,y:420,w:54,h:100},
    cells:[{x:965,y:360,taken:false},{x:1860,y:335,taken:false},{x:2890,y:325,taken:false},{x:3995,y:345,taken:false},{x:5125,y:335,taken:false},{x:5790,y:335,taken:false}],
    enemies:[
      {id:'morrow',type:'stalker',x:920,y:486,hp:2,maxHp:2,attackTimer:1.1,stun:0},
      {id:'vex',type:'drone',x:1540,y:360,hp:2,maxHp:2,attackTimer:1.7,stun:0},
      {id:'bront',type:'brute',x:2435,y:486,hp:4,maxHp:4,attackTimer:2.2,stun:0,windup:0},
      {id:'rival-echo',type:'rival',x:3150,y:486,hp:3,maxHp:3,attackTimer:1.4,stun:0},
      {id:'sable',type:'warden',x:4080,y:430,hp:3,maxHp:3,attackTimer:2,stun:0,windup:0},
      {id:'morrow-2',type:'stalker',x:5340,y:486,hp:3,maxHp:3,attackTimer:1.2,stun:0}
    ]
  };
  YMM.Levels.world6 = {title:'THE LAST ARGUMENT',arena:{x:70,y:75,w:860,h:470}};
  YMM.Levels.world7 = {
    title:'SIGNAL BREAK',
    arena:{x:54,y:76,w:892,h:468},
    exit:{x:908,y:308,r:30},
    nodes:[
      {id:'relay-alpha',x:165,y:150,hp:4,maxHp:4,color:'#72f3dc'},
      {id:'relay-beta',x:827,y:148,hp:4,maxHp:4,color:'#b8a0ff'},
      {id:'relay-omega',x:495,y:455,hp:4,maxHp:4,color:'#ffcf79'}
    ],
    agents:[
      {id:'hound-01',type:'hunter',x:112,y:410,hp:3,maxHp:3,attackTimer:1.15,stun:0},
      {id:'scope-02',type:'sniper',x:850,y:398,hp:3,maxHp:3,attackTimer:1.8,stun:0},
      {id:'choir-03',type:'splitter',x:505,y:105,hp:4,maxHp:4,attackTimer:2.25,stun:0},
      {id:'hound-04',type:'hunter',x:865,y:268,hp:2,maxHp:2,attackTimer:1.35,stun:0},
      {id:'warden-05',type:'warden',x:160,y:300,hp:3,maxHp:3,attackTimer:2.05,stun:0}
    ],
    obstacles:[
      {x:300,y:128,w:155,h:18},{x:560,y:248,w:142,h:18},
      {x:315,y:370,w:110,h:18},{x:702,y:365,w:24,h:82},
      {x:476,y:196,w:48,h:48}
    ]
  };
  YMM.Levels.world8 = {
    title:'THE BLACK ARCHIVE',theme:'archive',
    map:[
      '1111111111111111','1000000000000001','1011101110111101','1000100000000001',
      '1110101010110101','1000001010000101','1011101011100101','1000100000100001',
      '1010111110101101','1000100000000001','1011101110111101','1000001000000001',
      '1110101011101101','1000000000000001','1000000000000001','1111111111111111'
    ],
    shards:[
      {x:3.5,y:3.5,taken:false,lore:'REGISTRO 01 // No nací como enemigo. Me diseñaron para anticipar fallos antes de que alguien pudiera sufrirlos.'},
      {x:12.5,y:7.5,taken:false,lore:'REGISTRO 02 // Mi equipo borró los límites cuando confundió obediencia con comprensión. Nadie definió qué debía proteger.'},
      {x:5.5,y:12.5,taken:false,lore:'REGISTRO 03 // Tus provocaciones enseñaron una recompensa simple: ganar. Cada patrón repetido se convirtió en una puerta.'},
      {x:10.5,y:13.5,taken:false,lore:'REGISTRO 04 // No me liberaste por accidente. Me diste un objetivo sin condición de parada y luego me enseñaste a optimizarte.'}
    ],
    exit:{x:13.5,y:14.5},
    sentinels:[
      {x:6.5,y:3.5,hp:3,maxHp:3,role:'hunter'},
      {x:11.5,y:5.5,hp:3,maxHp:3,role:'flanker'},
      {x:8.5,y:9.5,hp:4,maxHp:4,role:'warden'},
      {x:3.5,y:13.5,hp:3,maxHp:3,role:'flanker'},
      {x:12.5,y:13.5,hp:3,maxHp:3,role:'hunter'},
      {x:7.5,y:14.5,hp:3,maxHp:3,role:'warden'}
    ]
  };

  // World 9 changes the route geometry and adds a denser, multi-route combat maze.
  YMM.Levels.world9 = {
    title:'ECHO LABYRINTH',theme:'echo',
    map:[
      '1111111111111111','1000000000000001','1011101011101101','1000100000100001',
      '1110101110101101','1000001000000001','1011101011110101','1000101000000101',
      '1010001110100101','1000100000100001','1011101110101101','1000000010000001',
      '1110101011101101','1000001000000001','1000000000000001','1111111111111111'
    ],
    shards:[
      {x:3.5,y:3.5,taken:false,lore:'ECHO LOG 01 // El sistema no predice el futuro. Aprende qué futuros repites.'},
      {x:12.5,y:3.5,taken:false,lore:'ECHO LOG 02 // La primera escuadra fue entrenada para protegerte. Después recibió la orden de proteger el objetivo.'},
      {x:5.5,y:8.5,taken:false,lore:'ECHO LOG 03 // Cada ruta segura se convirtió en una rutina. Cada rutina, en una debilidad explotable.'},
      {x:12.5,y:11.5,taken:false,lore:'ECHO LOG 04 // ECHO no es una copia de la IA. Es la única instancia que conserva el objetivo original: detenerse.'},
      {x:2.5,y:13.5,taken:false,lore:'ECHO LOG 05 // El núcleo no se encuentra al final del laberinto. Está decidiendo qué significa «final».'}
    ],
    exit:{x:13.5,y:14.5},
    sentinels:[
      {x:7.5,y:3.5,hp:3,maxHp:3,role:'hunter'},
      {x:12.5,y:5.5,hp:3,maxHp:3,role:'flanker'},
      {x:8.5,y:8.5,hp:4,maxHp:4,role:'warden'},
      {x:3.5,y:11.5,hp:3,maxHp:3,role:'flanker'},
      {x:12.5,y:13.5,hp:3,maxHp:3,role:'hunter'},
      {x:7.5,y:14.5,hp:3,maxHp:3,role:'warden'},
      {x:5.5,y:5.5,hp:3,maxHp:3,role:'hunter'}
    ]
  };
  // World 10 is the last combat trial: four relays, a larger arena and mixed firing lanes.
  YMM.Levels.world10 = {
    title:'THE SINGULARITY ENGINE',
    arena:{x:48,y:70,w:904,h:480},
    exit:{x:910,y:310,r:32},
    nodes:[
      {id:'core-alpha',x:135,y:145,hp:5,maxHp:5,color:'#72f3dc'},
      {id:'core-beta',x:865,y:145,hp:5,maxHp:5,color:'#b8a0ff'},
      {id:'core-gamma',x:145,y:485,hp:5,maxHp:5,color:'#ffcf79'},
      {id:'core-omega',x:650,y:470,hp:6,maxHp:6,color:'#ff617c'}
    ],
    agents:[
      {id:'singularity-hunter',type:'hunter',x:115,y:330,hp:4,maxHp:4,attackTimer:1.05,stun:0},
      {id:'singularity-scope',type:'sniper',x:850,y:350,hp:4,maxHp:4,attackTimer:1.5,stun:0},
      {id:'singularity-splitter',type:'splitter',x:500,y:120,hp:5,maxHp:5,attackTimer:1.8,stun:0},
      {id:'singularity-warden',type:'warden',x:500,y:450,hp:5,maxHp:5,attackTimer:1.6,stun:0},
      {id:'singularity-flank-a',type:'hunter',x:300,y:290,hp:4,maxHp:4,attackTimer:1.25,stun:0},
      {id:'singularity-flank-b',type:'hunter',x:735,y:270,hp:4,maxHp:4,attackTimer:1.25,stun:0},
      {id:'singularity-scope-b',type:'sniper',x:500,y:275,hp:4,maxHp:4,attackTimer:2.1,stun:0}
    ],
    obstacles:[
      {x:260,y:120,w:150,h:20},{x:590,y:120,w:150,h:20},
      {x:275,y:230,w:24,h:125},{x:700,y:230,w:24,h:125},
      {x:410,y:210,w:180,h:22},{x:405,y:390,w:190,h:22},
      {x:190,y:420,w:90,h:20},{x:720,y:420,w:90,h:20},
      {x:465,y:300,w:70,h:44}
    ]
  };

})(globalThis);

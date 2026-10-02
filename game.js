(() => {
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=Math.random,money=n=>"$"+Math.floor(n).toLocaleString("en-US");
const CARS=[
  {n:"C13 Veloce RS",type:"TCR racing sedan",c:0xc91f32,v:50,a:16,p:0,h:1,model:"rosso",bodyType:"sedan",scale:[1.02,.99,1],frontWidth:1.04,hoodHeight:1.01,wheelRadius:.405,wheelTrack:1.045,spoiler:true,wingWidth:2.02,stripe:0xf4eee5,raceSpec:true},
  {n:"C13 Verde V12",type:"Aero supercar",c:0x87d52a,v:57,a:19,p:1800,h:1.18,model:"verde",scale:[1.02,.94,1.03],frontWidth:.72,hoodHeight:.92,wingWidth:1.78,stripe:0x171b1f,scoop:true},
  {n:"C13 Summit X8",type:"110 SUV",c:0x174b7d,v:54,a:18,p:3900,h:1.27,model:"defender110",bodyType:"suv",scale:[1.06,1.08,1.04],frontWidth:1.02,hoodHeight:1.02,wheelRadius:.48,wheelTrack:1.08,spoiler:false,grille:true},
  {n:"C13 Apex GT3",type:"Club-racing coupe",c:0xf0efeb,v:55,a:21,p:6000,h:1.36,model:"pearl",scale:[1.01,1.02,1.01],frontWidth:.91,hoodHeight:1.02,wingWidth:1.92,stripe:0x191c20,roundLights:true},
  {n:"C13 Papaya 720",type:"Mid-engine sprinter",c:0xf27624,v:60,a:23,p:8200,h:1.43,model:"papaya",scale:[.98,.92,1.02],frontWidth:.78,hoodHeight:.95,wingWidth:1.7,scoop:true},
  {n:"C13 Sunburst ZR",type:"Widebody muscle GT",c:0xf2c51e,v:57,a:19,p:10600,h:1.2,model:"sunburst",scale:[1.12,1.02,1],frontWidth:1.12,hoodHeight:1.06,wingWidth:1.9,stripe:0x171a1e,hoodVents:true},
  {n:"C13 Violet R",type:"Twin-turbo grand tourer",c:0x813ee0,v:62,a:22,p:13200,h:1.29,model:"violet",scale:[1.04,1.06,1.04],frontWidth:.98,hoodHeight:1.04,wingWidth:1.95,quadLights:true},
  {n:"C13 Obsidian X",type:"Carbon track hypercar",c:0x171a20,v:68,a:25,p:16000,h:1.5,model:"obsidian",scale:[1.03,.91,1.08],frontWidth:.84,hoodHeight:.94,wingWidth:1.82,stripe:0xff772e,scoop:true},
  {n:"VORTEX S9",type:"Luxury Sports Sedan",c:0xdfe4e8,v:66.6667,a:20.5,accel:8.5,p:150000,h:.8,handling:8,model:"vortex",bodyType:"sedan",scale:[1.04,1.02,1.04],frontWidth:1.1,hoodHeight:1.02,wheelRadius:.39,wheelTrack:1.06,spoiler:false,grille:true}
]
const PAINTS=[{n:"Rosso corsa",c:0xc91f32},{n:"Platinum silver",c:0xdfe4e8},{n:"Track red",c:0xe63946},{n:"Electric blue",c:0x2a9df4},{n:"Sunburst",c:0xffd23f},{n:"Pearl",c:0xe9edf0},{n:"Midnight",c:0x26334a},{n:"Toxic",c:0x58cb78},{n:"Violet",c:0x9856db},{n:"Orange",c:0xff873b}];
const DECALS=[{id:"none",n:"Clean"},{id:"racing",n:"Racing stripes"},{id:"bolt",n:"Lightning"},{id:"flame",n:"Flames"}],TIRES=[{id:"street",n:"Street"},{id:"track",n:"Track slicks"},{id:"rally",n:"Rally"},{id:"whitewall",n:"Whitewall"}],MIRRORS=[{id:"classic",n:"Classic"},{id:"sport",n:"Sport"},{id:"carbon",n:"Carbon"},{id:"off",n:"Off"}],HEADLIGHTS=[{id:"standard",n:"Standard"},{id:"ice",n:"Ice blue"},{id:"off",n:"Off"}];
let S={cash:0,owned:[0],best:0};
try{Object.assign(S,JSON.parse(localStorage.getItem("cars13v14")||"{}"))}catch(e){}
S.custom=S.custom||{};S.owned=S.owned||[0];
const save=()=>{try{localStorage.setItem("cars13v14",JSON.stringify(S))}catch(e){}};

/* ---------- renderer / scene ---------- */
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));document.body.prepend(R.domElement);
const SKY=0x7db9e8,sc=new THREE.Scene();sc.background=new THREE.Color(SKY);sc.fog=new THREE.Fog(SKY,70,300);
const cam=new THREE.PerspectiveCamera(62,1,.5,900);
sc.add(new THREE.HemisphereLight(0xcfe3ff,0x33362f,1));
const sun=new THREE.DirectionalLight(0xfff2d8,.95);sun.position.set(-40,60,-30);sc.add(sun);
const studioCanvas=document.createElement("canvas");studioCanvas.width=512;studioCanvas.height=256;
const studioCtx=studioCanvas.getContext("2d"),studioSky=studioCtx.createLinearGradient(0,0,0,256);
studioSky.addColorStop(0,"#182234");studioSky.addColorStop(.42,"#526274");studioSky.addColorStop(.55,"#a8b0b6");studioSky.addColorStop(.72,"#48515d");studioSky.addColorStop(1,"#171c27");
studioCtx.fillStyle=studioSky;studioCtx.fillRect(0,0,512,256);
for(const [x,w] of [[48,52],[167,25],[345,33],[424,54]]){const glow=studioCtx.createLinearGradient(x-w/2,0,x+w/2,0);glow.addColorStop(0,"rgba(255,255,255,0)");glow.addColorStop(.38,"rgba(255,255,255,.7)");glow.addColorStop(.62,"rgba(255,255,255,.82)");glow.addColorStop(1,"rgba(255,255,255,0)");studioCtx.fillStyle=glow;studioCtx.fillRect(x-w/2,24,w,176)}
const studioEnv=new THREE.CanvasTexture(studioCanvas);studioEnv.mapping=THREE.EquirectangularReflectionMapping;studioEnv.encoding=THREE.sRGBEncoding;studioEnv.needsUpdate=true;
const shadowCanvas=document.createElement("canvas");shadowCanvas.width=shadowCanvas.height=128;
const shadowCtx=shadowCanvas.getContext("2d"),shadowGradient=shadowCtx.createRadialGradient(64,64,8,64,64,62);
shadowGradient.addColorStop(0,"rgba(0,0,0,.42)");shadowGradient.addColorStop(.48,"rgba(0,0,0,.25)");shadowGradient.addColorStop(1,"rgba(0,0,0,0)");shadowCtx.fillStyle=shadowGradient;shadowCtx.fillRect(0,0,128,128);
const shadowTexture=new THREE.CanvasTexture(shadowCanvas);shadowTexture.encoding=THREE.sRGBEncoding;
const showroomShadow=new THREE.Mesh(new THREE.PlaneGeometry(2.9,5.25),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:.72,depthWrite:false}));
showroomShadow.rotation.x=-Math.PI/2;showroomShadow.position.y=.006;showroomShadow.renderOrder=1;sc.add(showroomShadow);
const lam=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0});
const carLoftCache=new Map();
const raceTextureCache=new Map();
function raceTexture(kind){
  if(raceTextureCache.has(kind))return raceTextureCache.get(kind);
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext("2d"),roundRect=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()};ctx.clearRect(0,0,512,256);
  if(kind==="side"){
    ctx.fillStyle="rgba(13,17,22,.92)";ctx.beginPath();ctx.moveTo(0,54);ctx.lineTo(334,54);ctx.lineTo(294,202);ctx.lineTo(0,202);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f3f0e8";ctx.beginPath();ctx.moveTo(0,37);ctx.lineTo(351,37);ctx.lineTo(337,57);ctx.lineTo(0,57);ctx.closePath();ctx.fill();
    ctx.fillStyle="#d42135";ctx.beginPath();ctx.moveTo(0,202);ctx.lineTo(296,202);ctx.lineTo(286,218);ctx.lineTo(0,218);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f3f0e8";ctx.beginPath();ctx.arc(397,128,105,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#15191e";ctx.lineWidth=9;ctx.beginPath();ctx.arc(397,128,99,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle="#c91f32";ctx.lineWidth=5;ctx.beginPath();ctx.arc(397,128,88,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#171b20";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="900 104px Arial Black, Arial";ctx.fillText("13",397,137);
    ctx.fillStyle="#ffffff";ctx.textAlign="left";ctx.textBaseline="alphabetic";ctx.font="900 24px Arial";ctx.fillText("C13 MOTORSPORT",22,111);
    ctx.font="700 15px Arial";ctx.fillStyle="#d9dce0";ctx.fillText("VELOCE RS  ·  TCR",23,143);
    ctx.fillStyle="#c91f32";ctx.fillRect(22,158,115,5);
  }else{
    ctx.fillStyle="#f3f0e8";roundRect(20,16,472,224,24);ctx.fill();
    ctx.strokeStyle="#171b20";ctx.lineWidth=10;roundRect(26,22,460,212,19);ctx.stroke();
    ctx.fillStyle="#c91f32";ctx.fillRect(42,206,428,11);
    ctx.fillStyle="#171b20";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="900 174px Arial Black, Arial";ctx.fillText("13",256,120);
  }
  const tex=new THREE.CanvasTexture(canvas);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=R.capabilities.getMaxAnisotropy();
  raceTextureCache.set(kind,tex);return tex;
}
function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener("resize",resize);resize();

function mk(col,opts={}){
  const g=new THREE.Group(),M=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
  const model=opts.model||"",carStyle=CARS.find(c=>c.model===model)||{},defender110=carStyle.model==="defender110";
  if(carStyle.scale)g.scale.set(...carStyle.scale);
  const paint=new THREE.MeshPhysicalMaterial({color:opts.color??col,envMap:opts.traffic?null:studioEnv,envMapIntensity:.72,metalness:.38,roughness:.23,clearcoat:1,clearcoatRoughness:.12});
  const glass=new THREE.MeshPhysicalMaterial({color:0x101d29,envMap:opts.traffic?null:studioEnv,envMapIntensity:.55,metalness:.32,roughness:.12,clearcoat:1,clearcoatRoughness:.07});
  const trim=new THREE.MeshStandardMaterial({color:0x171b20,metalness:.48,roughness:.29});
  const alloy=new THREE.MeshStandardMaterial({color:carStyle.raceSpec?0x262b31:opts.tire==="rally"?0xc79b4b:0xb8c3ce,metalness:.83,roughness:.22});
  const tireId=opts.tire||"street",V=THREE.Vector3;
  // A lofted, tapered shell gives the hood and haunches real volume instead of a box silhouette.
  const bodyProfiles={
    sedan:[[-2.18,.42,.58],[-2.08,.66,.68],[-1.9,.79,.78],[-1.68,.86,.86],[-1.42,.9,.91],[-1.12,.92,.94],[-.72,.93,.96],[-.3,.93,.97],[.25,.94,.98],[.72,.95,.98],[1.08,.94,.98],[1.38,.92,.97],[1.66,.87,.95],[1.92,.76,.89],[2.1,.59,.8],[2.18,.39,.68]],
    vortex:[[-2.18,.43,.58],[-2.1,.64,.66],[-1.91,.8,.76],[-1.68,.88,.84],[-1.42,.93,.9],[-1.12,.95,.94],[-.72,.96,.96],[-.3,.97,.98],[.25,.98,.99],[.72,.98,.99],[1.08,.97,.97],[1.38,.94,.94],[1.66,.89,.91],[1.92,.78,.86],[2.1,.6,.78],[2.18,.4,.68]],
    suv:[[-2.2,.42,.64],[-2.08,.68,.78],[-1.9,.82,.9],[-1.65,.91,1.02],[-1.35,.96,1.11],[-.9,.99,1.17],[-.3,1,1.2],[.35,1,1.21],[.9,.99,1.2],[1.35,.96,1.17],[1.68,.9,1.1],[1.94,.77,1],[2.12,.58,.86],[2.2,.39,.76]]
  };
  const bodyShape=(bodyProfiles[carStyle.model==="vortex"?"vortex":carStyle.bodyType]||[[-2.18,.42,.56],[-2.08,.66,.64],[-1.9,.79,.73],[-1.68,.89,.81],[-1.42,.95,.84],[-1.12,.96,.85],[-.72,.93,.84],[-.3,.91,.82],[.25,.92,.8],[.72,.95,.79],[1.08,.99,.76],[1.38,1,.72],[1.66,.95,.67],[1.92,.81,.61],[2.1,.59,.55],[2.18,.39,.52]]).map(([z,w,h])=>{
    const front=1+((carStyle.frontWidth??1)-1)*clamp((-z-.9)/1.28,0,1),hood=1+((carStyle.hoodHeight??1)-1)*clamp((-z-.4)/1.78,0,1);
    return[z,w*front,h*hood];
  });
  const bodyWheelRad=carStyle.wheelRadius||(tireId==="rally"?.43:.37),wheelZ=carStyle.bodyType==="suv"?[-1.4,1.4]:[-1.38,1.38];
  const archY=(z,rad)=>{let y=0;for(const wz of wheelZ){const dz=Math.abs(z-wz);if(dz<.52)y=Math.max(y,rad+.012+Math.sqrt(.52*.52-dz*dz))}return y};
  let defenderTreadMap=null;const detailed=!opts.traffic;
  const rounded=(w,h,d,mat,x,y,z)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat);o.scale.set(w,h,d);o.position.set(x,y,z);g.add(o);return o};
  const link=(a,b,r,mat)=>{const dir=new V().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r*.8,r,dir.length(),9),mat);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new V(0,1,0),dir.normalize());g.add(o);return o};
  function loft(stops,mat,arch=false){
    const key=(arch?"race-body-"+bodyWheelRad+"-":"")+JSON.stringify(stops),cached=carLoftCache.get(key);if(cached){const mesh=new THREE.Mesh(cached,mat);g.add(mesh);return mesh}
    const rings=[],step=.055,z0=stops[0][0],z1=stops[stops.length-1][0];
    const sample=z=>{let i=0;while(i<stops.length-2&&z>stops[i+1][0])i++;const a=stops[i],b=stops[i+1],t=(z-a[0])/(b[0]-a[0]),s=t*t*(3-2*t);return a.map((v,k)=>k===0?z:v+(b[k]-v)*s)};
    for(let z=z0;z<z1;z+=step){const [,w,top]=sample(z),wheelTop=arch?archY(z,bodyWheelRad):0,flare=arch&&wheelTop?wheelTop+.075:0;
      const shoulder=Math.max(top-.08,flare+.08),side=Math.max(top-.19,flare+.035,.48),low=Math.max(.42,arch&&wheelTop?wheelTop:0);
      const prof=[[0,top],[.48*w,top-.025],[.84*w,shoulder],[w,side],[.97*w,low],[.72*w,.34],[0,.315],[-.72*w,.34],[-.97*w,low],[-w,side],[-.84*w,shoulder],[-.48*w,top-.025]];
      rings.push(prof.map(([x,y])=>new V(x,y,z)));
    }
    rings.push(rings.at(-1).map(p=>new V(p.x,p.y,z1)));
    const n=rings[0].length,verts=[],idx=[];
    for(const ring of rings)for(const p of ring)verts.push(p.x,p.y,p.z);
    for(let r=0;r<rings.length-1;r++)for(let j=0;j<n;j++){const a=r*n+j,b=r*n+(j+1)%n,c=(r+1)*n+(j+1)%n,d=(r+1)*n+j;idx.push(a,d,b,b,d,c)}
    for(let end=0;end<2;end++){const r=end?rings.length-1:0,center=verts.length/3,cz=end?z1:z0,cy=(rings[r][0].y+rings[r][6].y)/2;verts.push(0,cy,cz);for(let j=0;j<n;j++)idx.push(center,r*n+(end?j+1:j),r*n+(end?j:j+1))}
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();carLoftCache.set(key,geo);const mesh=new THREE.Mesh(geo,mat);g.add(mesh);return mesh;
  }
  if(defender110){
    // One longitudinally sampled shell carries the bonnet, shoulder, doors, rear cabin and roof.
    // The cross sections are softly interpolated and crown outward, so the blue body reads as
    // formed sheet metal instead of stacked primitives.
    const stations=[
      [-2.34,.82,.70,.58,.52,.39],[-2.28,.88,.84,.70,.63,.39],[-2.12,.94,.99,.82,.76,.40],
      [-1.90,1.00,1.05,.89,.82,.41],[-1.55,1.02,1.07,.91,.84,.42],[-1.20,1.00,1.09,.92,.86,.41],
      [-1.02,.99,1.18,.92,.86,.40],[-.88,.98,1.47,.92,.86,.40],[-.68,.97,1.77,.93,.87,.40],
      [-.45,.95,1.83,.94,.87,.40],[.10,.94,1.84,.94,.87,.40],[1.00,.95,1.84,.94,.87,.40],
      [1.30,.94,1.79,.93,.86,.40],[1.52,.93,1.68,.91,.85,.41],[1.75,.92,1.61,.93,.87,.41],
      [1.98,.90,1.50,.90,.84,.43],[2.25,.81,1.44,.83,.77,.44],[2.31,.66,1.40,.75,.69,.43]
    ];
    const cat=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
    const sectionAt=z=>{
      let i=0;while(i<stations.length-2&&z>stations[i+1][0])i++;
      const a=stations[i],b=stations[i+1],t=clamp((z-a[0])/(b[0]-a[0]),0,1),out=[z];
      for(let k=1;k<a.length;k++)out.push(cat(stations[Math.max(0,i-1)][k],a[k],b[k],stations[Math.min(stations.length-1,i+2)][k],t));
      return out;
    };
    const wheelArchY=z=>{let y=0;for(const wz of wheelZ){const dz=Math.abs(z-wz);if(dz<.53)y=Math.max(y,bodyWheelRad+.05+Math.sqrt(Math.max(0,.53*.53-dz*dz)))}return y};
    const ringAt=z=>{
      const [,w,top,shoulder,side,base]=sectionAt(z),arch=wheelArchY(z),s=Math.max(side,arch?arch-.07:0),low=Math.max(base,arch);
      return [[0,top],[.42*w,top-.012],[.78*w,top-.065],[.93*w,shoulder],[w,s],[.985*w,Math.max(low-.10,s-.02)],[.97*w,low],[.74*w,low-.065],[0,Math.max(.30,low-.085)],[-.74*w,low-.065],[-.97*w,low],[-.985*w,Math.max(low-.10,s-.02)],[-w,s],[-.93*w,shoulder],[-.78*w,top-.065],[-.42*w,top-.012]];
    };
    const rings=[],ringCount=164,z0=stations[0][0],z1=stations.at(-1)[0];
    for(let i=0;i<=ringCount;i++){const z=z0+(z1-z0)*i/ringCount;rings.push(ringAt(z).map(([x,y])=>new V(x,y,z)))}
    const nr=rings[0].length,verts=[],idx=[];
    for(const r of rings)for(const p of r)verts.push(p.x,p.y,p.z);
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<nr;j++){const a=i*nr+j,b=i*nr+(j+1)%nr,c=(i+1)*nr+(j+1)%nr,d=(i+1)*nr+j;idx.push(a,d,b,b,d,c)}
    for(const end of [0,1]){const r=end?rings.length-1:0,center=verts.length/3,meanY=rings[r].reduce((sum,p)=>sum+p.y,0)/nr;verts.push(0,meanY,end?z1:z0);for(let j=0;j<nr;j++)idx.push(center,r*nr+(end?j+1:j),r*nr+(end?j:j+1))}
    const shellGeo=new THREE.BufferGeometry();shellGeo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));shellGeo.setIndex(idx);shellGeo.computeVertexNormals();g.add(new THREE.Mesh(shellGeo,paint));

    const darkWindow=glass.clone();darkWindow.color.set(0x15232f);darkWindow.roughness=.16;darkWindow.metalness=.24;darkWindow.side=THREE.DoubleSide;
    const gasket=new THREE.MeshStandardMaterial({color:0x10151a,metalness:.18,roughness:.42,side:THREE.DoubleSide});
    const chrome=new THREE.MeshStandardMaterial({color:0xc4d0d9,metalness:.88,roughness:.2});
    const lampOn=opts.headlight!=="off"&&opts.headlights!==false,lampWhite=new THREE.MeshStandardMaterial({color:opts.headlight==="ice"?0xbbeaff:0xe6f7ff,emissive:lampOn?(opts.headlight==="ice"?0x65bfff:0x70c9ff):0,emissiveIntensity:lampOn?1.35:0,metalness:.08,roughness:.16});
    const lensRed=new THREE.MeshStandardMaterial({color:0xd9242f,emissive:0x711018,emissiveIntensity:.65,roughness:.24});
    const curveTube=(points,r,mat,closed=false)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new V(...p)),closed,"catmullrom",.22),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(16,points.length*8),r,8,closed),mat);g.add(mesh);return mesh};
    const sideX=(z,y,offset=.012)=>{const [,w,top,,side]=sectionAt(z),t=clamp((y-side)/Math.max(.1,top-side),0,1);return w*(.986-.075*t)+offset};
    const roundPoly=(points,r=.035)=>{
      const shape=new THREE.Shape(),n=points.length,entry=[],exit=[];
      for(let i=0;i<n;i++){const p=points[i],a=points[(i+n-1)%n],b=points[(i+1)%n],da=Math.hypot(a[0]-p[0],a[1]-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]),d=Math.min(r,da*.35,db*.35);entry.push([p[0]+(a[0]-p[0])*d/da,p[1]+(a[1]-p[1])*d/da]);exit.push([p[0]+(b[0]-p[0])*d/db,p[1]+(b[1]-p[1])*d/db])}
      shape.moveTo(...entry[0]);for(let i=0;i<n;i++){shape.quadraticCurveTo(points[i][0],points[i][1],...exit[i]);shape.lineTo(...entry[(i+1)%n])}shape.closePath();return shape;
    };
    const sidePatch=(side,points,mat,expand=0)=>{
      const cx=points.reduce((s,p)=>s+p[0],0)/points.length,cy=points.reduce((s,p)=>s+p[1],0)/points.length,pts=points.map(p=>[cx+(p[0]-cx)*(1+expand),cy+(p[1]-cy)*(1+expand)]);
      const geo=new THREE.ShapeGeometry(roundPoly(pts,.045),12),pos=geo.attributes.position;
      for(let i=0;i<pos.count;i++){const z=pos.getX(i),y=pos.getY(i);pos.setXYZ(i,side*sideX(z,y,.018),y,z)}
      geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat);mesh.material.side=THREE.DoubleSide;g.add(mesh);return mesh;
    };
    const sideLine=(side,coords,r,mat,closed=false)=>curveTube(coords.map(([z,y])=>[side*sideX(z,y,.024),y,z]),r,mat,closed);
    const topAt=z=>sectionAt(z)[2],bodyWidthAt=z=>sectionAt(z)[1];
    const screen=(zA,zB,scale,mat,offset=.012)=>{
      const rows=24,cols=20,v=[],ix=[];
      for(let i=0;i<=rows;i++){const t=i/rows,z=zA+(zB-zA)*t,w=bodyWidthAt(z)*scale;for(let j=0;j<=cols;j++){const s=j/cols*2-1,x=s*w,y=topAt(z)-.085*s*s+offset;v.push(x,y,z)}}
      for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+1,c=b+cols+1,d=a+cols+1;ix.push(a,b,d,b,c,d)}
      const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.material.side=THREE.DoubleSide;g.add(m);return m;
    };
    // Windscreens follow the sloped roof transitions; the roof itself remains part of the shell.
    screen(-1.20,-.62,.875,gasket,.006);screen(-1.165,-.655,.835,darkWindow,.017);
    screen(1.57,1.97,.865,gasket,.007);screen(1.595,1.94,.825,darkWindow,.018);
    const sideGlass=[
      [[-.72,1.69],[-.50,1.26],[.04,1.26],[.04,1.70]],
      [[.18,1.70],[.18,1.27],[1.00,1.27],[1.00,1.70]],
      [[1.13,1.68],[1.13,1.28],[1.45,1.34],[1.51,1.57],[1.36,1.68]]
    ];
    for(const s of [-1,1]){
      for(const pts of sideGlass){sidePatch(s,pts,gasket,.07);sidePatch(s,pts,darkWindow,-.035);sideLine(s,pts,.011,trim,true)}
      // Sculpted A, B and C pillars, door seams and pressed lower character lines.
      sideLine(s,[[-.81,1.76],[-.75,1.57],[-.64,1.35],[-.53,1.14]],.036,paint);
      sideLine(s,[[.105,1.75],[.105,1.49],[.105,1.24]],.034,paint);
      sideLine(s,[[1.055,1.72],[1.055,1.48],[1.055,1.25]],.035,paint);
      sideLine(s,[[1.51,1.61],[1.55,1.34],[1.57,1.08]],.036,paint);
      for(const z of [-.47,.12,1.08,1.72])sideLine(s,[[z,.46],[z,.76],[z,1.04],[z,1.19]],.008,gasket);
      sideLine(s,[[-.43,.61],[-.05,.595],[.46,.59],[.92,.61],[1.32,.64]],.008,trim);
      for(const z of [-.30,.77]){
        const y=1.06,x=s*sideX(z,y,.034);curveTube([[x,y,z-.11],[x+s*.008,y+.022,z-.07],[x+s*.008,y+.022,z+.07],[x,y,z+.11]],.018,trim);
        curveTube([[x+s*.018,y+.025,z-.062],[x+s*.018,y+.025,z+.052]],.006,chrome);
      }
      // Front-quarter extractor and raised, rounded wheel-arch lips.
      sidePatch(s,[[-1.88,.84],[-1.52,.84],[-1.52,.94],[-1.88,.94]],trim,.01);
      for(let k=0;k<3;k++)sideLine(s,[[-1.83,.855+k*.033],[-1.57,.855+k*.033]],.008,chrome);
      for(const wz of wheelZ){const pts=[];for(let i=0;i<=40;i++){const a=-Math.PI/2+Math.PI*i/40;pts.push([s*1.035,bodyWheelRad+Math.cos(a)*.545,wz+Math.sin(a)*.545])}curveTube(pts,.028,paint)}
      // A chamfered running board, with a curved outer rail and fine grip ribs.
      const stepProfile=[[-.085,.30],[.085,.30],[.108,.325],[.108,.385],[.078,.415],[-.078,.415],[-.108,.385],[-.108,.325]],stepV=[],stepI=[],stepRings=42;
      for(let i=0;i<=stepRings;i++){const z=-1.00+1.98*i/stepRings;for(const [dx,y] of stepProfile)stepV.push(s*(1.035+dx),y,z)}
      for(let i=0;i<stepRings;i++)for(let j=0;j<stepProfile.length;j++){const a=i*stepProfile.length+j,b=i*stepProfile.length+(j+1)%stepProfile.length,c=(i+1)*stepProfile.length+(j+1)%stepProfile.length,d=(i+1)*stepProfile.length+j;stepI.push(a,b,d,b,c,d)}
      const stepGeo=new THREE.BufferGeometry();stepGeo.setAttribute("position",new THREE.Float32BufferAttribute(stepV,3));stepGeo.setIndex(stepI);stepGeo.computeVertexNormals();g.add(new THREE.Mesh(stepGeo,new THREE.MeshStandardMaterial({color:0x24292e,metalness:.58,roughness:.32})));
      for(let z=-.88;z<.90;z+=.15)curveTube([[s*1.0,.416,z-.025],[s*1.035,.423,z],[s*1.07,.416,z+.025]],.006,chrome);
      // Mirrors mount ahead of the front side glass and keep their silhouette rounded.
      curveTube([[s*sideX(-.73,1.28,.025),1.28,-.73],[s*1.09,1.39,-.67],[s*1.13,1.43,-.62]],.032,trim);
      if(opts.mirror!=="off"&&opts.mirrors!==false){const mirrorMat=opts.mirror==="carbon"?trim:paint,mirror=rounded(.13,.085,.19,mirrorMat,s*1.13,1.43,-.59);mirror.rotation.y=s*.08;rounded(.105,.055,.035,chrome,s*1.13,1.43,-.755)}
      // Roof rails follow the gently crowned roof instead of sitting on a rectangular cap.
      curveTube([[s*.70,1.83,-.39],[s*.735,1.855,.02],[s*.735,1.855,.77],[s*.71,1.79,1.43]],.026,trim);
      for(const z of [-.25,1.23])curveTube([[s*.71,1.82,z],[s*.77,1.88,z],[s*.84,1.86,z]],.018,chrome);
    }
    // Curved, bevelled front and rear bumpers are formed surfaces with recessed air openings.
    const roundedRect=(w,h,r)=>{const q=new THREE.Shape();q.moveTo(-w/2+r,-h/2);q.lineTo(w/2-r,-h/2);q.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);q.lineTo(w/2,h/2-r);q.quadraticCurveTo(w/2,h/2,w/2-r,h/2);q.lineTo(-w/2+r,h/2);q.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);q.lineTo(-w/2,-h/2+r);q.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);q.closePath();return q};
    const sculptBumperShape=()=>{const q=new THREE.Shape();q.moveTo(-.94,-.055);q.quadraticCurveTo(-1.00,-.045,-.985,.02);q.lineTo(-.91,.105);q.quadraticCurveTo(-.875,.15,-.80,.145);q.lineTo(.80,.145);q.quadraticCurveTo(.89,.15,.985,.025);q.quadraticCurveTo(1.005,-.045,.91,-.095);q.lineTo(.46,-.14);q.quadraticCurveTo(0,-.175,-.46,-.14);q.lineTo(-.91,-.095);q.closePath();return q};
    const sculptBumper=(mat,x,y,z,front=true)=>{const geo=new THREE.ExtrudeGeometry(sculptBumperShape(),{depth:.09,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.034,bevelThickness:.028});const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(front)m.rotation.y=Math.PI;g.add(m);return m};
    const faceShape=(shape,mat,z)=>{const m=new THREE.Mesh(new THREE.ShapeGeometry(shape,12),mat);m.material.side=THREE.DoubleSide;m.position.z=z;g.add(m);return m};
    const roundedLoop=(cx,cy,w,h,r,z)=>{const out=[],cs=[[cx+w/2-r,cy+h/2-r,0,Math.PI/2],[cx-w/2+r,cy+h/2-r,Math.PI/2,Math.PI],[cx-w/2+r,cy-h/2+r,Math.PI,Math.PI*1.5],[cx+w/2-r,cy-h/2+r,Math.PI*1.5,Math.PI*2]];for(const [x,y,a,b] of cs)for(let i=0;i<=6;i++){const t=a+(b-a)*i/6;out.push([x+r*Math.cos(t),y+r*Math.sin(t),z])}return out};
    const frontDark=new THREE.MeshStandardMaterial({color:0x10161b,metalness:.42,roughness:.32,side:THREE.DoubleSide}),bumperMat=new THREE.MeshStandardMaterial({color:0x20282e,metalness:.64,roughness:.31}),skidMat=new THREE.MeshStandardMaterial({color:0x84919a,metalness:.82,roughness:.26});
    sculptBumper(bumperMat,0,.37,-2.31,true);faceShape(roundedRect(.90,.075,.032),skidMat,-2.438).position.set(0,.225,-2.438);
    faceShape(roundedRect(.79,.39,.09),frontDark,-2.365);
    const grilleBorder=new THREE.MeshStandardMaterial({color:0x87949d,metalness:.82,roughness:.22});
    for(let i=0;i<7;i++){const y=.625+i*.047,pts=[[-.355,y,-2.378],[-.19,y+.007,-2.386],[0,y+.011,-2.39],[.19,y+.007,-2.386],[.355,y,-2.378]];curveTube(pts,.014,grilleBorder)}
    rounded(.052,.052,.028,chrome,0,.77,-2.402);
    for(const s of [-1,1]){
      faceShape(roundedRect(.28,.12,.035),frontDark,-2.37).position.x=s*.66;for(let i=0;i<3;i++)curveTube([[s*.79,.335+i*.029,-2.383],[s*.66,.34+i*.029,-2.389],[s*.53,.335+i*.029,-2.383]],.007,skidMat);
      const cx=s*.695,cy=.91;
      faceShape(roundedRect(.32,.285,.078),gasket,-2.371).position.set(cx,cy,-2.371);
      curveTube(roundedLoop(cx,cy,.34,.30,.085,-2.386),.016,chrome,true);
      const drl=curveTube(roundedLoop(cx,cy,.296,.256,.069,-2.399),.011,lampWhite,true);drl.visible=lampOn;
      const optic=new THREE.Mesh(new THREE.CircleGeometry(.079,32),new THREE.MeshPhysicalMaterial({color:0x9bc8e0,metalness:.26,roughness:.13,clearcoat:1,clearcoatRoughness:.04}));optic.position.set(cx,cy,-2.402);g.add(optic);
      const opticRing=new THREE.Mesh(new THREE.TorusGeometry(.086,.009,8,32),chrome);opticRing.position.set(cx,cy,-2.404);g.add(opticRing);
      const led=curveTube([[cx-s*.08,.69,-2.39],[cx-s*.04,.68,-2.4],[cx,.675,-2.401]],.012,lampWhite);led.visible=lampOn;
      const fog=new THREE.Mesh(new THREE.TorusGeometry(.057,.012,7,24),skidMat);fog.position.set(s*.66,.39,-2.397);g.add(fog);
      const fogGlass=new THREE.Mesh(new THREE.CircleGeometry(.045,20),lampWhite);fogGlass.position.set(s*.66,.39,-2.397);g.add(fogGlass);
    }
    // Rear glass, upright tail lamps, split-door details and a body-colour spare-wheel carrier.
    const rearFace=new THREE.MeshStandardMaterial({color:0x151c21,metalness:.38,roughness:.3,side:THREE.DoubleSide});
    faceShape(roundedRect(.96,.38,.075),rearFace,2.318).position.y=.63;
    sculptBumper(bumperMat,0,.37,2.255,false);faceShape(roundedRect(.86,.075,.032),skidMat,2.392).position.set(0,.225,2.392);
    for(const s of [-1,1]){
      faceShape(roundedRect(.18,.48,.065),gasket,2.326).position.set(s*.81,1.17,2.326);
      const lamp=new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(.125,.39,.05),10),new THREE.MeshStandardMaterial({color:0x7e1017,emissive:0x37060a,roughness:.28,side:THREE.DoubleSide}));lamp.position.set(s*.81,1.17,2.337);g.add(lamp);
      for(const y of [1.04,1.17,1.30]){const light=new THREE.Mesh(new THREE.TorusGeometry(.039,.012,6,20),lensRed);light.position.set(s*.81,y,2.35);g.add(light)}
      curveTube([[s*.91,.92,2.36],[s*.96,.9,2.34],[s*.99,.82,2.32]],.027,lensRed);
    }
    // Rear door perimeter and the exposed hinge details remain visible around the spare.
    curveTube([[-.75,.52,2.326],[-.74,1.03,2.326],[-.72,1.46,2.326],[-.58,1.52,2.326],[.0,1.52,2.326],[.58,1.52,2.326],[.72,1.46,2.326],[.74,1.03,2.326],[.75,.52,2.326]],.009,gasket);
    for(const s of [-1,1])for(const y of [.78,1.53]){const h=rounded(.035,.07,.025,chrome,s*.74,y,2.35);h.rotation.z=.18}
    const plate=faceShape(roundedRect(.46,.105,.025),gasket,2.36);plate.position.y=.48;
    for(let x=-.15;x<=.16;x+=.03)curveTube([[x,.455,2.37],[x,.505,2.37]],.003,chrome);
    // Two sculpted tow eyes sit low in the rear bumper.
    for(const s of [-1,1]){const hook=new THREE.Mesh(new THREE.TorusGeometry(.075,.018,8,24),new THREE.MeshStandardMaterial({color:0xc32d34,metalness:.5,roughness:.3}));hook.position.set(s*.71,.28,2.39);hook.rotation.x=Math.PI/2;g.add(hook)}
    // High-mounted spare uses a bulged sidewall and a multi-spoke alloy face.
    const treadCanvas=document.createElement("canvas");treadCanvas.width=512;treadCanvas.height=256;const tc=treadCanvas.getContext("2d");
    tc.fillStyle="#111416";tc.fillRect(0,0,512,256);tc.strokeStyle="#292e31";tc.lineWidth=5;
    for(let x=-32;x<544;x+=40){tc.beginPath();tc.moveTo(x,62);tc.lineTo(x+22,105);tc.lineTo(x,148);tc.moveTo(x+20,62);tc.lineTo(x-2,105);tc.lineTo(x+20,148);tc.stroke()}
    tc.strokeStyle="#080a0b";tc.lineWidth=3;for(let y=66;y<=146;y+=20){tc.beginPath();tc.moveTo(0,y);tc.lineTo(512,y);tc.stroke()}
    const treadMap=new THREE.CanvasTexture(treadCanvas);treadMap.wrapS=THREE.RepeatWrapping;treadMap.wrapT=THREE.ClampToEdgeWrapping;treadMap.encoding=THREE.sRGBEncoding;treadMap.anisotropy=R.capabilities.getMaxAnisotropy();defenderTreadMap=treadMap;
    const spare=new THREE.Group();spare.position.set(0,.94,2.39);g.add(spare);
    const spareTireMat=new THREE.MeshStandardMaterial({color:0x151719,map:treadMap,roughness:.93});
    const spareTire=new THREE.Mesh(new THREE.LatheGeometry([new V(.29,-.15),new V(.38,-.135),new V(.438,-.105),new V(.462,-.06),new V(.462,.06),new V(.438,.105),new V(.38,.135),new V(.29,.15)],48),spareTireMat);spareTire.rotation.x=Math.PI/2;spare.add(spareTire);
    const spareFace=new THREE.Mesh(new THREE.CircleGeometry(.315,48),alloy);spareFace.position.z=.158;spare.add(spareFace);
    const spareRing=new THREE.Mesh(new THREE.TorusGeometry(.305,.018,8,48),chrome);spareRing.position.z=.164;spare.add(spareRing);
    for(let i=0;i<10;i++){const a=i*Math.PI/5,curve=new THREE.CatmullRomCurve3([new V(.07*Math.sin(a),.07*Math.cos(a),.17),new V(.19*Math.sin(a+.07),.19*Math.cos(a+.07),.17),new V(.29*Math.sin(a+.14),.29*Math.cos(a+.14),.17)]);spare.add(new THREE.Mesh(new THREE.TubeGeometry(curve,8,.018,6,false),chrome))}
    const spareCap=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.045,24),trim);spareCap.rotation.x=Math.PI/2;spareCap.position.z=.177;spare.add(spareCap);
  }else{
  loft(bodyShape,paint,true);
  const hoodTop=z=>{let i=0;while(i<bodyShape.length-2&&z>bodyShape[i+1][0])i++;const a=bodyShape[i],b=bodyShape[i+1],t=(z-a[0])/(b[0]-a[0]),smooth=t*t*(3-2*t);return a[2]+(b[2]-a[2])*smooth};
  const hoodRibbon=(x,width,z0,z1,mat)=>{
    const verts=[],idx=[],segments=24;
    for(let i=0;i<=segments;i++){const t=i/segments,z=z0+(z1-z0)*t,y=hoodTop(z)-.008;verts.push(x-width/2,y,z,x+width/2,y,z)}
    for(let i=0;i<segments;i++){const a=i*2,b=a+2;idx.push(a,b,a+1,a+1,b,b+1)}
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,mat));
  };
  // Dark glass canopy, with a low roof and sloped windscreen.
  const roof=carStyle.model==="vortex"?[[-1.53,.75,1.44],[-1.28,.78,1.62],[-.92,.75,1.72],[.62,.75,1.72],[.98,.78,1.65],[1.34,.82,1.49],[1.55,.79,1.4]]:carStyle.bodyType==="sedan"?[[ -1.43,.78,1.48],[-1.16,.79,1.66],[-.82,.74,1.72],[.55,.74,1.72],[.96,.78,1.66],[1.34,.82,1.48],[1.52,.79,1.4]]:carStyle.bodyType==="suv"?[[ -1.52,.79,1.61],[-1.24,.83,1.86],[-.78,.82,1.94],[.72,.82,1.94],[1.18,.82,1.88],[1.55,.8,1.7],[1.78,.75,1.5]]:{
    verde:[[-1.1,.73,.95],[-.9,.71,1.12],[-.52,.61,1.34],[.28,.61,1.34],[.7,.68,1.2],[1.08,.82,.91]],
    azure:[[-1.14,.75,.96],[-.9,.76,1.19],[-.5,.69,1.43],[.34,.69,1.43],[.74,.72,1.25],[1.1,.84,.92]],
    pearl:[[-1.2,.74,.93],[-.96,.76,1.17],[-.55,.66,1.46],[.35,.66,1.46],[.8,.71,1.26],[1.15,.82,.91]],
    papaya:[[-1.08,.7,.95],[-.86,.69,1.12],[-.48,.58,1.31],[.28,.58,1.31],[.66,.64,1.17],[1.04,.8,.91]],
    sunburst:[[-1.12,.76,.94],[-.9,.76,1.16],[-.52,.68,1.38],[.38,.68,1.38],[.78,.73,1.2],[1.12,.84,.91]],
    violet:[[-1.17,.74,.94],[-.94,.73,1.18],[-.54,.66,1.47],[.38,.66,1.47],[.78,.72,1.28],[1.12,.84,.91]],
    obsidian:[[-1.1,.72,.94],[-.88,.7,1.1],[-.5,.6,1.29],[.3,.6,1.29],[.68,.67,1.16],[1.04,.8,.91]]
  }[model]||[[-1.14,.73,.94],[-.91,.72,1.13],[-.53,.62,1.405],[.32,.62,1.405],[.72,.68,1.22],[1.08,.82,.91]];
  loft(roof,glass,false);
  rounded(.59,.055,.59,paint,0,1.405,-.04);
  if(detailed)[-1,1].forEach(s=>{
    link(new V(s*.57,.98,-.94),new V(s*.49,1.36,-.49),.035,paint);
    link(new V(s*.49,1.36,.36),new V(s*.67,.95,.96),.035,paint);
    link(new V(s*.94,.75,-.35),new V(s*.98,.75,.22),.022,trim);
  });
  if(detailed&&carStyle.bodyType){
    const suv=carStyle.bodyType==="suv",pillarTop=suv?1.88:1.67,doorY=suv?.94:.72,doorH=suv?.62:.46;
    [-1,1].forEach(s=>{
      link(new V(s*(suv?.68:.61),pillarTop,-.02),new V(s*(suv?.7:.61),suv?1.2:1.02,.08),suv?.048:.04,trim);
      for(const z of [-.58,.79])M(.022,doorH,.035,trim,s*(suv?1.005:.94),doorY,z);
      for(const z of [-.42,.94])M(.13,.035,.045,trim,s*(suv?1.015:.95),suv?1.08:.91,z);
    });
  }
  if(detailed&&carStyle.raceSpec){
    const archMat=new THREE.MeshStandardMaterial({color:0x20252a,metalness:.34,roughness:.38});
    for(const side of [-1,1]){
      for(const wz of wheelZ){
        const radius=bodyWheelRad+.078,points=[];
        for(let i=0;i<=24;i++){const a=-Math.PI/2+i*Math.PI/24;points.push(new V(side*1.005,bodyWheelRad+Math.cos(a)*radius,wz+Math.sin(a)*radius))}
        g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.022,7,false),archMat));
      }
      M(.12,.105,1.9,trim,side*1.018,.345,.04);
      M(.085,.018,1.52,paint,side*1.04,.292,.04);
      M(.025,.22,.17,trim,side*.99,.65,-.83);
      for(let i=0;i<3;i++)M(.022,.012,.125,lam(0x818890),side*1.012,.58+i*.065,-.83);
    }
    M(2.12,.07,.36,trim,0,.295,-2.13);M(1.86,.018,.018,paint,0,.333,-2.31);
    M(1.88,.115,.32,trim,0,.315,2.13);
    for(const x of [-.62,-.31,0,.31,.62])M(.035,.14,.31,lam(0x080a0d),x,.31,2.14);
    const hook=new THREE.Mesh(new THREE.TorusGeometry(.055,.014,8,20),new THREE.MeshStandardMaterial({color:0xd42135,metalness:.38,roughness:.32}));hook.position.set(0,.38,-2.225);hook.rotation.y=Math.PI;g.add(hook);
    for(const side of [-1,1]){
      link(new V(side*.67,.93,1.72),new V(side*.67,1.24,1.91),.045,trim);
      M(.055,.31,.36,trim,side*1.01,1.22,1.96);
    }
    M(carStyle.wingWidth,.075,.34,paint,0,1.27,1.96);
    M(carStyle.wingWidth+.08,.045,.37,trim,0,1.315,1.95);
    M(1.86,.05,.12,paint,0,1.14,1.79);
  }
  // Road-car trim and performance aero follow the selected body style.
  if(detailed){
  if(carStyle.bodyType==="suv"){
    M(2.02,.12,.18,trim,0,.4,-2.08);M(1.9,.13,.2,trim,0,.4,2.07);
    [-1,1].forEach(s=>M(.12,.13,1.18,trim,s*1.03,.38,.02));
    [-1,1].forEach(s=>M(.06,.07,2.65,trim,s*.61,1.91,.1));
  }else{
    M(1.86,.075,.21,trim,0,.34,-2.03);M(1.7,.055,.25,trim,0,.35,2.04);
    if(carStyle.model==="vortex")M(.86,.09,.045,trim,0,.49,2.115);else M(1.18,.12,.055,trim,0,.49,-2.115);
    for(let x=-.47;x<=.48;x+=.19)M(.035,.07,.025,lam(0x727a82),x,.49,-2.15);
    [-1,1].forEach(s=>{if(!carStyle.raceSpec){M(.14,.12,1.1,trim,s*.97,.39,0);M(.05,.13,.48,trim,s*.91,.62,.11);link(new V(s*.68,.7,1.72),new V(s*.71,1.01,1.9),.035,trim)}});
  }
  if(carStyle.spoiler!==false&&!carStyle.raceSpec){M(carStyle.wingWidth||1.88,.09,.32,paint,0,1.02,1.94);M((carStyle.wingWidth||1.88)+.16,.07,.4,trim,0,1.09,1.93)}
  else if(carStyle.bodyType==="sedan"&&!carStyle.raceSpec)M(1.45,.055,.12,paint,0,.91,2.005);
  // Real lenses sit in the corners, with narrow LED signatures.
  [-1,1].forEach(s=>{
    rounded(.29,.065,.075,lam(0x10151c),s*.61,.735,-1.995);
    const ice=opts.headlight==="ice",on=opts.headlight!=="off"&&opts.headlights!==false;
    const headWidth=carStyle.roundLights ? .29 : carStyle.model==="verde" ? .28 : carStyle.model==="vortex" ? .27 : .235;
    const head=rounded(headWidth,carStyle.model==="verde" ? .03 : .043,.052,new THREE.MeshStandardMaterial({color:ice?0xbbeaff:0xfff4d2,emissive:on?(ice?0x65bfff:0xffd97a):0,emissiveIntensity:on?1.5:0,roughness:.18}),s*.61,.75,-2.03);head.visible=on;
    if(detailed&&carStyle.quadLights){for(const dx of [-.12,.12]){const lamp=rounded(.065,.035,.045,lam(0xdff5ff),s*.61+dx,.75,-2.034);lamp.visible=on}}
    rounded(.28,.045,.052,new THREE.MeshStandardMaterial({color:0xff2929,emissive:0x9d0808,emissiveIntensity:.65}),s*.67,.755,2.035);
  });}
  if(detailed&&carStyle.stripe){
    const stripe=lam(carStyle.stripe),xs=carStyle.model==="azure"||carStyle.model==="obsidian"?[-.27,.27]:[-.22,.22];
    xs.forEach(x=>hoodRibbon(x,.085,-1.98,-1.16,stripe));
  }
  if(detailed&&carStyle.scoop)[-1,1].forEach(s=>{
    M(.075,.24,.5,trim,s*.965,.67,.46);
    M(.082,.035,.42,lam(0x78818a),s*.98,.67,.46);
  });
  if(detailed&&carStyle.grille&&carStyle.model!=="vortex"){rounded(.31,.26,.08,trim,0,.54,-2.105);rounded(.22,.18,.085,lam(0x111519),0,.54,-2.15)}
  if(detailed&&carStyle.raceSpec){
    const grilleShape=new THREE.Shape();grilleShape.moveTo(-.48,0);grilleShape.lineTo(.48,0);grilleShape.lineTo(.42,.25);grilleShape.lineTo(-.42,.25);grilleShape.closePath();
    const grille=new THREE.Mesh(new THREE.ShapeGeometry(grilleShape),new THREE.MeshStandardMaterial({color:0x0b0f13,metalness:.3,roughness:.38,side:THREE.DoubleSide}));grille.rotation.y=Math.PI;grille.position.set(0,.405,-2.175);g.add(grille);
    const slat=lam(0x899198);for(const y of [.445,.49,.535,.58,.625])M(.76,.012,.014,slat,0,y,-2.185);
    rounded(.065,.065,.025,lam(0xd4d7d9),0,.535,-2.197);
    for(const side of [-1,1]){
      M(.24,.15,.035,trim,side*.69,.47,-2.16);
      M(.17,.025,.025,lam(0x747c83),side*.69,.47,-2.185);
      M(.15,.025,.025,lam(0x747c83),side*.69,.52,-2.185);
    }
  }
  if(detailed&&carStyle.model==="vortex"){
    const grilleShape=new THREE.Shape();grilleShape.moveTo(-.48,.43);grilleShape.lineTo(.48,.43);grilleShape.lineTo(.43,.66);grilleShape.lineTo(-.43,.66);grilleShape.closePath();
    const grille=new THREE.Mesh(new THREE.ShapeGeometry(grilleShape),new THREE.MeshStandardMaterial({color:0x0a0e12,metalness:.36,roughness:.3,side:THREE.DoubleSide}));grille.rotation.y=Math.PI;grille.position.z=-2.195;g.add(grille);
    const chrome=new THREE.MeshStandardMaterial({color:0xbcc5ca,metalness:.86,roughness:.2}),slat=lam(0x68727a);
    M(.9,.023,.026,chrome,0,.681,-2.204);M(.91,.019,.025,chrome,0,.419,-2.204);
    for(const y of [.465,.51,.555,.6,.635])M(.79,.012,.014,slat,0,y,-2.207);
    rounded(.07,.07,.027,chrome,0,.548,-2.218);
    const drl=new THREE.MeshStandardMaterial({color:0xdff4ff,emissive:opts.headlight==="ice"?0x65bfff:0x9acfff,emissiveIntensity:opts.headlight==="off"?0:1.25,roughness:.2});
    [-1,1].forEach(side=>{
      const strip=M(.27,.022,.02,drl,side*.79,.79,-2.085);strip.visible=opts.headlight!=="off"&&opts.headlights!==false;
      const rear=new THREE.MeshStandardMaterial({color:0xff3a3a,emissive:0xb30d16,emissiveIntensity:.8,roughness:.24});
      M(.32,.023,.025,rear,side*.65,.77,2.085);
      const seam=lam(0x50575d);M(.018,.45,.02,seam,side*.947,.72,-.02);M(.016,.37,.02,seam,side*.93,.66,1.05);
      const exhaust=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.19,16),chrome);exhaust.rotation.x=Math.PI/2;exhaust.position.set(side*.57,.37,2.16);g.add(exhaust);
      const inner=new THREE.Mesh(new THREE.CylinderGeometry(.052,.06,.192,14),trim);inner.rotation.x=Math.PI/2;inner.position.set(side*.57,.37,2.16);g.add(inner);
    });
    M(1.45,.045,.13,trim,0,.32,2.075);
  }
  if(detailed&&carStyle.hoodVents)for(const s of [-1,1])hoodRibbon(s*.37,.022,-1.58,-1.3,trim);
  }
  // Four detailed tires share the original steering and rotation groups used by driving physics.
  const rad=carStyle.wheelRadius||(tireId==="rally"?.43:.37),wheelX=carStyle.wheelTrack||1.055,tireWidth=carStyle.raceSpec&&tireId==="track"?.38:.32;g.userData.wheels=[];
  for(const z of wheelZ)for(const side of [-1,1]){
    const wheelXPos=side*wheelX,steering=new THREE.Group();steering.position.set(wheelXPos,rad,z);g.add(steering);
    const spin=new THREE.Group();steering.add(spin);g.userData.wheels.push({steering,spin,front:z<0,radius:rad});
    const tireMat=new THREE.MeshStandardMaterial({color:0x101214,map:defender110?defenderTreadMap:null,roughness:defender110?.92:.84});
    let tire;if(defender110){const tireGeo=new THREE.LatheGeometry([new V(rad*.64,-tireWidth*.5),new V(rad*.83,-tireWidth*.44),new V(rad*.96,-tireWidth*.31),new V(rad,-tireWidth*.16),new V(rad,tireWidth*.16),new V(rad*.96,tireWidth*.31),new V(rad*.83,tireWidth*.44),new V(rad*.64,tireWidth*.5)],48);tireGeo.rotateZ(Math.PI/2);tire=new THREE.Mesh(tireGeo,tireMat)}else{tire=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,tireWidth,32,1),tireMat);tire.rotation.z=Math.PI/2}spin.add(tire);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(detailed?rad*.52:rad*.48,detailed?rad*.52:rad*.48,detailed?.035:.025,detailed?20:10),alloy);hub.rotation.z=Math.PI/2;hub.position.x=side*(detailed?.185:.18);spin.add(hub);
    if(detailed){const disc=new THREE.Mesh(new THREE.CylinderGeometry(rad*.69,rad*.69,.018,24),new THREE.MeshStandardMaterial({color:0x6f777d,metalness:.78,roughness:.31}));disc.rotation.z=Math.PI/2;disc.position.x=side*.17;spin.add(disc);
      const spokeCount=defender110?12:10;for(let i=0;i<spokeCount;i++){const a=i*Math.PI*2/spokeCount,spoke=new THREE.Mesh(new THREE.CylinderGeometry(.012,.024,rad*.48,6),alloy);spoke.rotation.set(Math.PI/2-a,0,0);spoke.position.set(side*.21,Math.sin(a)*rad*.34,Math.cos(a)*rad*.34);spin.add(spoke)}
      const cap=rounded(.06,.06,.028,lam(carStyle.raceSpec?0xd42135:0xd8e0e6),0,0,0);cap.position.x=side*.225;spin.add(cap);
      if(carStyle.raceSpec){
        const rimRing=new THREE.Mesh(new THREE.TorusGeometry(rad*.55,.012,6,28),new THREE.MeshStandardMaterial({color:0xaeb5bb,metalness:.88,roughness:.2}));rimRing.rotation.y=Math.PI/2;rimRing.position.x=side*.214;spin.add(rimRing);
        const caliper=new THREE.Mesh(new THREE.BoxGeometry(.075,.19,.13),new THREE.MeshStandardMaterial({color:0xc91f32,metalness:.28,roughness:.4}));caliper.position.set(side*.184,.015,rad*.39);spin.add(caliper);
        for(let i=0;i<12;i++){const a=i*Math.PI/6,hole=new THREE.Mesh(new THREE.SphereGeometry(.012,6,5),new THREE.MeshStandardMaterial({color:0x252a2e,metalness:.5,roughness:.5}));hole.position.set(side*.188,Math.sin(a)*rad*.43,Math.cos(a)*rad*.43);spin.add(hole)}
      }}
    if(tireId==="whitewall"){const ring=new THREE.Mesh(new THREE.TorusGeometry(rad*.79,.025,6,28),lam(0xe2e1d9));ring.rotation.y=Math.PI/2;ring.position.x=side*.19;spin.add(ring)}
  }
  if(!defender110){
  if(detailed&&tireId==="rally")for(const z of wheelZ)for(const side of [-1,1])M(.055,.035,.76,trim,side*1.04,.28,z);
  if(detailed&&opts.mirror!=="off"&&opts.mirrors!==false)[-1,1].forEach(s=>{const carbon=opts.mirror==="carbon"||carStyle.raceSpec;link(new V(s*.8,.91,-.53),new V(s*1.02,1.02,-.44),.045,trim);rounded(.13,.065,.17,lam(carbon?0x161a20:opts.color??col),s*1.04,1.035,-.43)});
  if(detailed&&carStyle.raceSpec){
    const sideMat=new THREE.MeshBasicMaterial({map:raceTexture("side"),transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
    const roofMat=new THREE.MeshBasicMaterial({map:raceTexture("roof"),side:THREE.DoubleSide,toneMapped:false});
    [-1,1].forEach(side=>{const number=new THREE.Mesh(new THREE.PlaneGeometry(1.26,.47),sideMat);number.rotation.y=side*Math.PI/2;number.position.set(side*.96,.72,.03);g.add(number)});
    const roofNumber=new THREE.Mesh(new THREE.PlaneGeometry(.58,.77),roofMat);roofNumber.rotation.x=-Math.PI/2;roofNumber.position.set(0,1.728,-.06);g.add(roofNumber);
    M(.28,.035,.025,new THREE.MeshStandardMaterial({color:0xff3948,emissive:0x9f0717,emissiveIntensity:.7}),0,.29,2.295);
    const exhaustMat=new THREE.MeshStandardMaterial({color:0xabb4b9,metalness:.9,roughness:.19}),inside=lam(0x171b1f);
    for(const side of [-1,1]){
      const tip=new THREE.Mesh(new THREE.CylinderGeometry(.076,.087,.17,18),exhaustMat);tip.rotation.x=Math.PI/2;tip.position.set(side*.59,.37,2.22);g.add(tip);
      const bore=new THREE.Mesh(new THREE.CylinderGeometry(.052,.06,.176,16),inside);bore.rotation.x=Math.PI/2;bore.position.set(side*.59,.37,2.225);g.add(bore);
    }
  }
  if(detailed&&opts.decal==="racing")[-.24,.24].forEach(x=>M(.105,.018,.65,lam(0xf6f4e9),x,.84,-1.48));
  if(detailed&&(opts.decal==="bolt"||opts.decal==="flame"))[-1,1].forEach(side=>{
    const shape=new THREE.Shape();
    if(opts.decal==="bolt"){shape.moveTo(-.65,.04);shape.lineTo(-.05,.08);shape.lineTo(-.3,.34);shape.lineTo(.55,.4);shape.lineTo(.12,.56);shape.lineTo(-.18,.27);shape.lineTo(-.58,.25);shape.closePath()}
    else{shape.moveTo(-.75,.04);shape.lineTo(-.45,.2);shape.lineTo(-.57,.48);shape.lineTo(-.12,.25);shape.lineTo(.08,.56);shape.lineTo(.2,.25);shape.lineTo(.64,.35);shape.lineTo(.43,.08);shape.closePath()}
    const decal=new THREE.Mesh(new THREE.ShapeGeometry(shape),lam(opts.decal==="bolt"?0xffcf39:0xff6c2e));decal.rotation.y=side>0?Math.PI/2:-Math.PI/2;decal.position.set(side*1.001,.46,0);g.add(decal);
  });
  }
  if(defender110)window.__reviewCar=g;
  return g;
}

/* ============================================================
   GRID CITY â€” wide roads on a repeating grid, so every road
   meets another at a crossing. The whole road+sidewalk pattern
   is one tiling texture on a single giant ground plane (cheap
   to render); buildings are real 3D boxes recycled around the
   player as they drive.
   ============================================================ */
const CELL=56,ROAD_W=18,SIDEWALK_W=24;
const cv=document.createElement("canvas");cv.width=cv.height=256;const c2=cv.getContext("2d");
const CS=256,scl=CS/CELL,rHalf=(ROAD_W/2)*scl,sHalf=(SIDEWALK_W/2)*scl;
c2.fillStyle="#2e5d3a";c2.fillRect(0,0,CS,CS);
c2.fillStyle="#4d525c";
[0,CS-sHalf].forEach(y=>c2.fillRect(0,y,CS,sHalf));[0,CS-sHalf].forEach(x=>c2.fillRect(x,0,sHalf,CS));
c2.fillStyle="#26282b";
[0,CS-rHalf].forEach(y=>c2.fillRect(0,y,CS,rHalf));[0,CS-rHalf].forEach(x=>c2.fillRect(x,0,rHalf,CS));
c2.fillStyle="#f2f2f2";
c2.fillRect(0,rHalf-2,CS,2);c2.fillRect(0,CS-rHalf,CS,2);c2.fillRect(rHalf-2,0,2,CS);c2.fillRect(CS-rHalf,0,2,CS);
c2.fillStyle="#ffd23f";
c2.fillRect(0,0,CS,2);c2.fillRect(0,CS-2,CS,2);c2.fillRect(0,0,2,CS);c2.fillRect(CS-2,0,2,CS);
const tex=new THREE.CanvasTexture(cv);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
tex.anisotropy=R.capabilities.getMaxAnisotropy();
const GS=CELL*800;tex.repeat.set(GS/CELL,GS/CELL);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(GS,GS),new THREE.MeshLambertMaterial({map:tex}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.02;sc.add(ground);

function onRoad(x,z){
  const lx=((x%CELL)+CELL)%CELL,lz=((z%CELL)+CELL)%CELL;
  return Math.min(lx,CELL-lx)<ROAD_W/2||Math.min(lz,CELL-lz)<ROAD_W/2;
}

const BC=[0x39456b,0x5a4a6b,0x2f5566,0x6b4a4a,0x46506b,0x44577a],BN=96,blds=[];
const AIRPORT_W=560,AIRPORT_D=420;
const PARKING={x:90,z:151,halfW:49,halfD:39,floorHeight:6,rampRun:82,rampWidth:10,baseY:.1};
const wc=document.createElement("canvas");wc.width=wc.height=64;const wctx=wc.getContext("2d");
wctx.fillStyle="#1c2027";wctx.fillRect(0,0,64,64);wctx.fillStyle="#ffd98a";
for(let gy=0;gy<8;gy++)for(let gx=0;gx<8;gx++)if(rnd()<.55)wctx.fillRect(gx*8+1,gy*8+1,5,5);
const winTex=new THREE.CanvasTexture(wc);winTex.wrapS=winTex.wrapT=THREE.RepeatWrapping;winTex.anisotropy=R.capabilities.getMaxAnisotropy();
const roofMat=lam(0x2b2e35);
const PLACES=[
  {name:"Airport",icon:"âœˆ",kind:"airport",x:0,z:-728,color:"#4fc3f7"},
  {name:"Central Station",icon:"ðŸš‰",kind:"station",x:0,z:210,color:"#ffd166"},
  {name:"CafÃ©",icon:"â˜•",kind:"cafe",x:-112,z:0,color:"#f4a261"},
  {name:"The Corner Pub",icon:"ðŸº",kind:"pub",x:112,z:0,color:"#d68cba"},
  {name:"City Hospital",icon:"âœš",kind:"hospital",x:-112,z:112,color:"#f27777"},
  {name:"Police Station",icon:"â˜…",kind:"police",x:112,z:112,color:"#76a9fa"},
  {name:"Fire Station",icon:"â™¨",kind:"fire",x:-112,z:-112,color:"#fb923c"},
  {name:"Shopping Mall",icon:"â—†",kind:"mall",x:112,z:-112,color:"#c084fc"},
  {name:"City Hall",icon:"â–°",kind:"civic",x:-112,z:224,color:"#a3b18a"},
  {name:"Hotel",icon:"â–£",kind:"hotel",x:112,z:224,color:"#f0abfc"},
  {name:"School",icon:"âœŽ",kind:"school",x:-224,z:0,color:"#fde68a"},
  {name:"Park",icon:"â™£",kind:"park",x:224,z:0,color:"#4ade80"},
  {name:"Supermarket",icon:"â–¤",kind:"market",x:-224,z:112,color:"#67e8f9"},
  {name:"Cinema",icon:"â–¶",kind:"cinema",x:224,z:112,color:"#f9a8d4"},
  {name:"Sports Arena",icon:"â—Ž",kind:"arena",x:-224,z:-112,color:"#93c5fd"},
  {name:"Harbor & Docks",icon:"âš“",kind:"harbor",x:224,z:-112,color:"#60a5fa"},
  {name:"Fire Station",icon:"â™¨",kind:"fire",x:0,z:322,color:"#fb923c"},
  {name:"Garden Square",icon:"â™£",kind:"park",x:-112,z:-224,color:"#4ade80"},
  {name:"Market Street",icon:"â–¤",kind:"market",x:112,z:-224,color:"#67e8f9"}
];
function insideAirport(x,z,pad=0){
  return PLACES.some(p=>p.kind==="airport"&&Math.abs(p.x-x)<AIRPORT_W/2+pad&&Math.abs(p.z-z)<AIRPORT_D/2+pad);
}
const bMat=(color)=>new THREE.MeshLambertMaterial({color}),bGeo=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function buildingShape(kind,color){
  const g=new THREE.Group(),base=bMat(color),trim=bMat(0xd5d0c6),roof=bMat(0x343841),glass=bMat(0x8ad6e8);
  const box=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(bGeo(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
  const tower=(w,h,d)=>{box(w,h,d,base,0,h/2,0);box(w+.6,.55,d+.6,trim,0,h+.2,0);box(w*.8,.3,d*.8,roof,0,h+.62,0);for(let y=3;y<h-1;y+=3.2){box(w+.08,.2,d+.08,glass,0,y,0)}};
  const aircraft=(x,z,scale=1)=>{
    const plane=new THREE.Group(),white=bMat(0xe8edf0),blue=bMat(0x2878a0),dark=bMat(0x25333b),wheel=bMat(0x17191b),metal=bMat(0x7b8588);
    const part=(geo,mat,px,py,pz,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(px,py,pz);o.rotation.set(rx,ry,rz);o.scale.setScalar(scale);plane.add(o);return o};
    // Passenger jet facing the runway, with swept wings, tail, engines, windows and landing gear.
    part(new THREE.CylinderGeometry(1.8,2.25,29,14),white,0,3,0,Math.PI/2);
    part(new THREE.ConeGeometry(2.25,8,14),white,0,3,-17,-Math.PI/2);
    part(new THREE.ConeGeometry(1.8,6,14),white,0,3,16,Math.PI/2);
    part(new THREE.BoxGeometry(42,.42,9),white,0,2.1,-1,0,0,-.08);
    part(new THREE.BoxGeometry(13,.34,5),white,0,2.8,12,0,0,-.04);
    part(new THREE.BoxGeometry(1,7,6),blue,0,5,12);
    part(new THREE.BoxGeometry(.12,.42,23),blue,1.92,3.1,1);
    part(new THREE.BoxGeometry(.12,.42,23),blue,-1.92,3.1,1);
    part(new THREE.BoxGeometry(2.8,1,.35),dark,0,4.25,-12.1,-.25);
    for(const side of [-1,1]){
      for(let i=0;i<9;i++)part(new THREE.BoxGeometry(.13,.42,.8),dark,side*1.91,3.65,-8+i*2.1);
      part(new THREE.CylinderGeometry(1.05,1.05,4.4,12),metal,side*8,1.7,-1,Math.PI/2);
      part(new THREE.CylinderGeometry(.82,.82,.18,12),dark,side*8,1.7,-3.25,Math.PI/2);
      part(new THREE.CylinderGeometry(.42,.42,1.2,10),dark,side*7,.72,5);
      part(new THREE.CylinderGeometry(.52,.52,.38,10),wheel,side*7,.55,5,0,0,Math.PI/2);
    }
    part(new THREE.CylinderGeometry(.35,.35,1,10),dark,0,.7,15,0,0,Math.PI/2);
    part(new THREE.CylinderGeometry(.45,.45,.35,10),wheel,0,.45,15,0,0,Math.PI/2);
    plane.position.set(x,0,z);g.add(plane);return plane;
  };
  if(kind==="airport"){
    // Remote airfield with a marked runway, taxiways, apron, terminal and gate.
    const apron=bMat(0x777d80),asphalt=bMat(0x30363a),marking=bMat(0xe7e2cf),window=bMat(0x91d9e8),fence=bMat(0x737c7e),terminal=bMat(0xc7cdd0);
    const pavement=(w,d,material,x,y,z)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);g.add(o)};
    // Runway shoulders, centerline, threshold bars and blue edge lights.
    pavement(448,54,apron,0,.035,-128);pavement(432,40,asphalt,0,.05,-128);
    for(let x=-194;x<=194;x+=16)box(7,.08,.45,marking,x,.095,-128);
    for(const x of [-204,204])for(let z=-145;z<=-111;z+=6)box(2,.08,1.5,marking,x,.095,z);
    for(let x=-210;x<=210;x+=14)for(const z of [-153,-103])box(.7,.35,.7,bMat(0x9ce8ff),x,.22,z);
    // Parallel taxiway and two broad runway connectors.
    pavement(390,18,asphalt,0,.055,-82);
    pavement(30,42,asphalt,-166,.058,-104);pavement(30,42,asphalt,166,.058,-104);
    for(let x=-182;x<=182;x+=18)box(8,.08,.35,marking,x,.105,-82);
    for(let x=-190;x<=190;x+=14)for(const z of [-92,-72])box(.65,.3,.65,bMat(0xf1e1a0),x,.21,z);
    // Large concrete stand apron and glazed terminal with three passenger concourses.
    pavement(320,126,apron,0,.04,-8);
    box(202,19,44,terminal,0,9.5,82);box(194,7,.5,window,0,10,59.7);
    // Three glazed bands and floor plates show the terminal's stacked levels.
    for(const y of [4.2,9.3,14.4,18.1])box(194,.28,.7,window,0,y,59.55);
    for(const y of [6.4,12.7,18.6])box(202,.45,44,trim,0,y,82);
    box(212,1,47,trim,0,19.2,82);box(188,.7,40,roof,0,20,82);
    box(88,7,30,window,0,14,82);box(92,.7,34,roof,0,18,82);
    // High entrance canopy, terminal wing, and three boarding piers.
    box(174,1.2,12,trim,0,5.6,111);box(176,.45,13,roof,0,6.35,111);
    box(38,11,25,terminal,-127,5.5,86);box(40,.8,27,roof,-127,11.2,86);
    for(const x of [-94,0,94]){
      box(18,7,54,terminal,x,3.5,31);box(18.5,.65,55,roof,x,7.3,31);
      box(17,3,.35,window,x,4.8,4.2);
    }
    box(4.5,4,28,trim,-90,5,-2);box(5,.45,28,roof,-90,7.25,-2);
    aircraft(-94,-29);
    // Tall glazed air-traffic-control tower, hangar, and marked vehicle parking.
    box(12,28,12,trim,177,14,69);box(15,5,15,window,177,30.5,69);box(17,.8,17,roof,177,33.4,69);
    box(5,3,5,base,177,35.3,69);box(3,2,.5,marking,177,35.5,66.5);
    box(70,20,48,trim,214,10,-17);box(74,1,52,roof,214,20.5,-17);
    box(52,12,.6,asphalt,214,6,7);box(52,.4,.8,trim,214,12,7);
    pavement(92,58,asphalt,-194,.035,129);pavement(92,58,asphalt,194,.035,129);
    for(const side of [-1,1])for(let r=0;r<5;r++)for(let c=0;c<6;c++)box(.18,.08,7,marking,side*194+(c-2.5)*12,.09,108+r*10);
    // Three-level parking garage. Two broad switchback ramps connect all floors.
    const pgx=PARKING.x,pgz=PARKING.z,ph=PARKING.floorHeight;
    pavement(18,82,asphalt,pgx,.045,pgz);
    const deckMat=bMat(0x777d80),deckEdge=bMat(0x555d61),stall=bMat(0xf0dfaa);
    const cuts=[[],[[5,13],[19,29]],[[5,13]]];
    for(let floor=0;floor<3;floor++){
      const y=PARKING.baseY+floor*ph,excluded=floor===0?[[19,29]]:cuts[floor];
      let z0=-PARKING.halfD;
      for(const [a,b] of [...excluded,[PARKING.halfD,PARKING.halfD+1]]){
        const end=Math.min(b,PARKING.halfD);
        if(a>z0)box(PARKING.halfW*2,.5,a-z0,deckMat,pgx,y-.25,pgz+(z0+a)/2);
        z0=Math.max(z0,end);
      }
      if(z0<PARKING.halfD)box(PARKING.halfW*2,.5,PARKING.halfD-z0,deckMat,pgx,y-.25,pgz+(z0+PARKING.halfD)/2);
      // Painted parking bays on the open sides of the ramp lanes.
      for(const z of [-31,-17,-3,16,34])if(Math.abs(z-9)>5&&Math.abs(z-24)>5)
        for(let x=-39;x<=39;x+=13)box(.16,.045,8,stall,pgx+x,y+.025,pgz+z);
      // Perimeter beams and low safety rails keep cars on the decks.
      box(PARKING.halfW*2,.45,.55,deckEdge,pgx,y+.38,pgz-PARKING.halfD+.3);
      if(floor===0){
        box(PARKING.halfW-12,.45,.55,deckEdge,pgx-(PARKING.halfW+12)/2,y+.38,pgz+PARKING.halfD-.3);
        box(PARKING.halfW-12,.45,.55,deckEdge,pgx+(PARKING.halfW+12)/2,y+.38,pgz+PARKING.halfD-.3);
      }else box(PARKING.halfW*2,.45,.55,deckEdge,pgx,y+.38,pgz+PARKING.halfD-.3);
      box(.55,.45,PARKING.halfD*2,deckEdge,pgx-PARKING.halfW+.3,y+.38,pgz);
      box(.55,.45,PARKING.halfD*2,deckEdge,pgx+PARKING.halfW-.3,y+.38,pgz);
    }
    for(let x=-46;x<=46;x+=23)for(const z of [-36,36])if(z<0||Math.abs(x)>14)box(1.3,ph*3,1.3,deckEdge,pgx+x,ph*1.5,pgz+z);
    const rampA=new THREE.Mesh(new THREE.BoxGeometry(PARKING.rampRun,.36,PARKING.rampWidth),asphalt);
    rampA.position.set(pgx,PARKING.baseY+ph/2-.17,pgz+24);rampA.rotation.z=Math.atan(ph/PARKING.rampRun);g.add(rampA);
    const rampB=new THREE.Mesh(new THREE.BoxGeometry(PARKING.rampRun,.36,PARKING.rampWidth),asphalt);
    rampB.position.set(pgx,PARKING.baseY+ph*1.5-.17,pgz+9);rampB.rotation.z=-Math.atan(ph/PARKING.rampRun);g.add(rampB);
    // Parking sign and level labels make the multi-storey structure easy to spot.
    box(98,.7,1.2,trim,pgx,ph*3+.2,pgz-PARKING.halfD+1);
    box(3,5,.35,glass,pgx,ph*3+2.7,pgz-PARKING.halfD+1.7);
    const parkingSign=document.createElement("canvas");parkingSign.width=512;parkingSign.height=72;
    const parkingSignCtx=parkingSign.getContext("2d");parkingSignCtx.fillStyle="#17394b";parkingSignCtx.fillRect(0,0,512,72);
    parkingSignCtx.fillStyle="#f5f2df";parkingSignCtx.font="bold 34px Arial, sans-serif";parkingSignCtx.textAlign="center";parkingSignCtx.textBaseline="middle";parkingSignCtx.fillText("AIRPORT PARKING  ·  3 LEVELS",256,37);
    const parkingSignMesh=new THREE.Mesh(new THREE.PlaneGeometry(46,4.2),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(parkingSign)}));
    parkingSignMesh.position.set(pgx,ph*3+2.7,pgz-PARKING.halfD+1.9);g.add(parkingSignMesh);
    for(let floor=0;floor<3;floor++){
      const levelCanvas=document.createElement("canvas");levelCanvas.width=128;levelCanvas.height=64;
      const levelCtx=levelCanvas.getContext("2d");levelCtx.fillStyle="#17394b";levelCtx.fillRect(0,0,128,64);
      levelCtx.fillStyle="#f5f2df";levelCtx.font="bold 26px Arial, sans-serif";levelCtx.textAlign="center";levelCtx.textBaseline="middle";levelCtx.fillText("LEVEL "+(floor+1),64,33);
      const levelSign=new THREE.Mesh(new THREE.PlaneGeometry(8,3.2),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(levelCanvas)}));
      levelSign.position.set(pgx-42,PARKING.baseY+floor*ph+2.2,pgz-PARKING.halfD+1.75);g.add(levelSign);
    }
    // A marked access road connects the city street through the front gate to the terminal.
    pavement(24,106,asphalt,-28,.04,157);pavement(250,26,asphalt,0,.045,113);
    for(let x=-112;x<=112;x+=16)box(.25,.08,9,marking,x,.1,113);
    for(let z=120;z<=190;z+=14)box(.3,.08,5,marking,-28,.1,z);
    // A perimeter fence separates the airport grounds from the repeating street grid.
    for(let x=-274;x<=274;x+=18){box(.45,1.7,.45,fence,x,.86,-205);if(Math.abs(x+28)>17)box(.45,1.7,.45,fence,x,.86,205)}
    for(let z=-187;z<=187;z+=18){box(.45,1.7,.45,fence,-275,.86,z);box(.45,1.7,.45,fence,275,.86,z)}
    // Replace the obstructive kiosk with an obvious, readable airport gateway.
    box(1,9,1,trim,-49,4.5,203);box(1,9,1,trim,-7,4.5,203);
    box(42,.8,1,roof,-28,9.1,203);
    const signCanvas=document.createElement("canvas");signCanvas.width=512;signCanvas.height=96;
    const signCtx=signCanvas.getContext("2d");signCtx.fillStyle="#17394b";signCtx.fillRect(0,0,512,96);
    signCtx.fillStyle="#f5f2df";signCtx.font="bold 40px Arial, sans-serif";signCtx.textAlign="center";signCtx.textBaseline="middle";signCtx.fillText("AIRPORT  -  TERMINAL",256,49);
    const entrySign=new THREE.Mesh(new THREE.PlaneGeometry(40,7.5),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(signCanvas)}));
    entrySign.position.set(-28,9.1,203.6);g.add(entrySign);
  }else if(kind==="station"){
    box(28,5,18,base,0,2.5,0);box(30,.8,20,roof,0,5.2,0);box(10,4,7,trim,0,7,0);box(11,.4,8,roof,0,9.2,0);
    for(let x=-10;x<=10;x+=5)box(1.3,2.8,.3,glass,x,1.8,9.2);
  }else if(kind==="cafe"||kind==="pub"){
    box(13,6,12,base,0,3,0);box(14,.55,13,roof,0,6.1,0);box(14,1.2,.4,trim,0,5.2,6.1);
    for(let x=-4;x<=4;x+=4)box(2.3,2.6,.28,glass,x,2.1,6.2);
    box(4,.32,1,trim,0,.35,8);box(.3,1.4,.3,base,0,1.2,8);
  }else if(kind==="hospital"||kind==="civic"||kind==="hotel"||kind==="school"||kind==="mall"||kind==="cinema"||kind==="market"||kind==="police"||kind==="fire"||kind==="arena"){
    const h=kind==="hotel"?25:kind==="civic"?17:kind==="school"?10:kind==="mall"||kind==="arena"?10:kind==="fire"||kind==="police"?9:14;
    if(kind==="arena"){const shell=new THREE.Mesh(new THREE.CylinderGeometry(11,12,10,12),base);shell.position.y=5;g.add(shell);const cap=new THREE.Mesh(new THREE.CylinderGeometry(11,11,1,12),roof);cap.position.y=10.5;g.add(cap)}
    else if(kind==="mall"||kind==="cinema"||kind==="market"){box(25,h,18,base,0,h/2,0);box(26,.8,19,roof,0,h+.4,0);for(let x=-8;x<=8;x+=4)box(2.8,2.8,.3,glass,x,2,9.2)}
    else {tower(kind==="hotel"?15:20,h,kind==="hotel"?15:16);if(kind==="hospital"){box(5,5.2,.5,trim,0,h*.65,8.4);box(.65,3,.6,bMat(0xe85d63),0,h*.65,8.75);box(2.8,.65,.6,bMat(0xe85d63),0,h*.65,8.75)}if(kind==="fire")box(8,2,8,trim,0,1.2,11);if(kind==="police")box(5,2.2,.4,glass,0,2,8.3)}
  }else if(kind==="park"){
    box(25,.3,25,bMat(0x558b46),0,.12,0);
    for(const [x,z] of [[-8,-8],[7,-8],[-8,7],[7,7],[0,0]]){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.45,.7,3,7),bMat(0x765437));trunk.position.set(x,1.8,z);g.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(3,6,8),bMat(0x35804a));crown.position.set(x,6,z);g.add(crown)}
    box(4,.45,2,trim,2,.6,-3);
  }else{
    box(28,1,13,bMat(0x405866),0,.5,0);for(let x=-10;x<=10;x+=8){const hull=new THREE.Mesh(new THREE.ConeGeometry(2,8,4),bMat(0xd0e5e8));hull.rotation.z=Math.PI;hull.position.set(x,2,-5);g.add(hull)}
  }
  return g;
}
const lotCenter=v=>(Math.round(v/CELL-.5)+.5)*CELL;
const placeGroundGeo=new THREE.PlaneGeometry(30,30),airportGroundGeo=new THREE.PlaneGeometry(AIRPORT_W,AIRPORT_D),placeGroundMat=lam(0x737c83),airportGroundMat=lam(0x617a52);
function createPlace(p){
  // Streets run along multiples of CELL, so landmarks belong in the middle of a block.
  p.x=lotCenter(p.x);p.z=lotCenter(p.z);
  if(p.kind!=="park"){
    const pad=new THREE.Mesh(p.kind==="airport"?airportGroundGeo:placeGroundGeo,p.kind==="airport"?airportGroundMat:placeGroundMat);pad.rotation.x=-Math.PI/2;pad.position.set(p.x,.005,p.z);sc.add(pad);
  }
  const group=buildingShape(p.kind,parseInt(p.color.slice(1),16));group.position.set(p.x,0,p.z);sc.add(group);p.mesh=group;
}
PLACES.forEach(createPlace);
function placeBld(b){
  let cx,cz,tries=0;const w=13+rnd()*13,h=9+rnd()*29,d=13+rnd()*13,clearance=Math.max(w,d)/2+7;
  do{
    const radius=6+Math.floor(tries/60),k=Math.round(P.x/CELL)+Math.floor(rnd()*(radius*2+1)-radius),q=Math.round(P.z/CELL)+Math.floor(rnd()*(radius*2+1)-radius);
    cx=(k+.5)*CELL;cz=(q+.5)*CELL;tries++;
  }while(insideAirport(cx,cz,clearance)||PLACES.some(p=>p.kind!=="airport"&&Math.abs(p.x-cx)<33&&Math.abs(p.z-cz)<33)||blds.some(o=>o!==b&&Math.abs(o.cx-cx)<29&&Math.abs(o.cz-cz)<29));
  b.cx=cx;b.cz=cz;
  b.w=w;b.d=d;
  if(b.group)sc.remove(b.group);b.group=new THREE.Group();
  const facade=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({map:winTex,color:BC[Math.floor(rnd()*BC.length)]}));facade.position.y=h/2;b.group.add(facade);
  const podium=new THREE.Mesh(new THREE.BoxGeometry(w+1,.8,d+1),bMat(0x747b7f));podium.position.y=.4;b.group.add(podium);
  const levels=h>18?Math.ceil(h/8):0;
  for(let j=0;j<levels;j++){const setback=new THREE.Mesh(new THREE.BoxGeometry(w*(1-j*.12),.8,d*(1-j*.12)),bMat(j%2?0x666a6d:0x77766f));setback.position.y=h*.4+j*5;b.group.add(setback)}
  const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.8,.45,d*.8),roofMat);roof.position.y=h+.2;b.group.add(roof);
  b.group.position.set(cx,0,cz);sc.add(b.group);
}
for(let i=0;i<BN;i++)blds.push({cx:1e9,cz:1e9,group:null});

/* ---------- traffic: drives straight along whichever grid line it spawned on ---------- */
const TN=10,T=[],TC=[0x8d99ae,0xef476f,0x06d6a0,0xf8f9fa,0x9b5de5];
for(let i=0;i<TN;i++){const m=mk(TC[i%TC.length],{traffic:true});sc.add(m);T.push({m,x:0,z:0,ang:0,v:0,nm:0})}
function placeT(t){
  let tries=0;
  do{
    if(rnd()<.5){const k=Math.round(P.x/CELL)+Math.floor(rnd()*7-3),dir=rnd()<.5?1:-1;
      t.x=k*CELL;t.ang=dir>0?0:Math.PI;t.z=P.z-dir*(150+rnd()*130);
    }else{const q=Math.round(P.z/CELL)+Math.floor(rnd()*7-3),dir=rnd()<.5?1:-1;
      t.z=q*CELL;t.ang=dir>0?Math.PI/2:-Math.PI/2;t.x=P.x-dir*(150+rnd()*130);
    }
  }while((trafficInParking(t.x,t.z)||airportTerminalAt(t.x,t.z,2.5))&&++tries<24);
  t.v=9+rnd()*8+level*.6;t.nm=0;
}

/* ---------- player ---------- */
const P={x:0,z:0,y:0,garageFloor:0,ramp:null,ang:0,v:0,car:null},K={l:0,r:0,g:0,b:0};
const reviewView=new URLSearchParams(location.search).get("view");let mode="career",state="menu",sel=0,level=1,distTotal=0,lvStart=0,run=0,cd=0,toastT=0,last=0,orbit=({front45:-Math.PI*.75,front:Math.PI,side:-Math.PI/2,rear:0,rear45:-Math.PI/4}[reviewView]??-Math.PI*.72),orbitPitch=.22,orbitAuto=!reviewView,curTurn=0,AC,osc,gn;
let garageReturn=false,dragX=null,dragY=null,returnMode="career",returnCar=0,garageMessage="";
S.soundEnabled=S.soundEnabled!==false;S.volume=Number.isFinite(S.volume)?clamp(S.volume,0,1):.35;
let destination=PLACES[0],route=[];
function localParking(x,z){const a=PLACES.find(p=>p.kind==="airport");return{x:x-a.x-PARKING.x,z:z-a.z-PARKING.z}}
function inParking(x,z){const q=localParking(x,z);return Math.abs(q.x)<PARKING.halfW-2.5&&Math.abs(q.z)<PARKING.halfD-2.5}
function trafficInParking(x,z){const q=localParking(x,z);return Math.abs(q.x)<PARKING.halfW+3&&Math.abs(q.z)<PARKING.halfD+3}
function airportTerminalAt(x,z,pad=0){
  const a=PLACES.find(p=>p.kind==="airport"),lx=x-a.x,lz=z-a.z;
  const blocks=[[-101,60,101,104],[-147,73,-107,99],[-103,4,-85,58],[-9,4,9,58],[85,4,103,58],[168,60,186,78],[177,-43,251,9]];
  return blocks.some(([x1,z1,x2,z2])=>lx>x1-pad&&lx<x2+pad&&lz>z1-pad&&lz<z2+pad);
}
function parkingColumnAt(x,z){
  const q=localParking(x,z);
  for(let cx=-46;cx<=46;cx+=23)for(const cz of [-36,36])if((cz<0||Math.abs(cx)>14)&&Math.abs(q.x-cx)<2.6&&Math.abs(q.z-cz)<2.6)return true;
  return false;
}
function landmarkWallAt(x,z){
  for(const p of PLACES){
    if(p.kind==="airport"||p.kind==="park")continue;
    let w=20,d=16;
    if(p.kind==="station"){w=30;d=20}
    else if(p.kind==="cafe"||p.kind==="pub"){w=14;d=13}
    else if(p.kind==="hotel"){w=16;d=16}
    else if(p.kind==="mall"||p.kind==="cinema"||p.kind==="market"){w=26;d=19}
    else if(p.kind==="arena"){w=24;d=24}
    else if(p.kind==="harbor"){w=28;d=13}
    else if(p.kind==="fire"){w=22;d=24}
    if(Math.abs(x-p.x)<w/2+2.8&&Math.abs(z-p.z)<d/2+2.8)return true;
  }
  return false;
}
function solidBuildingAt(x,z){
  if(parkingColumnAt(x,z)||airportTerminalAt(x,z,2.8)||landmarkWallAt(x,z))return true;
  return blds.some(b=>b.group&&Math.abs(x-b.cx)<b.w/2+2.8&&Math.abs(z-b.cz)<b.d/2+2.8);
}
function updateParkingDrive(oldX,oldZ,nextX,nextZ,dx){
  const airport=PLACES.find(p=>p.kind==="airport"),old=localParking(oldX,oldZ),q=localParking(nextX,nextZ),insideOld=inParking(oldX,oldZ),insideNew=inParking(nextX,nextZ),gate=Math.abs(q.x)<PARKING.rampWidth+2;
  const run=PARKING.rampRun/2,near=(z,center)=>Math.abs(z-center)<PARKING.rampWidth/2+1;
  const nearLane=center=>near(q.z,center)||near(old.z,center);
  const enter= !insideOld&&insideNew&&old.z>=PARKING.halfD-2.5&&gate;
  const exit=insideOld&&!insideNew&&P.garageFloor===0&&!P.ramp&&q.z>=PARKING.halfD-2.5&&gate;
  if((!insideOld&&insideNew&&!enter)||(insideOld&&!insideNew&&!exit))return{ok:false,x:oldX,z:oldZ};
  if(!insideNew){P.garageFloor=0;P.ramp=null;P.y=0;return{ok:true,x:nextX,z:nextZ};}
  if(enter){P.garageFloor=0;P.ramp=null;}
  let ramp=P.ramp;
  if(!ramp){
    // Check the previous position too: a fast frame can cross the ramp lip
    // and leave the new position just outside its narrow activation window.
    if(P.garageFloor===0&&nearLane(24)&&(old.x<=-run+5||q.x<=-run+5)&&dx>0)ramp={id:"a",from:0,to:1};
    else if(P.garageFloor===1&&nearLane(24)&&(old.x>=run-5||q.x>=run-5)&&dx<0)ramp={id:"a",from:1,to:0};
    else if(P.garageFloor===1&&nearLane(9)&&(old.x>=run-5||q.x>=run-5)&&dx<0)ramp={id:"b",from:1,to:2};
    else if(P.garageFloor===2&&nearLane(9)&&(old.x<=-run+5||q.x<=-run+5)&&dx>0)ramp={id:"b",from:2,to:1};
  }
  if(ramp){
    const lane=ramp.id==="a"?24:9,clampedZ=Math.max(-PARKING.rampWidth/2+2,Math.min(PARKING.rampWidth/2-2,q.z-lane));
    q.z=lane+clampedZ;
    const t=clamp((q.x+run)/PARKING.rampRun,0,1);
    P.y=PARKING.baseY+(ramp.id==="a"?t:2-t)*PARKING.floorHeight;
    const reached=ramp.id==="a"?(ramp.to===1?q.x>=run-1:q.x<=-run+1):(ramp.to===2?q.x<=-run+1:q.x>=run-1);
    const returned=ramp.id==="a"?(ramp.from===0?q.x<=-run+1:q.x>=run-1):(ramp.from===1?q.x>=run-1:q.x<=-run+1);
    if(reached){P.garageFloor=ramp.to;P.ramp=null;P.y=PARKING.baseY+P.garageFloor*PARKING.floorHeight;}
    else if(returned){P.garageFloor=ramp.from;P.ramp=null;P.y=PARKING.baseY+P.garageFloor*PARKING.floorHeight;}
    else P.ramp=ramp;
  }else{
    // Keep cars on the deck around the two ramp openings.
    const a=near(q.z,24),b=near(q.z,9),atEnd=Math.abs(q.x)>=run-6;
    if((P.garageFloor===1&&a&&q.x<run-6)||(P.garageFloor===1&&b&&!atEnd)||(P.garageFloor===2&&b&&q.x>-run+6))return{ok:false,x:oldX,z:oldZ};
    P.y=PARKING.baseY+P.garageFloor*PARKING.floorHeight;
  }
  return{ok:true,x:nextX,z:airport.z+PARKING.z+q.z};
}
function appearance(i=sel){const base={color:CARS[i].c,decal:"none",tire:i===0?"track":"street",mirror:i===0?"carbon":"classic",headlight:"standard"};return{...base,...(S.custom[i]||{})}}
function setCar(i){sel=i;if(P.car)sc.remove(P.car);P.car=mk(CARS[i].c,{...appearance(i),model:CARS[i].model});sc.add(P.car)}
function toast(s){const e=$("toast");e.textContent=s;e.style.opacity=1;toastT=1.1}
function snd(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();osc=AC.createOscillator();gn=AC.createGain();osc.type="sawtooth";gn.gain.value=0;osc.connect(gn);gn.connect(AC.destination);osc.start()}catch(e){AC=null}}

/* ---------- garage ---------- */
function drawPlaceDirectory(){ /* map is kept visual and uncluttered */ }
function customize(key,value){S.custom[sel]={...appearance(),[key]:value};save();setCar(sel);drawGarage()}
function browseCar(step){garageMessage="";setCar((sel+step+CARS.length)%CARS.length);drawGarage()}
function buySelectedCar(){
  const c=CARS[sel];
  if(S.owned.includes(sel)){garageMessage=c.n+" is already in your garage."}
  else if(S.cash<c.p){const short=c.p-Math.floor(S.cash);garageMessage="Not enough money. Earn "+money(short)+" more to buy the "+c.n+".";toast("Not enough money")}
  else{S.cash-=c.p;S.owned=[...new Set([...S.owned,sel])];garageMessage=c.n+" bought and added to your garage!";save()}
  drawGarage();
}
function drawGarage(){
  const c=CARS[sel],a=appearance();
  $("best").textContent=Math.floor(S.best);$("garageCash").textContent=money(S.cash);
  const own=S.owned.includes(sel);
  const speed=Math.round(c.v*3.6),accel=c.accel??Math.min(10,c.a/2.5),handling=c.handling??Math.min(10,c.h*6.25),price=c.model==="vortex"?c.p.toLocaleString("en-US")+" coins":money(c.p);
  $("carName").textContent=c.n;$("panelCarName").textContent=c.n;$("carStats").textContent=c.type+" · Top speed "+speed+" km/h";$("panelCarStats").textContent=speed+" km/h max · "+Number(accel).toFixed(1)+"/10 acceleration · "+Number(handling).toFixed(1)+"/10 handling · Price "+price+(own?" · OWNED":"");
  const carStep=String(sel+1).padStart(2,"0")+" / "+String(CARS.length).padStart(2,"0");
  $("catalogName").textContent=c.n;$("catalogType").textContent=c.type;$("catalogStep").textContent=carStep;$("panelStep").textContent=carStep;
  $("buyCar").textContent=own?"OWNED · READY TO DRIVE":"BUY CAR · "+price;$("buyCar").disabled=own;
  $("note").textContent=garageMessage||(own?"In your garage · Cash available: "+money(S.cash):"Cash: "+money(S.cash)+" · Price: "+price);
  $("mCareer").className="tab"+(mode==="career"?" sel":"");$("mFree").className="tab"+(mode==="free"?" sel":"");
  $("modeLabel").textContent=mode==="career"?"CAREER MODE · LEVEL "+level:"FREE DRIVE";
  $("start").innerHTML=garageReturn?'Return to drive <span aria-hidden="true">→</span>':own?(mode==="career"?"Start career":"Start free drive")+' <span aria-hidden="true">→</span>':"Buy this car to drive";
  $("start").disabled=!own&&!garageReturn;
  $("start").title=$("start").disabled?"Buy this car before driving it":"";
  $("paintOptions").innerHTML=PAINTS.map(p=>`<button class="swatch${a.color===p.c?" selected":""}" title="${p.n}" aria-label="${p.n}" aria-pressed="${a.color===p.c}" style="background:#${p.c.toString(16).padStart(6,"0")}" data-color="${p.c}"></button>`).join("");
  $("decalOptions").innerHTML=DECALS.map(d=>`<button class="option-chip${a.decal===d.id?" selected":""}" data-decal="${d.id}" aria-pressed="${a.decal===d.id}">${d.n}</button>`).join("");
  $("tireOptions").innerHTML=TIRES.map(t=>`<button class="option-chip${a.tire===t.id?" selected":""}" data-tire="${t.id}" aria-pressed="${a.tire===t.id}">${t.n}</button>`).join("");
  $("mirrorOptions").innerHTML=MIRRORS.map(m=>`<button class="option-chip${(a.mirror||"classic")===m.id?" selected":""}" data-mirror="${m.id}" aria-pressed="${(a.mirror||"classic")===m.id}">${m.n}</button>`).join("");
  $("headlightOptions").innerHTML=HEADLIGHTS.map(h=>`<button class="option-chip${(a.headlight||"standard")===h.id?" selected":""}" data-headlight="${h.id}" aria-pressed="${(a.headlight||"standard")===h.id}">${h.n}</button>`).join("");
  $("paintOptions").querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>customize("color",Number(b.dataset.color)));
  $("decalOptions").querySelectorAll("[data-decal]").forEach(b=>b.onclick=()=>customize("decal",b.dataset.decal));
  $("tireOptions").querySelectorAll("[data-tire]").forEach(b=>b.onclick=()=>customize("tire",b.dataset.tire));
  $("mirrorOptions").querySelectorAll("[data-mirror]").forEach(b=>b.onclick=()=>customize("mirror",b.dataset.mirror));
  $("headlightOptions").querySelectorAll("[data-headlight]").forEach(b=>b.onclick=()=>customize("headlight",b.dataset.headlight));
}
$("prevCar").onclick=()=>browseCar(-1);$("nextCar").onclick=()=>browseCar(1);$("buyCar").onclick=buySelectedCar;
function showDriveUI(){$("hud").classList.remove("hide");$("menuButton").classList.remove("hide");$("padL").classList.remove("hide");$("padR").classList.remove("hide")}
function clearDriveInput(){Object.keys(K).forEach(k=>K[k]=0);document.querySelectorAll(".pad button").forEach(b=>b.classList.remove("on"))}
function togglePause(){
  if(state==="play"){state="paused";document.body.classList.add("ui-open");clearDriveInput();$("pauseOv").classList.remove("hide");$("padL").classList.add("hide");$("padR").classList.add("hide")}
  else if(state==="paused"){state="play";document.body.classList.remove("ui-open");$("pauseOv").classList.add("hide");$("padL").classList.remove("hide");$("padR").classList.remove("hide")}
}
$("mCareer").onclick=()=>{mode="career";drawGarage()};$("mFree").onclick=()=>{mode="free";drawGarage()};
$("tabGarage").onclick=()=>drawGarage();
function begin(){
  if(!S.owned.includes(sel)){garageMessage="Buy the "+CARS[sel].n+" before driving it.";drawGarage();return}
  snd();if(AC&&AC.state==="suspended")AC.resume();
  level=1;run=0;distTotal=0;lvStart=0;P.x=0;P.z=0;P.y=0;P.garageFloor=0;P.ramp=null;P.ang=0;P.v=0;destination=PLACES[0];route=[];
  blds.forEach(b=>placeBld(b));T.forEach(t=>placeT(t));
  garageReturn=false;document.body.classList.remove("ui-open");state="play";$("garage").classList.add("hide");$("over").classList.add("hide");$("pauseOv").classList.add("hide");$("miniButton").classList.remove("hide");showDriveUI();
}
function end(){
  state="over";S.cash+=run;S.best=Math.max(S.best,distTotal);save();
  $("miniButton").classList.add("hide");$("mapOv").classList.add("hide");$("menuButton").classList.add("hide");$("padL").classList.add("hide");$("padR").classList.add("hide");$("hud").classList.add("hide");
  $("ot").textContent="Crashed";
  $("os").textContent=Math.floor(distTotal)+" m driven Â· level "+level+" Â· +$"+Math.floor(run)+" earned";
  $("over").classList.remove("hide");run=0;
}
$("start").onclick=()=>{
  if(garageReturn){if(!S.owned.includes(sel)){sel=returnCar;setCar(sel)}garageReturn=false;mode=returnMode;document.body.classList.remove("ui-open");state="play";$("garage").classList.add("hide");$("miniButton").classList.remove("hide");showDriveUI();drawGarage()}
  else begin();
};
$("again").onclick=begin;
$("toGarage").onclick=()=>{$("over").classList.add("hide");$("garage").classList.remove("hide");garageReturn=false;document.body.classList.add("ui-open");state="menu";drawGarage()};
$("menuButton").onclick=togglePause;$("resume").onclick=togglePause;
$("pauseGarage").onclick=()=>{if(state!=="paused")return;garageReturn=true;returnCar=sel;returnMode=mode;state="menu";$("pauseOv").classList.add("hide");$("garage").classList.remove("hide");$("miniButton").classList.add("hide");$("hud").classList.add("hide");$("menuButton").classList.add("hide");drawGarage()};
$("soundToggle").onclick=()=>{S.soundEnabled=!S.soundEnabled;$("soundToggle").textContent=S.soundEnabled?"On":"Off";$("soundToggle").setAttribute("aria-pressed",String(S.soundEnabled));if(gn)gn.gain.value=S.soundEnabled?.025*S.volume:0;save()};
$("volume").value=Math.round(S.volume*100);$("volumeValue").textContent=Math.round(S.volume*100)+"%";$("soundToggle").textContent=S.soundEnabled?"On":"Off";$("soundToggle").setAttribute("aria-pressed",String(S.soundEnabled));
$("volume").oninput=()=>{S.volume=Number($("volume").value)/100;$("volumeValue").textContent=$("volume").value+"%";if(gn)gn.gain.value=S.soundEnabled?.025*S.volume:0;save()};
const garageAngles={"front":Math.PI,"front-left":-Math.PI*.75,"left":-Math.PI/2,"rear-left":-Math.PI/4,"rear":0,"rear-right":Math.PI/4,"right":Math.PI/2,"front-right":Math.PI*.75};
function setGarageView(name){orbitAuto=false;if(name==="top")orbitPitch=1.48;else{orbit=garageAngles[name]??orbit;orbitPitch=.22}document.querySelectorAll("[data-view]").forEach(b=>{const selected=b.dataset.view===name;b.classList.toggle("selected",selected);b.setAttribute("aria-pressed",String(selected))})}
document.querySelectorAll("[data-view]").forEach(b=>{b.addEventListener("pointerdown",e=>e.stopPropagation());b.addEventListener("click",e=>{e.stopPropagation();setGarageView(b.dataset.view)})});
$("vehicleStage").addEventListener("pointerdown",e=>{dragX=e.clientX;dragY=e.clientY;orbitAuto=false;$("vehicleStage").setPointerCapture(e.pointerId);e.preventDefault()});
$("vehicleStage").addEventListener("pointermove",e=>{if(dragX===null)return;orbit-=(e.clientX-dragX)*.012;orbitPitch=clamp(orbitPitch-(e.clientY-dragY)*.009,.06,1.5);dragX=e.clientX;dragY=e.clientY;document.querySelectorAll("[data-view]").forEach(b=>{b.classList.remove("selected");b.setAttribute("aria-pressed","false")})});
["pointerup","pointercancel","lostpointercapture"].forEach(ev=>$("vehicleStage").addEventListener(ev,()=>{dragX=null;dragY=null}));
function setMapOpen(open){
  $("mapOv").classList.toggle("hide",!open);
  $("miniButton").classList.toggle("hide",open||state!=="play");
  if(open)drawMap($("bigmap"),1900);
}
function toggleMap(){if(state==="play")setMapOpen($("mapOv").classList.contains("hide"))}
$("miniButton").onclick=toggleMap;
$("closeMap").onclick=()=>setMapOpen(false);
$("bigmap").onclick=()=>setMapOpen(false);

/* ---------- input ---------- */
document.querySelectorAll(".pad button").forEach(b=>{
  const k=b.dataset.k,on=e=>{e.preventDefault();K[k]=1;b.classList.add("on")},off=e=>{e.preventDefault();K[k]=0;b.classList.remove("on")};
  b.addEventListener("pointerdown",on);["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,off));
});
const km={ArrowLeft:"l",a:"l",A:"l",ArrowRight:"r",d:"r",D:"r",ArrowUp:"g",w:"g",W:"g",ArrowDown:"b",s:"b",S:"b"};
addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();togglePause();return}if(km[e.key]&&state==="play")K[km[e.key]]=1});addEventListener("keyup",e=>{if(km[e.key])K[km[e.key]]=0});

/* ---------- map (used for both the small always-on minimap and the full overlay) ---------- */
function drawMap(canvas,range){
  const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height,scale=w/range,half=range/2;
  ctx.clearRect(0,0,w,h);
  {
    ctx.fillStyle="#b8c8a2";ctx.fillRect(0,0,w,h);
    // Parks and city blocks give the map a physical street-map appearance.
    PLACES.filter(p=>p.kind==="park").forEach(p=>{const x=w/2+(p.x-P.x)*scale,y=h/2+(p.z-P.z)*scale;ctx.fillStyle="#76a76b";ctx.fillRect(x-13*scale,y-13*scale,26*scale,26*scale)});
    const firstX=Math.ceil((P.x-half)/CELL)*CELL,firstZ=Math.ceil((P.z-half)/CELL)*CELL;
    // Sidewalk blocks, asphalt, road edges and dashed lane markings.
    ctx.strokeStyle="#d0cdbf";ctx.lineWidth=Math.max(3,(ROAD_W+SIDEWALK_W)*scale);
    for(let gx=firstX;gx<=P.x+half;gx+=CELL){const sx=w/2+(gx-P.x)*scale;ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,h);ctx.stroke()}
    for(let gz=firstZ;gz<=P.z+half;gz+=CELL){const sz=h/2+(gz-P.z)*scale;ctx.beginPath();ctx.moveTo(0,sz);ctx.lineTo(w,sz);ctx.stroke()}
    ctx.strokeStyle="#41474a";ctx.lineWidth=Math.max(2,ROAD_W*scale);
    for(let gx=firstX;gx<=P.x+half;gx+=CELL){const sx=w/2+(gx-P.x)*scale;ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,h);ctx.stroke()}
    for(let gz=firstZ;gz<=P.z+half;gz+=CELL){const sz=h/2+(gz-P.z)*scale;ctx.beginPath();ctx.moveTo(0,sz);ctx.lineTo(w,sz);ctx.stroke()}
    ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle="#e5d88a";ctx.lineWidth=Math.max(1,1.4*scale);
    for(let gx=firstX;gx<=P.x+half;gx+=CELL){const sx=w/2+(gx-P.x)*scale;ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,h);ctx.stroke()}
    for(let gz=firstZ;gz<=P.z+half;gz+=CELL){const sz=h/2+(gz-P.z)*scale;ctx.beginPath();ctx.moveTo(0,sz);ctx.lineTo(w,sz);ctx.stroke()}ctx.restore();
    PLACES.forEach(p=>{const x=w/2+(p.x-P.x)*scale,y=h/2+(p.z-P.z)*scale,bound=p.kind==="airport"?300:40;if(x<-bound||x>w+bound||y<-bound||y>h+bound)return;
      if(p.kind==="airport"){
        ctx.fillStyle="#617a52";ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.fillRect(x-280*scale,y-210*scale,560*scale,420*scale);ctx.strokeRect(x-280*scale,y-210*scale,560*scale,420*scale);
        ctx.fillStyle="#777d80";ctx.fillRect(x-224*scale,y-155*scale,448*scale,54*scale);
        ctx.fillStyle="#30363a";ctx.fillRect(x-216*scale,y-148*scale,432*scale,40*scale);
        ctx.save();ctx.setLineDash([8,6]);ctx.strokeStyle="#eee9d9";ctx.lineWidth=Math.max(1,2*scale);ctx.beginPath();ctx.moveTo(x-194*scale,y-128*scale);ctx.lineTo(x+194*scale,y-128*scale);ctx.stroke();ctx.restore();
        ctx.fillStyle="#30363a";ctx.fillRect(x-195*scale,y-91*scale,390*scale,18*scale);
        ctx.fillStyle="#777d80";ctx.fillRect(x-160*scale,y-71*scale,320*scale,126*scale);
        ctx.fillStyle="#44515a";ctx.fillRect(x-101*scale,y+60*scale,202*scale,44*scale);
        ctx.fillStyle="#69b9c9";ctx.fillRect(x-97*scale,y+60*scale,194*scale,5*scale);
        for(const gateX of [-94,0,94])ctx.fillRect(x+(gateX-9)*scale,y+4*scale,18*scale,58*scale);
        ctx.fillStyle="#30363a";ctx.fillRect(x-40*scale,y+114*scale,24*scale,96*scale);
        ctx.fillRect(x-125*scale,y+100*scale,250*scale,26*scale);
        ctx.fillStyle="#e3bd63";ctx.fillRect(x+(PARKING.x-9)*scale,y+(PARKING.z-7)*scale,18*scale,14*scale);
        ctx.fillStyle="#f2ce56";ctx.beginPath();ctx.arc(x-28*scale,y+202*scale,Math.max(2,4*scale),0,Math.PI*2);ctx.fill();
        if(w>=400){ctx.font="bold 14px system-ui, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineWidth=3;ctx.strokeStyle="#fff";ctx.strokeText("AIRPORT",x,y-184*scale);ctx.fillStyle="#183647";ctx.fillText("AIRPORT",x,y-184*scale);ctx.strokeStyle="#1c2c20";ctx.strokeText("ENTRY",x-28*scale,y+196*scale);ctx.fillStyle="#f5e8a6";ctx.fillText("ENTRY",x-28*scale,y+196*scale);ctx.strokeStyle="#fff";ctx.strokeText("PARKING 3F",x+PARKING.x*scale,y+(PARKING.z+17)*scale);ctx.fillStyle="#674e1b";ctx.fillText("PARKING 3F",x+PARKING.x*scale,y+(PARKING.z+17)*scale)}
      }else{
        const pw=p.kind==="park"?23:p.kind==="harbor"?28:14,ph=p.kind==="park"?23:p.kind==="harbor"?13:14;
        ctx.fillStyle=p.color;ctx.strokeStyle="rgba(10,15,26,.85)";ctx.lineWidth=2;ctx.fillRect(x-pw*scale/2,y-ph*scale/2,pw*scale,ph*scale);ctx.strokeRect(x-pw*scale/2,y-ph*scale/2,pw*scale,ph*scale);
      }
    });
    // The player arrow shows heading without a route line.
    ctx.fillStyle="#ff8a3d";
  T.forEach(t=>{const sx=w/2+(t.x-P.x)*scale,sz=h/2+(t.z-P.z)*scale;if(sx>-6&&sx<w+6&&sz>-6&&sz<h+6){ctx.beginPath();ctx.arc(sx,sz,3,0,7);ctx.fill()}});
  ctx.save();ctx.translate(w/2,h/2);ctx.rotate(P.ang);ctx.fillStyle="#3fe0c5";
  ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6,7);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
  }
}

/* ---------- loop ---------- */
function step(dt){
  const C=CARS[sel],onR=onRoad(P.x,P.z);
  if(K.b){
    if(P.v>.15)P.v=Math.max(0,P.v-34*dt);
    else P.v=Math.max(-8,P.v-8*dt);
  }else if(K.g)P.v+=C.a*(onR?1:.4)*(1-Math.max(0,P.v)/C.v*.85)*dt;
  else if(Math.abs(P.v)>.001){
    const drag=(Math.abs(P.v)*(onR?.02:.1)+.5)*dt;
    P.v=Math.sign(P.v)*Math.max(0,Math.abs(P.v)-drag);
  }
  P.v=clamp(P.v,-8,C.v);
  const reverse=P.v<-.15?-1:1;
  const targetTurn=(K.r-K.l)*1.5*C.h*clamp(.12+Math.abs(P.v)/9,0,1)*reverse;
  curTurn+=(targetTurn-curTurn)*Math.min(1,6*dt);
  P.ang+=curTurn*dt;
  const dx=Math.sin(P.ang)*P.v*dt,dz=-Math.cos(P.ang)*P.v*dt,oldX=P.x,oldZ=P.z;
  // Resolve each axis separately so the car slides along a wall instead of sticking on corners.
  let nextX=oldX+dx,nextZ=oldZ+dz,hitWall=false;
  if(solidBuildingAt(nextX,oldZ)){nextX=oldX;hitWall=true}
  if(solidBuildingAt(nextX,nextZ)){nextZ=oldZ;hitWall=true}
  let move={ok:true,x:nextX,z:nextZ};
  if(move.ok)move=updateParkingDrive(oldX,oldZ,move.x,move.z,move.x-oldX);
  if(move.ok){P.x=move.x;P.z=move.z}else P.v*=.35;
  const moved=Math.hypot(P.x-oldX,P.z-oldZ);
  if(moved<.001&&(hitWall||!move.ok))P.v=0;
  distTotal+=moved;run+=moved*.05;cd-=dt;
  if(mode==="career"){
    const need=900+level*500,prog=(distTotal-lvStart)/need;$("fill").style.width=clamp(prog*100,0,100)+"%";
    if(prog>=1){run+=level*300;toast("Level "+level+" complete  +$"+level*300);level++;lvStart=distTotal}
  }else $("fill").style.width="0";
  T.forEach(t=>{
    const tx=t.x+Math.sin(t.ang)*t.v*dt,tz=t.z-Math.cos(t.ang)*t.v*dt;
    if(trafficInParking(tx,tz)||airportTerminalAt(tx,tz,2.5))placeT(t);else{t.x=tx;t.z=tz}
    const dist=Math.hypot(t.x-P.x,t.z-P.z);
    if(dist>340)placeT(t);
    else if(dist<3.4&&cd<=0){
      if(mode==="career"){end();return}
      P.v*=.4;cd=.8;placeT(t);toast("Crash!");
    }else if(dist<5.8&&!t.nm&&P.v>t.v+2){t.nm=1;run+=20;toast("Near miss  +$20")}
  });
  blds.forEach(b=>{if(Math.hypot(b.cx-P.x,b.cz-P.z)>370)placeBld(b)});
  $("spd").firstChild.textContent=Math.round(P.v*3.6);
  $("gear").textContent=P.v<-.5?"Reverse":P.ramp?"Parking ramp "+(P.ramp.to>P.ramp.from?"↑":"↓"):inParking(P.x,P.z)?"Parking level "+(P.garageFloor+1):"Gear "+Math.min(6,1+Math.floor(P.v/C.v*6));
  $("cash").textContent="$"+Math.floor(S.cash+run);$("lvl").textContent=mode==="career"?"Level "+level:"Free drive";
  P.car.rotation.y=-P.ang;P.car.rotation.z=-curTurn*.06;
  (P.car.userData.wheels||[]).forEach(w=>{if(w.front)w.steering.rotation.y=-curTurn*.3;w.spin.rotation.x+=P.v/w.radius*dt});
  cam.position.set(P.x-Math.sin(P.ang)*9,P.y+4+P.v*.01,P.z+Math.cos(P.ang)*9);
  cam.lookAt(P.x,P.y+1.2,P.z);cam.fov=62+P.v*.25;cam.updateProjectionMatrix();
  if(gn){gn.gain.value=S.soundEnabled?.025*S.volume:0;osc.frequency.value=55+P.v*3.4}
}
function idle(dt){
  if(orbitAuto&&!dragX)orbit+=dt*.18;if(!garageReturn)P.v=0;if(gn)gn.gain.value=0;P.car.rotation.set(0,0,0);
  (P.car.userData.wheels||[]).forEach(w=>{if(w.front)w.steering.rotation.y=0});
  const horizontal=Math.cos(orbitPitch)*7;
  cam.position.set(P.x+Math.sin(orbit)*horizontal,P.y+.8+Math.sin(orbitPitch)*7,P.z+Math.cos(orbit)*horizontal);cam.lookAt(P.x,P.y+.8,P.z);
  cam.fov=55;cam.updateProjectionMatrix();
}
function world(){
  P.car.position.set(P.x,P.y,P.z);
  showroomShadow.position.set(P.x,P.y+.006,P.z);showroomShadow.rotation.set(-Math.PI/2,-P.ang,0);
  T.forEach(t=>{t.m.visible=state==="play"||state==="paused";t.m.position.set(t.x,0,t.z);t.m.rotation.y=t.ang});
  blds.forEach(b=>{if(b.group)b.group.position.set(b.cx,0,b.cz)});
}
function frame(t){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(t-last)/1000||0);last=t;
  if(toastT>0){toastT-=dt;if(toastT<=0)$("toast").style.opacity=0}
  if(state==="play")step(dt);else if(state==="menu")idle(dt);
  world();R.render(sc,cam);
  drawMap($("mini"),240);
  if(!$("mapOv").classList.contains("hide"))drawMap($("bigmap"),1900);
}
setCar(reviewView?2:0);blds.forEach(b=>placeBld(b));drawGarage();requestAnimationFrame(frame);
})();

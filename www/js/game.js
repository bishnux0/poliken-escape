const $=id=>document.getElementById(id);
const LS={get(k,d){try{const v=localStorage.getItem('je_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('je_'+k,JSON.stringify(v))}catch(e){}}};
let best=LS.get('best',0),bank=LS.get('coins',0),sfx=LS.get('sfx',true);
/* ---------- Audio (synthesized) ---------- */
let AC;
function tone(f,d,t,v,s){if(!sfx)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const n=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,n);if(s)o.frequency.exponentialRampToValueAtTime(s,n+d);g.gain.setValueAtTime(v||.08,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}catch(e){}}
const S={click:()=>tone(500,.06),coin:()=>{tone(880,.08,'triangle',.1);setTimeout(()=>tone(1320,.1,'triangle',.1),60)},jump:()=>tone(300,.2,'sine',.12,650),slide:()=>tone(220,.2,'sawtooth',.05,90),pow:()=>tone(500,.25,'triangle',.12,1100),shield:()=>tone(700,.3,'sine',.12,200),hit:()=>tone(120,.4,'sawtooth',.15,40),over:()=>tone(300,.8,'sawtooth',.1,60),step:()=>tone(90,.04,'sine',.04),lane:()=>tone(400,.05,'sine',.05)};
/* ---------- Scene ---------- */
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:false});}catch(e){$('nogl').style.display='flex';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
const scene=new THREE.Scene(),bg=new THREE.Color(0x7fc8a0);scene.background=bg;scene.fog=new THREE.Fog(0x7fc8a0,30,150);
const cam=new THREE.PerspectiveCamera(65,1,.1,260);let baseFov=65;
scene.add(new THREE.HemisphereLight(0xffffff,0x2d5a3a,.95));const sun=new THREE.DirectionalLight(0xfff0c0,.7);sun.position.set(5,10,5);scene.add(sun);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;baseFov=w/h<1?82:65;}
addEventListener('resize',resize);resize();
const G=new THREE.BoxGeometry(1,1,1),mat=c=>new THREE.MeshLambertMaterial({color:c});
const mStone=mat(0x8b8f94),mMoss=mat(0x4f8a3a),mWood=mat(0x7a4a22),mDark=mat(0x150d06),mLeaf=mat(0x2e8b3d),mLeaf2=mat(0x1f6f35),mRock=mat(0x6e6a63),mGold=new THREE.MeshLambertMaterial({color:0xffc928,emissive:0x8a5a00}),mFire=new THREE.MeshBasicMaterial({color:0xff9a2a});
function box(w,h,d,m,x,y,z,p){const b=new THREE.Mesh(G,m);b.scale.set(w,h,d);b.position.set(x,y,z);if(p)p.add(b);return b}
/* World dressing */
box(8,.4,320,mat(0x6b5a3a),0,-.2,-110,scene);box(120,.3,320,mat(0x2f7a3f),0,-.45,-110,scene);
const env={dash:[],trees:[],gates:[]},dm=mat(0x4a3a22);
for(let i=0;i<16;i++)for(const x of[-1,1])env.dash.push(box(.12,.03,2,dm,x,.01,-i*10,scene));
for(let i=0;i<32;i++){const g=new THREE.Group(),s=.8+Math.random()*.8;box(.7,3,.7,mWood,0,1.5,0,g);const c=new THREE.Mesh(new THREE.ConeGeometry(2,5,6),Math.random()<.5?mLeaf:mLeaf2);c.position.y=5;g.add(c);g.scale.setScalar(s);g.position.set((i%2?-1:1)*(5.5+Math.random()*10),0,-i*5);scene.add(g);env.trees.push(g)}
for(let i=0;i<4;i++){const g=new THREE.Group();for(const x of[-4,4]){box(1.2,6,1.2,mStone,x,3,0,g);box(.5,.5,.5,mFire,x*.78,3.4,.7,g)}box(10,1,1.4,mStone,0,6.4,0,g);box(10,.2,1.4,mMoss,0,7,0,g);g.position.z=-i*40-10;scene.add(g);env.gates.push(g)}
for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(30,45,5),mat(0x3d5a6a));m.position.set(-90+i*36,10,-200);scene.add(m)}
/* ---------- Player (low-poly adventurer) ---------- */
const P=new THREE.Group(),body=new THREE.Group();P.add(body);scene.add(P);
const mSkin=mat(0xf1b27a),mShirt=mat(0xd9482b),mPants=mat(0x3a4a8a),mHat=mat(0x8a5a2b);
box(.7,.8,.4,mShirt,0,1.15,0,body);const head=new THREE.Mesh(new THREE.SphereGeometry(.26,8,6),mSkin);head.position.y=1.8;body.add(head);
box(.8,.06,.8,mHat,0,1.98,0,body);box(.46,.22,.46,mHat,0,2.1,0,body);box(.7,.12,.42,mat(0x6b3d00),0,.78,0,body);
function limb(x,y,w,h,m){const g=new THREE.Group();g.position.set(x,y,0);box(w,h,.25,m,0,-h/2,0,g);body.add(g);return g}
const legL=limb(-.18,.75,.24,.75,mPants),legR=limb(.18,.75,.24,.75,mPants),armL=limb(-.48,1.5,.2,.7,mSkin),armR=limb(.48,1.5,.2,.7,mSkin);
/* ---------- Pools ---------- */
const B={
block(){const g=new THREE.Group();box(1.8,1,.8,mStone,0,.5,0,g);box(1.8,.12,.8,mMoss,0,1.02,0,g);g.userData={lo:0,hi:1,d:.8};return g},
log(){const g=new THREE.Group(),c=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,1.9,8),mWood);c.rotation.z=Math.PI/2;c.position.y=.45;g.add(c);g.userData={lo:0,hi:.9,d:.9};return g},
arch(){const g=new THREE.Group();box(.35,2.2,.6,mStone,-.85,1.1,0,g);box(.35,2.2,.6,mStone,.85,1.1,0,g);box(2.1,.6,.7,mStone,0,1.5+.0,0,g).position.y=1.55;box(2.1,.15,.7,mMoss,0,1.9,0,g);g.userData={lo:1.2,hi:3,d:.8};return g},
vines(){const g=new THREE.Group();box(2,.25,.3,mWood,0,3.1,0,g);for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.9,5),mLeaf);c.position.set(-.8+i*.32,2.15,0);g.add(c)}g.userData={lo:1.2,hi:3.3,d:.5};return g},
gap(){const g=new THREE.Group();box(1.9,.06,3.2,mDark,0,.03,0,g);box(2,.1,.2,mRock,0,.05,1.6,g);box(2,.1,.2,mRock,0,.05,-1.6,g);g.userData={lo:-9,hi:.25,d:3.2};return g},
boulder(){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),mRock);m.scale.set(1,1.2,1);m.position.y=1.1;g.add(m);g.userData={lo:0,hi:2.3,d:1.6};return g},
coin(){const m=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.08,10),mGold);m.rotation.x=Math.PI/2;const g=new THREE.Group();g.add(m);g.userData={};return g}};
const PC=[0xff5a5a,0x4fe3ff,0xc47bff,0xffa43a];
PC.forEach((c,i)=>B['pu'+i]=()=>{const g=new THREE.Group(),m=new THREE.Mesh(new THREE.OctahedronGeometry(.5),new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.5}));g.add(m);g.userData={t:i};return g});
const pool={};
function get(k){const a=pool[k]||(pool[k]=[]);let m=a.pop();if(!m){m=B[k]();m.userData.k=k;scene.add(m)}m.visible=true;return m}
function rel(m){m.visible=false;pool[m.userData.k].push(m)}
const pg=new THREE.BoxGeometry(.15,.15,.15),parts=[];
for(let i=0;i<24;i++){const m=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({color:0xffd24a}));m.visible=false;scene.add(m);parts.push({m,vx:0,vy:0,vz:0,l:0})}
function burst(x,y,z,c){let n=0;for(const p of parts)if(p.l<=0&&n<8){n++;p.l=.5;p.m.material.color.setHex(c);p.m.position.set(x,y,z);p.vx=(Math.random()-.5)*6;p.vy=Math.random()*5;p.vz=(Math.random()-.5)*6;p.m.visible=true}}
/* ---------- Game state ---------- */
let state='menu',lane=1,px=0,py=0,vy=0,slide=0,v=9,dist=0,score=0,coins=0,inv=0,t=0,lastRowZ=-40,lastFree=1,shake=0,dieT=0,stepT=0,hudT=0,theme=0;
const pw={magnet:0,shield:0,mult:0,boost:0},PK=['magnet','shield','mult','boost'],PN=['MAGNET','SHIELD','x2 SCORE','BOOST'],PCS=['#ff7a7a','#4fe3ff','#c47bff','#ffa43a'],THEMES=[0x7fc8a0,0xf0a878,0x8aa8d8];
let obs=[],cns=[],pus=[];
function reset(){for(const o of obs)rel(o);for(const o of cns)rel(o);for(const o of pus)rel(o);obs=[];cns=[];pus=[];lane=1;px=0;py=0;vy=0;slide=0;dist=0;score=0;coins=0;inv=0;lastRowZ=-40;lastFree=1;dieT=0;theme=0;for(const k of PK)pw[k]=0;P.rotation.set(0,0,0);body.rotation.x=0;hudT=9}
function spawnRow(z){
 const early=dist<120,ks=early?['block','log','arch']:['block','log','arch','vines','gap','boulder'],k=ks[Math.floor(Math.random()*ks.length)],lv=Math.min(1,dist/1500);
 let lanes;
 if(k=='boulder'){const f=Math.max(0,Math.min(2,lastFree+Math.floor(Math.random()*3)-1));lastFree=f;lanes=[0,1,2].filter(l=>l!=f);if(Math.random()>.35+lv*.4)lanes=[lanes[Math.random()<.5?0:1]]}
 else{lanes=[0,1,2].filter(()=>Math.random()<.45+lv*.3);if(!lanes.length)lanes=[Math.floor(Math.random()*3)]}
 for(const l of lanes){const m=get(k);m.position.set((l-1)*2,0,z);obs.push(m)}
 const span=lastRowZ-z;
 const n=Math.min(8,Math.floor((span-10)/2.2));
 if(n>=3){const l=lastFree,arc=Math.random()<.4,z0=lastRowZ-5;for(let i=0;i<n;i++){const c=get('coin');c.position.set((l-1)*2,arc?.9+Math.sin(i/(n-1)*Math.PI)*1.5:.9,z0-i*2.2);cns.push(c)}}
 if(Math.random()<.13&&span>14){const p=get('pu'+Math.floor(Math.random()*4));p.position.set((lastFree-1)*2,1.2,(lastRowZ+z)/2);pus.push(p)}
 lastRowZ=z;
}
function wrapEnv(mz){
 for(const d of env.dash){d.position.z+=mz;if(d.position.z>10)d.position.z-=160}
 for(const g of env.trees){g.position.z+=mz;if(g.position.z>8){g.position.z-=160;g.position.x=(g.position.x<0?-1:1)*(5.5+Math.random()*10)}}
 for(const g of env.gates){g.position.z+=mz;if(g.position.z>10)g.position.z-=160}
}
function die(){state='over';shake=1;S.hit();setTimeout(S.over,250);const f=$('fl');f.style.transition='none';f.style.opacity=.6;requestAnimationFrame(()=>{f.style.transition='opacity .6s';f.style.opacity=0});
 const sc=Math.floor(score);if(sc>best){best=sc;LS.set('best',best)}bank+=coins;LS.set('coins',bank);
 $('gs').textContent=sc;$('gd').textContent=Math.floor(dist);$('gc').textContent=coins;$('gb').textContent=best;
 setTimeout(()=>{if(state=='over')show('go')},700)}
function hit(o){
 if(inv>0||pw.boost>0)return;
 if(pw.shield>0){pw.shield=0;inv=1;S.shield();shake=.5;burst(px,1,0,0x4fe3ff);rel(o);obs.splice(obs.indexOf(o),1);return}
 die()}
function frame(dt){
 if(state=='pause')return;
 const play=state=='play';
 const base=play?Math.min(32,15+dist*.012):state=='menu'?9:0,boost=play&&pw.boost>0;
 v=boost?base*1.5:base;const mz=v*dt;t+=dt;
 /* theme */
 theme=Math.floor(dist/600)%3;bg.lerp(new THREE.Color(THEMES[theme]),dt*.4);scene.fog.color.copy(bg);
 if(play){
  for(const k of PK)pw[k]=Math.max(0,pw[k]-dt);inv=Math.max(0,inv-dt);
  dist+=mz;score+=mz*(pw.mult>0?2:1);lastRowZ+=mz;
  while(lastRowZ>-130)spawnRow(lastRowZ-(Math.max(13,base*1.3*(1-Math.min(.25,dist/4000)))+Math.random()*5));
  /* player physics */
  px+=((lane-1)*2-px)*Math.min(1,dt*14);vy-=40*dt;py+=vy*dt;if(py<=0){py=0;vy=0}slide=Math.max(0,slide-dt);
  const sl=slide>0&&py==0,ph=sl?.8:1.8;
  /* obstacles */
  for(let i=obs.length-1;i>=0;i--){const o=obs[i];o.position.z+=mz;const u=o.userData;
   if(o.position.z>8){rel(o);obs.splice(i,1);continue}
   if(Math.abs(o.position.x-px)<.8&&Math.abs(o.position.z)<u.d/2+.35&&py<u.hi&&py+ph>u.lo){hit(o);if(state!='play')break}}
  /* coins */
  for(let i=cns.length-1;i>=0&&state=='play';i--){const c=cns[i];c.position.z+=mz;c.rotation.y+=dt*5;
   if(pw.magnet>0){const dx=px-c.position.x,dy=py+.9-c.position.y,dz=-c.position.z;if(dx*dx+dy*dy+dz*dz<64){const k=Math.min(1,dt*10);c.position.x+=dx*k;c.position.y+=dy*k;c.position.z+=(0-c.position.z)*k}}
   const dx=px-c.position.x,dy=py+.9-c.position.y,dz=c.position.z;
   if(dx*dx+dy*dy+dz*dz<1.3){coins++;score+=10;S.coin();burst(c.position.x,c.position.y,c.position.z,0xffd24a);rel(c);cns.splice(i,1)}
   else if(c.position.z>8){rel(c);cns.splice(i,1)}}
  for(let i=pus.length-1;i>=0;i--){const p=pus[i];p.position.z+=mz;p.rotation.y+=dt*3;p.position.y=1.2+Math.sin(t*4)*.15;
   const dx=px-p.position.x,dy=py+.9-p.position.y,dz=p.position.z;
   if(dx*dx+dy*dy+dz*dz<2.2){const k=p.userData.t;pw[PK[k]]=k==1?12:8;S.pow();if(k==1)S.shield();burst(p.position.x,p.position.y,p.position.z,PC[k]);rel(p);pus.splice(i,1)}
   else if(p.position.z>8){rel(p);pus.splice(i,1)}}
  /* animation */
  P.position.set(px,py,0);
  const ts=sl;body.rotation.x+=((ts?1.1:0)-body.rotation.x)*Math.min(1,dt*20);
  const sw=Math.sin(t*v*.55)*(py>0?.25:1)*.9;legL.rotation.x=sw;legR.rotation.x=-sw;armL.rotation.x=-sw;armR.rotation.x=sw;
  stepT-=dt;if(stepT<=0&&py==0&&!sl){S.step();stepT=Math.max(.14,5/v)}
  P.visible=!(inv>0&&Math.floor(t*14)%2);
  wrapEnv(mz);
 }else if(state=='menu'){
  P.position.set(0,0,0);P.visible=true;const sw=Math.sin(t*v*.55)*.9;legL.rotation.x=sw;legR.rotation.x=-sw;armL.rotation.x=-sw;armR.rotation.x=sw;wrapEnv(mz);
 }else if(state=='over'){
  dieT+=dt;P.rotation.x=-Math.min(1.4,dieT*4);P.visible=true;
 }
 for(const p of parts)if(p.l>0){p.l-=dt;p.vy-=15*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt+mz;if(p.l<=0)p.m.visible=false}
 /* camera */
 const bo=boost?1:0;shake=Math.max(0,shake-dt*3);
 cam.position.x+=((state=='menu'?Math.sin(t*.4)*1.8:px*.6)-cam.position.x)*Math.min(1,dt*6);
 cam.position.y=3.6+(Math.random()-.5)*(shake*.4+bo*.03);cam.position.z=6.5-bo*.6;
 cam.fov+=(baseFov+bo*12-cam.fov)*Math.min(1,dt*5);cam.updateProjectionMatrix();cam.lookAt(px*.4,1.3,-10);
 /* HUD */
 hudT+=dt;if(hudT>.1){hudT=0;$('sc').textContent=Math.floor(score);$('ds').textContent=Math.floor(dist)+'m';$('cn').textContent=coins;
  let h='';PK.forEach((k,i)=>{if(pw[k]>0)h+='<span style="background:'+PCS[i]+'">'+PN[i]+' '+Math.ceil(pw[k])+'s</span>'});$('pu').innerHTML=h}
}
let last=performance.now();
function loop(n){requestAnimationFrame(loop);const dt=Math.min(.05,(n-last)/1000);last=n;frame(dt);renderer.render(scene,cam)}
/* ---------- UI ---------- */
const OVS=['menu','how','pz','go'];
function show(id){OVS.forEach(o=>$(o).classList.toggle('hide',o!=id));const g=state=='play'||state=='pause'||state=='over';$('hud').classList.toggle('hide',!g);$('tc').classList.toggle('hide',!(state=='play'||state=='pause'))}
function sndLabel(){const s='Sound: '+(sfx?'On':'Off');$('sn1').textContent=$('sn2').textContent=s}
function toMenu(){state='menu';reset();$('mb').textContent=best;$('mt').textContent=bank;show('menu')}
const A={start(){reset();state='play';show(null)},how(){show('how')},back(){show('menu')},snd(){sfx=!sfx;LS.set('sfx',sfx);sndLabel()},
 pause(){if(state=='play'){state='pause';show('pz')}},resume(){if(state=='pause'){state='play';last=performance.now();show(null)}},
 restart(){reset();state='play';show(null)},menu(){toMenu()}};
document.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{S.click();A[b.dataset.a]()}));
/* ---------- Input ---------- */
function mv(d){if(state!='play')return;const n=lane+d;if(n<0||n>2)return;lane=n;S.lane()}
function jump(){if(state!='play'||py>.05)return;vy=14;slide=0;S.jump()}
function down(){if(state!='play')return;if(py>.05)vy=-22;else{slide=.7;S.slide()}}
addEventListener('keydown',e=>{const c=e.code;let h=true;
 if(c=='ArrowLeft'||c=='KeyA')mv(-1);else if(c=='ArrowRight'||c=='KeyD')mv(1);else if(c=='ArrowUp'||c=='KeyW'||c=='Space')jump();else if(c=='ArrowDown'||c=='KeyS')down();
 else if(c=='Escape'){state=='play'?A.pause():state=='pause'&&A.resume()}else h=false;if(h)e.preventDefault()});
let tx=0,ty=0,tr=false;
addEventListener('touchstart',e=>{if(state=='play')e.preventDefault();const p=e.touches[0];tx=p.clientX;ty=p.clientY;tr=true},{passive:false});
addEventListener('touchmove',e=>{if(state=='play')e.preventDefault();if(!tr||state!='play')return;const p=e.touches[0],dx=p.clientX-tx,dy=p.clientY-ty;
 if(Math.max(Math.abs(dx),Math.abs(dy))<30)return;
 if(Math.abs(dx)>Math.abs(dy))mv(dx>0?1:-1);else dy<0?jump():down();tr=false},{passive:false});
addEventListener('touchend',()=>{tr=false});
for(const [id,f] of [['bl',()=>mv(-1)],['br',()=>mv(1)],['bu',jump],['bd',down]])$(id).addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();f()},{passive:false}),$(id).addEventListener('mousedown',e=>{e.preventDefault();f()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)A.pause()});addEventListener('blur',()=>A.pause());
/* Android back button (Capacitor App plugin) */
try{const C=window.Capacitor;if(C&&C.Plugins&&C.Plugins.App)C.Plugins.App.addListener('backButton',()=>{if(state=='play')A.pause();else if(state=='pause')A.resume();else if(state=='menu'||state=='over')C.Plugins.App.exitApp();else toMenu()})}catch(e){}
sndLabel();toMenu();requestAnimationFrame(loop);

// Downloads Three.js r128 into www/js so the app works fully offline.
const https=require('https'),fs=require('fs'),path=require('path');
const url='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const out=path.join(__dirname,'..','www','js','three.min.js');
https.get(url,r=>{if(r.statusCode!==200){console.error('HTTP',r.statusCode);process.exit(1)}
 r.pipe(fs.createWriteStream(out)).on('finish',()=>console.log('Saved',out,fs.statSync(out).size,'bytes'))}).on('error',e=>{console.error(e);process.exit(1)});

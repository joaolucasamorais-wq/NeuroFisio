/* Monta uma distribuição estática sem npm, usando React UMD e o compilador TypeScript.
   A versão de desenvolvimento permanece React + TypeScript + Vite.
   Este script é mantido como alternativa técnica para gerar a build de entrega. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
let ts;
try{ts=require('typescript');}catch{const cp=require('child_process');ts=require(path.join(cp.execSync('npm root -g').toString().trim(),'typescript'));}
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
const files=['src/data/catalog.ts','src/storage.ts','src/main.tsx'];
const app={};const diagnostics=[];
for(const f of files){const raw=fs.readFileSync(path.join(root,f),'utf8');const tr=ts.transpileModule(raw,{fileName:f,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,removeComments:false}});app[f.replace(/\.(tsx|ts)$/,'')]=tr.outputText;diagnostics.push(...(tr.diagnostics||[]));}
if(diagnostics.length){for(const d of diagnostics)process.stderr.write(ts.flattenDiagnosticMessageText(d.messageText,'\n')+'\n');process.exit(1);}
const keys=Object.keys(app);
const modules=keys.map(k=>`${JSON.stringify(k)}:function(require,module,exports){\n${app[k]}\n}`).join(',\n');
const boot=`(function(){'use strict';\nconst modules={${modules}};\nconst cache={};function load(k){if(cache[k])return cache[k].exports;const m={exports:{}};if(!modules[k])throw Error('Módulo não encontrado: '+k);cache[k]=m;const req=(r)=>{if(r==='react')return window.React;if(r==='react-dom/client')return {createRoot(el){return {render(element){window.ReactDOM.render(element,el)}}}};if(r.endsWith('.css'))return {};if(r.startsWith('.')){const v=k.split('/');v.pop();for(const part of r.split('/')){if(part==='..')v.pop();else if(part!=='.')v.push(part)}return load(v.join('/'));}throw Error('Dependência não encontrada: '+r)};modules[k](req,m,m.exports);return m.exports;}\nload('src/main');\n})();`;
const digest=crypto.createHash('sha256').update(boot).digest('hex').slice(0,12);
const appName=`app-${digest}.js`,css=fs.readFileSync(path.join(root,'src/styles.css'),'utf8').replace(/^@import[^\n]*\n/,'');
const cssName=`styles-${crypto.createHash('sha256').update(css).digest('hex').slice(0,12)}.css`;
fs.mkdirSync(path.join(dist,'assets'),{recursive:true});fs.writeFileSync(path.join(dist,'assets',appName),boot);fs.writeFileSync(path.join(dist,'assets',cssName),css);
function copyDirectory(src,dst){for(const entry of fs.readdirSync(src,{withFileTypes:true})){const s=path.join(src,entry.name),d=path.join(dst,entry.name);if(entry.isDirectory()){fs.mkdirSync(d,{recursive:true});copyDirectory(s,d)}else if(entry.name!=='sw.js'){fs.copyFileSync(s,d);}}}
copyDirectory(path.join(root,'public'),dist);
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');html=html.replace('</head>','<script defer src="/vendor/react.production.min.js"></script><script defer src="/vendor/react-dom.production.min.js"></script><script defer src="/vendor/react16-compat.js"></script></head>');html=html.replace('<script type="module" src="/src/main.tsx"></script>',`<link rel="stylesheet" href="/assets/${cssName}" /><script defer src="/assets/${appName}"></script>`);fs.writeFileSync(path.join(dist,'index.html'),html);
const fileUrls=['/','/index.html',`/assets/${appName}`,`/assets/${cssName}`,'/vendor/react.production.min.js','/vendor/react-dom.production.min.js','/vendor/react16-compat.js','/manifest.webmanifest','/icons/icon.svg','/icons/icon-192.png','/icons/icon-512.png'];
const sw=`const CACHE='neurofisio-fase1-${digest}';const ASSETS=${JSON.stringify(fileUrls)};\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('neurofisio-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;if(req.mode==='navigate'){e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('/index.html',copy));}return res;}).catch(()=>caches.match('/index.html')));return;}e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res})));});`;
fs.writeFileSync(path.join(dist,'sw.js'),sw);
console.log(`NeuroFisio · distribuição estática pronta: ${path.relative(root,dist)}; ${boot.length} bytes JS; ${css.length} bytes CSS; ${Object.keys(app).length} módulos TS transpilados.`);

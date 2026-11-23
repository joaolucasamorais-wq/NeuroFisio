const fs=require('fs'),path=require('path'),assert=require('assert');const root=path.resolve(__dirname,'..');
for(const p of ['package.json','tsconfig.json','vite.config.ts','src/main.tsx','src/storage.ts','src/data/catalog.ts','src/types.ts','src/styles.css','public/manifest.webmanifest','public/icons/icon-192.png','public/icons/icon-512.png','index.html'])assert(fs.existsSync(path.join(root,p)),`Arquivo ausente: ${p}`);
const catalog=fs.readFileSync(path.join(root,'src/data/catalog.ts'),'utf8');for(const m of ['eeg','enmg','psg','pe'])assert(catalog.includes(`id:'${m}'`),`Módulo ausente: ${m}`);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/manifest.webmanifest'),'utf8'));assert(manifest.display==='standalone');assert(manifest.icons.length>=2);
const packageJSON=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));assert(packageJSON.dependencies.react);assert(packageJSON.devDependencies.vite);assert(packageJSON.devDependencies.typescript);
const compiled=path.join(root,'dist');if(fs.existsSync(compiled))for(const p of ['index.html','manifest.webmanifest','sw.js'])assert(fs.existsSync(path.join(compiled,p)),`Build incompleta: ${p}`);
console.log('PASS: estrutura, quatro módulos, dependências, manifesto e artefatos essenciais.');

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MODULES, OVERVIEW_METRICS, SECTION_LABELS, getModule, isModule } from './data/catalog';
import { backupState, deletePack, exportFile, listPacks, loadNotes, loadPrefs, loadProgress, loadReports, putPack, saveNotes, savePrefs, saveProgress, saveReports, validatePack } from './storage';
import type { ContentPack, LibraryState, ModuleId, NotesMap, ProgressMap, ReportMap, UserPreferences, WorkspaceId } from './types';
import './styles.css';

const WORKSPACES: {id:WorkspaceId;label:string;mono:string}[] = [
  {id:'home',label:'Visão geral',mono:'00'}, {id:'study',label:'Study',mono:'01'},
  {id:'lab',label:'Signal Lab',mono:'02'}, {id:'atlas',label:'Atlas',mono:'03'},
  {id:'cases',label:'Case Room',mono:'04'}, {id:'reports',label:'Report Studio',mono:'05'},
  {id:'library',label:'Biblioteca',mono:'06'}
];
const EMPTY_LIBRARY: LibraryState = {packs:[], imported:[]};
function currentRoute():{section:WorkspaceId;module:ModuleId}{
  const [sectionRaw,moduleRaw] = window.location.hash.replace(/^#\/?/,'').split('/');
  const section = WORKSPACES.some(x=>x.id===sectionRaw)?sectionRaw as WorkspaceId:'home';
  return {section,module:isModule(moduleRaw)?moduleRaw:'eeg'};
}
function navigate(section:WorkspaceId,module:ModuleId){const hash=`#/${section}/${module}`;if(location.hash!==hash)location.hash=hash;}
function Icon({name,size=18}:{name:string;size?:number}){
  const shared={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
  switch(name){
    case 'grid':return <svg {...shared}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'book':return <svg {...shared}><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1ZM12 6v14"/></svg>;
    case 'activity':return <svg {...shared}><path d="M2 12h4l3-8 5 16 3-8h5"/></svg>;
    case 'archive':return <svg {...shared}><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 14h4"/></svg>;
    case 'case':return <svg {...shared}><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M11 11v3h2v-3"/></svg>;
    case 'file':return <svg {...shared}><path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM15 3v6h5M9 13h7M9 17h7"/></svg>;
    case 'search':return <svg {...shared}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>;
    case 'chevron':return <svg {...shared}><path d="m9 5 7 7-7 7"/></svg>;
    case 'arrow':return <svg {...shared}><path d="M4 12h16m-7-7 7 7-7 7"/></svg>;
    case 'moon':return <svg {...shared}><path d="M19 15.5A8 8 0 0 1 8.5 5a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>;
    case 'sun':return <svg {...shared}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
    case 'check':return <svg {...shared}><path d="m5 12 4 4L19 6"/></svg>;
    case 'download':return <svg {...shared}><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>;
    case 'upload':return <svg {...shared}><path d="M12 17V5m-5 5 5-5 5 5M4 17v4h16v-4"/></svg>;
    case 'refresh':return <svg {...shared}><path d="M21 12a9 9 0 0 0-16-5l-2 2m0-6v6h6M3 12a9 9 0 0 0 16 5l2-2m0 6v-6h-6"/></svg>;
    case 'trash':return <svg {...shared}><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7M10 11v6m4-6v6"/></svg>;
    case 'menu':return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'close':return <svg {...shared}><path d="M5 5l14 14M19 5 5 19"/></svg>;
    case 'info':return <svg {...shared}><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></svg>;
    default:return <svg {...shared}><circle cx="12" cy="12" r="9"/></svg>;
  }
}
function SignalGlyph({id,wide=false}:{id:ModuleId;wide?:boolean}){
  const common={fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  return <svg className={`signal-glyph ${wide?'signal-glyph-wide':''}`} viewBox="0 0 320 92" role="img" aria-label={`Assinatura gráfica abstrata ${id}, não representa exame clínico`} preserveAspectRatio="none">
    <path d="M0 23H320M0 46H320M0 69H320" className="signal-guides" />
    {id==='eeg' && <g {...common}><path d="M0 46L18 46 27 42 35 50 45 45 54 45 63 31 70 57 81 41 88 48 106 46 112 38 122 52 133 44 146 46 156 19 165 73 174 39 185 46 201 46 210 40 220 52 231 42 244 46 255 24 263 65 272 41 282 47 300 46 320 46"/></g>}
    {id==='enmg' && <g {...common}><path d="M0 47H47l5-2 4-8 5 17 5-31 6 45 5-27 6 9 6-5H142l5-1 6-11 4 20 5-35 6 49 5-23 6 5h33l5-1 4-8 4 16 5-27 5 38 5-20 5 4h58"/></g>}
    {id==='psg' && <g {...common}><path d="M0 41Q9 23 18 41T36 41T54 41T72 41T90 41T108 41T126 41T144 41T162 41T180 41T198 41T216 41T234 41T252 41T270 41T288 41T306 41T324 41"/><path d="M0 72H38V61H80V70H114V54H158V62H214V47H260V58H320" opacity=".55"/></g>}
    {id==='pe' && <g {...common}><path d="M0 46H53Q66 46 74 51T92 56Q105 55 119 38T143 23Q154 20 165 36T187 61Q205 64 219 47T245 43Q260 46 275 46H320"/><path d="M0 46H61Q74 46 82 52T100 55Q114 53 124 39T146 24Q158 24 170 37T191 59Q209 62 223 47T247 44H320" strokeDasharray="4 5" opacity=".55"/></g>}
  </svg>;
}
const Badge = ({children}:{children:React.ReactNode})=><span className="micro-badge">{children}</span>;
function SectionHeader({eyebrow,title,description,actions}:{eyebrow:string;title:string;description?:string;actions?:React.ReactNode}){
  return <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div><div className="section-actions">{actions}</div></div>;
}
function BlankMessage({icon,title,children,action}:{icon:string;title:string;children:React.ReactNode;action?:React.ReactNode}){
  return <div className="blank-state"><span className="blank-icon"><Icon name={icon} size={26}/></span><h3>{title}</h3><p>{children}</p>{action}</div>;
}
function TechnicalSignal({moduleId,theme}:{moduleId:ModuleId;theme:string}){
  const canvasRef=React.useRef<HTMLCanvasElement|null>(null);
  const [channels,setChannels]=React.useState(4);
  const [gain,setGain]=React.useState(50);
  const [span,setSpan]=React.useState(10);
  const [grid,setGrid]=React.useState(true);
  React.useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const frame=()=>{
      const cssWidth=canvas.clientWidth || 740, cssHeight=Math.max(300,channels*66+34), dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(cssWidth*dpr);canvas.height=Math.round(cssHeight*dpr);canvas.style.height=`${cssHeight}px`;
      const ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.fillStyle=theme==='dark'?'#151820':'#ffffff';ctx.fillRect(0,0,cssWidth,cssHeight);
      const fg=theme==='dark'?'#a2a4ac':'#68707a',rule=theme==='dark'?'#2b2e37':'#e9ebef';
      if(grid){ctx.strokeStyle=rule;ctx.lineWidth=.7;for(let i=0;i<=cssWidth;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,cssHeight);ctx.stroke();}for(let i=0;i<=cssHeight;i+=22){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(cssWidth,i);ctx.stroke();}}
      const colors=['#ef706c','#a795f4','#87b6a1','#94acd6','#d6a2a2','#a5bbb5','#c0b5e2','#a8aab4'];
      const count=channels;
      for(let c=0;c<count;c++){
        const mid=39+c*66;ctx.font='10px monospace';ctx.fillStyle=fg;ctx.fillText(`CH ${String(c+1).padStart(2,'0')}`,8,mid-23);
        ctx.beginPath();ctx.lineWidth=1.45;ctx.strokeStyle=colors[c%colors.length];
        for(let px=0;px<cssWidth;px+=1.4){const t=px/cssWidth * span;const a= (0.22*Math.sin(t*3.2+c*1.3)+0.5*Math.sin(t*(c+3)*5.1 +c*1.7)+0.14*Math.sin(t*43+c*2.1));const feature=moduleId==='pe'?Math.exp(-Math.pow((t-span*.46)/(span*.13),2))*Math.sin(t*4+c):moduleId==='psg'?Math.sin(t*.8+c)*.6:moduleId==='enmg'?Math.sin(t*23+c)*Math.exp(-Math.pow((t-span*.5)/(span*.10),2)) :Math.sin(t*14+c)*.23;const value=mid-(a*.44+feature*.65)*(gain/100)*35;if(px===0)ctx.moveTo(px,value);else ctx.lineTo(px,value);}
        ctx.stroke();
      }
      ctx.fillStyle=fg;ctx.font='10px monospace';ctx.fillText(`JANELA ${span} s   ·   UNIDADES ARBITRÁRIAS`,9,cssHeight-9);
    };
    frame();const resize=new ResizeObserver(frame);resize.observe(canvas);return()=>resize.disconnect();
  },[moduleId,channels,gain,span,grid,theme]);
  return <div className="lab-workspace"><div className="lab-topline"><div className="live-dot"/><span>GERADOR GRÁFICO EXPERIMENTAL</span><span className="lab-stamp">NÃO É EXAME CLÍNICO</span></div>
    <div className="signal-screen"><canvas ref={canvasRef} aria-label="Ilustração técnica sintética de múltiplos canais sem validade clínica"/></div>
    <div className="lab-controls">
      <label>CANAL <select value={channels} onChange={e=>setChannels(Number(e.target.value))}><option value="2">02 canais</option><option value="4">04 canais</option><option value="8">08 canais</option></select></label>
      <label>GANHO <input aria-label="Ganho demonstrativo" type="range" min="20" max="100" step="10" value={gain} onChange={e=>setGain(Number(e.target.value))}/><span>{gain}%</span></label>
      <label>JANELA <select value={span} onChange={e=>setSpan(Number(e.target.value))}><option value="5">5 s</option><option value="10">10 s</option><option value="20">20 s</option></select></label>
      <button type="button" className={grid?'toggle-pill active':'toggle-pill'} onClick={()=>setGrid(v=>!v)}>GRADE {grid?'ON':'OFF'}</button>
    </div><p className="tiny-note"><Icon name="info" size={13}/> Demonstração técnica para testar o renderizador. As ondas são artificiais e não simulam traçados de pacientes, padrões fisiológicos ou patologias.</p>
  </div>;
}
function App(){
  const initial=currentRoute();
  const [view,setView]=React.useState<WorkspaceId>(initial.section);
  const [mod,setMod]=React.useState<ModuleId>(initial.module);
  const [prefs,setPrefs]=React.useState<UserPreferences>(loadPrefs);
  const [progress,setProgress]=React.useState<ProgressMap>(loadProgress);
  const [notes,setNotes]=React.useState<NotesMap>(loadNotes);
  const [reports,setReports]=React.useState<ReportMap>(loadReports);
  const [library,setLibrary]=React.useState<LibraryState>(EMPTY_LIBRARY);
  const [query,setQuery]=React.useState('');
  const [searchOpen,setSearchOpen]=React.useState(false);
  const [menuOpen,setMenuOpen]=React.useState(false);
  const [toast,setToast]=React.useState('');
  const [fileBusy,setFileBusy]=React.useState(false);
  const fileRef=React.useRef<HTMLInputElement|null>(null);
  const searchRef=React.useRef<HTMLInputElement|null>(null);
  const module=getModule(mod);
  const sections=MODULES.reduce((s,m)=>s+m.topics.length,0);
  const completed=Object.keys(progress).filter(k=>progress[k]&&MODULES.some(m=>m.topics.some(t=>t.id===k))).length;
  React.useEffect(()=>{const sync=()=>{const r=currentRoute();setView(r.section);setMod(r.module);setMenuOpen(false);};window.addEventListener('hashchange',sync);if(!location.hash)navigate('home',initial.module);return()=>window.removeEventListener('hashchange',sync);},[]);
  React.useEffect(()=>{savePrefs(prefs);document.documentElement.setAttribute('data-theme',prefs.theme);document.documentElement.classList.toggle('compact',prefs.compact);},[prefs]);
  React.useEffect(()=>{saveProgress(progress);},[progress]);
  React.useEffect(()=>{saveNotes(notes);},[notes]);
  React.useEffect(()=>{saveReports(reports);},[reports]);
  React.useEffect(()=>{listPacks().then(packs=>setLibrary({packs,imported:packs.map(p=>({id:p.packageId,title:p.title,examples:p.examples.length,cases:p.cases.length,importedAt:p.createdAt}))})).catch(()=>{});},[]);
  React.useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true);}if(e.key==='Escape'){setSearchOpen(false);setMenuOpen(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
  React.useEffect(()=>{if(searchOpen){searchRef.current?.focus();}},[searchOpen]);
  const message=(s:string)=>{setToast(s);window.setTimeout(()=>setToast(''),3600);};
  function go(section:WorkspaceId= 'home',moduleId:ModuleId=mod){setView(section);setMod(moduleId);setMenuOpen(false);navigate(section,moduleId);setPrefs(v=>({...v,lastModule:moduleId}));}
  function onToggleTopic(id:string){setProgress(v=>({...v,[id]:!v[id]}));}
  async function onImport(file?:File){if(!file)return;setFileBusy(true);try{if(file.size>1_500_000)throw new Error('Arquivo de índice muito grande. Limite: 1,5 MB nesta fase.');const raw=JSON.parse(await file.text()) as unknown;const checked=validatePack(raw);if(!checked.value)throw new Error(checked.error||'Arquivo inválido.');await putPack(checked.value);const packs=await listPacks();setLibrary({packs,imported:packs.map(p=>({id:p.packageId,title:p.title,examples:p.examples.length,cases:p.cases.length,importedAt:p.createdAt}))});message(`Pacote ${checked.value.packageId} integrado ao índice local.`);}catch(err){message(`Importação: ${err instanceof Error?err.message:'erro desconhecido'}`);}finally{setFileBusy(false);if(fileRef.current)fileRef.current.value='';}}
  async function onDeletePack(p:ContentPack){if(!window.confirm(`Excluir o índice de conteúdo “${p.title}” do armazenamento deste navegador?`))return;try{await deletePack(p.packageId);const packs=await listPacks();setLibrary({packs,imported:packs.map(k=>({id:k.packageId,title:k.title,examples:k.examples.length,cases:k.cases.length,importedAt:k.createdAt}))});message('Índice local excluído.');}catch{message('Não foi possível excluir o índice.');}}
  const indexedExamples=library.packs.flatMap(p=>p.examples.map(e=>({...e,pack:p.packageId}))).filter(e=>e.module===mod);
  const indexedCases=library.packs.flatMap(p=>p.cases.map(c=>({...c,pack:p.packageId}))).filter(c=>c.module===mod);
  const searchItems=React.useMemo(()=>{
    const items=[...WORKSPACES.map(s=>({id:s.id,title:s.label,detail:'Ambiente',section:s.id,module:mod})),...MODULES.flatMap(m=>[
      {id:`module-${m.id}`,title:m.name,detail:'Modalidade',section:'home' as WorkspaceId,module:m.id},
      ...m.topics.map(t=>({id:t.id,title:t.title,detail:`${m.shortName} · ${t.group}`,section:'study' as WorkspaceId,module:m.id}))
    ]),...library.packs.flatMap(p=>[
      ...p.examples.map(e=>({id:e.id,title:e.title,detail:`Exemplo · ${p.title}`,section:'atlas' as WorkspaceId,module:e.module})),
      ...p.cases.map(c=>({id:c.id,title:c.title,detail:`Caso · ${p.title}`,section:'cases' as WorkspaceId,module:c.module}))
    ])];
    return items;
  },[library,mod]);
  const filtered=searchItems.filter(s=>`${s.title} ${s.detail}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,16);
  const modReport=reports[mod]||{technique:'',findings:'',conclusion:'',updatedAt:''};
  function changeReport(key:'technique'|'findings'|'conclusion',text:string){setReports(r=>({...r,[mod]:{...r[mod], [key]:text,updatedAt:new Date().toISOString()}}));}
  function exportReport(){const text=`NEUROFISIO · REPORT STUDIO\nMaterial exclusivamente educacional · ${module.name}\n\nDESCRIÇÃO TÉCNICA\n${modReport.technique||'[Não preenchida]'}\n\nACHADOS\n${modReport.findings||'[Não preenchidos]'}\n\nCONCLUSÃO\n${modReport.conclusion||'[Não preenchida]'}\n\nLaudo de treinamento. Não utilizar em documentos assistenciais.`;exportFile(`neurofisio-laudo-treino-${mod}.txt`,text,'text/plain;charset=utf-8');message('Laudo educacional exportado.');}
  function renderContent(){
    if(view==='home')return <><SectionHeader eyebrow="CENTRAL DE ESTUDO  /  INÍCIO" title="A ciência dos sinais." description="Quatro modalidades. Um ambiente de precisão, pensado para aprender a interpretar — não apenas reconhecer imagens." actions={<Badge>BUILD 01 / 20</Badge>}/>
      <div className="hero-band"><div className="hero-text"><span className="upper-muted">CLINICAL NEUROPHYSIOLOGY LABORATORY</span><h2>Conheça o sinal.<br/><em>Entenda o sistema.</em></h2><p>Uma estação de estudos para EEG, ENMG, sono e potenciais evocados. Esta versão inaugura os ambientes e a infraestrutura do laboratório.</p><button className="primary-btn" onClick={()=>go('study',mod)}>Explorar o currículo <Icon name="arrow" size={16}/></button></div><div className="hero-visual" aria-hidden="true"><div className="hero-visual-caption">SIGNAL ROOM <span>·</span> GRÁFICO ABSTRATO</div><SignalGlyph id="eeg" wide/><SignalGlyph id="enmg" wide/><SignalGlyph id="psg" wide/><SignalGlyph id="pe" wide/></div></div>
      <div className="area-head"><div><span className="eyebrow">SELECIONE UMA DISCIPLINA</span><h2>Laboratórios de estudo</h2></div><span className="section-num">01 — 04</span></div>
      <div className="modules-grid">{MODULES.map(m=><button key={m.id} className="module-card" style={{'--accent':m.color} as React.CSSProperties} onClick={()=>go('study',m.id)}><div className="module-meta"><span>{m.index} / 04</span><span className="module-chip">{m.tag}</span></div><SignalGlyph id={m.id}/><div className="module-title"><h3>{m.name}</h3><Icon name="arrow" size={18}/></div><p>{m.intro}</p><div className="module-footer"><span>{m.topics.length} TÓPICOS MAPEADOS</span><span>ABRIR <Icon name="chevron" size={12}/></span></div></button>)}</div>
      <div className="metric-row">{OVERVIEW_METRICS.map(x=><div key={x.label}><b>{x.head}</b><span>{x.label}</span></div>)}</div>
    </>;
    if(view==='study'){
      const groups=[...new Set(module.topics.map(t=>t.group))];const count=module.topics.filter(t=>progress[t.id]).length;
      return <><SectionHeader eyebrow={`STUDY / ${module.shortName.toUpperCase()}`} title={module.name} description={module.intro} actions={<button className="outline-btn" onClick={()=>go('lab',mod)}>Abrir Signal Lab <Icon name="arrow" size={15}/></button>}/>
        <div className="summary-stripe"><div><span>ÍNDICE CURRICULAR</span><strong>{String(module.topics.length).padStart(2,'0')} tópicos</strong></div><div><span>CONCLUÍDOS</span><strong>{String(count).padStart(2,'0')} / {String(module.topics.length).padStart(2,'0')}</strong></div><div><span>PROFUNDIDADE CIENTÍFICA</span><strong>Expansão na fase {module.plannedPhase}</strong></div></div>
        <div className="study-layout"><div className="topic-stack">{groups.map((g,i)=><section className="topic-group" key={g}><div className="topic-group-title"><span>{String(i+1).padStart(2,'0')}</span><h3>{g}</h3></div>{module.topics.filter(t=>t.group===g).map(t=><label className="topic-row" key={t.id}><input type="checkbox" checked={!!progress[t.id]} onChange={()=>onToggleTopic(t.id)}/><span className={progress[t.id]?'topic-done':''}>{t.title}</span><span className="topic-state">{progress[t.id]?'REVISADO':'PLANEJADO'}</span></label>)}</section>)}</div>
        <aside className="study-aside"><div className="aside-title">DIÁRIO DE ESTUDO <span>LOCAL</span></div><p>Registre dúvidas, metas e referências para estudar esta modalidade.</p><textarea aria-label={`Anotações de ${module.name}`} value={notes[mod]||''} onChange={e=>setNotes(v=>({...v,[mod]:e.target.value}))} placeholder="Suas anotações serão salvas neste navegador…" rows={8}/><div className="aside-small"><Icon name="check" size={15}/> Salvamento local automático</div><div className="aside-divider"/><b>CONTEÚDO CIENTÍFICO</b><p>Este é o mapa curricular inicial. Os capítulos e os exames clínicos revisados serão incorporados nas fases específicas, sem inventar conteúdo validado.</p><button className="text-btn" onClick={()=>go('atlas',mod)}>Ver estrutura do Atlas <Icon name="arrow" size={15}/></button></aside></div>
      </>;
    }
    if(view==='lab')return <><SectionHeader eyebrow={`SIGNAL LAB / ${module.shortName}`} title="Estação de sinais" description={`Estrutura do visualizador de ${module.name}. O motor técnico completo será desenvolvido na fase correspondente.`} actions={<Badge>PROTÓTIPO TÉCNICO</Badge>}/>
      <div className="lab-summary"><span className="module-label" style={{color:module.color}}>{module.english}</span><span>RENDERIZAÇÃO CANVAS 2D</span><span>SEM AMOSTRAS CLÍNICAS</span></div><TechnicalSignal moduleId={mod} theme={prefs.theme}/>
      <div className="lab-below"><article><b>O que já funciona</b><p>Renderização responsiva, seleção de canais, ajuste demonstrativo de ganho, intervalo temporal, grade e diferenciação gráfica entre módulos.</p></article><article><b>Próximos instrumentos</b><p>Leitura de arquivos de sinais, montagens reais, filtros documentados, medições com unidades físicas, eventos e visualizadores específicos por exame.</p></article></div>
    </>;
    if(view==='atlas')return <><SectionHeader eyebrow={`ATLAS / ${module.shortName}`} title="Atlas de registros" description="Índice preparado para receber materiais com origem documentada e identificadores estáveis." actions={<button className="outline-btn" onClick={()=>fileRef.current?.click()}><Icon name="upload" size={15}/> Importar índice JSON</button>}/>
      {indexedExamples.length===0?<BlankMessage icon="archive" title="Aguardando registros documentados">Nenhum exemplo clínico foi importado para {module.shortName}. A criação do acervo de exames e imagens pertence à fase {module.workPhase} no Work.</BlankMessage>:<div className="record-list">{indexedExamples.map((e,i)=><article className="record" key={`${e.pack}-${e.id}`}><span className="mono-index">{String(i+1).padStart(2,'0')}</span><div><h3>{e.title}</h3><p>{e.description||'Sem descrição adicional.'}</p><span className="record-meta">ORIGEM: {e.origin.replace(/_/g,' ').toUpperCase()} · PACOTE: {e.pack}</span></div><Badge>ÍNDICE</Badge></article>)}</div>}
      <div className="note-panel"><Icon name="info" size={18}/><div><b>Importação de conteúdo — Fase 1</b><p>O importador recebe apenas metadados de índices JSON no esquema neurofisio-content-v1. Ainda não abre imagens, EDF/EDF+ ou sinais clínicos; essas integrações serão desenvolvidas em fases posteriores. Não carregue dados identificáveis de pacientes.</p><button className="text-btn" onClick={()=>go('library',mod)}>Gerenciar pacotes <Icon name="arrow" size={14}/></button></div></div>
    </>;
    if(view==='cases')return <><SectionHeader eyebrow={`CASE ROOM / ${module.shortName}`} title="Casos clínicos" description="Uma sala de interpretação progressiva, construída com casos documentados e decisões clínicas realistas." actions={<Badge>CONTEÚDO VIA WORK</Badge>}/>
      {indexedCases.length===0?<BlankMessage icon="case" title="O laboratório de casos está preparado">O banco inicial de {module.shortName} ainda não possui casos integrados. O acervo será desenvolvido na fase {module.workPhase}, antes da mecânica interativa completa da fase 17.<button className="inline-action" onClick={()=>go('study',mod)}>Consultar o currículo <Icon name="arrow" size={15}/></button></BlankMessage>:<div className="record-list">{indexedCases.map((c,i)=><article className="record" key={`${c.pack}-${c.id}`}><span className="mono-index">{String(i+1).padStart(2,'0')}</span><div><h3>{c.title}</h3><p>{c.synopsis||'Sinopse ainda não informada.'}</p><span className="record-meta">{(c.complexity||'NÃO DEFINIDA').toUpperCase()} · PACOTE: {c.pack}</span></div><Badge>ÍNDICE</Badge></article>)}</div>}
      <div className="note-panel"><Icon name="info" size={18}/><div><b>Sem casos artificiais inseridos para preencher a interface</b><p>A integração de um índice não equivale à validação ou execução de casos interativos. Os registros completos dependerão das etapas de produção, revisão e implementação.</p></div></div>
    </>;
    if(view==='reports')return <><SectionHeader eyebrow={`REPORT STUDIO / ${module.shortName}`} title="Ateliê de laudos" description="Um rascunho estruturado para treinar a redação e organizar o raciocínio de cada modalidade." actions={<button className="outline-btn" onClick={exportReport}><Icon name="download" size={15}/> Exportar .txt</button>}/>
      <div className="report-layout"><div className="report-editor"><div className="report-banner"><span>DOCUMENTO DE TREINAMENTO</span><Badge>SALVAMENTO AUTOMÁTICO</Badge></div><div className="report-name">{module.name}</div><label>DESCRIÇÃO TÉCNICA<textarea value={modReport.technique} onChange={e=>changeReport('technique',e.target.value)} rows={4} placeholder="Descreva os parâmetros, a técnica e as limitações do exame…"/></label><label>ACHADOS<textarea value={modReport.findings} onChange={e=>changeReport('findings',e.target.value)} rows={6} placeholder="Organize os achados e as medições disponíveis…"/></label><label>CONCLUSÃO<textarea value={modReport.conclusion} onChange={e=>changeReport('conclusion',e.target.value)} rows={4} placeholder="Escreva uma conclusão proporcional aos achados…"/></label><div className="report-footer"><span>USO EDUCACIONAL · SEM VALIDADE ASSISTENCIAL</span><button className="primary-btn" onClick={exportReport}>Exportar rascunho <Icon name="arrow" size={15}/></button></div></div><aside className="study-aside"><div className="aside-title">INSTRUÇÕES</div><p>Este editor é funcional, com salvamento no navegador e exportação de texto. A correção comentada, modelos especializados, valores de referência e comparação com laudos serão implementados na fase 17 e nas fases clínicas correspondentes.</p><div className="aside-divider"/><b>PRIVACIDADE</b><p>Não insira nome de pacientes, datas de nascimento, prontuários ou identificadores clínicos. O conteúdo digitado permanece neste dispositivo.</p></aside></div>
    </>;
    return <><SectionHeader eyebrow="BIBLIOTECA / GESTÃO" title="Pacotes de conteúdo" description="Gerencie o catálogo de índices produzido externamente e acompanhe o progresso armazenado neste dispositivo." actions={<button className="outline-btn" disabled={fileBusy} onClick={()=>fileRef.current?.click()}><Icon name="upload" size={15}/>{fileBusy?'Importando…':'Importar pacote JSON'}</button>}/>
      <div className="library-banner"><div><span className="upper-muted">ARMAZENAMENTO LOCAL · INDEXEDDB</span><h2>Biblioteca extensível.</h2><p>Pacotes são identificados por um ID estável. Importações repetidas atualizam o mesmo ID, sem gerar duplicação. Conteúdo não validado nunca é rotulado como revisado automaticamente.</p></div><div className="library-stat"><b>{library.packs.length.toString().padStart(2,'0')}</b><span>PACOTES INDEXADOS</span></div></div>
      {library.packs.length===0?<BlankMessage icon="archive" title="Nenhum pacote importado">O projeto foi preparado para arquivos JSON de metadados do Work. O primeiro banco de exames será produzido nas fases 5, 9, 12, 15 e 18.</BlankMessage>:<div className="record-list">{library.packs.map(p=><article className="record" key={p.packageId}><span className="mono-index">PKG</span><div><h3>{p.title}</h3><p>{p.examples.length} exemplos · {p.cases.length} casos · {p.modality.toUpperCase()}</p><span className="record-meta">ID {p.packageId} · {p.createdAt.slice(0,10)}</span></div><button className="icon-btn danger" aria-label={`Excluir pacote ${p.title}`} onClick={()=>onDeletePack(p)}><Icon name="trash" size={17}/></button></article>)}</div>}
      <div className="library-actions"><button className="outline-btn" onClick={()=>{exportFile('neurofisio-progresso-backup.json',backupState(prefs,progress,notes,reports,library));message('Backup exportado.');}}><Icon name="download" size={15}/> Exportar backup do estudo</button><button className="outline-btn" onClick={()=>{exportFile('neurofisio-pack-modelo.json',{schemaVersion:'neurofisio-content-v1',packageId:'exemplo_modelo_sem_registros',title:'Modelo de estrutura de pacote',createdAt:new Date().toISOString(),modality:'eeg',examples:[],cases:[],references:[],provenance:'Modelo técnico sem exames ou validação clínica.'});message('Modelo de índice exportado.');}}><Icon name="file" size={15}/> Baixar modelo de JSON</button></div>
      <p className="tiny-note">Backup: exportação disponível. A restauração automática e a importação de arquivos binários serão acrescentadas em fases posteriores.</p>
    </>;
  }
  return <div className="app-shell">
    {menuOpen&&<button className="mobile-scrim" aria-label="Fechar navegação" onClick={()=>setMenuOpen(false)}/>}
    <aside className={`sidebar ${menuOpen?'sidebar-open':''}`}><div className="brand"><div className="brand-mark"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 24h8l4-10 6 23 7-27 6 21 4-7h7" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div><strong>NEUROFISIO</strong><span>SIGNAL ROOM / 01</span></div></div>
      <div className="side-group"><div className="side-label">WORKSPACE</div>{WORKSPACES.map((item,i)=><button key={item.id} className={`side-nav ${view===item.id?'side-nav-active':''}`} onClick={()=>go(item.id,mod)}><span className="nav-index">{item.mono}</span><span>{item.label}</span>{i===0&&<span className="nav-dot"/>}</button>)}</div>
      <div className="side-group module-side-group"><div className="side-label">MODALIDADES</div>{MODULES.map(m=><button key={m.id} className={`side-module ${mod===m.id?'side-module-active':''}`} onClick={()=>go(view==='home'?'study':view,m.id)}><span className="mod-indicator" style={{background:m.color}}/><span>{m.shortName==='PSG'?'Polissonografia':m.shortName==='PE'?'Potenciais evocados':m.shortName}</span><span className="side-number">{m.index}</span></button>)}</div>
      <div className="sidebar-bottom"><div className="save-state"><span className="green-led"/>DADOS SALVOS LOCALMENTE</div><span>FASE 01 · BASE OPERACIONAL</span><span>© NEUROFISIO · EDUCACIONAL</span></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="menu-btn" aria-label="Abrir menu" onClick={()=>setMenuOpen(v=>!v)}><Icon name="menu"/></button><span className="breadcrumb">SIGNAL ROOM</span><span className="slash">/</span><b>{SECTION_LABELS[view]}</b><span className="slash">/</span><span className="crumb-module">{module.shortName}</span></div><div className="topbar-right"><button className="search-trigger" onClick={()=>setSearchOpen(true)}><Icon name="search" size={17}/><span>Buscar no laboratório</span><kbd>⌘ K</kbd></button><button className="theme-btn" title="Alternar tema" aria-label="Alternar tema" onClick={()=>setPrefs(p=>({...p,theme:p.theme==='dark'?'light':'dark'}))}><Icon name={prefs.theme==='dark'?'sun':'moon'} size={18}/></button><span className="topbar-avatar">NF</span></div></header>
      <main className="content"><div className="content-inner">{renderContent()}<footer className="footer"><div>NEUROFISIO <span>—</span> CLINICAL NEUROPHYSIOLOGY LABORATORY</div><div>{completed} / {sections} TÓPICOS MARCADOS · FASE 1 DE 20</div></footer></div></main>
    </div>
    <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={e=>onImport(e.target.files?.[0])}/>
    {toast&&<div className="toast" role="status">{toast}<button aria-label="Fechar mensagem" onClick={()=>setToast('')}><Icon name="close" size={14}/></button></div>}
    {searchOpen&&<div className="search-backdrop" onClick={()=>setSearchOpen(false)}><div className="search-modal" role="dialog" aria-modal="true" aria-label="Busca universal" onClick={e=>e.stopPropagation()}><div className="modal-search"><Icon name="search" size={19}/><input ref={searchRef} placeholder="Buscar tópicos, modalidades, ambientes e índices..." value={query} onChange={e=>setQuery(e.target.value)}/><button onClick={()=>setSearchOpen(false)} aria-label="Fechar busca"><Icon name="close" size={17}/></button></div><div className="modal-results">{filtered.length?filtered.map((item,i)=><button key={`${item.id}-${i}`} className="modal-result" onClick={()=>{go(item.section,item.module);setSearchOpen(false);setQuery('');}}><span><Icon name={item.section==='study'?'book':'arrow'} size={16}/></span><div><b>{item.title}</b><small>{item.detail}</small></div><Icon name="chevron" size={15}/></button>):<p className="no-results">Nenhum resultado para esta busca.</p>}</div><div className="modal-foot">CTRL / ⌘ + K PARA ABRIR <span>ESC PARA FECHAR</span></div></div></div>}
  </div>;
}
const root=document.getElementById('root');if(!root)throw Error('Contêiner principal indisponível');
createRoot(root).render(<App/>);
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}

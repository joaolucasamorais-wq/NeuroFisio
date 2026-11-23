import type { ContentPack, LibraryState, NotesMap, ProgressMap, ReportMap, UserPreferences } from './types';
const PREFIX = 'neurofisio:f1:';
const jsonRead = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(PREFIX+key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } };
const jsonWrite = (key:string,value:unknown) => { try { localStorage.setItem(PREFIX+key,JSON.stringify(value)); return true; } catch { return false; } };
export const DEFAULT_PREFS:UserPreferences = {theme:'dark',lastModule:'eeg',compact:false};
export const loadPrefs = () => jsonRead<UserPreferences>('preferences', DEFAULT_PREFS);
export const savePrefs = (p:UserPreferences) => jsonWrite('preferences',p);
export const loadProgress = () => jsonRead<ProgressMap>('progress',{});
export const saveProgress = (p:ProgressMap) => jsonWrite('progress',p);
export const loadNotes = () => jsonRead<NotesMap>('notes',{});
export const saveNotes = (n:NotesMap) => jsonWrite('notes',n);
const blankReport = () => ({ technique:'', findings:'', conclusion:'', updatedAt:'' });
export const defaultReports = ():ReportMap => ({eeg:blankReport(),enmg:blankReport(),psg:blankReport(),pe:blankReport()});
export const loadReports = () => jsonRead<ReportMap>('reports',defaultReports());
export const saveReports = (r:ReportMap) => jsonWrite('reports',r);
export const backupState = (prefs:UserPreferences,progress:ProgressMap,notes:NotesMap,reports:ReportMap,library:LibraryState) => ({
  schemaVersion:'neurofisio-backup-v1', exportedAt:new Date().toISOString(),preferences:prefs,progress,notes,reports,library
});
export const exportFile = (name:string,data:unknown,mime='application/json') => {
  const body = typeof data==='string' ? data : JSON.stringify(data,null,2);
  const blob = new Blob([body],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
};
const DB_NAME = 'neurofisio-content';
const STORE = 'content-packs';
function openDB():Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('IndexedDB indisponível'));return;}
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=> {const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'packageId'});};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('Erro de armazenamento'));
  });
}
export async function listPacks():Promise<ContentPack[]> {
  try {const db=await openDB();return await new Promise<ContentPack[]>((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result as ContentPack[]);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});}
  catch { return jsonRead<ContentPack[]>('packs-fallback',[]); }
}
export async function putPack(pack:ContentPack):Promise<void> {
  try {const db=await openDB();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(pack);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});db.close();}
  catch {const prev=jsonRead<ContentPack[]>('packs-fallback',[]).filter(p=>p.packageId!==pack.packageId);if(!jsonWrite('packs-fallback',[...prev,pack]))throw new Error('Não foi possível gravar no armazenamento local.');}
}
export async function deletePack(id:string):Promise<void> {
  try {const db=await openDB();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();}
  catch { jsonWrite('packs-fallback',jsonRead<ContentPack[]>('packs-fallback',[]).filter(p=>p.packageId!==id)); }
}
export function validatePack(x:unknown):{value?:ContentPack;error?:string} {
  if (!x || typeof x!=='object')return {error:'Formato inválido: esperado um objeto JSON.'};
  const p=x as Partial<ContentPack>;
  if (p.schemaVersion!=='neurofisio-content-v1')return {error:'Versão de esquema incompatível: use neurofisio-content-v1.'};
  if(!p.packageId || typeof p.packageId!=='string' || p.packageId.length>120 || !/^[a-zA-Z0-9_-]+$/.test(p.packageId))return {error:'packageId ausente ou inválido.'};
  if(!p.title||typeof p.title!=='string'||p.title.length>180)return {error:'Título do pacote ausente ou inválido.'};
  const mods:ModuleId[]=['eeg','enmg','psg','pe'];
  if(!p.modality || !(mods as string[]).concat('multi').includes(p.modality))return {error:'Modalidade inválida.'};
  if(!Array.isArray(p.examples)||!Array.isArray(p.cases))return {error:'Campos examples e cases devem ser arrays.'};
  if(p.examples.length>500||p.cases.length>500)return {error:'Pacote excede o limite inicial de 500 itens por tipo.'};
  const origins=['real_desidentified','synthetic_reviewed','didactic_illustration','unreviewed'];
  const ids=new Set<string>();
  for(const item of [...p.examples,...p.cases]){
    if(!item||typeof item!=='object'||typeof item.id!=='string'||typeof item.title!=='string'||!mods.includes(item.module)||item.id.length>120||item.title.length>250)return {error:'Um dos itens não possui id, título ou modalidade válidos.'};
    if(ids.has(item.id))return {error:`Identificador duplicado: ${item.id}`};ids.add(item.id);
  }
  for(const item of p.examples){if(!origins.includes(item.origin))return {error:'Todo exemplo deve declarar origem/proveniência válida.'};}
  if(typeof p.createdAt!=='string'||Number.isNaN(Date.parse(p.createdAt)))return {error:'createdAt deve ser uma data ISO válida.'};
  const accepted:ContentPack = {schemaVersion:'neurofisio-content-v1',packageId:p.packageId,title:p.title,createdAt:p.createdAt,modality:p.modality,examples:p.examples,cases:p.cases,references:Array.isArray(p.references)?p.references:[],provenance:typeof p.provenance==='string'?p.provenance:''};
  return {value:accepted};
}

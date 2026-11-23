import type { ModuleId, ModuleInfo } from '../types';
const groups = (groups: { [group: string]: string[] }, prefix: string) => Object.entries(groups).flatMap(([group, titles], gi) => titles.map((title, i) => ({ id: `${prefix}-${gi+1}-${i+1}`, title, group })));
export const MODULES: ModuleInfo[] = [
  { id:'eeg', index:'01', name:'Eletroencefalografia', shortName:'EEG', english:'ELECTROENCEPHALOGRAPHY', tag:'ATIVIDADE CORTICAL', intro:'Dos fundamentos de eletrogênese à interpretação de registros multicanais.', color:'#ef706c', plannedPhase:3, workPhase:5, topics:groups({
    'Fundamentos':['Eletrogênese cortical e potenciais pós-sinápticos','Volume condutor e sincronização neuronal','Sistema 10–20 e sistema 10–10','Impedância, aquisição e amostragem'],
    'Aquisição':['Montagens bipolares e referenciais','Sensibilidade, filtros e resolução temporal','Organização de registros e artefatos'],
    'Interpretação':['Ritmos fisiológicos e variantes normais','EEG pediátrico, neonatal e sono','Lentificações focais e generalizadas','Descargas epileptiformes e crises','EEG contínuo em UTI e padrões críticos'],
    'Prática':['Correlação clínica e armadilhas diagnósticas','Critérios de interpretação e laudos']},'eeg') },
  { id:'enmg', index:'02', name:'Eletroneuromiografia', shortName:'ENMG', english:'ELECTRONEUROMYOGRAPHY', tag:'CONDUÇÃO & UNIDADE MOTORA', intro:'Estudos de condução, EMG de agulha e raciocínio neuromuscular.', color:'#a795f4', plannedPhase:7, workPhase:9, topics:groups({
    'Fundamentos':['Anatomia periférica, raízes e plexos','Fisiologia axonal, mielina e unidade motora','Instrumentação, temperatura e estimulação'],
    'Neurocondução':['Potenciais motores e sensitivos','Latência, amplitude e velocidade de condução','Bloqueio, dispersão e respostas tardias','Onda F e reflexo H'],
    'Agulha e técnicas especiais':['Potenciais de unidade motora e recrutamento','Atividade espontânea e descargas miotônicas','Estimulação repetitiva e fibra única'],
    'Interpretação':['Mononeuropatias, plexopatias e radiculopatias','Polineuropatias axonais e desmielinizantes','Doenças musculares e da junção neuromuscular','Doenças do neurônio motor e laudos']},'enmg') },
  { id:'psg', index:'03', name:'Polissonografia', shortName:'PSG', english:'POLYSOMNOGRAPHY', tag:'ARQUITETURA DO SONO', intro:'Estadiamento, eventos respiratórios e integração de sinais do sono.', color:'#87b6a1', plannedPhase:11, workPhase:12, topics:groups({
    'Fundamentos':['Neurobiologia do sono e ritmos circadianos','Circuitos sono-vigília e neurotransmissores','Instrumentação e sinais registrados'],
    'Estadiamento':['Estágios N1, N2, N3 e REM','EEG, EOG e EMG mentoniano','Arquitetura do sono e microdespertares'],
    'Eventos':['Apneias, hipopneias e hipoventilação','Esforço respiratório, fluxo e oximetria','Movimentos periódicos dos membros','Parassonias e sono REM sem atonia'],
    'Prática':['Polissonografia pediátrica','Testes de latência e manutenção da vigília','Titulação de pressão positiva','Regras de estadiamento e elaboração de laudos']},'psg') },
  { id:'pe', index:'04', name:'Potenciais Evocados', shortName:'PE', english:'EVOKED POTENTIALS', tag:'VIAS & LATÊNCIAS', intro:'Respostas visuais, auditivas e somatossensitivas: aquisição e análise.', color:'#94acd6', plannedPhase:14, workPhase:15, topics:groups({
    'Fundamentos':['Relação sinal-ruído e promediação','Reprodutibilidade e parâmetros de aquisição','Latências, amplitudes e interpicos'],
    'Visual':['Potenciais evocados visuais','Componente P100 e parâmetros de estímulo'],
    'Somatossensitivo':['Potenciais somatossensitivos e vias centrais','Componentes N9, N13 e N20 quando aplicáveis'],
    'Auditivo':['Potenciais auditivos de tronco encefálico','Ondas I–V e latências interpicos'],
    'Prática':['Comparação bilateral e artefatos','Monitorização neurofisiológica intraoperatória','Aplicações clínicas, limitações e laudos']},'pe') }
];
export const getModule = (id:ModuleId) => MODULES.find(m=>m.id===id) || MODULES[0];
export const isModule = (id:string): id is ModuleId => MODULES.some(m=>m.id===id);
export const SECTION_LABELS: Record<string,string> = { home:'Visão geral',study:'Study',lab:'Signal Lab',atlas:'Atlas',cases:'Case Room',reports:'Report Studio',library:'Biblioteca' };
export const OVERVIEW_METRICS = [
  {head:'04',label:'MODALIDADES'}, {head:'05',label:'AMBIENTES'}, {head:'20',label:'FASES PLANEJADAS'}, {head:'01',label:'FASE ATUAL'}
];

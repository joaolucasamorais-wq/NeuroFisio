export type ModuleId = 'eeg' | 'enmg' | 'psg' | 'pe';
export type WorkspaceId = 'home' | 'study' | 'lab' | 'atlas' | 'cases' | 'reports' | 'library';
export type Theme = 'dark' | 'light';
export type DataOrigin = 'real_desidentified' | 'synthetic_reviewed' | 'didactic_illustration' | 'unreviewed';
export interface ModuleInfo { id: ModuleId; index: string; name: string; shortName: string; english: string; tag: string; intro: string; color: string; topics: { id: string; title: string; group: string }[]; plannedPhase: number; workPhase: number; }
export interface UserPreferences { theme: Theme; lastModule: ModuleId; compact: boolean; }
export type ProgressMap = Record<string, boolean>;
export type NotesMap = Record<string, string>;
export interface ReportDraft { technique: string; findings: string; conclusion: string; updatedAt: string; }
export type ReportMap = Record<ModuleId, ReportDraft>;
export interface ContentExample { id: string; title: string; module: ModuleId; origin: DataOrigin; description?: string; assetPath?: string; reviewedBy?: string; license?: string; }
export interface ContentCase { id: string; title: string; module: ModuleId; complexity?: 'basic'|'intermediate'|'advanced'; synopsis?: string; }
export interface ContentPack { schemaVersion: 'neurofisio-content-v1'; packageId: string; title: string; createdAt: string; modality: ModuleId | 'multi'; examples: ContentExample[]; cases: ContentCase[]; references?: { id: string; title: string; url?: string }[]; provenance?: string; }
export interface ImportHistory { id: string; title: string; examples: number; cases: number; importedAt: string; }
export interface LibraryState { packs: ContentPack[]; imported: ImportHistory[]; }

# NEUROFISIO — SIGNAL ROOM

**Fase 1/20 · Aplicação-base funcional · React + TypeScript + Vite · PWA estático**

Plataforma educacional para EEG, ENMG, polissonografia e potenciais evocados. A Fase 1 entrega a arquitetura inicial, sem fabricar exames clínicos nem antecipar os casos produzidos pelo ChatGPT Work.

## O que funciona nesta fase

- Tela inicial com quatro módulos e identidade visual inicial Signal Room.
- Sete ambientes navegáveis: visão geral, Study, Signal Lab, Atlas, Case Room, Report Studio e Biblioteca.
- Índice curricular por modalidade, marcação de revisão e diário de estudo.
- Demonstração Canvas multicanal com alterações de canais, ganho, janela e grade. **Os sinais são artificiais e não têm validade clínica.**
- Pesquisa global de tópicos/ambientes/índices, inclusive `Ctrl+K` / `⌘K`.
- Editor de laudos educacionais com salvamento automático e exportação de `.txt`.
- Indexador JSON de conteúdo em IndexedDB, com deduplicação por `packageId`.
- Tema escuro e claro, interface responsiva, manifesto PWA, ícones e service worker de distribuição estática.
- Salvamento local de preferências, anotações, tópicos, laudos; backup de progresso em JSON.
- Arquivos `_headers` e `_redirects` compatíveis com Cloudflare Pages.

## Publicar sem instalar Node.js (Cloudflare Pages)

1. Abra o painel do Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Direct Upload / Upload assets**.
2. Faça upload do **ZIP de publicação separado**, `neurofisio-fase1-cloudflare-pages.zip`, ou arraste o conteúdo da pasta `dist/`. O `index.html` deve ficar na raiz dos arquivos enviados.
3. Defina o nome do projeto e publique. O aplicativo usará rotas por `#`, dispensando Functions e configurações de servidor.
4. A instalação como PWA exige endereço HTTPS (o Cloudflare Pages fornece HTTPS).
5. Em atualizações, crie um novo deployment com os arquivos `dist` atualizados.

**Atenção:** não faça upload do ZIP de código-fonte para Direct Upload: use o ZIP de publicação. Não foi criada nem acessada nenhuma conta Cloudflare neste processo.

## Desenvolver / atualizar localmente

Ambiente recomendado: Node.js 22.12+ (ou 20.19+), npm.

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` gera `dist/` pelo Vite. Para testagem estrutural: `npm run test:structure`.

**Como esta entrega foi preparada:** o ambiente disponível não conseguiu acessar o registro npm. A pasta `dist/` incluída foi compilada por um *empacotador offline* que transpila a mesma base TypeScript e reutiliza uma cópia local das versões UMD de React/ReactDOM. O código-fonte está configurado para Vite; a compilação via Vite deverá ser verificada em ambiente com dependências instaladas. Não é necessário instalar Node.js para publicar o ZIP pré-compilado.

## Arquitetura

```text
neurofisio-fase1/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ src/
│  ├─ main.tsx            # Interface, roteamento, laboratórios, editores
│  ├─ styles.css          # Signal Room
│  ├─ types.ts            # Contratos de dados e modalidades
│  ├─ storage.ts          # Preferências e IndexedDB
│  └─ data/catalog.ts     # Módulos e estrutura curricular
├─ public/
│  ├─ manifest.webmanifest
│  ├─ sw.js                # Service worker para build Vite
│  ├─ _headers
│  ├─ _redirects
│  ├─ icons/              # SVG + PNG
│  └─ vendor/             # React UMD compatível com distribuição offline
├─ scripts/build-offline.cjs
├─ tests/structure.cjs
├─ docs/CONTENT_PACK_SCHEMA.md
└─ dist/                 # Pronto para publicar
```

## Limitações reais desta fase

- Os capítulos médicos ainda são **apenas índices**, não tratados científicos completos.
- O visualizador Canvas é demonstrativo: não contém filtros neurofisiológicos validados, montagens reais, EDF, cálculos clínicos ou interpretação automatizada.
- O importador trata **índices JSON**, não arquivos EDF/EDF+, ZIP de conteúdo ou imagens. O `assetPath` é uma referência reservada para as fases futuras.
- Case Room lista casos indexados, sem motor de casos interativos. Atlas lista exemplos indexados, sem abrir o sinal.
- Report Studio não corrige laudos nem gera um documento assistencial.
- Os dados são locais ao navegador e não sincronizam entre dispositivos. O backup exporta JSON, mas ainda não tem restauração automatizada.
- Não há evidência clínica revisada nem exemplos reais integrados. O Work executará as fases de conteúdo previstas no prompt.
- A verificação de funcionamento do PWA em diferentes versões de iOS e Android e em publicação real depende de testes posteriores.

**Aviso de uso**: Plataforma em desenvolvimento para ensino. Não utilizar em diagnóstico, laudos assistenciais nem com dados pessoais identificáveis de pacientes.
